import { useEffect, useMemo, useReducer } from "react";
import { computeDerived } from "../derived/computeDerived.js";
import { createInitialStore, engineReducer } from "./store.js";

export default function useEngineState(schema) {
  const [store, dispatch] = useReducer(engineReducer, schema.state || {}, createInitialStore);

  useEffect(() => {
    dispatch({ type: "RESET", payload: schema.state || {} });
  }, [schema]);

  const derived = useMemo(
    () => computeDerived(schema.derived, store.values, { runtime: store.runtime }),
    [schema.derived, store.runtime, store.values]
  );

  return {
    state: store.values,
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
