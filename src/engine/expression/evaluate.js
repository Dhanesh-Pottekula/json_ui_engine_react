const IDENTIFIER_PATTERN = /[A-Za-z_$][A-Za-z0-9_$]*/y;
const NUMBER_PATTERN = /\d+(?:\.\d+)?/y;
const FORBIDDEN_PROPERTIES = new Set(["__proto__", "prototype", "constructor"]);

function syntaxError(message) {
  return new Error(`Expression syntax error: ${message}`);
}

function tokenize(expression) {
  const tokens = [];
  let index = 0;

  while (index < expression.length) {
    const character = expression[index];

    if (/\s/.test(character)) {
      index += 1;
      continue;
    }

    const operator = [
      "===",
      "!==",
      "&&",
      "||",
      ">=",
      "<=",
      "==",
      "!=",
      "**",
    ].find((candidate) => expression.startsWith(candidate, index));

    if (operator) {
      tokens.push({ type: "operator", value: operator });
      index += operator.length;
      continue;
    }

    if ("+-*/%><!?:(),.".includes(character)) {
      tokens.push({
        type: character === "(" || character === ")" || character === "," || character === "."
          ? "punctuation"
          : "operator",
        value: character,
      });
      index += 1;
      continue;
    }

    if (character === "'" || character === "\"") {
      let value = "";
      let cursor = index + 1;

      while (cursor < expression.length) {
        const nextCharacter = expression[cursor];

        if (nextCharacter === "\\") {
          value += expression[cursor + 1] ?? "";
          cursor += 2;
          continue;
        }

        if (nextCharacter === character) {
          tokens.push({ type: "string", value });
          index = cursor + 1;
          value = null;
          break;
        }

        value += nextCharacter;
        cursor += 1;
      }

      if (value !== null) {
        throw syntaxError("unterminated string literal");
      }

      continue;
    }

    NUMBER_PATTERN.lastIndex = index;
    const numberMatch = NUMBER_PATTERN.exec(expression);
    if (numberMatch) {
      tokens.push({ type: "number", value: Number(numberMatch[0]) });
      index = NUMBER_PATTERN.lastIndex;
      continue;
    }

    IDENTIFIER_PATTERN.lastIndex = index;
    const identifierMatch = IDENTIFIER_PATTERN.exec(expression);
    if (identifierMatch) {
      tokens.push({ type: "identifier", value: identifierMatch[0] });
      index = IDENTIFIER_PATTERN.lastIndex;
      continue;
    }

    throw syntaxError(`unexpected token "${character}"`);
  }

  tokens.push({ type: "eof", value: "" });
  return tokens;
}

