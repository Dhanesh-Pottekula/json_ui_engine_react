import React from "react";
import { evaluate } from "../expression/evaluate.js";
import { createExpressionScope } from "../expression/scope.js";
import { mapProps } from "./resolveValue.js";

function renderNodeInternal(node, context, key) {
  // Null or missing nodes simply render nothing, which lets optional branches disappear cleanly.
  if (!node) {
    return null;
  }

  // Support schema-driven repetition like:
  // { each: { expr: "items", item: "product", index: "i" }, ...nodeTemplate }
  // The expression is evaluated against the current engine state plus any local loop variables.
  if (node.each?.expr) {
    const items = evaluate(
      node.each.expr,
      createExpressionScope({
        state: context.state,
        derived: context.derived,
        runtime: context.runtime,
        locals: context.locals,
        extras: context.extras,
      })
    );

    // Only arrays can be repeated. If the expression does not resolve to an array,
    // the repeated branch is treated as non-renderable instead of throwing.
    if (!Array.isArray(items)) {
      return null;
    }

    // Clone the current node and remove the "each" instruction so each repeated copy
    // renders like a normal node after the loop variables have been injected.
    const template = { ...node };
    delete template.each;

    // Render one copy of the node per item and extend locals with the current item/index.
    // These locals become available to expressions in props, visibility rules, and children.
    return items.map((item, index) =>
      renderNodeInternal(
        template,
        {
          ...context,
          locals: {
            ...(context.locals || {}),
            [node.each.item || "item"]: item,
            [node.each.index || "index"]: index,
          },
        },
        `${key}-${index}`
      )
    );
  }

  // visibleWhen is a schema-level conditional render.
  // If the expression evaluates to a falsy value, this node and all of its children are skipped.
  if (
    typeof node.visibleWhen === "string" &&
    !evaluate(
      node.visibleWhen,
      createExpressionScope({
        state: context.state,
        derived: context.derived,
        runtime: context.runtime,
        locals: context.locals,
        extras: context.extras,
      })
    )
  ) {
    return null;
  }

  // Component types are resolved dynamically from the registry so the schema can say
  // { type: "Button" } and the renderer can look up the actual React component to mount.
  const Component = context.componentRegistry[node.type];
  if (!Component) {
    return null;
  }

  // Convert schema props into real React props. This is where templates, expressions,
  // action bindings, and state-aware values are resolved into concrete prop values.
  const props = mapProps(node.props || {}, context);

  // Recursively render child nodes using the same context. Each child gets a stable key
  // derived from its position in the tree so React can track the nested structure.
  const children = Array.isArray(node.children)
    ? node.children.map((child, index) => (
        <React.Fragment key={`${key}-child-${index}`}>
          {renderNodeInternal(child, context, `${key}-child-${index}`)}
        </React.Fragment>
      ))
    : null;

  // Finally, create the actual React element for this schema node.
  return <Component key={key} {...props}>{children}</Component>;
}

export default function renderNode(node, context) {
  // Start the recursive render walk from a fixed root key.
  return renderNodeInternal(node, context, "root");
}
