function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function getIn(source, path, fallback) {
  if (!path) {
    return source;
  }

  const result = String(path)
    .split(".")
    .reduce((current, segment) => (current == null ? undefined : current[segment]), source);

  return result === undefined ? fallback : result;
}

export function setIn(source, path, value) {
  const segments = String(path).split(".");
  const clone = Array.isArray(source) ? [...source] : { ...(source || {}) };
  let cursor = clone;
  let sourceCursor = source || {};

  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      cursor[segment] = value;
      return;
    }

    const nextSourceValue = sourceCursor?.[segment];
    const nextValue = Array.isArray(nextSourceValue)
      ? [...nextSourceValue]
      : isPlainObject(nextSourceValue)
        ? { ...nextSourceValue }
        : {};

    cursor[segment] = nextValue;
    cursor = nextValue;
    sourceCursor = nextSourceValue;
  });

  return clone;
}

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

export function engineReducer(store, action) {
  switch (action.type) {
    case "RESET":
      return createInitialStore(action.payload || {});
    case "SET_VALUE":
      return {
        ...store,
        values: setIn(store.values, action.path, action.value),
      };
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
    case "SET_ERRORS":
      return {
        ...store,
        runtime: {
          ...store.runtime,
          errors: action.errors || {},
        },
      };
    case "CLEAR_ERRORS":
      return {
        ...store,
        runtime: {
          ...store.runtime,
          errors: {},
        },
      };
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
    case "SET_NAVIGATION":
      return {
        ...store,
        runtime: {
          ...store.runtime,
          navigation: action.payload,
        },
      };
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
