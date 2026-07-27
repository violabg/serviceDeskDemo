import { existsSync, readFileSync } from "node:fs"
import path from "node:path"

type LintMode =
  | "planning-ready"
  | "approval-ready"
  | "implementation-handoff"
  | "review-ready"

type Severity = "error" | "warning" | "note"

type Finding = {
  severity: Severity
  message: string
}

type LintReport = {
  sessionId: string
  mode: LintMode
  status: "ok" | "warning" | "error"
  errors: string[]
  warnings: string[]
  notes: string[]
}

const VALID_MODES: Set<LintMode> = new Set([
  "planning-ready",
  "approval-ready",
  "implementation-handoff",
  "review-ready",
])

const REQUIRED_APPROVAL_KEYS = [
  "Approved: true",
  "Approved By",
  "Approved At",
  "Source Message",
] as const

const REQUIRED_HANDOFF_FIELDS = [
  "Session ID",
  "From Agent",
  "To Agent",
  "Current Gate",
  "Approval State",
  "Required Artifacts",
  "Open Questions",
  "Blocking Risks",
  "Definition of Done for Next Agent",
] as const

const MODE_REQUIRED_FILES: Record<LintMode, string[]> = {
  "planning-ready": [
    "session-brief.md",
    "requirements-analysis.md",
    "spec.md",
    "task-breakdown.md",
    "implementation-plan.md",
    "test-plan.md",
  ],
  "approval-ready": [
    "session-brief.md",
    "requirements-analysis.md",
    "spec.md",
    "task-breakdown.md",
    "implementation-plan.md",
    "test-plan.md",
  ],
  "implementation-handoff": ["implementation-plan.md"],
  "review-ready": [
    "implementation-plan.md",
    "test-plan.md",
    "changed-files.md",
  ],
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.mode || !args.session) {
    printUsageAndExit(
      "Missing required arguments. Use --mode <mode> --session <session-id>."
    )
  }

  if (!VALID_MODES.has(args.mode)) {
    printUsageAndExit(`Invalid mode: ${args.mode}`)
  }

  const sessionRoot = path.resolve(process.cwd(), "sessions", args.session)
  const findings = lintSession(args.mode, args.session, sessionRoot)
  const report = findingsToReport(args.session, args.mode, findings)

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
  process.exit(report.status === "error" ? 1 : 0)
}

function parseArgs(argv: string[]) {
  let mode: LintMode | undefined
  let session: string | undefined

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === "--mode") {
      mode = argv[index + 1] as LintMode | undefined
      index += 1
      continue
    }

    if (arg === "--session") {
      session = argv[index + 1]
      index += 1
      continue
    }

    if (arg === "--help" || arg === "-h") {
      printUsageAndExit()
    }
  }

  return { mode, session }
}

function printUsageAndExit(message?: string): never {
  if (message) {
    process.stderr.write(`${message}\n\n`)
  }

  process.stderr.write(
    [
      "Usage:",
      "  pnpm agent:lint-artifacts --mode <planning-ready|approval-ready|implementation-handoff|review-ready> --session <session-id>",
    ].join("\n")
  )
  process.stderr.write("\n")
  process.exit(1)
}

