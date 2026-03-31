# Schema to Render — Complete Step-by-Step Flow

This document traces the exact journey from loading `interestSchema.json` to a fully rendered, interactive page in the browser.

---

## The Schema (starting point)

```json
{
  "state": {
    "principal": 250000,
    "rate": 7.1,
    "years": 20,
    "fees": 1200
  },
  "derived": {
    "monthlyPayment": "payment(principal, rate, years)",
    "totalRepayment": "monthlyPayment * years * 12 + fees",
    "totalInterest": "totalRepayment - principal - fees",
    "interestShare": "(totalInterest / max(totalRepayment, 1)) * 100",
    "yearlyBreakdown": "amortization(principal, rate, years)"
  },
  "actions": {
    "resetScenario": [ ... ],
    "requestQuote": [ ... ]
  },
  "ui": {
    "type": "Container",
    "children": [ ... ]
  }
}
```

---

## PHASE 1 — Entry Point

### Step 1 — `main.jsx` boots React

React mounts `<App />` into the DOM.

### Step 2 — `App.jsx` imports schema and passes it

```js
import interestSchema from "./schemas/interestSchema.json";

export default function App() {
  return <JsonRenderer schema={interestSchema} />;
}
```

The entire JSON file is imported as a plain JavaScript object and passed as the `schema` prop to `JsonRenderer`.

---

## PHASE 2 — Schema Validation

### Step 3 — `validateSchema()` is called

Inside `JsonRenderer`, before anything renders:

```js
const validation = useMemo(
  () => validateSchema(schema, {
    components: Object.keys(componentRegistry),  // ["Button","Card","Container",...]
    actions: Object.keys(actionRegistry),        // ["set","validate","api_request",...]
  }),
  [actionRegistry, componentRegistry, schema]
);
```

`schemaValidator.js` performs these checks:

**3a. Root structure check**
- `schema.state` must be a plain object ✓
- `schema.derived` must be a plain object ✓
- `schema.actions` must be a plain object ✓
- `schema.ui` must be a plain object ✓

**3b. Derived expressions check**
Each derived value is parsed (not evaluated):
```
"payment(principal, rate, years)"  → parseExpression() → valid ✓
"monthlyPayment * years * 12 + fees" → valid ✓
```
If any expression has a syntax error → pushed to errors list.

**3c. Action steps check**
For every step in every action:
- `step.type` must be in `actionRegistry` (`"set"`, `"validate"`, etc.)
- `step.when` expression is parsed if present
- `step.rules[n].test` expressions are parsed
- `step.action` in `run` steps must reference a known action name
- Nested `then`, `else`, `onSuccess`, `onError` steps are recursively checked
- Limit: max 200 total steps across all actions

**3d. UI tree check**
Each node is checked recursively:
- `node.type` must be in `componentRegistry`
- `node.visibleWhen` expression is parsed if present
- `node.each.expr` is parsed if present
- `node.props` values with `{ expr }` are parsed
- `{ action: "name" }` must reference a known action
- Limit: max 14 levels deep, max 250 total nodes

**If validation fails:**
```jsx
return <ValidationPanel errors={validation.errors} />;
```
Rendering stops here. No state is created. No UI tree is built.

**For interestSchema — validation passes ✓**

---

## PHASE 3 — State Initialization

### Step 4 — `useEngineState(schema)` creates the store

```js
const engine = useEngineState(schema);
```

Inside `useEngineState.js`:

```js
const [store, dispatch] = useReducer(engineReducer, schema.state || {}, createInitialStore);
```

`createInitialStore` is called once with `schema.state` as the argument:

```js
function createInitialStore(initialValues) {
  return {
    values: { ...initialValues },   // copy of schema.state
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
```

Result:
```js
store.values = { principal: 250000, rate: 7.1, years: 20, fees: 1200 }
store.runtime = { errors: {}, busyActions: {}, lastAction: null, ... }
```

### Step 5 — Derived values are computed

