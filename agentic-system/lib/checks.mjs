// Mechanical design checks (contracts/design-checks.md). Facts about the artifact only: they never judge
// whether the design realizes R — that is the design verifier's job.

// Lab-authored: the minimum number of words that must follow a placeholder before the next placeholder
// (or the end of the text). The captured server only says "closer than a few words".
export const MIN_WORDS_AFTER_PLACEHOLDER = 4;

const PLACEHOLDER = /\{\{O(\d+)(?:\.(\d+))?\}\}/g;
const ACCESSORY_KINDS = new Set(["NotCode"]);
const FAILURE_ELEMENT_KINDS = new Set(["Guard", "Effect", "StateSemantics"]);
const CODE_KINDS = new Set(["Code"]);

// A decision stored before `highlight` replaced `blocking` reads its old flag as the highlight.
export const isHighlighted = (decision) => Boolean(decision.highlight || decision.blocking);

export function elementRef(obligationId, elementId) {
  return elementId === undefined ? obligationId : `${obligationId}.${elementId}`;
}

export function placeholders(text) {
  const found = [];
  for (const match of (text ?? "").matchAll(PLACEHOLDER)) {
    found.push({ ref: match[2] ? `O${match[1]}.${match[2]}` : `O${match[1]}`, start: match.index, end: match.index + match[0].length });
  }
  return found;
}

function countWords(text) {
  return (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’_\-.]*/gu) ?? []).length;
}

export function crowdedPlaceholders(text) {
  const found = placeholders(text);
  const crowded = [];
  found.forEach((current, index) => {
    const next = found[index + 1];
    const between = text.slice(current.end, next ? next.start : text.length);
    if (countWords(between) < MIN_WORDS_AFTER_PLACEHOLDER) crowded.push(current.ref);
  });
  return crowded;
}

// Every anchor an obligation set requires: O#.k per element, or O# for an obligation with no elements.
export function requiredAnchors(design) {
  const anchors = [];
  for (const obligation of design.obligations) {
    if (obligation.elements?.length) for (const element of obligation.elements) anchors.push(elementRef(obligation.id, element.id));
    else anchors.push(obligation.id);
  }
  return anchors;
}

export function overviewFindings(design, gaps = design.overview.gaps) {
  const errors = [];
  if (design.obligations.length === 0) return errors;
  const known = new Set(requiredAnchors(design));
  const used = new Set(placeholders(gaps).map((p) => p.ref));
  for (const anchor of known) {
    if (!used.has(anchor)) {
      errors.push({ rule: "overview-gap-missing-element", element: anchor, detail: `the gaps do not anchor ${anchor} as {{${anchor}}} followed by the gap it leaves open` });
    }
  }
  for (const ref of used) {
    if (!known.has(ref)) errors.push({ rule: "overview-gap-unknown-placeholder", element: ref, detail: `{{${ref}}} names no element of the obligations` });
  }
  for (const ref of crowdedPlaceholders(gaps)) {
    errors.push({
      rule: "overview-gap-placeholders-crowded",
      element: "gaps",
      detail: `{{${ref}}} is followed by fewer than ${MIN_WORDS_AFTER_PLACEHOLDER} words before the next placeholder: describe the gap each element leaves open`,
    });
  }
  return errors;
}

// Persisted operations carry prefixed references: refElements ["O1.2"], refObligations ["O1"], dependsOn ["IM1"].
// An obligation listed in refObligations is anchored as {{O#}} only when it has no elements of its own.
function declaredRefs(operation, obligationById) {
  const refs = new Set(operation.refElements ?? []);
  for (const obligation of operation.refObligations ?? []) {
    if (!obligationById.get(obligation)?.elements?.length) refs.add(obligation);
  }
  return refs;
}

