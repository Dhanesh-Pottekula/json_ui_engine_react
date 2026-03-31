const ROOT_KEY_ALIASES = {
  s: "state",
  d: "derived",
  a: "actions",
  u: "ui",
};

const COMPONENT_ALIASES = {
  C: "Container",
  T: "Text",
  R: "Slider",
  S: "Select",
  N: "NumberInput",
  B: "Button",
  K: "Card",
  G: "StatGrid",
  H: "BarChart",
};

const NODE_KEY_ALIASES = {
  t: "type",
  p: "props",
  c: "children",
  if: "visibleWhen",
  e: "each",
};

const PROP_KEY_ALIASES = {
  a: "as",
  br: "bars",
  ct: "content",
  d: "data",
  ds: "disabled",
  er: "error",
  gp: "gap",
  hi: "hint",
  it: "items",
  k: "key",
  lb: "label",
  lk: "labelKey",
  mb: "maxBars",
  mn: "min",
  mx: "max",
  oc: "onClick",
  op: "options",
  pf: "prefix",
  sb: "subtitle",
  sf: "suffix",
  st: "step",
  tn: "tone",
  tt: "title",
  v: "value",
  vr: "variant",
};

const GENERIC_VALUE_KEY_ALIASES = {
  c: "color",
  i: "item",
  k: "key",
  l: "label",
  n: "index",
  v: "value",
  x: "expr",
};

const ACTION_TYPE_ALIASES = {
  a: "alert",
  api: "api_request",
  c: "condition",
  l: "log",
  n: "navigate",
  r: "run",
  s: "set",
  v: "validate",
};

const ACTION_STEP_KEY_ALIASES = {
  a: "action",
  b: "body",
  el: "else",
  em: "errorMessage",
  err: "onError",
  hd: "headers",
  i: "into",
  m: "message",
  ok: "onSuccess",
  pl: "payload",
  r: "rules",
  rep: "replace",
  s: "saveAs",
  t: "type",
  th: "then",
  to: "to",
  u: "url",
  v: "values",
  w: "when",
  wh: "with",
  x: "test",
};

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function expandBindExprOrAction(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }

  if (options.eventProp && value.startsWith("#")) {
    return { action: value.slice(1) };
  }

  if (value.startsWith("@")) {
    return { bind: value.slice(1) };
  }

  if (value.startsWith("=")) {
    return { expr: value.slice(1) };
  }

  return value;
}

function normalizeLooseValue(value, options = {}) {
  const expanded = expandBindExprOrAction(value, options);

  if (Array.isArray(expanded)) {
    return expanded.map((entry) => normalizeLooseValue(entry));
  }

  if (isPlainObject(expanded)) {
    const nextValue = {};

    Object.entries(expanded).forEach(([key, entry]) => {
      const nextKey = GENERIC_VALUE_KEY_ALIASES[key] || key;
      nextValue[nextKey] = normalizeLooseValue(entry, {
        eventProp: typeof nextKey === "string" && nextKey.startsWith("on"),
      });
    });

    return nextValue;
  }

  return expanded;
}

function normalizeProps(props = {}) {
  const nextProps = {};

  Object.entries(props).forEach(([key, value]) => {
    const nextKey = PROP_KEY_ALIASES[key] || key;
    nextProps[nextKey] = normalizeLooseValue(value, {
      eventProp: typeof nextKey === "string" && nextKey.startsWith("on"),
    });
  });

  return nextProps;
}

function normalizeRule(rule) {
  if (Array.isArray(rule)) {
    return {
      field: rule[0],
      test: rule[1],
      message: rule[2],
      required: Boolean(rule[3]),
    };
  }

  return normalizeLooseValue(rule);
}

function normalizeActionStep(step) {
  if (Array.isArray(step)) {
    const [rawType, payload, extra = {}] = step;
    const type = ACTION_TYPE_ALIASES[rawType] || rawType;
    const normalized = { type };

    if (type === "set") {
      normalized.values = normalizeLooseValue(payload);
    } else if (type === "validate") {
      normalized.rules = Array.isArray(payload) ? payload.map(normalizeRule) : [];
    } else if (type === "log") {
      normalized.payload = normalizeLooseValue(payload);
    } else if (type === "alert") {
      normalized.message = normalizeLooseValue(payload);
    } else if (type === "run") {
      normalized.action = payload;
    } else if (type === "navigate") {
      normalized.to = normalizeLooseValue(payload);
    } else if (type === "condition") {
      normalized.test = payload;
    } else if (payload !== undefined) {
      normalized.payload = normalizeLooseValue(payload);
    }

    if (isPlainObject(extra)) {
      Object.entries(extra).forEach(([key, value]) => {
        const nextKey = ACTION_STEP_KEY_ALIASES[key] || key;
        normalized[nextKey] =
          nextKey === "rules"
            ? (Array.isArray(value) ? value.map(normalizeRule) : [])
            : nextKey === "onSuccess" || nextKey === "onError" || nextKey === "then" || nextKey === "else"
              ? (Array.isArray(value) ? value.map(normalizeActionStep) : [])
              : normalizeLooseValue(value);
      });
    }

    return normalized;
  }

  if (!isPlainObject(step)) {
    return step;
  }

  const normalized = {};

  Object.entries(step).forEach(([key, value]) => {
    const nextKey = ACTION_STEP_KEY_ALIASES[key] || key;

    if (nextKey === "type") {
      normalized.type = ACTION_TYPE_ALIASES[value] || value;
      return;
    }

    if (nextKey === "rules") {
      normalized.rules = Array.isArray(value) ? value.map(normalizeRule) : [];
      return;
    }

    if (nextKey === "onSuccess" || nextKey === "onError" || nextKey === "then" || nextKey === "else") {
      normalized[nextKey] = Array.isArray(value) ? value.map(normalizeActionStep) : [];
      return;
    }

    normalized[nextKey] = normalizeLooseValue(value);
  });

  return normalized;
}

function normalizeNode(node) {
  if (typeof node === "string") {
    return {
      type: "Text",
      props: {
        content: node,
      },
    };
  }

  if (!isPlainObject(node)) {
    return node;
  }

  const nextNode = {};

  Object.entries(node).forEach(([key, value]) => {
    const nextKey = NODE_KEY_ALIASES[key] || key;

    if (nextKey === "type") {
      nextNode.type = COMPONENT_ALIASES[value] || value;
      return;
    }

    if (nextKey === "props") {
      nextNode.props = normalizeProps(value || {});
      return;
    }

    if (nextKey === "children") {
      nextNode.children = Array.isArray(value) ? value.map(normalizeNode) : [];
      return;
    }

    if (nextKey === "each") {
      nextNode.each = normalizeLooseValue(value);
      return;
    }

    nextNode[nextKey] = normalizeLooseValue(value);
  });

  return nextNode;
}

export function normalizeSchema(schema = {}) {
  const root = isPlainObject(schema) ? schema : {};

  return {
    state: normalizeLooseValue(root.state ?? root[ROOT_KEY_ALIASES.s] ?? root.s ?? {}),
    derived: normalizeLooseValue(root.derived ?? root[ROOT_KEY_ALIASES.d] ?? root.d ?? {}),
    actions: Object.fromEntries(
      Object.entries(root.actions ?? root[ROOT_KEY_ALIASES.a] ?? root.a ?? {}).map(([name, steps]) => [
        name,
        Array.isArray(steps) ? steps.map(normalizeActionStep) : steps,
      ])
    ),
    ui: normalizeNode(root.ui ?? root[ROOT_KEY_ALIASES.u] ?? root.u ?? null),
  };
}