```js
const derived = useMemo(
  () => computeDerived(schema.derived, store.values, { runtime: store.runtime }),
  [schema.derived, store.runtime, store.values]
);
```

`computeDerived.js` iterates each key in `schema.derived` in order:

```
key: "monthlyPayment"
  expression: "payment(principal, rate, years)"
  scope: { principal: 250000, rate: 7.1, years: 20, fees: 1200, payment: fn, ... }
  result: 1775.43  ← stored in derived.monthlyPayment

key: "totalRepayment"
  expression: "monthlyPayment * years * 12 + fees"
  scope: { ..., monthlyPayment: 1775.43, ... }  ← derived builds on itself
  result: 427903.2

key: "totalInterest"
  expression: "totalRepayment - principal - fees"
  result: 176703.2

key: "interestShare"
  expression: "(totalInterest / max(totalRepayment, 1)) * 100"
  result: 41.29

key: "yearlyBreakdown"
  expression: "amortization(principal, rate, years)"
  result: [ { year:1, principalPaid: 5208.3, interestPaid: 17097.3, balance: 244791.7 }, ... ]
```

Notice: each key's result is added to `derived` before computing the next key — so later expressions can reference earlier ones (`monthlyPayment` is available when computing `totalRepayment`).

Final `derived` object:
```js
{
  monthlyPayment: 1775.43,
  totalRepayment: 427903.2,
  totalInterest: 176703.2,
  interestShare: 41.29,
  yearlyBreakdown: [ ...20 year objects ]
}
```

### Step 6 — Scope is built (used throughout rendering)

`createExpressionScope` merges everything into one flat object:

```js
{
  // helpers
  abs, ceil, floor, max, min, pow, sqrt, round,
  payment, amortization, formatCurrency, hasErrors,

  // namespaced access
  state:   { principal: 250000, rate: 7.1, years: 20, fees: 1200 },
  derived: { monthlyPayment: 1775.43, ... },
  runtime: { errors: {}, busyActions: {}, ... },

  // spread for direct access (no prefix needed in expressions)
  principal: 250000,
  rate: 7.1,
  years: 20,
  fees: 1200,
  monthlyPayment: 1775.43,
  totalRepayment: 427903.2,
  ...
}
```

This is why `"principal >= 1000"` works in expressions — `principal` is directly on the scope.

---

## PHASE 4 — Building the Execution Context

### Step 7 — `executeAction` function is created in `JsonRenderer`

```js
const executeAction = async (actionName, extras = {}, options = {}) => {
  const context = {
    state: engine.state,
    derived: engine.derived,
    runtime: engine.runtime,
    getValue(path) { return getIn(context.state, path); },
    setValue(path, value) {
      context.state = setIn(context.state, path, value);
      context.derived = computeDerived(...);
      engine.setValue(path, value);          // triggers React re-render
    },
    setValues(values) { ... },
    setErrors(errors) { engine.setErrors(errors); },
    clearErrors() { engine.clearErrors(); },
    setBusy(name, busy) { engine.setBusy(name, busy); },
    setLastAction(name) { engine.setLastAction(name); },
    setNavigation(payload) { engine.setNavigation(payload); },
    setActionResult(name, result) { engine.setActionResult(name, result); },
    onNavigate,
    executeAction(nextAction, nextExtras) { return executeAction(nextAction, nextExtras); },
  };

  return await executeActionFlow({ actionName, actions: schema.actions, registry: actionRegistry, context, extras });
};
```

The context object acts as the bridge between action handlers and React state — every call to `engine.setValue` etc. triggers a `dispatch` to `useReducer`, causing a re-render.

---

## PHASE 5 — Rendering the UI Tree

### Step 8 — `renderNode(schema.ui, context)` is called

```js
renderNode(schema.ui, {
  state: engine.state,
  derived: engine.derived,
  runtime: engine.runtime,
  locals: {},
  componentRegistry,
  getValue: (path) => getIn(engine.state, path),
  setValue: engine.setValue,
  executeAction: (actionName, extras) => executeAction(actionName, extras, { swallowErrors: true }),
})
```

