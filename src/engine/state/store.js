function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

// get the value from the source object at the given path, return the fallback value if the resolved value is undefined
export function getIn(source, path, fallback) {
  if (!path) {
    return source;
  }

  const result = String(path)
    .split(".")
    .reduce((current, segment) => (current == null ? undefined : current[segment]), source);

  return result === undefined ? fallback : result;
}

// update the value in the source object at the given path and return a new object with the updated value
export function setIn(source, path, value) {
  // Turn a dot path like "user.profile.name" into ["user", "profile", "name"].
  const segments = String(path).split(".");
  // Clone the top level so we return a new structure instead of mutating state.
  const clone = Array.isArray(source) ? [...source] : { ...(source || {}) };
  let cursor = clone;
  let sourceCursor = source || {};

  segments.forEach((segment, index) => {
    // When we reach the last segment, write the new value and stop descending.
    if (index === segments.length - 1) {
      cursor[segment] = value;
      return;
    }

    // Reuse existing nested data by cloning each level we walk through.
    const nextSourceValue = sourceCursor?.[segment];
    const nextValue = Array.isArray(nextSourceValue)
      ? [...nextSourceValue]
      : isPlainObject(nextSourceValue)
        ? { ...nextSourceValue }
        : {};

    // Attach the cloned level, then move both cursors one step deeper.
    cursor[segment] = nextValue;
    cursor = nextValue;
    sourceCursor = nextSourceValue;
  });

  return clone;
}

// create the initial store with the given initial values and default runtime values
export function createInitialStore(initialValues = {}) {
  return {
    values: { ...initialValues },
    runtime: {
      errors: {},
      busyActions: {},
      lastAction: null,
      lastError: null,
      navigation: null,
      actionResults: {},
    },
  };
}

// the reducer function to handle the state updates based on the dispatched actions
export function engineReducer(store, action) {
  switch (action.type) {
    case "RESET":
      return createInitialStore(action.payload || {});
      //set the single variable value in store
    case "SET_VALUE":
      return {
        ...store,
        values: setIn(store.values, action.path, action.value),
      };
     // set the values of the variables in store 
    case "SET_VALUES": {
      const nextValues = Object.entries(action.values || {}).reduce(
        (accumulator, [path, value]) => setIn(accumulator, path, value),
        store.values
      );

      return {
        ...store,
        values: nextValues,
      };
    }
    // to set the runtime errors 
    case "SET_ERRORS":
      return {
        ...store,
        runtime: {
          ...store.runtime,
          errors: action.errors || {},
        },
      };
      // to clear the runtime errors
    case "CLEAR_ERRORS":
      return {
        ...store,
        runtime: {
          ...store.runtime,
          errors: {},
        },
      };
      // to track the busy states like loadings , spinners
    case "SET_BUSY":
      return {
        ...store,
        runtime: {
          ...store.runtime,
          busyActions: {
            ...store.runtime.busyActions,
            [action.name]: action.busy,
          },
        },
      };
      // to track the last action performed in the runtime
    case "SET_LAST_ACTION":
      return {
        ...store,
        runtime: {
          ...store.runtime,
          lastAction: action.name,
        },
      };
    case "SET_LAST_ERROR":
      return {
        ...store,
        runtime: {
          ...store.runtime,
          lastError: action.error,
        },
      };
      // to set the navigation data in runtime which can be used to navigate between different screens in the application
    case "SET_NAVIGATION":
      return {
        ...store,
        runtime: {
          ...store.runtime,
          navigation: action.payload,
        },
      };
    // to set the action results in runtime which can be used to store the results of different actions performed in the application
    case "SET_ACTION_RESULT":
      return {
        ...store,
        runtime: {
          ...store.runtime,
          actionResults: {
            ...store.runtime.actionResults,
            [action.name]: action.result,
          },
        },
      };
    default:
      return store;
  }
}