function createParser(tokens) {
  let cursor = 0;

  function current() {
    return tokens[cursor];
  }

  function consume(expectedType, expectedValue) {
    const token = current();
    const typeMatches = !expectedType || token.type === expectedType;
    const valueMatches = !expectedValue || token.value === expectedValue;

    if (!typeMatches || !valueMatches) {
      throw syntaxError(`expected ${expectedValue ?? expectedType}, received ${token.value || token.type}`);
    }

    cursor += 1;
    return token;
  }

  function match(expectedType, expectedValue) {
    const token = current();
    if (expectedType && token.type !== expectedType) {
      return false;
    }
    if (expectedValue && token.value !== expectedValue) {
      return false;
    }
    cursor += 1;
    return true;
  }

  function parsePrimary() {
    const token = current();

    if (match("punctuation", "(")) {
      const expression = parseExpression();
      consume("punctuation", ")");
      return expression;
    }

    if (token.type === "number") {
      consume("number");
      return { type: "Literal", value: token.value };
    }

    if (token.type === "string") {
      consume("string");
      return { type: "Literal", value: token.value };
    }

    if (token.type === "identifier") {
      consume("identifier");

      if (token.value === "true" || token.value === "false") {
        return { type: "Literal", value: token.value === "true" };
      }

      if (token.value === "null") {
        return { type: "Literal", value: null };
      }

      return { type: "Identifier", name: token.value };
    }

    throw syntaxError(`unexpected ${token.value || token.type}`);
  }

  function parseMemberAndCall() {
    let node = parsePrimary();

    while (true) {
      if (match("punctuation", ".")) {
        const property = consume("identifier");
        node = {
          type: "MemberExpression",
          object: node,
          property: property.value,
        };
        continue;
      }

      if (match("punctuation", "(")) {
        const args = [];

        if (!match("punctuation", ")")) {
          do {
            args.push(parseExpression());
          } while (match("punctuation", ","));
          consume("punctuation", ")");
        }

        node = {
          type: "CallExpression",
          callee: node,
          arguments: args,
        };
        continue;
      }

      break;
    }

    return node;
  }

  function parseUnary() {
    if (match("operator", "!")) {
      return { type: "UnaryExpression", operator: "!", argument: parseUnary() };
    }

    if (match("operator", "-")) {
      return { type: "UnaryExpression", operator: "-", argument: parseUnary() };
    }

    if (match("operator", "+")) {
      return { type: "UnaryExpression", operator: "+", argument: parseUnary() };
    }

    return parseMemberAndCall();
  }

  function parseBinary(parseChild, operators) {
    let node = parseChild();

    while (operators.includes(current().value)) {
      const operator = consume("operator").value;
      node = {
        type: "BinaryExpression",
        operator,
        left: node,
        right: parseChild(),
      };
    }

    return node;
  }

  function parseExponent() {
    let node = parseUnary();

    if (current().value === "**") {
      const operator = consume("operator").value;
      node = {
        type: "BinaryExpression",
        operator,
        left: node,
        right: parseExponent(),
      };
    }

    return node;
  }

  function parseMultiplicative() {
    return parseBinary(parseExponent, ["*", "/", "%"]);
  }

  function parseAdditive() {
    return parseBinary(parseMultiplicative, ["+", "-"]);
  }

  function parseComparison() {
    return parseBinary(parseAdditive, [">", ">=", "<", "<="]);
  }

  function parseEquality() {
    return parseBinary(parseComparison, ["==", "!=", "===", "!=="]);
  }

  function parseLogicalAnd() {
    return parseBinary(parseEquality, ["&&"]);
  }

  function parseLogicalOr() {
    return parseBinary(parseLogicalAnd, ["||"]);
  }

  function parseConditional() {
    const test = parseLogicalOr();

    if (!match("operator", "?")) {
      return test;
    }

    const consequent = parseExpression();
    consume("operator", ":");

    return {
      type: "ConditionalExpression",
      test,
      consequent,
      alternate: parseExpression(),
    };
  }

  function parseExpression() {
    return parseConditional();
  }

  return {
    parse() {
      const ast = parseExpression();
      consume("eof");
      return ast;
    },
  };
}

function evaluateBinary(operator, left, right) {
  switch (operator) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      return left / right;
    case "%":
      return left % right;
    case "**":
      return left ** right;
    case ">":
      return left > right;
    case ">=":
      return left >= right;
    case "<":
      return left < right;
    case "<=":
      return left <= right;
    case "==":
      return left == right;
    case "!=":
      return left != right;
    case "===":
      return left === right;
    case "!==":
      return left !== right;
    default:
      throw new Error(`Unsupported binary operator: ${operator}`);
  }
}

function resolveMember(target, property) {
  if (target == null || FORBIDDEN_PROPERTIES.has(property)) {
    return undefined;
  }

  return target[property];
}

function evaluateAst(node, scope) {
  switch (node.type) {
    case "Literal":
      return node.value;
    case "Identifier":
      return scope[node.name];
    case "MemberExpression":
      return resolveMember(evaluateAst(node.object, scope), node.property);
    case "UnaryExpression": {
      const value = evaluateAst(node.argument, scope);
      if (node.operator === "!") {
        return !value;
      }
      if (node.operator === "-") {
        return -value;
      }
      return +value;
    }
    case "BinaryExpression":
      if (node.operator === "&&") {
        return evaluateAst(node.left, scope) && evaluateAst(node.right, scope);
      }
      if (node.operator === "||") {
        return evaluateAst(node.left, scope) || evaluateAst(node.right, scope);
      }
      return evaluateBinary(
        node.operator,
        evaluateAst(node.left, scope),
        evaluateAst(node.right, scope)
      );
    case "ConditionalExpression":
      return evaluateAst(node.test, scope)
        ? evaluateAst(node.consequent, scope)
        : evaluateAst(node.alternate, scope);
    case "CallExpression": {
      if (node.callee.type !== "Identifier") {
        throw new Error("Only direct helper calls are allowed in expressions.");
      }

      const fn = scope[node.callee.name];
      if (typeof fn !== "function") {
        throw new Error(`Unknown helper "${node.callee.name}"`);
      }

      return fn(...node.arguments.map((argument) => evaluateAst(argument, scope)));
    }
    default:
      throw new Error(`Unsupported expression node: ${node.type}`);
  }
}

export function parseExpression(expression) {
  const parser = createParser(tokenize(expression));
  return parser.parse();
}

export function validateExpression(expression) {
  parseExpression(expression);
  return true;
}

export function evaluate(expression, scope = {}) {
  if (typeof expression !== "string" || expression.trim() === "") {
    return undefined;
  }

  const ast = parseExpression(expression);
  return evaluateAst(ast, scope);
}