This calls `renderNodeInternal(schema.ui, context, "root")`.

---

### Step 9 — Each node is processed by `renderNodeInternal`

For every node in the tree, three checks run in order:

**Check A — `each` (iteration)**
```js
if (node.each?.expr) { ... }
```
Not used in interestSchema. If present, would evaluate the expression and repeat the node once per array item, injecting `item` and `index` into locals.

**Check B — `visibleWhen` (conditional rendering)**
```js
if (typeof node.visibleWhen === "string" && !evaluate(node.visibleWhen, scope)) {
  return null;
}
```

Example — the warning text node:
```json
{ "visibleWhen": "monthlyPayment > 2200" }
```
With `monthlyPayment = 1775.43` → `1775.43 > 2200` → `false` → this node returns `null` (not rendered).

Example — the success text node:
```json
{ "visibleWhen": "runtime.lastAction === 'requestQuote' && !hasErrors(runtime.errors)" }
```
With `lastAction = null` at startup → `false` → not rendered.

**Check C — look up component in registry**
```js
const Component = context.componentRegistry[node.type];
// node.type = "Container" → Container React component
```
If the type isn't in the registry → returns `null`.

---

### Step 10 — `mapProps()` resolves all props

For each key in `node.props`, the value is resolved based on its shape:

**Shape 1 — Bind (two-way binding)**
```json
{ "bind": "principal" }
```
```js
mappedProps["value"] = context.getValue("principal");        // → 250000
mappedProps["onChange"] = (nextValue) => context.setValue("principal", nextValue);
```
The `inferEventName` helper maps `"value"` → `"onChange"` automatically.

**Shape 2 — Action binding**
```json
{ "action": "requestQuote" }
```
```js
mappedProps["onClick"] = () => context.executeAction("requestQuote", {});
```

**Shape 3 — Expression**
```json
{ "expr": "runtime.busyActions.requestQuote === true" }
```
```js
// evaluate("runtime.busyActions.requestQuote === true", scope)
// → false (not busy yet)
mappedProps["disabled"] = false;
```

**Shape 4 — Template string interpolation**
```json
"{{formatCurrency(monthlyPayment)}}"
```
`interpolate.js` finds `{{ ... }}` with regex `/\{\{(.*?)\}\}/g`:
```js
// Single full-string match → returns the raw evaluated value (not stringified)
evaluate("formatCurrency(monthlyPayment)", scope)
// → "$1,775"
mappedProps["content"] = "$1,775";
```

For partial interpolation like `"{{years}} years"`:
```js
"{{years}} years".replace(/\{\{(.*?)\}\}/g, ...)
// → "20 years"
```

**Shape 5 — Plain object (recursive)**
```json
{ "label": "Principal", "min": 1000 }
```
Each entry is resolved individually — literals pass through as-is.

**Shape 6 — Error expression**
```json
{ "expr": "runtime.errors.principal" }
```
```js
// evaluate → undefined (no errors yet)
mappedProps["error"] = undefined;
```

---

### Step 11 — Children are recursively rendered

```js
const children = node.children.map((child, index) =>
  <React.Fragment key={`root-child-${index}`}>
    {renderNodeInternal(child, context, `root-child-${index}`)}
  </React.Fragment>
);
```

This recurses depth-first through the entire tree. The full interestSchema tree:

