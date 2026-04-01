Generate a valid JSON website schema for this UI runtime.

Rules:
- Output JSON only
- Use full property names, not aliases
- Use only these top-level keys: `state`, `derived`, `actions`, `ui`
- Use Tailwind utility classes in a plain literal `className` string
- Do not use inline `style`
- Do not invent components, props, helpers, actions, or syntax not listed here
- We are using shadcn/ui components
- We also support a small set of primitive HTML-style components for layouts or visuals that are too custom for shadcn/ui alone
- Use only the components listed below
- Build a real responsive website, not a bare demo block
- Use `className` heavily for layout with `flex`, `grid`, `gap`, `space-y`, `max-w-*`, `mx-auto`, and responsive breakpoints

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
- binding: `{ "bind": "form.email" }`
- binding with transform: `{ "bind": "principal", "transform": "+input" }`
- action event: `{ "action": "submitForm" }`
- interpolation: `"Total: {{formatCurrency(total)}}" `

Expression rules:
- Expressions are plain strings
- `visibleWhen` must be a string, not an object
- `derived.someKey` must be a string or `{ "expr": "..." }`
- Allowed syntax: numbers, strings, `true`/`false`/`null`, `+ - * / % **`, comparisons, `&&`, `||`, `!`, ternary, dot access, direct helper calls
- Allowed scope: state keys directly, `state.*`, `derived.*`, `runtime.*`, `item`, `i`, and helper names
- Dot paths are supported in state updates, for example `profile.name`
- Do not use array literals, object literals, bracket access, arrow functions, method chains, or `.map/.filter/.reduce`
- Do not use `{ "expr": ... }` or `{{...}}` for `className`
- Arrays and objects must be normal JSON in props; only individual field values inside them may use `{ "expr": "..." }`
- Use `{ "bind": "..." }` only for interactive input values such as `Input.value`, `Textarea.value`, `Select.value`, and `Slider.value`

Readable runtime values:
- `runtime.errors.fieldName`
- `runtime.busyActions.actionName`
- `runtime.lastAction`
- `runtime.lastError`
- `runtime.actionResults.actionName`

Allowed helpers:
- `abs`, `ceil`, `floor`, `max`, `min`, `pow`, `sqrt`, `round`
- `formatCurrency`, `hasErrors`, `payment`, `amortization`

Allowed components:
- `Div`
  - use for a generic layout wrapper or free-form block
  - usually used with `children` for grids, flex rows, spacing groups, backgrounds, or positioned visual layers
  - optional props: `content`, `className`
- `Section`
  - use for a major page section or grouped content block
  - usually used with `children` for large page bands such as hero, features, FAQ, or footer
  - optional props: `content`, `className`
- `Span`
  - use for short inline text inside larger text or badges
  - usually used inside text-heavy layouts, not as a main layout container
  - optional props: `content`, `className`
- `P`
  - use for normal paragraph text
  - best for explanations, body copy, and supporting text
  - optional props: `content`, `className`
- `H1`
  - use for the main page heading
  - usually there should be only one main `H1` in a page hero
  - optional props: `content`, `className`
- `H2`
  - use for major section headings
  - optional props: `content`, `className`
- `H3`
  - use for smaller subsection headings or card headings
  - optional props: `content`, `className`
- `Ul`
  - use for unordered lists
  - use with `Li` children for bullets, steps, or grouped facts
  - optional props: `className`
- `Li`
  - use for a list item inside `Ul`
  - optional props: `content`, `className`
- `Img`
  - use for images, illustrations, diagrams, or icons
  - use when you need a real image source, not for decorative colored shapes
  - required props: `src`
  - optional props: `alt`, `className`
- `DropSimulation`
  - use for an animated falling and bouncing object scene
  - use when the page needs real motion, not just static explanation
  - renders a vertical scene where objects start near the top, fall downward, and bounce on the floor
  - required props: `gravity`, `height`, `objects`
  - optional props: `bounce`, `play`, `resetKey`, `className`
  - `gravity` is the gravitational strength in `m/s^2`
  - `height` is the drop height in meters
  - `bounce` is the base bounce amount from `0` to around `1`
  - `play` starts or pauses the animation
  - changing `resetKey` resets all objects to the top
  - `objects` is an array of objects like:
```json
[
  {
    "label": "Rubber ball",
    "className": "bg-sky-400",
    "x": 18,
    "size": 54,
    "bounce": { "expr": "bounce" }
  }
]
```
- for each object:
  - `label` is the visible object name
  - `className` styles the object body color
  - `x` is the horizontal lane in percent from left to right
  - `size` is the object size in pixels
  - `shape` may be `circle` or `square`
  - `bounce` overrides the final bounce amount for that object
  - `bounceMultiplier` multiplies the shared `bounce` prop for that object
- `SectionCard`
  - use for a full content section with an optional header and a body
  - this is a convenience wrapper for a repeated section pattern
  - use `children` for the actual section body
  - optional props: `badge`, `title`, `description`, `className`
