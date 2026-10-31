// The implementation plan as the runtime serves it (contracts/design-model.md#implementation-loop): the weight
// class of every operation and which classes need the developer's authorisation. The weight is metadata: the plan
// is served in the order it was declared, and `dependsOn` is the only precedence constraint.

export const WEIGHTS = ["authoring", "commands", "testing", "build"];

const WEIGHT_OF_KIND = {
  Code: "authoring",
  NotCode: "authoring",
  Commands: "commands",
  Testing: "testing",
  Build: "build",
};

const AUTOMATIC_WEIGHTS = new Set(["authoring", "build"]);

// An operation whose kind is unknown (a design stored before the current kinds) is kept out of the automatic batch.
export function weightOf(operation) {
  return WEIGHT_OF_KIND[operation.kind] ?? "commands";
}

export const isAutomatic = (operation) => AUTOMATIC_WEIGHTS.has(weightOf(operation));

export function authorisationOf(weight) {
  if (AUTOMATIC_WEIGHTS.has(weight)) return "automatic batch: served without the developer's authorisation";
  return "requires the developer's explicit authorisation: served only when the delegation prompt names its operation id";
}

// An operation is done for the loop once it is closed (Implemented) or verified (Completed).
export const isDone = (operation) => operation.implementationStatus === "Implemented" || operation.implementationStatus === "Completed";

// An operation is servable only when every operation it depends on is done.
export function unmetDependencies(operations, operation) {
  const byId = new Map(operations.map((op) => [op.id, op]));
  return (operation.dependsOn ?? []).filter((id) => !byId.get(id) || !isDone(byId.get(id)));
}