```
root: Container (variant="page")
  ├── [0] Card (tone="hero")
  │     ├── Text (eyebrow) → "Controlled React Runtime"
  │     ├── Text (h1 display) → "Loan Studio"
  │     └── Text (lead) → description
  │
  ├── [1] Container (variant="split")
  │     ├── Card (title="Scenario inputs")
  │     │     ├── NumberInput  label="Principal"  value=250000  onChange=fn
  │     │     ├── Slider       label="Interest rate"  value=7.1  onChange=fn
  │     │     ├── Select       label="Term"  value=20  onChange=fn
  │     │     ├── NumberInput  label="Closing fees"  value=1200  onChange=fn
  │     │     └── Container (variant="actions")
  │     │           ├── Button  label="Request quote"  onClick=fn  disabled=false
  │     │           └── Button  label="Reset scenario"  onClick=fn
  │     │
  │     └── Card (title="Derived summary")
  │           ├── Text (metric) → "$1,775"
  │           ├── Text (caption) → "Estimated monthly payment"
  │           ├── StatGrid  items=[{label, value}, ...]
  │           ├── Text (visibleWhen: monthlyPayment > 2200) → null (hidden)
  │           └── Text (visibleWhen: lastAction === 'requestQuote'...) → null (hidden)
  │
  └── [2] Card (title="Yearly payoff profile")
        └── BarChart  data=[...20 year rows]  bars=[principal, interest]
```

---

### Step 12 — React component is returned

```jsx
return <Component key="root" {...mappedProps}>{children}</Component>;
```

Each resolved component is a real React component from the registry. React mounts them all to the DOM.

---

## PHASE 6 — User Interaction (State Update)

### Step 13 — User changes the Principal input

```
User types "300000" in NumberInput
  → onChange fires with value 300000
  → mapProps wired: onChange = (v) => context.setValue("principal", v)
  → context.setValue("principal", 300000) runs:
      context.state = setIn(context.state, "principal", 300000)
      context.derived = computeDerived(schema.derived, context.state, ...)  ← sync update
      engine.setValue("principal", 300000)
        → dispatch({ type: "SET_VALUE", path: "principal", value: 300000 })
        → engineReducer runs:
            return { ...store, values: setIn(store.values, "principal", 300000) }
        → store.values.principal = 300000
  → useMemo re-runs computeDerived (dependency changed)
  → all derived values recompute with new principal
  → React re-renders components that read principal or derived values
```

`setIn` does an immutable nested update using path segments:
```js
setIn({ principal: 250000, rate: 7.1 }, "principal", 300000)
// → { principal: 300000, rate: 7.1 }  (new object, original untouched)
```

`getIn` reads nested paths:
```js
getIn(state, "user.profile.age")
// → state["user"]["profile"]["age"]
```

---

## PHASE 7 — Action Execution

### Step 14 — User clicks "Request quote"

```
Button onClick fires
  → executeAction("requestQuote", {})
  → executeActionFlow({ actionName: "requestQuote", actions: schema.actions, ... })
```

Inside `executeActionFlow`:

```js
context.setLastAction("requestQuote");       // runtime.lastAction = "requestQuote"
context.setLastError(null);
context.setBusy("requestQuote", true);       // runtime.busyActions.requestQuote = true
```

Button re-renders: `disabled = evaluate("runtime.busyActions.requestQuote === true") = true` → disabled.

---

### Step 15 — `executeSteps` processes each step

Steps run sequentially using `for...of` (async/await):

**Step 0 — validate**
```json
{
  "type": "validate",
  "rules": [
    { "field": "principal", "test": "principal >= 1000", "message": "Principal must be at least $1,000." },
    { "field": "rate",      "test": "rate > 0 && rate <= 20", "message": "..." },
    { "field": "years",     "test": "years >= 1 && years <= 30", "message": "..." },
    { "field": "fees",      "test": "fees >= 0", "message": "..." }
  ]
}
```

`validateHandler` runs:
```js
for (const rule of step.rules) {
  const fieldValue = context.getValue(rule.field);   // e.g. 300000
  const passes = evaluate(rule.test, scope);          // evaluate("principal >= 1000") → true
  if (!passes) nextErrors[rule.field] = rule.message;
}

context.setErrors(nextErrors);   // {} (all pass)

if (Object.keys(nextErrors).length > 0) {
  throw new Error("Validation failed.");  // not thrown — all valid
}
```

→ `lastResult = true`, move to next step.

**Step 1 — log**
```json
{
  "type": "log",
  "payload": {
    "principal":      { "expr": "principal" },
    "rate":           { "expr": "rate" },
    "monthlyPayment": { "expr": "monthlyPayment" }
  }
}
```

