import { validateExpression } from "../expression/evaluate.js";

const TEMPLATE_PATTERN = /\{\{(.*?)\}\}/g;
const MAX_UI_DEPTH = 14;
const MAX_UI_NODES = 250;
const MAX_ACTION_STEPS = 200;

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validateTemplateExpressions(value, path, errors) {
  if (typeof value !== "string") {
    return;
  }

  const matches = [...value.matchAll(TEMPLATE_PATTERN)];
  matches.forEach((match) => {
    try {
      validateExpression(match[1].trim());
    } catch (error) {
      errors.push(`${path}: ${error.message}`);
    }
  });
}

function validateValueExpressions(value, path, errors) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => validateValueExpressions(entry, `${path}[${index}]`, errors));
    return;
  }

  if (isPlainObject(value)) {
    if (typeof value.expr === "string") {
      try {
        validateExpression(value.expr);
      } catch (error) {
        errors.push(`${path}.expr: ${error.message}`);
      }
      return;
    }

    Object.entries(value).forEach(([key, entry]) => {
      validateValueExpressions(entry, `${path}.${key}`, errors);
    });
    return;
  }

  validateTemplateExpressions(value, path, errors);
}

function validateActionStep(step, schema, allowedActions, errors, path, counter) {
  if (!isPlainObject(step)) {
    errors.push(`${path}: action step must be an object`);
    return;
  }

  counter.count += 1;
  if (counter.count > MAX_ACTION_STEPS) {
    errors.push(`actions: exceeded step limit of ${MAX_ACTION_STEPS}`);
    return;
  }

  if (!allowedActions.has(step.type)) {
    errors.push(`${path}.type: unsupported action "${step.type}"`);
  }

  if (typeof step.when === "string") {
    try {
      validateExpression(step.when);
    } catch (error) {
      errors.push(`${path}.when: ${error.message}`);
    }
  }

  if (step.type === "run" && typeof step.action === "string" && !schema.actions?.[step.action]) {
    errors.push(`${path}.action: unknown action "${step.action}"`);
  }

  ["payload", "message", "values", "headers", "body", "url", "to", "href", "meta", "with"].forEach((key) => {
    if (key in step) {
      validateValueExpressions(step[key], `${path}.${key}`, errors);
    }
  });

  if (Array.isArray(step.rules)) {
    step.rules.forEach((rule, index) => {
      if (typeof rule.test === "string") {
        try {
          validateExpression(rule.test);
        } catch (error) {
          errors.push(`${path}.rules[${index}].test: ${error.message}`);
        }
      }
    });
  }

  if (typeof step.test === "string") {
    try {
      validateExpression(step.test);
    } catch (error) {
      errors.push(`${path}.test: ${error.message}`);
    }
  }

  if (Array.isArray(step.then)) {
    step.then.forEach((nestedStep, index) =>
      validateActionStep(nestedStep, schema, allowedActions, errors, `${path}.then[${index}]`, counter)
    );
  }

  if (Array.isArray(step.else)) {
    step.else.forEach((nestedStep, index) =>
      validateActionStep(nestedStep, schema, allowedActions, errors, `${path}.else[${index}]`, counter)
    );
  }

  if (Array.isArray(step.onSuccess)) {
    step.onSuccess.forEach((nestedStep, index) =>
      validateActionStep(nestedStep, schema, allowedActions, errors, `${path}.onSuccess[${index}]`, counter)
    );
  }

  if (Array.isArray(step.onError)) {
    step.onError.forEach((nestedStep, index) =>
      validateActionStep(nestedStep, schema, allowedActions, errors, `${path}.onError[${index}]`, counter)
    );
  }
}

function validateUiNode(node, schema, allowedComponents, errors, pathState, counter) {
  if (!isPlainObject(node)) {
    errors.push(`${pathState.path}: ui node must be an object`);
    return;
  }

  counter.count += 1;
  if (counter.count > MAX_UI_NODES) {
    errors.push(`ui: exceeded node limit of ${MAX_UI_NODES}`);
    return;
  }

  if (pathState.depth > MAX_UI_DEPTH) {
    errors.push(`${pathState.path}: exceeded max depth of ${MAX_UI_DEPTH}`);
    return;
  }

  if (!allowedComponents.has(node.type)) {
    errors.push(`${pathState.path}.type: unsupported component "${node.type}"`);
  }

  if (typeof node.visibleWhen === "string") {
    try {
      validateExpression(node.visibleWhen);
    } catch (error) {
      errors.push(`${pathState.path}.visibleWhen: ${error.message}`);
    }
  }

  if (node.each?.expr) {
    try {
      validateExpression(node.each.expr);
    } catch (error) {
      errors.push(`${pathState.path}.each.expr: ${error.message}`);
    }
  }

  if (isPlainObject(node.props)) {
    Object.entries(node.props).forEach(([key, value]) => {
      if (isPlainObject(value) && typeof value.action === "string" && !schema.actions?.[value.action]) {
        errors.push(`${pathState.path}.props.${key}: unknown action "${value.action}"`);
      }

      if (isPlainObject(value) && typeof value.transform === "string") {
        try {
          validateExpression(value.transform);
        } catch (error) {
          errors.push(`${pathState.path}.props.${key}.transform: ${error.message}`);
        }
      }

      validateValueExpressions(value, `${pathState.path}.props.${key}`, errors);
    });
  }

  if (Array.isArray(node.children)) {
    node.children.forEach((child, index) => {
      validateUiNode(
        child,
        schema,
        allowedComponents,
        errors,
        {
          path: `${pathState.path}.children[${index}]`,
          depth: pathState.depth + 1,
        },
        counter
      );
    });
  }
}

export function validateSchema(schema, options = {}) {
  const errors = [];
  const allowedComponents = new Set(options.components || []);
  const allowedActions = new Set(options.actions || []);

  if (!isPlainObject(schema)) {
    return {
      valid: false,
      errors: ["Schema root must be an object."],
    };
  }

  if (!isPlainObject(schema.state)) {
    errors.push("state: must be an object");
  }

  if (!isPlainObject(schema.derived)) {
    errors.push("derived: must be an object");
  } else {
    Object.entries(schema.derived).forEach(([key, value]) => {
      const expression = typeof value === "string" ? value : value?.expr;
      if (typeof expression !== "string") {
        errors.push(`derived.${key}: must be a string expression or { expr }`);
        return;
      }

      try {
        validateExpression(expression);
      } catch (error) {
        errors.push(`derived.${key}: ${error.message}`);
      }
    });
  }

  if (!isPlainObject(schema.actions)) {
    errors.push("actions: must be an object");
  } else {
    const counter = { count: 0 };
    Object.entries(schema.actions).forEach(([name, steps]) => {
      if (!Array.isArray(steps)) {
        errors.push(`actions.${name}: must be an array`);
        return;
      }

      steps.forEach((step, index) => {
        validateActionStep(step, schema, allowedActions, errors, `actions.${name}[${index}]`, counter);
      });
    });
  }

  if (!isPlainObject(schema.ui)) {
    errors.push("ui: must be an object");
  } else {
    const counter = { count: 0 };
    validateUiNode(schema.ui, schema, allowedComponents, errors, {
      path: "ui",
      depth: 1,
    }, counter);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