function lintSession(
  mode: LintMode,
  sessionId: string,
  sessionRoot: string
): Finding[] {
  const findings: Finding[] = []

  if (!existsSync(sessionRoot)) {
    findings.push({
      severity: "error",
      message: `Session folder not found: sessions/${sessionId}`,
    })
    return findings
  }

  for (const requiredFile of MODE_REQUIRED_FILES[mode]) {
    requireFile(sessionRoot, requiredFile, findings)
  }

  for (const requiredFile of MODE_REQUIRED_FILES[mode]) {
    const content = readOptionalFile(sessionRoot, requiredFile)
    if (!content) {
      continue
    }

    requireTitle(requiredFile, content, findings)
    requireSessionIdReference(requiredFile, sessionId, content, findings)
  }

  const implementationPlan = readOptionalFile(
    sessionRoot,
    "implementation-plan.md"
  )
  if (implementationPlan && mode === "planning-ready") {
    requireContains(
      "implementation-plan.md",
      implementationPlan,
      "Proposed Diff or Proposed File",
      findings,
      "error",
      /Proposed Diffs|Proposed Diff:|Proposed File:/i
    )
  }

  if (implementationPlan) {
    requireContains(
      "implementation-plan.md",
      implementationPlan,
      "validation",
      findings,
      "warning",
      /validation commands?/i
    )

    validateImplementationPlanSchema(implementationPlan, findings)
  }

  if (
    implementationPlan &&
    mode !== "planning-ready"
  ) {
    validateImplementationPlanSchema(implementationPlan, findings)
  }

  const sessionBrief = readOptionalFile(sessionRoot, "session-brief.md")
  if (sessionBrief) {
    for (const token of [
      "source",
      "assumptions",
      "decisions",
      "open questions",
      "approval",
    ]) {
      requireContains(
        "session-brief.md",
        sessionBrief,
        token,
        findings,
        "warning",
        new RegExp(token, "i")
      )
    }
  }

  if (mode === "approval-ready") {
    for (const fileName of ["session-brief.md", "implementation-plan.md"]) {
      const content = readOptionalFile(sessionRoot, fileName)
      if (!content) {
        continue
      }
      requireApprovalMetadata(fileName, content, findings)
    }
  }

  if (mode === "implementation-handoff") {
    const changedFiles = path.join(sessionRoot, "changed-files.md")
    if (!existsSync(changedFiles)) {
      findings.push({
        severity: "warning",
        message:
          "implementation-handoff: changed-files.md is missing; expected when implementation has started",
      })
    }

    const handoffFiles = findHandoffFiles(sessionRoot)
    if (handoffFiles.length === 0) {
      findings.push({
        severity: "error",
        message: "implementation-handoff: no handoff file found",
      })
    }

    for (const handoffFile of handoffFiles) {
      validateHandoffFile(sessionRoot, handoffFile, findings)
      const content = readOptionalFile(sessionRoot, handoffFile)
      if (!content) {
        continue
      }

      const fromAgent = readFieldValue(content, "From Agent")
      if (fromAgent?.match(/implementor/i)) {
        const hasValidationEvidence = /validation evidence/i.test(content)
        const validationReportExists = existsSync(
          path.join(sessionRoot, "validation-report.md")
        )
        if (!hasValidationEvidence && !validationReportExists) {
          findings.push({
            severity: "error",
            message: `${handoffFile} missing Validation Evidence section or validation-report.md`,
          })
        }
      }

      const approvalState = readFieldValue(content, "Approval State")
      if (approvalState && !/true|approved/i.test(approvalState)) {
        findings.push({
          severity: "error",
          message: `${handoffFile} has non-approved Approval State: ${approvalState}`,
        })
      }
    }
  }

  if (mode === "review-ready") {
    const changedFilesContent = readOptionalFile(
      sessionRoot,
      "changed-files.md"
    )
    if (changedFilesContent && changedFilesContent.trim().length === 0) {
      findings.push({
        severity: "error",
        message: "changed-files.md is empty",
      })
    }

    const reviewHandoffs = findHandoffFiles(sessionRoot).filter((fileName) => {
      const content = readOptionalFile(sessionRoot, fileName)
      return content ? /Current Gate:\s*Review Ready/i.test(content) : false
    })

    if (reviewHandoffs.length === 0) {
      findings.push({
        severity: "error",
        message: "review-ready: no handoff file marked with Current Gate: Review Ready found",
      })
    }

    for (const handoffFile of reviewHandoffs) {
      validateHandoffFile(sessionRoot, handoffFile, findings)
    }
  }

  return findings
}

function requireFile(
  sessionRoot: string,
  fileName: string,
  findings: Finding[]
) {
  if (!existsSync(path.join(sessionRoot, fileName))) {
    findings.push({
      severity: "error",
      message: `Missing required file: ${fileName}`,
    })
  }
}

function readOptionalFile(sessionRoot: string, fileName: string) {
  const filePath = path.join(sessionRoot, fileName)
  if (!existsSync(filePath)) {
    return null
  }

  return readFileSync(filePath, "utf8")
}

function requireTitle(fileName: string, content: string, findings: Finding[]) {
  if (!/^#\s+.+/m.test(content)) {
    findings.push({
      severity: "warning",
      message: `${fileName} missing markdown title`,
    })
  }
}