// Exactly one Build operation, after every Code and NotCode operation and before every Commands and Testing one.
function buildFindings(operations) {
  if (operations.length === 0) return [];
  const builds = operations.filter((o) => o.kind === "Build");
  if (builds.length === 0) return [{ rule: "build-operation-missing", element: "operations", detail: "the plan declares no Build operation; it declares exactly one, which runs the build, the compiler-error checks, the linter and the static verifications" }];
  if (builds.length > 1) return [{ rule: "build-operation-multiple", element: builds[1].id, detail: `${builds.map((o) => o.id).join(", ")} are Build operations; the plan declares exactly one` }];
  const position = operations.indexOf(builds[0]);
  const findings = [];
  operations.forEach((operation, index) => {
    const authoring = operation.kind === "Code" || operation.kind === "NotCode";
    const gated = operation.kind === "Commands" || operation.kind === "Testing";
    if ((authoring && index > position) || (gated && index < position)) {
      findings.push({ rule: "build-operation-order", element: operation.id, detail: `${operation.id} (${operation.kind}) is scheduled ${authoring ? "after" : "before"} the Build operation ${builds[0].id}; Code and NotCode come before it, Commands and Testing after it` });
    }
  });
  return findings;
}

// At most one Testing operation per test type; testType belongs to Testing operations and to no other kind.
function testingFindings(operations) {
  const findings = [];
  const seen = new Map();
  for (const operation of operations) {
    if (operation.kind === "Testing") {
      if (!operation.testType) findings.push({ rule: "testing-operation-without-type", element: operation.id, detail: `${operation.id} is a Testing operation and declares no testType` });
      else if (seen.has(operation.testType)) findings.push({ rule: "testing-operations", element: operation.id, detail: `${seen.get(operation.testType)} and ${operation.id} are both ${operation.testType} Testing operations; the plan declares at most one per test type` });
      else seen.set(operation.testType, operation.id);
    } else if (operation.testType) {
      findings.push({ rule: "operation-test-type-misplaced", element: operation.id, detail: `${operation.id} is a ${operation.kind} operation and declares a testType; only a Testing operation does` });
    }
  }
  return findings;
}