`logHandler` runs:
```js
const payload = context.resolve(step.payload);
// resolveSchemaValue resolves each { expr } → actual values
// payload = { principal: 300000, rate: 7.1, monthlyPayment: 2120.34 }

console.info("[engine:log]", payload);
```

→ `lastResult = { principal: 300000, ... }`, move to next step.

**Step 2 — alert**
```json
{
  "type": "alert",
  "message": "Projected payment: {{formatCurrency(monthlyPayment)}} each month."
}
```

`alertHandler` runs:
```js
const message = context.resolve(step.message);
// interpolate("Projected payment: {{formatCurrency(monthlyPayment)}} each month.", scope)
// → "Projected payment: $2,120 each month."

window.alert("Projected payment: $2,120 each month.");
```

---

### Step 16 — Action completes

Back in `executeActionFlow`:
```js
context.setActionResult("requestQuote", true);   // runtime.actionResults.requestQuote = true
context.setBusy("requestQuote", false);          // runtime.busyActions.requestQuote = false
```

Button re-renders: `disabled = false` → clickable again.

The success text node re-evaluates its `visibleWhen`:
```
"runtime.lastAction === 'requestQuote' && !hasErrors(runtime.errors)"
→ "requestQuote" === "requestQuote" && !hasErrors({})
→ true && true
→ true
```

The success message **appears** on the page.

---

### Step 17 — Validation failure path (if user enters bad data)

If `principal = 500` (below 1000):

```js
// validate handler:
evaluate("principal >= 1000") → false
nextErrors = { principal: "Principal must be at least $1,000." }
context.setErrors({ principal: "Principal must be at least $1,000." })
throw new Error("Validation failed.")
```

`executeSteps` catches the error. Since the `validate` step has no `onError`, it re-throws.

`executeActionFlow` catches:
```js
context.setLastError("Validation failed.");
context.setBusy("requestQuote", false);
throw error;   // re-thrown
```

`JsonRenderer` catches with `{ swallowErrors: true }` → error is suppressed.

The `error` prop on NumberInput re-renders:
```json
{ "expr": "runtime.errors.principal" }
→ "Principal must be at least $1,000."
```

The error message appears under the input field.

---

## Complete Flow Summary

```
interestSchema.json (imported as JS object)
         │
         ▼
  App.jsx → <JsonRenderer schema={...} />
         │
         ▼
  ① validateSchema()
     ├─ parse all expressions (no eval, just syntax check)
     ├─ check all component types exist in registry
     ├─ check all action types exist in registry
     └─ if errors → render <ValidationPanel>, stop
         │
         ▼
  ② useEngineState(schema)
     ├─ createInitialStore(schema.state) → { values, runtime }
     └─ computeDerived(schema.derived, values) → derived object
         │
         ▼
  ③ renderNode(schema.ui, context)
     └─ for each node recursively:
         ├─ evaluate visibleWhen → skip if false
         ├─ evaluate each.expr → repeat if array
         ├─ look up component in registry
         ├─ mapProps():
         │   ├─ { bind }   → value + onChange handler
         │   ├─ { action } → onClick handler
         │   ├─ { expr }   → evaluate expression
         │   └─ "{{...}}"  → interpolate template
         └─ return <Component {...props}>{children}</Component>
         │
         ▼
  ④ React mounts DOM — page visible
         │
         ▼
  ⑤ User changes input
     └─ onChange → setValue() → dispatch SET_VALUE
        → engineReducer → new store.values
        → useMemo recomputes derived
        → React re-renders affected components
         │
         ▼
  ⑥ User clicks button
     └─ executeAction("requestQuote")
        ├─ setBusy(true) → button disabled
        ├─ executeSteps() sequentially:
        │   ├─ validate → check rules → throw if fail
        │   ├─ log      → console.info
        │   └─ alert    → window.alert
        └─ setBusy(false) → button re-enabled
           setLastAction → success text appears
```
