import { useEffect, useMemo, useReducer } from "react";
import { computeDerived } from "../derived/computeDerived.js";
import { createInitialStore, engineReducer } from "./store.js";

export default function useEngineState(schema) {
  // Store both persistent form values and runtime metadata in a reducer-managed state object.
  const [store, dispatch] = useReducer(engineReducer, schema.state || {}, createInitialStore);

  useEffect(() => {
    // Reset the engine whenever a new schema arrives so initial state stays in sync.
    dispatch({ type: "RESET", payload: schema.state || {} });
  }, [schema]);

  const derived = useMemo(
    // Recompute derived values only when schema rules, state values, or runtime data change.
    () => computeDerived(schema.derived, store.values, { runtime: store.runtime }),
    [schema.derived, store.runtime, store.values]
  );

  return {
    // actual state data 
    state: store.values,
    // data that gets produced in runtime like errors, busy states, last action, action results etc
    runtime: store.runtime,
    derived,
    setValue(path, value) {
      dispatch({ type: "SET_VALUE", path, value });
    },
    setValues(values) {
      dispatch({ type: "SET_VALUES", values });
    },
    setErrors(errors) {
      dispatch({ type: "SET_ERRORS", errors });
    },
    clearErrors() {
      dispatch({ type: "CLEAR_ERRORS" });
    },
    setBusy(name, busy) {
      dispatch({ type: "SET_BUSY", name, busy });
    },
    setLastAction(name) {
      dispatch({ type: "SET_LAST_ACTION", name });
    },
    setLastError(error) {
      dispatch({ type: "SET_LAST_ERROR", error });
    },
    setNavigation(payload) {
      dispatch({ type: "SET_NAVIGATION", payload });
    },
    setActionResult(name, result) {
      dispatch({ type: "SET_ACTION_RESULT", name, result });
    },
  };
}