- `StatCard`
  - use for one metric tile with a label and highlighted value
  - use for read-only summary numbers like revenue, score, gravity, time, count, or percentage
  - this component is self-contained and usually should not have children
  - optional props: `label`, `value`, `description`, `className`
- `InfoCard`
  - use for a small text card like a feature, tip, fact, or FAQ item
  - use for read-only explanation blocks
  - this component is self-contained and usually should not have children
  - optional props: `title`, `description`, `className`
- `DataTable`
  - use for standard structured data tables
  - use when all rows follow the same columns, such as comparisons, pricing, schedules, or facts
  - required props: `columns`, `rows`
  - optional props: `className`
  - `columns` is an array like:
```json
[
  { "key": "planet", "label": "Planet" },
  { "key": "gravity", "label": "Gravity" }
]
```
  - the order of `columns` controls the visible column order
  - each row should provide values for those same `key` names
  - `rows` is an array like:
```json
[
  {
    "planet": { "content": "Earth", "className": "text-white" },
    "gravity": { "content": "9.81 m/s²", "className": "text-slate-300" }
  }
]
```
  - each row cell may be:
    - a plain string or number
    - or an object like `{ "content": "...", "className": "..." }`
- `Badge`
  - use for short status tags or small highlights
  - keep badge text short, usually one to three words
  - optional props: `label`, `variant`, `className`
  - `variant`: `default`, `secondary`, `outline`, `success`
- `Button`
  - use for clickable actions
  - use for submit, reset, open, continue, or other user actions
  - required props: `label`
  - optional props: `onClick`, `variant`, `disabled`, `className`
  - `variant`: `primary`, `secondary`
- `Input`
  - use for one-line text or number entry
  - use for text, email, URL, password, search, or numeric entry
  - when using `type: "number"`, prefer `{ "bind": "...", "transform": "+input" }` so the value becomes a number
  - `hint` is helper text shown below the field
  - `error` is validation text shown below the field
  - optional props: `label`, `value`, `placeholder`, `type`, `min`, `max`, `step`, `hint`, `error`, `disabled`, `className`
  - `type`: `text`, `email`, `password`, `search`, `url`, `number`
- `Textarea`
  - use for longer multi-line text entry
  - use for messages, notes, descriptions, prompts, or feedback
  - optional props: `label`, `value`, `placeholder`, `rows`, `hint`, `error`, `disabled`, `className`
- `Label`
  - use for short captions, field labels, or small headings
  - use when you need small supporting text without the full styling of a heading
  - optional props: `content`, `className`
- `Select`
  - use for choosing one option from a dropdown list
  - use when the user must choose one value from a predefined set
  - required props: `label`, `options`
  - optional props: `value`, `hint`, `error`, `className`
  - `options` may be:
    - simple values like `["Moon", "Earth", "Mars"]`
    - or objects like `{ "label": "Earth", "value": "earth" }`
- `Slider`
  - use for numeric input over a range
  - use for interactive ranges such as price, gravity, opacity, volume, or years
  - the current value is shown automatically next to the label
  - `suffix` is appended to the visible value, such as `" kg"` or `" m/s²"`
  - required props: `label`
  - optional props: `value`, `min`, `max`, `step`, `suffix`, `hint`, `error`, `className`
- `Separator`
  - use for visual dividers between content blocks
  - optional props: `orientation`, `className`
  - `orientation`: `horizontal`, `vertical`
- `Alert`
  - use for highlighted messages, summaries, warnings, or tips
  - usually contains `AlertTitle` and `AlertDescription` as children
  - optional props: `className`
- `AlertTitle`
  - use for the short heading inside an `Alert`
  - optional props: `content`, `className`
- `AlertDescription`
  - use for the supporting text inside an `Alert`
  - optional props: `content`, `className`
- `Card`
  - use for a general boxed surface or content container
  - use as a flexible shell for dashboards, forms, feature panels, or grouped content
  - usually composed with `CardHeader`, `CardContent`, and `CardFooter`
  - optional props: `className`
- `CardHeader`
  - use for the top area of a `Card`
  - usually contains `Badge`, `CardTitle`, and `CardDescription`
  - optional props: `className`
- `CardTitle`
  - use for the main heading inside a `Card`
  - optional props: `content`, `className`
- `CardDescription`
  - use for supporting text under a `CardTitle`
  - optional props: `content`, `className`
- `CardContent`
  - use for the main body area inside a `Card`
  - usually contains grids, inputs, charts, tables, stats, or paragraphs
  - optional props: `className`
- `CardFooter`
  - use for actions or secondary content at the bottom of a `Card`
  - usually contains buttons or short follow-up content
  - optional props: `className`
- `Table`
  - use for a manual table when `DataTable` is not flexible enough
  - prefer `DataTable` first; use manual table components only when custom row structure is required
  - optional props: `className`
- `TableHeader`
  - use for the header section of a manual table
  - optional props: `className`
