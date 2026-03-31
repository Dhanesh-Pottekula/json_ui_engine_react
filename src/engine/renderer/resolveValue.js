import { createExpressionScope } from "../expression/scope.js";
import { evaluate } from "../expression/evaluate.js";
import { interpolate } from "../expression/interpolate.js";

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function inferEventName(propName) {
  return propName === "value" ? "onChange" : `on${propName[0].toUpperCase()}${propName.slice(1)}Change`;
}

export function resolveSchemaValue(value, context = {}) {
  const scope = createExpressionScope({
    state: context.state,
    derived: context.derived,
    runtime: context.runtime,
    locals: context.locals,
    extras: context.extras,
  });

  if (Array.isArray(value)) {
    return value.map((item) => resolveSchemaValue(item, context));
  }

  if (isPlainObject(value)) {
    if (typeof value.expr === "string") {
      return evaluate(value.expr, scope);
    }

    const nextObject = {};
    Object.entries(value).forEach(([key, entry]) => {
      nextObject[key] = resolveSchemaValue(entry, context);
    });
    return nextObject;
  }

  if (typeof value === "string") {
    return interpolate(value, scope);
  }

  return value;
}

export function mapProps(props = {}, context = {}) {
  const mappedProps = {};

  Object.entries(props).forEach(([key, value]) => {
    if (isPlainObject(value) && typeof value.bind === "string") {
      const eventName = value.event || inferEventName(key);
      mappedProps[key] = context.getValue(value.bind);
      mappedProps[eventName] = (nextValue) => {
        const resolvedValue =
          typeof value.transform === "string"
            ? evaluate(
                value.transform,
                createExpressionScope({
                  state: context.state,
                  derived: context.derived,
                  runtime: context.runtime,
                  locals: context.locals,
                  extras: {
                    input: nextValue,
                    current: context.getValue(value.bind),
                  },
                })
              )
            : nextValue;

        context.setValue(value.bind, resolvedValue);
      };
      return;
    }

    if (isPlainObject(value) && typeof value.action === "string") {
      mappedProps[key] = () => context.executeAction(value.action, value.with || {});
      return;
    }

    mappedProps[key] = resolveSchemaValue(value, context);
  });

  return mappedProps;
}
