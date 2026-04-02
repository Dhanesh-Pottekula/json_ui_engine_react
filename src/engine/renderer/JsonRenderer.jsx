import { useMemo } from "react";
import { computeDerived } from "../derived/computeDerived.js";
import { executeActionFlow } from "../actions/actionExecutor.js";
import { defaultActionRegistry } from "../actions/registry.js";
import { getIn, setIn } from "../state/store.js";
import { normalizeSchema } from "../schema/normalizeSchema.js";
import useEngineState from "../state/useEngineState.js";
import { validateSchema } from "../validation/schemaValidator.js";
import { defaultComponentRegistry } from "./registry.js";
import renderNode from "./renderNode.jsx";

function ValidationPanel({ errors }) {
  return (
    <div className="mx-auto my-12 max-w-4xl rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
      <h2 className="mt-0 text-2xl font-bold tracking-[-0.03em] text-slate-900">Schema validation failed</h2>
      <ul className="m-0 list-disc pl-5 text-red-700">
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  );
}

export default function JsonRenderer({
  schema,
  componentRegistry = defaultComponentRegistry,
  actionRegistry = defaultActionRegistry,
  onNavigate,
}) {
  // Normalize the schema into full format from short formats 
  const normalizedSchema = useMemo(() => normalizeSchema(schema), [schema]);
  
  // Create the engine state for this schema, including state values, derived values, and runtime helpers.
  const engine = useEngineState(normalizedSchema);

  const validation = useMemo(
    () =>
      validateSchema(normalizedSchema, {
        components: Object.keys(componentRegistry),
        actions: Object.keys(actionRegistry),
      }),
    [actionRegistry, componentRegistry, normalizedSchema]
  );

  if (!validation.valid) {
    return <ValidationPanel errors={validation.errors} />;
  }

  const executeAction = async (actionName, extras = {}, options = {}) => {
    const context = {
      state: engine.state,
      derived: engine.derived,
      runtime: engine.runtime,
      getValue(path) {
        return getIn(context.state, path);
      },
      setValue(path, value) {
        context.state = setIn(context.state, path, value);
        context.derived = computeDerived(normalizedSchema.derived, context.state, {
          runtime: context.runtime,
        });
        engine.setValue(path, value);
      },
      setValues(values) {
        Object.entries(values || {}).forEach(([path, value]) => {
          context.state = setIn(context.state, path, value);
        });
        context.derived = computeDerived(normalizedSchema.derived, context.state, {
          runtime: context.runtime,
        });
        engine.setValues(values);
      },
      setErrors(errors) {
        context.runtime = {
          ...context.runtime,
          errors,
        };
        engine.setErrors(errors);
      },
      clearErrors() {
        context.runtime = {
          ...context.runtime,
          errors: {},
        };
        engine.clearErrors();
      },
      setBusy(name, busy) {
        context.runtime = {
          ...context.runtime,
          busyActions: {
            ...context.runtime.busyActions,
            [name]: busy,
          },
        };
        engine.setBusy(name, busy);
      },
      setLastAction(name) {
        context.runtime = {
          ...context.runtime,
          lastAction: name,
        };
        engine.setLastAction(name);
      },
      setLastError(error) {
        context.runtime = {
          ...context.runtime,
          lastError: error,
        };
        engine.setLastError(error);
      },
      setNavigation(payload) {
        context.runtime = {
          ...context.runtime,
          navigation: payload,
        };
        engine.setNavigation(payload);
      },
      setActionResult(name, result) {
        context.runtime = {
          ...context.runtime,
          actionResults: {
            ...context.runtime.actionResults,
            [name]: result,
          },
        };
        engine.setActionResult(name, result);
      },
      onNavigate,
      executeAction(nextAction, nextExtras = {}) {
        return executeAction(nextAction, nextExtras);
      },
    };

    try {
      return await executeActionFlow({
        actionName,
        actions: normalizedSchema.actions,
        registry: actionRegistry,
        context,
        extras,
      });
    } catch (error) {
      console.error(`Action "${actionName}" failed`, error);
      if (options.swallowErrors) {
        return undefined;
      }
      throw error;
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.14),transparent_24%),linear-gradient(180deg,#fbf7f0_0%,#f4efe5_100%)] px-4 py-7 text-slate-800 sm:px-5 sm:py-10 lg:px-6 lg:py-14">
      <div className="mx-auto max-w-6xl font-['Avenir_Next','Segoe_UI',sans-serif]">
      {normalizedSchema.ui ? renderNode(normalizedSchema.ui, {
        state: engine.state,
        derived: engine.derived,
        runtime: engine.runtime,
        locals: {},
        componentRegistry,
        getValue: (path) => getIn(engine.state, path),
        setValue: engine.setValue,
        executeAction: (actionName, extras) =>
          executeAction(actionName, extras, { swallowErrors: true }),
      }) : <div className="mx-auto my-12 max-w-4xl rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">Schema has no UI tree.</div>}
      </div>
    </main>
  );
}