function requireSessionIdReference(
  fileName: string,
  sessionId: string,
  content: string,
  findings: Finding[]
) {
  const sessionIdPattern = new RegExp(
    `session id[^\n]*${escapeForRegExp(sessionId)}`,
    "i"
  )
  if (!sessionIdPattern.test(content) && !content.includes(sessionId)) {
    findings.push({
      severity: "warning",
      message: `${fileName} missing explicit session ID reference for ${sessionId}`,
    })
  }
}

function requireContains(
  fileName: string,
  content: string,
  token: string,
  findings: Finding[],
  severity: Severity,
  pattern = new RegExp(escapeForRegExp(token), "i")
) {
  if (!pattern.test(content)) {
    findings.push({
      severity,
      message: `${fileName} missing expected content: ${token}`,
    })
  }
}

function requireApprovalMetadata(
  fileName: string,
  content: string,
  findings: Finding[]
) {
  for (const key of REQUIRED_APPROVAL_KEYS) {
    const keyPattern = new RegExp(`^${escapeForRegExp(key)}(?::|$)`, "im")
    if (!keyPattern.test(content)) {
      findings.push({
        severity: "error",
        message: `${fileName} missing approval metadata: ${key}`,
      })
      continue
    }

    if (key !== "Approved: true") {
      const match = content.match(
        new RegExp(`^${escapeForRegExp(key)}:\s*(.+)$`, "im")
      )
      if (!match || match[1].trim().length === 0) {
        findings.push({
          severity: "error",
          message: `${fileName} has blank approval metadata: ${key}`,
        })
      }
    }
  }
}

