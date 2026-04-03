import { createExpressionScope } from "../expression/scope.js";
import { evaluate } from "../expression/evaluate.js";
import { interpolate } from "../expression/interpolate.js";

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function inferEventName(propName) {
  return propName === "value" ? "onChange" : `on${propName[0].toUpperCase()}${propName.slice(1)}Change`;
}

/**
 * Resolve a schema-authored value into a concrete runtime value.
 *
 * Supported forms:
 * - primitives are returned as-is
 * - strings are interpolated with the current expression scope
 * - arrays are resolved item by item
 * - objects with `{ expr }` are evaluated as expressions
 * - other plain objects are resolved recursively
 *
 * The scope exposes `state`, `derived`, `runtime`, `locals`, and `extras`,
 * along with each state/derived/local value directly for expression access.
 *
 * @param {any} value Schema value to resolve.
 * @param {object} [context={}] Render/action context used to build the expression scope.
 * @param {object} [context.state] Current engine state values.
 * @param {object} [context.derived] Current derived values computed from state.
 * @param {object} [context.runtime] Runtime metadata such as errors and action results.
 * @param {object} [context.locals] Local variables introduced by repeated UI nodes.
 * @param {object} [context.extras] Extra transient values passed by action flows.
 * @returns {any} Fully resolved JavaScript value ready to pass into a component or action.
 */
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

/**
 * Convert schema props into real React props for a rendered component.
 *
 * Special schema forms handled here:
 * - `{ bind: "path" }`
 *   Reads the current value from engine state and creates a matching change handler
 *   that writes updates back through `context.setValue`.
 * - `{ action: "name", with: {...} }`
 *   Creates an event handler that triggers a named action through `context.executeAction`.
 * - all other values
 *   Are resolved through `resolveSchemaValue`, which supports expressions and interpolation.
 *
 * Binding details:
 * - `value` infers `onChange`
 * - `checked` infers `onCheckedChange`
 * - any other prop infers `on${PropName}Change`
 * - `event` can override the inferred event name
 * - `transform` can preprocess the incoming event value before it is stored
 *
 * Inside a bind transform expression:
 * - `input` is the new value coming from the component event
 * - `current` is the current value already stored at the bound path
 *
 * Example:
 * ```js
 * mapProps(
 *   {
 *     value: { bind: "profile.age", transform: "+input" },
 *     onClick: { action: "saveProfile", with: { source: "button" } },
 *   },
 *   context
 * );
 * ```
 *
 * @param {Record<string, any>} [props={}] Schema props object from a UI node.
 * @param {object} [context={}] Render context used to resolve values and wire handlers.
 * @param {(path: string) => any} [context.getValue] Reads a value from engine state by path.
 * @param {(path: string, value: any) => void} [context.setValue] Writes a value into engine state.
 * @param {(actionName: string, extras?: object) => any} [context.executeAction] Runs a named schema action.
 * @param {object} [context.state] Current engine state values.
 * @param {object} [context.derived] Current derived values.
 * @param {object} [context.runtime] Current runtime metadata.
 * @param {object} [context.locals] Local variables available while rendering repeated nodes.
 * @param {object} [context.extras] Extra transient values available to expressions.
 * @returns {Record<string, any>} React-ready props object with resolved values and event handlers.
 */
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
