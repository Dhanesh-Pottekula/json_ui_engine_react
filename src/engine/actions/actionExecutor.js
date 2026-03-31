import { evaluate } from "../expression/evaluate.js";
import { createExpressionScope } from "../expression/scope.js";
import { resolveSchemaValue } from "../renderer/resolveValue.js";

function buildScope(context, extras = {}) {
  return createExpressionScope({
    state: context.state,
    derived: context.derived,
    runtime: context.runtime,
    extras,
  });
}

async function executeSteps(steps, registry, context, extras = {}) {
  let lastResult;

  for (const step of steps) {
    if (!step || typeof step !== "object") {
      continue;
    }

    if (step.when && !evaluate(step.when, buildScope(context, { ...extras, lastResult }))) {
      continue;
    }

    const handler = registry[step.type];
    if (!handler) {
      throw new Error(`Unknown action type "${step.type}"`);
    }

    const stepContext = {
      ...context,
      lastResult,
      resolve(value, nextExtras = {}) {
        return resolveSchemaValue(value, {
          state: context.state,
          derived: context.derived,
          runtime: context.runtime,
          extras: {
            ...extras,
            lastResult,
            ...nextExtras,
          },
        });
      },
      executeSteps(nextSteps, nextExtras = {}) {
        return executeSteps(nextSteps, registry, context, {
          ...extras,
          lastResult,
          ...nextExtras,
        });
      },
    };

    try {
      lastResult = await handler(step, stepContext);

      if (Array.isArray(step.onSuccess)) {
        lastResult = await executeSteps(step.onSuccess, registry, context, {
          ...extras,
          lastResult,
          result: lastResult,
        });
      }
    } catch (error) {
      if (Array.isArray(step.onError)) {
        lastResult = await executeSteps(step.onError, registry, context, {
          ...extras,
          lastResult,
          error,
        });
        continue;
      }

      throw error;
    }
  }

  return lastResult;
}

export async function executeActionFlow({ actionName, actions = {}, registry, context, extras = {} }) {
  const steps = actions[actionName];

  if (!Array.isArray(steps)) {
    throw new Error(`Unknown action "${actionName}"`);
  }

  context.setLastAction(actionName);
  context.setLastError(null);
  context.setBusy(actionName, true);

  try {
    const result = await executeSteps(steps, registry, context, extras);
    context.setActionResult(actionName, result);
    return result;
  } catch (error) {
    context.setLastError(error.message || String(error));
    throw error;
  } finally {
    context.setBusy(actionName, false);
  }
}