export function runChecks(design) {
  const errors = [];
  const warnings = [];
  const operations = design.path.operations;
  const obligationById = new Map(design.obligations.map((o) => [o.id, o]));
  const elementKind = new Map();
  for (const obligation of design.obligations) for (const element of obligation.elements ?? []) elementKind.set(elementRef(obligation.id, element.id), element.kind);

  errors.push(...overviewFindings(design));

  const operationIds = operations.map((o) => o.id);
  const carried = new Set();
  operations.forEach((operation, index) => {
    const declared = declaredRefs(operation, obligationById);
    const used = new Set(placeholders(operation.instructions).map((p) => p.ref));
    for (const ref of declared) {
      const [obligationId] = ref.split(".");
      const known = ref.includes(".") ? elementKind.has(ref) : obligationById.has(obligationId);
      if (!known) {
        errors.push({ rule: "operation-reference-unknown", element: operation.id, detail: `${operation.id} declares ${ref}, which does not exist` });
        continue;
      }
      carried.add(ref);
      if (!used.has(ref)) {
        errors.push({ rule: "operation-instruction-missing-reference", element: operation.id, detail: `${operation.id} declares ${ref} but its instructions never name {{${ref}}} with the mechanism that realizes it` });
      }
    }
    for (const obligation of operation.refObligations ?? []) {
      if (!obligationById.has(obligation)) {
        errors.push({ rule: "operation-reference-unknown", element: operation.id, detail: `${operation.id} declares ${obligation}, which does not exist` });
      }
    }
    for (const ref of used) {
      if (!declared.has(ref)) {
        errors.push({ rule: "operation-instruction-undeclared-reference", element: operation.id, detail: `${operation.id} names {{${ref}}} in its instructions but does not declare it in refElements/refObligations` });
      }
    }
    for (const ref of crowdedPlaceholders(operation.instructions ?? "")) {
      errors.push({
        rule: "operation-instruction-placeholders-crowded",
        element: operation.id,
        detail: `${operation.id}: {{${ref}}} is followed by fewer than ${MIN_WORDS_AFTER_PLACEHOLDER} words before the next placeholder; describe the mechanism for each element`,
      });
    }
    if (CODE_KINDS.has(operation.kind) && declared.size === 0) {
      errors.push({ rule: "operation-without-elements", element: operation.id, detail: `${operation.id} produces code but declares no obligation element it carries out` });
    }
    const needsFailures = [...declared].some((ref) => FAILURE_ELEMENT_KINDS.has(elementKind.get(ref)));
    if (needsFailures && !ACCESSORY_KINDS.has(operation.kind) && !(operation.negatives?.length || operation.exceptions?.length)) {
      errors.push({ rule: "operation-without-failures", element: operation.id, detail: `${operation.id} carries out a guard, effect or state semantics but states no negatives and no exceptions` });
    }
    if (operation.source && operation.source !== "Design" && !operation.sourceRef?.trim()) {
      errors.push({ rule: "operation-source-without-ref", element: operation.id, detail: `${operation.id} comes from ${operation.source} but cites no sourceRef` });
    }
    for (const dependency of operation.dependsOn ?? []) {
      const position = operationIds.indexOf(dependency);
      if (position === -1) errors.push({ rule: "operation-dependency-unknown", element: operation.id, detail: `${operation.id} depends on ${dependency}, which does not exist` });
      else if (position >= index) errors.push({ rule: "operation-dependency-order", element: operation.id, detail: `${operation.id} depends on ${dependency}, which is not scheduled before it` });
    }
  });

  errors.push(...buildFindings(operations), ...testingFindings(operations));

  let elementsTotal = 0;
  let elementsRealized = 0;
  let obligationsRealized = 0;
  for (const obligation of design.obligations) {
    if (obligation.elements?.length) {
      let all = true;
      for (const element of obligation.elements) {
        const ref = elementRef(obligation.id, element.id);
        elementsTotal += 1;
        if (carried.has(ref)) elementsRealized += 1;
        else {
          all = false;
          if (operations.length) errors.push({ rule: "element-not-realized", element: ref, detail: `no operation carries out ${ref}: a condition of R the design forgot` });
        }
      }
      if (all) obligationsRealized += 1;
    } else if (carried.has(obligation.id)) obligationsRealized += 1;
    else if (operations.length) errors.push({ rule: "obligation-not-realized", element: obligation.id, detail: `no operation carries out ${obligation.id}` });
  }

  const decisionIds = new Set(design.decisions.map((d) => d.id));
  const cited = new Set();
  for (const operation of operations) {
    for (const ref of operation.realizes ?? []) {
      cited.add(ref);
      if (!decisionIds.has(ref)) errors.push({ rule: "decision-realized-unknown", element: operation.id, detail: `${operation.id} realizes ${ref}, which does not exist` });
    }
  }
  for (const decision of design.decisions) {
    const chosen = decision.options.filter((o) => o.chosen).length;
    if (chosen !== 1) errors.push({ rule: "decision-chosen-count", element: decision.id, detail: `${decision.id} has ${chosen} chosen options; exactly one must be chosen` });
    if (operations.length && !isHighlighted(decision) && !cited.has(decision.id)) {
      errors.push({ rule: "decision-not-realized", element: decision.id, detail: `${decision.id} is not realized by any operation (at least one operation must cite it in realizes)` });
    }
  }

  const operationFiles = new Set(operations.flatMap((o) => o.files ?? []));
  for (const file of design.path.filesystem.files) {
    if (!operationFiles.has(file.path)) errors.push({ rule: "file-without-operation", element: file.id, detail: `${file.id} (${file.path}) is created or modified by no operation` });
  }

  for (const reference of design.fileReferences) {
    for (const file of reference.files ?? []) {
      const detail = (reference.details ?? []).find((d) => d.path === file);
      if (!detail?.why?.trim() || !detail?.purpose?.trim()) {
        warnings.push({
          rule: "file-reference-without-detail",
          element: reference.id,
          detail: `the file '${file}' of the symbol '${reference.symbol}' does not say why it is a reference or how the implementor must use it`,
        });
      }
    }
  }

  return {
    errors,
    warnings,
    coverage: { obligationsTotal: design.obligations.length, obligationsRealized, elementsTotal, elementsRealized },
  };
}
