import React from "react";
import { evaluate } from "../expression/evaluate.js";
import { createExpressionScope } from "../expression/scope.js";
import { mapProps } from "./resolveValue.js";

function renderNodeInternal(node, context, key) {
  if (!node) {
    return null;
  }

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

    if (!Array.isArray(items)) {
      return null;
    }

    const template = { ...node };
    delete template.each;

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

  const Component = context.componentRegistry[node.type];
  if (!Component) {
    return null;
  }

  const props = mapProps(node.props || {}, context);
  const children = Array.isArray(node.children)
    ? node.children.map((child, index) => (
        <React.Fragment key={`${key}-child-${index}`}>
          {renderNodeInternal(child, context, `${key}-child-${index}`)}
        </React.Fragment>
      ))
    : null;

  return <Component key={key} {...props}>{children}</Component>;
}

export default function renderNode(node, context) {
  return renderNodeInternal(node, context, "root");
}
