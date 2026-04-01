# Frontend Runtime Comparison Report

## Scope

This report compares three approaches for LLM-generated UI in a React Native product:

1. `WebView runtime`
   The LLM returns `HTML + CSS + JS`, and the app renders it inside a `WebView`.
2. `Runtime-generated React Native code`
   The LLM returns React Native component code, and the app compiles/evaluates it on-device.
3. `Pre-built native components + JSON schema`
   The app owns the component library and rendering engine. The LLM returns only JSON describing structure, props, formulas, and actions.

This repo currently implements approach 3 as a web prototype, but the architectural comparison still maps well to React Native because the main difference is the render target, not the control model.

## Executive Summary

For a production mobile app, approach 3 is the strongest default.

Why:

- It is the safest of the three approaches.
- It gives the best native feel among dynamic-runtime options.
- It keeps LLM payload size lowest.
- It avoids the heavy startup, memory, and interaction cost of `WebView`.
- It avoids the operational and security complexity of compiling arbitrary React Native code on-device.

Short recommendation:

- Choose `pre-built components + JSON schema` if the goal is a shippable, scalable product.
- Choose `WebView` only if maximum visual freedom is more important than native UX and performance.
- Avoid `runtime-generated React Native code` as a primary runtime architecture.

## Current Engine In This Repo

The current schema-driven runtime is implemented through:

- [JsonRenderer.jsx](/Users/dhanesh/Desktop/p/practice/sss_ui_react/src/engine/renderer/JsonRenderer.jsx)
- [renderNode.jsx](/Users/dhanesh/Desktop/p/practice/sss_ui_react/src/engine/renderer/renderNode.jsx)
- [resolveValue.js](/Users/dhanesh/Desktop/p/practice/sss_ui_react/src/engine/renderer/resolveValue.js)
- [schemaValidator.js](/Users/dhanesh/Desktop/p/practice/sss_ui_react/src/engine/validation/schemaValidator.js)
- [useEngineState.js](/Users/dhanesh/Desktop/p/practice/sss_ui_react/src/engine/state/useEngineState.js)
- [evaluate.js](/Users/dhanesh/Desktop/p/practice/sss_ui_react/src/engine/expression/evaluate.js)
- [registry.js](/Users/dhanesh/Desktop/p/practice/sss_ui_react/src/engine/renderer/registry.js)

At runtime it does four main things:

1. Parse and normalize schema.
2. Validate allowed components/actions/expressions.
3. Compute derived values and action flows.
4. Render registered components.

This is much lighter than running a full browser surface inside React Native.

## Measured Numbers From This Repo

These numbers are measured directly from the current codebase.

### Engine And Example Payload

- Engine + component source:
  - `31` JS/JSX files
  - `63,993` characters total
  - roughly `15,999` tokens
- Current example schema as pretty JSON:
  - `13,086` characters
  - roughly `3,272` tokens
- Current example schema as minified JSON payload:
  - `12,064` characters
  - roughly `3,016` tokens
- Current string-backed schema source file:
  - `22,761` characters
  - roughly `5,691` tokens

Important interpretation:

- The engine cost is mostly a one-time platform cost.
- The per-screen cost is mainly the schema payload.
- As you add more screens, the engine becomes cheaper per screen.

### Current Example Complexity

The current interest tracker schema contains:

- `48` UI nodes
- `3` named actions
- `4` top-level action steps
- `17` expressions
- `19` template interpolations

### Current Build Output

Latest measured build output:

- JS bundle: about `210.06 kB` raw, `66.40 kB` gzip
- CSS bundle: about `41.88 kB` raw, `7.60 kB` gzip

These are not React Native bundle sizes, but they are still useful for understanding the current engine footprint.

## Comparison Summary

| Dimension | WebView | Runtime RN Code | Pre-built Components + JSON |
|---|---|---|---|
| Startup cost | High | Very high | Low |
| Memory cost | High | High to very high | Low to medium |
| Native look/feel | Low to medium | High | High |
| Safety | Medium | Low | High |
| Validation/control | Low | Low | High |
| LLM payload size | Medium-high | High | Low |
| Dev complexity | Medium | Very high | Medium |
| Old phone risk | High | Very high | Lowest of the three |
| Best use case | Maximum freedom | Almost never at runtime | Production system |

## Detailed Comparison

## 1. WebView Runtime

### What Happens

The app loads a browser surface inside React Native, then the device must:

- initialize the `WebView`
- parse HTML
- parse CSS
- execute JS
- lay out and paint DOM content
- coordinate any RN-to-web communication over a bridge

### Strengths

- Highest visual flexibility after raw code generation
- LLMs are usually good at generating HTML/CSS/JS
- Easy to reuse existing web content
- Charts and layout systems are easy in web tech

### Weaknesses

- Not truly native UI
- Higher memory usage
- Slower startup on weak devices
- More jank risk on scroll, forms, and gestures
- More complicated keyboard, navigation, and bridge behavior
- Accessibility quality is usually weaker than native components

### Estimated Runtime Cost

Compared to the schema engine approach, `WebView` is usually:

- about `1.5x to 3x` slower on first load for medium screens
- often `10 MB to 40+ MB` heavier in memory
- more likely to show visible lag on older devices

These are practical engineering estimates, not benchmarked numbers from this repo.

### Old Phone Behavior

On older phones, `WebView` is the most likely place to see:

- delayed initial render
- blank white flashes before paint
- typing lag in forms
- stutter during scroll
- sluggish charts or visual effects
- more aggressive OS kills under memory pressure