- `TableBody`
  - use for the body rows of a manual table
  - optional props: `className`
- `TableRow`
  - use for one row in a manual table
  - optional props: `className`
- `TableHead`
  - use for one header cell in a manual table
  - optional props: `content`, `className`
- `TableCell`
  - use for one body cell in a manual table
  - optional props: `content`, `className`

Composition rules:
- Prefer reusable high-level components like `SectionCard`, `StatCard`, `InfoCard`, and `DataTable` when they fit the page
- `StatCard` and `InfoCard` are self-contained display components; do not use them as large layout wrappers
- `SectionCard` is the better choice when you need a repeated section shell with body children
- Use `Card` as the main section/layout wrapper when the UI fits normal shadcn/ui composition
- Use `CardHeader` for section intro area
- Put headings in `CardTitle`
- Put supporting text in `CardDescription`
- Put main body layout inside `CardContent`
- Put actions inside `CardFooter`
- Use nested `Card` blocks to create grids, stat tiles, and feature panels
- Use `Label` for short captions, field labels, and stat labels
- Use `Alert` with `AlertTitle` and `AlertDescription` for highlighted callouts, warnings, tips, or summaries
- Use `Table` only for tabular data, not for general page layout
- Use `Separator` to divide sections inside a card
- Use `Card`, `CardContent`, `CardTitle`, `CardDescription`, `Label`, and `Badge` to build the page structure and text hierarchy
- Use primitive components like `Div`, `Section`, `P`, `Span`, `H1`, `H2`, `H3`, `Ul`, `Li`, and `Img` when you need a more custom composition, layered visual layout, or free-form content structure than a standard shadcn/ui card layout provides
- Use `DropSimulation` for animated falling-object scenes, gravity demos, bounce demos, or playground-style motion areas
- Use `SectionCard` instead of manually repeating `Card` + `CardHeader` + `CardTitle` + `CardDescription` + `CardContent` when the pattern is standard
- Use `StatCard` for small metric tiles instead of manually nesting `Card`, `Label`, and value text
- Use `InfoCard` for repeated title + description tiles such as features, FAQ items, or learning tips
- Use `DataTable` for ordinary tables instead of manually writing `TableHeader`, `TableBody`, `TableRow`, `TableHead`, and `TableCell` each time
- It is valid to mix shadcn/ui components and primitive components in the same page

Recommended page structure:
- Root `ui` should usually be a `Card` or `CardContent` with page-level spacing classes
- For landing pages and dashboards, prefer multiple major sections
- Good common sections: hero, input/form area, metrics, feature grid, comparison area, FAQ/info area, CTA footer
- Prefer grids of nested cards for stats and repeated panels
- Keep headings and descriptions close to the section they describe

Valid composition patterns:
```json
{
  "type": "Card",
  "props": { "className": "border-none shadow-none" },
  "children": [
    {
      "type": "CardHeader",
      "children": [
        { "type": "Badge", "props": { "label": "Dashboard" } },
        { "type": "CardTitle", "props": { "content": "Revenue overview" } },
        { "type": "CardDescription", "props": { "content": "Track performance across channels." } }
      ]
    },
    {
      "type": "CardContent",
      "props": { "className": "grid gap-4 md:grid-cols-3" },
      "children": []
    }
  ]
}
```

```json
{
  "type": "Alert",
  "children": [
    { "type": "AlertTitle", "props": { "content": "Heads up" } },
    { "type": "AlertDescription", "props": { "content": "This action updates the current scenario." } }
  ]
}
```

Special prop formats:
- `Input.value`, `Textarea.value`, `Select.value`, `Slider.value`
```json
{ "bind": "form.email" }
```
- Numeric `Input.value`
```json
{ "bind": "principal", "transform": "+input" }
```
- `Select.options`
```json
[
  { "label": "Basic", "value": "basic" },
  { "label": "Pro", "value": "pro" }
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

Action flow notes:
- `run.with` passes extra values into the nested action
- Inside action expressions and action payloads you may use `lastResult`
- Inside `onSuccess` you may also use `result`
- Inside `onError` you may also use `error`
- Inside input `bind` transforms you may also use `input` and `current`

Design requirements:
- Use shadcn/ui composition patterns, especially `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter`
- Use primitive HTML-style components when the layout needs custom positioning, scene building, layered visuals, custom illustration blocks, or content flows that do not fit standard shadcn/ui composition
- Use `DropSimulation` when the page needs actual animated gravity or bounce behavior instead of static explanation only
- Use `Badge`, `Separator`, `Alert`, `Input`, `Textarea`, `Select`, and `Slider` where appropriate
- Use strong spacing, hierarchy, and responsive Tailwind classes like `sm:`, `md:`, and `lg:`
- Make the result feel like a polished shadcn/ui + Tailwind website, not a raw JSON dump or plain form stack
- Use nested cards, subtle borders, and spacing rhythm to create structure
- Prefer clean sections over one giant card unless the request is intentionally simple

Now generate a complete schema for: [describe the website here]
