# Local Test Plan Schema

This is a Lab-authored filesystem fallback, derived from the Integration Tester contract. It is not a recovered private-service schema. Bootstrap may select an existing repository schema only after verifying that it supports the fields and lifecycle below, or recording an approved adaptation of the Tester contract.

Store one `<test_plan_name>.yaml` inside the current Planning Session folder. Read and update that same file when resuming. No server is required.

## YAML Shape

```yaml
session_id: "<planning-session-id>"
test_plan_name: "<test-plan-name>"
approval_status: false
approved_by: null
approved_at: null
steps:
  - step_id: 1
    production_class: "<repository-relative-production-path>#<unit>"
    test_class: "<repository-relative-test-path>"
    test_class_action: "create"
    test_command: "<exact-approved-test-command>"
    test_cases:
      - name: "<scenario>"
        expected_result: "<observable-result>"
    status: "Planned"
    summary_of_changes: ""
```

## Field And Lifecycle Rules

- `session_id` and `test_plan_name` are nonempty strings matching the current session and selected filename.
- `approval_status` is a boolean. It starts false; record the approver and approval time when approval is granted. Revised planned scope requires renewed approval before execution.
- `steps` is a list of production-unit-to-test-file work items. Each `step_id` is a unique positive integer; append new items with `max(step_id) + 1`.
- `production_class`, `test_class`, and `test_command` are nonempty strings resolved from repository evidence. A production unit may be a class, module, or equivalent unit in the target test stack.
- `test_class_action` is `create` or `update`.
- `test_cases` is a nonempty list of named scenarios with observable expected results.
- New steps use `Planned`. Execution changes status to `TestingInProgress`; successful verification changes it to `Tested`. The runtime spelling `tested` is an accepted alias of `Tested`.
- During plan revision, existing steps whose status is not `Planned` are immutable. Append new work instead of rewriting their history. This restriction does not prevent execution from updating its own active step's status and results.
- `summary_of_changes` records actual changes and verification results, or a blocker. Never mark a blocked or unverified step completed.
- Preserve these keys and their order when drafting; duplicate YAML keys, unknown status values, and fabricated validation results are invalid.
