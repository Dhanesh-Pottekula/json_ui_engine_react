import { evaluate } from "../expression/evaluate.js";
import { createExpressionScope } from "../expression/scope.js";

export function computeDerived(derivedConfig = {}, state = {}, options = {}) {
  // computeDerived() calculates derived values from the current state and runtime context.
  const derived = {};

  Object.entries(derivedConfig).forEach(([key, definition]) => {
    // Support either a plain expression string or an object like { expr: "..." }.
    const expression =
      typeof definition === "string" ? definition : definition && typeof definition.expr === "string" ? definition.expr : null;

    // If no expression is provided, treat the definition as a static derived value.
    if (!expression) {
      derived[key] = definition;
      return;
    }

    try {
      // Evaluate the expression against the current state and any already computed derived values.
      derived[key] = evaluate(
        expression,
        // Create a scope for evaluating the expression with access to state, derived values, and runtime helpers.
        createExpressionScope({
          state,
          derived,
          runtime: options.runtime,
          extras: options.extras,
        })
      );
    } catch (error) {
      // Keep rendering resilient even if one derived expression fails.
      console.error(`Failed to compute derived field "${key}"`, error);
      derived[key] = undefined;
    }
  });

  return derived;
}
