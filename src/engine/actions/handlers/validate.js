import { evaluate } from "../../expression/evaluate.js";
import { createExpressionScope } from "../../expression/scope.js";

function isEmptyValue(value) {
  return value == null || value === "";
}

export default async function validateHandler(step, context) {
  const nextErrors = {};

  for (const rule of step.rules || []) {
    const fieldValue = context.getValue(rule.field);
    const requiredFailed = rule.required && isEmptyValue(fieldValue);
    const passes =
      !rule.test ||
      Boolean(
        evaluate(
          rule.test,
          createExpressionScope({
            state: context.state,
            derived: context.derived,
            runtime: context.runtime,
            extras: {
              value: fieldValue,
              field: rule.field,
            },
          })
        )
      );

    if (requiredFailed || !passes) {
      nextErrors[rule.field] = rule.message || "This field is invalid.";
    }
  }

  context.setErrors(nextErrors);

  if (Object.keys(nextErrors).length > 0) {
    const error = new Error(step.errorMessage || "Validation failed.");
    error.validationErrors = nextErrors;
    throw error;
  }

  return true;
}
