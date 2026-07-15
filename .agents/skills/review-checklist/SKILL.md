---
name: review-checklist
description: "Use when: reviewing service desk demo changes for approved plan conformance, bugs, regressions, missing tests, accessibility issues, security risks, data integrity, and PR readiness."
argument-hint: "Provide changed files and plan artifacts"
---

# Review Checklist

Use this skill to perform a technical review.

## Checklist

- Does the change match the approved spec and implementation plan?
- Are there unplanned files or unrelated refactors?
- Are validation, authorization, and not-found paths handled?
- Are loading, empty, error, and disabled states represented in UI changes?
- Are accessible names, roles, focus behavior, and keyboard paths preserved?
- Are Prisma writes transactional or consistent where needed?
- Are Neon Auth identity assumptions explicit?
- Do tests cover meaningful branches and user-visible behavior?
- Are validation commands documented and recently run?

## Output Rule

Lead with findings ordered by severity. Put summary after findings.
