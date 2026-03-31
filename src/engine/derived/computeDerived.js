import { evaluate } from "../expression/evaluate.js";
import { createExpressionScope } from "../expression/scope.js";

export function computeDerived(derivedConfig = {}, state = {}, options = {}) {
  const derived = {};

  Object.entries(derivedConfig).forEach(([key, definition]) => {
    const expression =
      typeof definition === "string" ? definition : definition && typeof definition.expr === "string" ? definition.expr : null;

    if (!expression) {
      derived[key] = definition;
      return;
    }

    try {
      derived[key] = evaluate(
        expression,
        createExpressionScope({
          state,
          derived,
          runtime: options.runtime,
          extras: options.extras,
        })
      );
    } catch (error) {
      console.error(`Failed to compute derived field "${key}"`, error);
      derived[key] = undefined;
    }
  });

  return derived;
}