function validateImplementationPlanSchema(
  content: string,
  findings: Finding[]
) {
  for (const section of [
    "Filesystem Tree",
    "File Details",
    "Validation Commands",
    "Risks and Rollback",
  ]) {
    requireContains(
      "implementation-plan.md",
      content,
      section,
      findings,
      "error",
      new RegExp(`^##\\s+.+${escapeForRegExp(section)}$`, "im")
    )
  }

  const filesystemTreeSection = getMarkdownSection(content, "Filesystem Tree")
  if (!filesystemTreeSection) {
    return
  }

  const treeTargets = extractFilesystemTreeTargets(filesystemTreeSection)
  if (treeTargets.length === 0) {
    findings.push({
      severity: "error",
      message:
        "implementation-plan.md missing Filesystem Tree markdown links to File Details anchors",
    })
  }

  const invalidPathCells = extractFilesystemTreePathCells(filesystemTreeSection)
    .filter((cell) => !/\[[^\]]+\]\(#[-a-z0-9]+\)/i.test(cell))

  for (const cell of invalidPathCells) {
    findings.push({
      severity: "error",
      message: `implementation-plan.md has non-linked Filesystem Tree path cell: ${cell}`,
    })
  }

  const fileDetailsSection = getMarkdownSection(content, "File Details")
  if (!fileDetailsSection) {
    return
  }

  const detailBlocks = extractFileDetailBlocks(fileDetailsSection)
  const anchors = extractFileDetailAnchors(fileDetailsSection)
  if (anchors.length === 0) {
    findings.push({
      severity: "error",
      message:
        "implementation-plan.md missing File Details anchors required by the plan schema",
    })
  }

  const anchorSet = new Set([
    ...anchors,
    ...detailBlocks
      .map((detailBlock) => slugifyPlanHeading(detailBlock.heading))
      .filter(Boolean),
  ])
  for (const target of treeTargets) {
    if (!anchorSet.has(target)) {
      findings.push({
        severity: "error",
        message: `implementation-plan.md Filesystem Tree link target has no matching File Details anchor: #${target}`,
      })
    }
  }

  for (const detailBlock of detailBlocks) {
    if (!detailBlock.hasAnchor) {
      findings.push({
        severity: "error",
        message: `implementation-plan.md File Details entry missing anchor: ${detailBlock.heading}`,
      })
    }

    if (!/Back to \[Filesystem Tree\]\(#(?:3|5)-filesystem-tree\)/i.test(detailBlock.body)) {
      findings.push({
        severity: "error",
        message: `implementation-plan.md File Details entry missing Filesystem Tree backlink: ${detailBlock.heading}`,
      })
    }
  }
}

function getMarkdownSection(content: string, heading: string) {
  const pattern = new RegExp(
    `^##\\s+.+${escapeForRegExp(heading)}\\s*$([\\s\\S]*?)(?=^##\\s+|\\Z)`,
    "im"
  )
  return content.match(pattern)?.[1] ?? null
}

function extractFilesystemTreeTargets(section: string) {
  return Array.from(section.matchAll(/\[[^\]]+\]\(#([^)]+)\)/g), (match) =>
    match[1].trim()
  )
}

function extractFilesystemTreePathCells(section: string) {
  return section
    .split("\n")
    .filter((line) => /^\|\s*(NEW|MODIFIED|UNMODIFIED)\s*\|/i.test(line))
    .map((line) => line.split("|")[2]?.trim() ?? "")
    .filter(Boolean)
}

function extractFileDetailAnchors(section: string) {
  return Array.from(section.matchAll(/<a id="([^"]+)"><\/a>/g), (match) =>
    match[1].trim()
  )
}

function extractFileDetailBlocks(section: string) {
  const lines = section.split("\n")
  const blocks: Array<{ heading: string; hasAnchor: boolean; body: string }> = []
  let index = 0

  while (index < lines.length) {
    if (!/^###\s+/.test(lines[index])) {
      index += 1
      continue
    }

    const heading = lines[index].replace(/^###\s+/, "").trim()
    const previousLines = lines.slice(Math.max(0, index - 3), index)
    const hasAnchor = previousLines.some((line) => /<a id="[^"]+"><\/a>/.test(line))

    let bodyEnd = index + 1
    while (bodyEnd < lines.length && !/^###\s+/.test(lines[bodyEnd])) {
      bodyEnd += 1
    }

    blocks.push({
      heading,
      hasAnchor,
      body: lines.slice(index + 1, bodyEnd).join("\n"),
    })

    index = bodyEnd
  }

  return blocks
}

function slugifyPlanHeading(heading: string) {
  return heading
    .replace(/^`|`$/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function findHandoffFiles(sessionRoot: string) {
  return [
    "handoff-planner-to-implementor.md",
    "handoff-implementor-to-reviewer.md",
    "handoff-implementor-to-tester.md",
    "handoff-tester-to-reviewer.md",
  ].filter((fileName) => existsSync(path.join(sessionRoot, fileName)))
}

function validateHandoffFile(
  sessionRoot: string,
  fileName: string,
  findings: Finding[]
) {
  const content = readOptionalFile(sessionRoot, fileName)
  if (!content) {
    return
  }

  for (const field of REQUIRED_HANDOFF_FIELDS) {
    const match = content.match(
      new RegExp(`^[-*]?\s*${escapeForRegExp(field)}:\s*(.+)$`, "im")
    )
    if (!match) {
      findings.push({
        severity: "error",
        message: `${fileName} missing handoff field: ${field}`,
      })
      continue
    }

    if (match[1].trim().length === 0) {
      findings.push({
        severity: "error",
        message: `${fileName} has blank handoff field: ${field}`,
      })
    }
  }

  const requiredArtifactsValue = readFieldValue(content, "Required Artifacts")
  if (requiredArtifactsValue) {
    const artifactNames = requiredArtifactsValue
      .split(/[;,\n]/)
      .map((item) => item.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean)

    for (const artifactName of artifactNames) {
      const normalized = artifactName.replace(/^`|`$/g, "")
      if (!existsSync(path.join(sessionRoot, normalized))) {
        findings.push({
          severity: "error",
          message: `${fileName} references missing artifact: ${normalized}`,
        })
      }
    }
  }
}

function readFieldValue(content: string, field: string) {
  const match = content.match(
    new RegExp(`^[-*]?\s*${escapeForRegExp(field)}:\s*(.+)$`, "im")
  )
  return match?.[1].trim() ?? null
}

function findingsToReport(
  sessionId: string,
  mode: LintMode,
  findings: Finding[]
): LintReport {
  const errors = findings
    .filter((finding) => finding.severity === "error")
    .map((finding) => finding.message)
  const warnings = findings
    .filter((finding) => finding.severity === "warning")
    .map((finding) => finding.message)
  const notes = findings
    .filter((finding) => finding.severity === "note")
    .map((finding) => finding.message)

  const status =
    errors.length > 0 ? "error" : warnings.length > 0 ? "warning" : "ok"

  return { sessionId, mode, status, errors, warnings, notes }
}

function escapeForRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

main()
