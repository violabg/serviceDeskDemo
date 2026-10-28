// The implementation plan as the runtime serves it (contracts/design-model.md#implementation-loop): the weight
// class of every operation, the order the classes are served in and which class needs the developer's
// authorisation. The class follows the operation kind: the captured review document renders `UnitTest` as
// `unit-test` and has an `integration-test` kind; the other assignments are Lab-authored.

export const WEIGHTS = ["authoring", "external-execution", "unit-test", "integration-test", "verification"];

const WEIGHT_OF_KIND = {
  Code: "authoring",
  Wiring: "authoring",
  Documentation: "authoring",
  Changelog: "authoring",
  Generator: "external-execution",
  Migration: "external-execution",
  Procedure: "external-execution",
  UnitTest: "unit-test",
  IntegrationTest: "integration-test",
  Verification: "verification",
};

// An operation whose kind is unknown is kept out of the automatic batch.
export function weightOf(operation) {
  return WEIGHT_OF_KIND[operation.kind] ?? "external-execution";
}

export function authorisationOf(weight) {
  if (weight === "authoring") return "automatic batch: served without the developer's authorisation";
  if (weight === "verification") return "never served: the implementation verifier covers it";
  return "requires the developer's explicit authorisation: served only when the delegation prompt names its operation id";
}

// An operation is done for the loop once it is closed (Implemented) or verified (Completed).
export const isDone = (operation) => operation.implementationStatus === "Implemented" || operation.implementationStatus === "Completed";

// The plan in weight order; inside a class the list order is kept. A declared dependency always prevails:
// an operation is servable only when every operation it depends on is done.
export function servingOrder(operations) {
  const rank = (op) => WEIGHTS.indexOf(weightOf(op));
  return operations.map((op, index) => ({ op, index })).sort((a, b) => rank(a.op) - rank(b.op) || a.index - b.index).map((x) => x.op);
}

export function unmetDependencies(operations, operation) {
  const byId = new Map(operations.map((op) => [op.id, op]));
  return (operation.dependsOn ?? []).filter((id) => !byId.get(id) || !isDone(byId.get(id)));
}