## 2. Runtime-Generated React Native Code

### What Happens

The LLM returns React Native component code and the device must:

- receive raw code
- transpile/compile/evaluate it
- provide a component/runtime environment
- mount the generated component tree

### Strengths

- Maximum theoretical flexibility
- Can express anything React Native can express
- Native component model if it works correctly

### Weaknesses

- Hardest to secure
- Hardest to validate
- Hardest to maintain
- Highest runtime CPU cost
- Brittle import/dependency/runtime issues
- Not a good fit for product-grade runtime execution

### Estimated Runtime Cost

Compared to the schema engine approach, runtime-generated RN code is usually:

- about `3x to 10x` heavier on first load
- the most likely to stall the JS thread
- the hardest to make reliable across devices

This is the worst of the three as an on-device runtime strategy.

### Important Caveat

If the RN code is generated ahead of time and compiled in the normal build pipeline, then this approach changes category entirely. In that build-time case, raw React Native code can outperform the schema runtime. This report is only about runtime generation on device.

## 3. Pre-built Native Components + JSON Schema

### What Happens

The device does:

- parse JSON
- validate schema
- evaluate a limited expression language
- compute derived values
- render already-built trusted components

### Strengths

- Safest runtime model
- Lowest payload size
- Best native UX among dynamic options
- Most controllable and auditable
- Best fit for a design-system-first product
- Easy to whitelist allowed components and actions

### Weaknesses

- Lower flexibility than arbitrary code
- Requires upfront engine investment
- Requires ongoing maintenance of schema contract and registry
- Novel screens may require adding new components

### Estimated Runtime Cost

This is the lightest of the three dynamic approaches.

Most of the work is:

- JSON parse
- validation
- small expression evaluation
- React rendering of trusted components

For schemas in the current repo size range, JSON parse cost is small relative to the cost of a `WebView` boot or runtime code compilation.

## Performance Comparison

## Relative Runtime Cost

Using the schema engine as baseline:

- `Pre-built components + JSON schema`: `1.0x`
- `WebView`: roughly `1.5x to 3x`
- `Runtime-generated RN code`: roughly `3x to 10x`

These are directional estimates meant for planning.

## Relative Jank Risk On Older Phones

- `Pre-built components + JSON schema`: low to medium
- `WebView`: medium to high
- `Runtime-generated RN code`: high to very high

The main reason is that older devices are much more sensitive to:

- browser runtime startup
- extra memory pressure
- JS-thread blocking
- large render trees with visual effects

## Native Features Limited Or Weakened By WebView

Using `WebView` weakens or complicates:

- native navigation integration
- gesture consistency
- keyboard behavior
- native accessibility semantics
- screen reader quality
- list virtualization performance
- native animations and transitions
- haptics
- biometrics
- camera and file picker flows
- permissions UX
- deep native theming and OS-level polish
- reliable offline/native state integration

These things are not impossible in `WebView`, but they become more complex and less natural.

## What You Gain With Pre-built Components

Using pre-built components gives:

- native rendering
- better accessibility
- better scrolling and form behavior
- lower memory use
- lower startup cost
- easier validation
- easier governance over what the LLM can produce
- smaller per-screen payloads
- stronger design-system consistency

It also makes LLM output safer:

- the LLM controls intent and structure
- the app controls execution and rendering

That is the most important product-level architectural benefit.

## Code Size Implications

## Schema Approach

Per-screen payload is low:

- current minified schema payload is about `12,064` characters
- roughly `3,016` tokens

This is usually the best model when you expect many dynamically generated screens.

## WebView Approach

Equivalent screens usually require:

- full HTML structure
- CSS styling
- JS behavior

That tends to increase LLM output size significantly versus schema.

## Runtime RN Code Approach

This is usually the largest output because the LLM must generate:

- component structure
- styling
- state handling
- event handlers
- validation
- data transformations

That is usually the worst of the three for token cost.

## Recommendation Matrix

### If The Goal Is A Shippable Product

Use `pre-built components + JSON schema`.

### If The Goal Is Maximum Freedom With Minimum Platform Work

Use `WebView`, but accept:

- higher runtime cost
- weaker native UX
- worse old-device behavior

### If The Goal Is Unlimited Native Flexibility At Runtime

Do not use runtime-generated RN code as the main architecture.

## Team Recommendation

For the frontend team, the recommended path is:

1. Keep the schema-driven runtime as the main architecture.
2. Expand the native component registry deliberately.
3. Keep the schema contract strict and validated.
4. Add performance budgets for:
   - maximum node count
   - chart complexity
   - number of expensive visual effects
   - derived recomputation frequency
5. Use `WebView` only for exceptional cases where native parity is not required.

## What To Benchmark Next

To replace estimates with team-safe numbers, benchmark the same screen in all three modes on:

- low-end Android
- mid-range Android
- recent Android
- older iPhone
- recent iPhone

Measure:

- time to first paint
- time to interactive
- memory usage after render
- scroll FPS
- input latency
- CPU spikes during updates

## Final Conclusion

For React Native, `pre-built components + JSON schema` is the best balanced architecture.

It will usually be:

- faster than `WebView`
- lighter on memory than `WebView`
- much safer than runtime-generated RN code
- easier to scale as a product platform

If the team wants a single sentence:

`WebView` buys freedom by embedding a browser; the schema runtime buys performance, control, and native UX by keeping rendering inside trusted native components.
