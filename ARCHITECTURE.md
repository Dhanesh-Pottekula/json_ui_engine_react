# Architecture Overview

This is a **schema-driven UI engine** — you describe an entire interactive page in a JSON file, and the engine renders and runs it. No hardcoded UI logic.

---

## Folder Structure

```
src/
├── App.jsx                        # Entry — loads JsonRenderer with schema
├── schemas/
│   └── interestSchema.json        # JSON schema (the "program")
│
├── components/
│   ├── base/                      # Button, NumberInput, Select, Slider, Text, Container
│   └── complex/                   # Card, BarChart, StatGrid
│
└── engine/
    ├── renderer/
    │   ├── JsonRenderer.jsx        # Main orchestrator
    │   ├── renderNode.jsx          # Recursively renders UI tree
    │   ├── resolveValue.js         # Resolves props (bindings, expressions, actions)
    │   └── registry.js             # name → React component map
    │
    ├── state/
    │   ├── useEngineState.js       # React hook — manages all state
    │   └── store.js                # Reducer + getIn/setIn path utilities
    │
    ├── actions/
    │   ├── actionExecutor.js       # Runs action steps sequentially
    │   ├── registry.js             # name → handler map
    │   └── handlers/               # set, validate, api, condition, alert, log, navigate, run
    │
    ├── expression/
    │   ├── evaluate.js             # Custom expression parser + evaluator (no eval)
    │   ├── scope.js                # Builds scope (state + derived + helpers)
    │   └── interpolate.js          # Resolves "Hello {{name}}" template strings
    │
    ├── derived/
    │   └── computeDerived.js       # Recomputes derived fields when state changes
    │
    └── validation/
        └── schemaValidator.js      # Validates schema at load time
```

---

## Three Layers of State

| Layer | What it holds | Example |
|---|---|---|
| `state` | User-editable values | `principal: 250000` |
| `derived` | Computed from state | `monthlyPayment: payment(principal, rate, years)` |
| `runtime` | UI metadata | `errors`, `busyActions`, `lastAction` |

All three live in `useEngineState`. Derived values auto-recompute via `useMemo` whenever state changes.

---

## Full Data Flow

```
JSON Schema
    │
    ▼
JsonRenderer.jsx
    ├── validateSchema()          ← check all component names, actions, expressions
    ├── useEngineState(schema)    ← initialize state / derived / runtime
    └── renderNode(schema.ui)
            │
            ▼
        resolveValue() on each prop
            ├── { bind: "principal" }      → read state + wire onChange
            ├── { expr: "rate > 0" }       → evaluate expression
            ├── { action: "requestQuote" } → wire to executeAction()
            └── "{{formatCurrency(x)}}"    → interpolate template string
            │
            ▼
        React component from registry renders
            │
            ▼
        User interacts (types / clicks)
            │
            ├── Input change → setValue("principal", 300000)
            │       └── reducer updates state → derived recomputes → re-render
            │
            └── Button click → executeAction("requestQuote")
                    └── actionExecutor runs steps sequentially:
                            1. validate  → check rules, set errors, throw if fail
                            2. log       → console.info
                            3. alert     → window.alert with interpolated message
```

---

## Schema Structure

A schema has four top-level sections:

```json
{
  "state": {
    "principal": 250000,
    "rate": 7.1,
    "years": 20
  },

  "derived": {
    "monthlyPayment": "payment(principal, rate, years)",
    "totalInterest": "totalRepayment - principal"
  },

  "actions": {
    "requestQuote": [
      { "type": "validate", "rules": [...] },
      { "type": "log", "payload": {...} },
      { "type": "alert", "message": "Payment: {{formatCurrency(monthlyPayment)}}" }
    ]
  },

  "ui": {
    "type": "Container",
    "children": [
      { "type": "NumberInput", "props": { "value": { "bind": "principal" } } },
      { "type": "Button", "props": { "onClick": { "action": "requestQuote" } } }
    ]
  }
}
```

---

## Action Registry

The action registry maps type names to handler functions. Eight built-in handlers:

