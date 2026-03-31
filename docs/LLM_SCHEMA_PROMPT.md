Generate a valid JSON website schema for this UI runtime.

Rules:
- Output JSON only
- Use full property names, not aliases
- Use only these top-level keys: `state`, `derived`, `actions`, `ui`
- Use only these styling props: `className`, `tone`, `variant`
- Use Tailwind utility classes in a plain literal `className` string
- Do not use inline `style`
- Do not invent components, props, helpers, actions, or syntax not listed here
- Build a real responsive website, not a bare demo block or plain form
- Use `className` heavily for layout, spacing, colors, typography, and responsive design
- Prefer `className` over built-in `tone` or `variant` defaults for custom visual design

Schema shape:
```json
{
  "state": {},
  "derived": {},
  "actions": {},
  "ui": {}
}
```

Node shape:
```json
{
  "type": "ComponentName",
  "props": {},
  "children": [],
  "visibleWhen": "expression",
  "each": {
    "expr": "items",
    "item": "item",
    "index": "i"
  }
}
```

Required:
- `state`, `derived`, `actions`, `ui`
- Every UI node must have `type`

Dynamic values:
- expression: `{ "expr": "price * qty" }`
- binding: `{ "bind": "loan.amount" }`
- action event: `{ "action": "submitForm" }`
- interpolation: `"Total: {{formatCurrency(total)}}" `

Expression rules:
- Expressions are plain strings
- `visibleWhen` must be a string, not an object
- `derived.someKey` must be a string or `{ "expr": "..." }`
- Allowed syntax: numbers, strings, `true`/`false`/`null`, `+ - * / % **`, comparisons, `&&`, `||`, `!`, ternary, dot access, direct helper calls like `formatCurrency(total)`
- Allowed scope: state keys directly, `state.*`, `derived.*`, `runtime.*`, `item`, `i`, and helper names
- Dot paths are supported in state updates, for example `profile.name` or `filters.price.min`
- Do not use array literals, object literals, bracket access, arrow functions, method chains, or `.map/.filter/.reduce`
- Do not use `{ "expr": ... }` or `{{...}}` for `className`
- Arrays and objects must be written as normal JSON in props; only individual field values inside them may use `{ "expr": "..." }`
- Use `{ "bind": "..." }` only for input values like `NumberInput.value`, `Select.value`, or `Slider.value`

Readable runtime values in expressions:
- `runtime.errors.fieldName`
- `runtime.busyActions.actionName`
- `runtime.lastAction`
- `runtime.lastError`
- `runtime.actionResults.actionName`

Allowed helpers:
- `abs`, `ceil`, `floor`, `max`, `min`, `pow`, `sqrt`, `round`
- `formatCurrency`, `hasErrors`, `payment`, `amortization`

Allowed components:
- `Container`
  - optional props: `variant`, `gap`, `align`, `justify`, `wrap`, `className`
  - `variant`: `page`, `split`, `actions`
- `Text`
  - optional props: `as`, `content`, `tone`, `align`, `className`
  - `tone`: `eyebrow`, `display`, `lead`, `metric`, `caption`, `note`, `success`
- `Button`
  - required props: `label`
  - optional props: `onClick`, `variant`, `disabled`, `className`
  - `variant`: `primary`, `secondary`
- `NumberInput`
  - required props: `label`
  - optional props: `value`, `min`, `max`, `step`, `prefix`, `hint`, `error`, `className`
- `Select`
  - required props: `label`, `options`
  - optional props: `value`, `hint`, `error`, `className`
- `Slider`
  - required props: `label`
  - optional props: `value`, `min`, `max`, `step`, `suffix`, `hint`, `error`, `className`
- `Card`
  - optional props: `title`, `subtitle`, `tone`, `className`
  - `tone`: `hero`
- `StatGrid`
  - required props: `items`
  - optional props: `className`
- `BarChart`
  - required props: `data`, `bars`
  - optional props: `labelKey`, `maxBars`, `className`

Special prop formats:
- `Select.options`
```json
[
  { "label": "Basic", "value": "basic" },
  { "label": "Pro", "value": "pro" }
]
```
- `StatGrid.items`
```json
[
  { "label": "Revenue", "value": "{{formatCurrency(revenue)}}" }
]
```
- `BarChart.bars`
```json
[
  { "key": "sales", "label": "Sales", "className": "fill-cyan-500" }
]
```
- `BarChart.data`
```json
[
  { "label": "Jan", "sales": { "expr": "monthlySales" } }
]
```

Allowed action types:
- `set`
- `validate`
- `alert`
- `log`
- `navigate`
- `run`
- `condition`
- `api_request`

Action step control keys:
- Any step may also use optional `when`, `onSuccess`, `onError`
- `when` is an expression string; the step runs only if it is truthy
- `onSuccess` and `onError` are arrays of more action steps

Action formats:
- `set`
  - required: `values`
  - optional: `clearErrors`
- `validate`
  - required: `rules`
  - optional: `errorMessage`
  - each rule:
    - required: `field`
    - optional: `test`, `message`, `required`
  - inside `test`, you may use `value` and `field`
- `alert`
  - required: `message`
- `log`
  - required: `payload`
- `navigate`
  - required: `to`
  - optional: `replace`, `meta`
- `run`
  - required: `action`
  - optional: `with`
- `condition`
  - required: `test`
  - optional: `then`, `else`
- `api_request`
  - required: `url`
  - optional: `method`, `headers`, `body`, `into`, `saveAs`, `errorMessage`
  - `into` saves the response into state using a dot path
  - `saveAs` saves the response into `runtime.actionResults.saveAs`

Action flow notes:
- `run.with` passes extra values into the nested action
- Inside action expressions and action payloads you may use `lastResult`
- Inside `onSuccess` you may also use `result`
- Inside `onError` you may also use `error`
- Inside input `bind` transforms you may also use `input` and `current`

Design requirements:
- Create a clear visual direction matching the requested website
- Use multiple sections when appropriate, such as hero, feature/content blocks, stats, CTA, and footer
- Use strong typography hierarchy, spacing rhythm, and contrast
- Make the layout responsive with Tailwind breakpoints like `sm:`, `md:`, `lg:`
- Avoid placeholder copy, weak generic dashboards, and one-card layouts unless the request truly needs that

Now generate a complete schema for: [describe the website here]
