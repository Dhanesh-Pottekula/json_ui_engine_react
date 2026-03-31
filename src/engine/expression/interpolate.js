import { evaluate } from "./evaluate.js";

const TEMPLATE_PATTERN = /\{\{(.*?)\}\}/g;

export function interpolate(value, scope = {}) {
  if (typeof value !== "string") {
    return value;
  }

  const matches = [...value.matchAll(TEMPLATE_PATTERN)];
  if (matches.length === 0) {
    return value;
  }

  const [singleMatch] = matches;
  if (matches.length === 1 && singleMatch.index === 0 && singleMatch[0].length === value.length) {
    return evaluate(singleMatch[1].trim(), scope);
  }

  return value.replace(TEMPLATE_PATTERN, (_, expression) => {
    const resolved = evaluate(expression.trim(), scope);
    return resolved == null ? "" : String(resolved);
  });
}