| Action | What it does |
|---|---|
| `set` | Write multiple state values at once |
| `validate` | Run field rules, set errors, throw if any fail |
| `api_request` | Fetch a URL, store result via `into` or `saveAs` |
| `condition` | Evaluate a `test` expression, run `then` or `else` steps |
| `alert` | Show `window.alert()` with a resolved message |
| `log` | `console.info` a value for debugging |
| `navigate` | Call `onNavigate` callback or `window.location` |
| `run` | Call another named action by name (for reuse/composition) |

Custom actions can be registered at runtime:

```js
registerAction("my_action", myHandler);
```

### Action Flow Example

A button click on `requestQuote` runs these steps in sequence:

```
validate  →  (throws if invalid, errors shown on inputs)
log       →  console prints current state snapshot
alert     →  shows monthly payment in a popup
```

If any step throws, the rest are skipped.

---

## Expression Engine

The engine has its own **safe expression language** — no `eval()` or `new Function()`.

### Pipeline

```
"principal >= 1000 && rate > 0"
         │
         ▼
    tokenize()
         │
  [identifier:principal, operator:>=, number:1000, operator:&&, identifier:rate, operator:>, number:0]
         │
         ▼
    parseExpression()  (recursive descent parser)
         │
  BinaryExpression(&&)
    ├── BinaryExpression(>=, Identifier(principal), Literal(1000))
    └── BinaryExpression(>,  Identifier(rate),      Literal(0))
         │
         ▼
    evaluateAst(ast, scope)
         │
         ▼
       true / false
```

### Supported Syntax

| Category | Operators |
|---|---|
| Arithmetic | `+` `-` `*` `/` `%` `**` |
| Comparison | `>` `>=` `<` `<=` |
| Equality | `==` `!=` `===` `!==` |
| Logic | `&&` `||` `!` |
| Ternary | `x ? y : z` |
| Member access | `runtime.errors.field` |
| Function calls | `formatCurrency(monthlyPayment)` |

### Scope Helpers

The scope passed to the evaluator includes:

- State values: `principal`, `rate`, `years`, ...
- Derived values: `monthlyPayment`, `totalInterest`, ...
- Runtime values: `runtime.errors`, `runtime.busyActions`, ...
- Math helpers: `abs`, `ceil`, `floor`, `round`, `max`, `min`, `sqrt`
- Finance helpers: `payment()`, `amortization()`
- Format helpers: `formatCurrency()`
- Utility helpers: `hasErrors()`

### Security

- Blocks `__proto__`, `prototype`, `constructor` access
- Only functions explicitly in scope can be called
- No access to `window`, `fetch`, or global JS

---

## Prop Resolution

`resolveValue.js` translates schema prop definitions into real React props:

| Schema syntax | Resolves to |
|---|---|
| `{ bind: "principal" }` | `value={state.principal}` + `onChange` handler |
| `{ expr: "rate > 0" }` | evaluated expression result |
| `{ action: "requestQuote" }` | `() => executeAction("requestQuote")` |
| `"Hello {{name}}"` | interpolated string with expression replaced |
| Literal value | passed through as-is |

---

## Rendering Pipeline

```
renderNode(schema.ui, context)
    │
    ├── Check node.visibleWhen  →  skip if expression is false
    ├── Check node.each         →  repeat node for each item in array
    ├── mapProps()              →  resolve all props via resolveValue()
    ├── Look up component in registry
    └── Render <Component {...props}>{children}</Component>
        └── Recurse for each child node
```

---

## Schema Validation

At load time, `schemaValidator.js` checks:

- `state`, `derived`, `actions`, `ui` must be objects
- All expressions are syntactically valid (parsed but not evaluated)
- All action steps reference known handler types
- All UI nodes reference registered component names
- UI tree depth does not exceed 14 levels
- Total node count does not exceed 250
- Total action step count does not exceed 200

If validation fails, `JsonRenderer` renders a `<ValidationPanel>` with the error list instead of the UI.

---

## Key Design Principles

- **No eval** — custom parser for safe, sandboxed expression evaluation
- **Declarative** — behavior is data (JSON), not code
- **Three-layer state** — `state` / `derived` / `runtime` are distinct and composable
- **Registry pattern** — both components and actions are pluggable maps, extensible at runtime
- **Sequential action pipeline** — steps run in order, any step can throw to halt the chain
- **Schema-first validation** — errors surface at load time, not at runtime
