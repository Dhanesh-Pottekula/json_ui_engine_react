// Matches variable/helper names like amount, state, _index, or $value.
const IDENTIFIER_PATTERN = /[A-Za-z_$][A-Za-z0-9_$]*/y;
// Matches integer and decimal number literals like 10 or 10.5.
const NUMBER_PATTERN = /\d+(?:\.\d+)?/y;
// Block access to prototype-chain escape hatches when reading object properties.
const FORBIDDEN_PROPERTIES = new Set(["__proto__", "prototype", "constructor"]);

function syntaxError(message) {
  return new Error(`Expression syntax error: ${message}`);
}

function tokenize(expression) {
  // Convert the raw expression string into a flat stream of tokens that the parser can consume.
  // Example:
  // Input: "amount > 10 ? 'big' : 'small'"
  // Output:
  // [
  //   { type: "identifier", value: "amount" },
  //   { type: "operator", value: ">" },
  //   { type: "number", value: 10 },
  //   { type: "operator", value: "?" },
  //   { type: "string", value: "big" },
  //   { type: "operator", value: ":" },
  //   { type: "string", value: "small" },
  //   { type: "eof", value: "" }
  // ]
  //
  // Input: "max(a, b)"
  // Output:
  // [
  //   { type: "identifier", value: "max" },
  //   { type: "punctuation", value: "(" },
  //   { type: "identifier", value: "a" },
  //   { type: "punctuation", value: "," },
  //   { type: "identifier", value: "b" },
  //   { type: "punctuation", value: ")" },
  //   { type: "eof", value: "" }
  // ]
  //
  // Input: "state.amount"
  // Output:
  // [
  //   { type: "identifier", value: "state" },
  //   { type: "punctuation", value: "." },
  //   { type: "identifier", value: "amount" },
  //   { type: "eof", value: "" }
  // ]
  const tokens = [];
  let index = 0;

  while (index < expression.length) {
    const character = expression[index];

    // Ignore whitespace between tokens.
    if (/\s/.test(character)) {
      index += 1;
      continue;
    }

    // Check multi-character operators first so ">=" is not split into ">" and "=".
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

    // Single-character operators and punctuation are handled one character at a time.
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

    // Parse quoted string literals, supporting escaped characters like \" or \'.
    if (character === "'" || character === "\"") {
      let value = "";
      let cursor = index + 1;

      while (cursor < expression.length) {
        const nextCharacter = expression[cursor];

        if (nextCharacter === "\\") {
          // Keep the escaped character and skip over the backslash.
          value += expression[cursor + 1] ?? "";
          cursor += 2;
          continue;
        }

        if (nextCharacter === character) {
          // Closing quote found: emit the full string token.
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

    // Match a number literal starting at the current position.
    NUMBER_PATTERN.lastIndex = index;
    const numberMatch = NUMBER_PATTERN.exec(expression);
    if (numberMatch) {
      tokens.push({ type: "number", value: Number(numberMatch[0]) });
      index = NUMBER_PATTERN.lastIndex;
      continue;
    }

    // Match identifiers for variables, literals like true/null, and helper names.
    IDENTIFIER_PATTERN.lastIndex = index;
    const identifierMatch = IDENTIFIER_PATTERN.exec(expression);
    if (identifierMatch) {
      tokens.push({ type: "identifier", value: identifierMatch[0] });
      index = IDENTIFIER_PATTERN.lastIndex;
      continue;
    }

    // Anything else is unsupported by this expression language.
    throw syntaxError(`unexpected token "${character}"`);
  }

  // Add an explicit end token so the parser can verify the whole input was consumed.
  tokens.push({ type: "eof", value: "" });
  return tokens;
}

function createParser(tokens) {
  // The parser walks the token list with a single cursor and builds an AST.
  let cursor = 0;

  function current() {
    return tokens[cursor];
  }

  function consume(expectedType, expectedValue) {
    // Require the current token to match the expected shape, or fail with a readable error.
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
    // Like consume(), but return false instead of throwing when the token does not match.
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
    // Parse the smallest valid building blocks in the language.
    const token = current();

    if (match("punctuation", "(")) {
      // Parentheses force precedence, so parse a full nested expression.
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

      // Treat these keywords as literal values instead of variable lookups.
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
    // Parse property access and helper calls after a primary expression.
    let node = parsePrimary();

    while (true) {
      if (match("punctuation", ".")) {
        // state.amount becomes a MemberExpression.
        const property = consume("identifier");
        node = {
          type: "MemberExpression",
          object: node,
          property: property.value,
        };
        continue;
      }

      if (match("punctuation", "(")) {
        // max(a, b) becomes a CallExpression with parsed argument expressions.
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
    // Unary operators bind tighter than multiplication/addition.
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
    // Generic left-associative parser for operators at the same precedence level.
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
    // Exponentiation is right-associative: 2 ** 3 ** 2 == 2 ** (3 ** 2).
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
    // *, /, and % bind tighter than + and -.
    return parseBinary(parseExponent, ["*", "/", "%"]);
  }

  function parseAdditive() {
    return parseBinary(parseMultiplicative, ["+", "-"]);
  }

  function parseComparison() {
    // Comparison operators like >, >=, <, <=.
    return parseBinary(parseAdditive, [">", ">=", "<", "<="]);
  }

  function parseEquality() {
    // Equality operators are parsed after comparisons.
    return parseBinary(parseComparison, ["==", "!=", "===", "!=="]);
  }

  function parseLogicalAnd() {
    // Logical AND has higher precedence than logical OR.
    return parseBinary(parseEquality, ["&&"]);
  }

  function parseLogicalOr() {
    return parseBinary(parseLogicalAnd, ["||"]);
  }

  function parseConditional() {
    // Parse ternary expressions: condition ? whenTrue : whenFalse.
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
    // Entry point for the full grammar.
    // This does not evaluate anything yet.
    // It only converts tokens into an AST (Abstract Syntax Tree),
    // which is a structured object representation of the expression.
    //
    // Example input tokens:
    // [
    //   { type: "identifier", value: "amount" },
    //   { type: "operator", value: ">" },
    //   { type: "number", value: 10 },
    //   { type: "eof", value: "" }
    // ]
    //
    // Example output AST:
    // {
    //   type: "BinaryExpression",
    //   operator: ">",
    //   left: { type: "Identifier", name: "amount" },
    //   right: { type: "Literal", value: 10 }
    // }
    return parseConditional();
  }

  return {
    parse() {
      // Build the AST for the full expression starting from the current token.
      //
      // Example:
      // Expression: "amount > 10 ? 'big' : 'small'"
      //
      // Input tokens:
      // [
      //   { type: "identifier", value: "amount" },
      //   { type: "operator", value: ">" },
      //   { type: "number", value: 10 },
      //   { type: "operator", value: "?" },
      //   { type: "string", value: "big" },
      //   { type: "operator", value: ":" },
      //   { type: "string", value: "small" },
      //   { type: "eof", value: "" }
      // ]
      //
      // Output AST:
      // {
      //   type: "ConditionalExpression",
      //   test: {
      //     type: "BinaryExpression",
      //     operator: ">",
      //     left: { type: "Identifier", name: "amount" },
      //     right: { type: "Literal", value: 10 }
      //   },
      //   consequent: { type: "Literal", value: "big" },
      //   alternate: { type: "Literal", value: "small" }
      // }
      const ast = parseExpression();
      // Make sure the parser consumed the entire token list.
      // If anything is left before EOF, the expression is incomplete or invalid.
      consume("eof");
      return ast;
    },
  };
}

function evaluateBinary(operator, left, right) {
  // Execute basic binary operators using JavaScript semantics.
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
  // Stop unsafe or invalid property access before reading from the object.
  if (target == null || FORBIDDEN_PROPERTIES.has(property)) {
    return undefined;
  }

  return target[property];
}

function evaluateAst(node, scope) {
  // Recursively interpret each AST node against the provided expression scope.
  switch (node.type) {
    case "Literal":
      // Return literal values like numbers, strings, booleans, and null directly.
      // Input node: { type: "Literal", value: 10 }
      // Output: 10
      return node.value;
    case "Identifier":
      // Look up plain variable names and helpers directly from the scope object.
      // Input node: { type: "Identifier", name: "amount" }
      // Input scope: { amount: 25 }
      // Output: 25
      return scope[node.name];
    case "MemberExpression":
      // Resolve state.amount by first evaluating state, then safely reading amount.
      // Input node:
      // {
      //   type: "MemberExpression",
      //   object: { type: "Identifier", name: "state" },
      //   property: "amount"
      // }
      // Input scope: { state: { amount: 250 } }
      // Output: 250
      return resolveMember(evaluateAst(node.object, scope), node.property);
    case "UnaryExpression": {
      // Input node example:
      // { type: "UnaryExpression", operator: "-", argument: { type: "Literal", value: 5 } }
      // Output: -5
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
      // Preserve short-circuit behavior for logical operators.
      // Input node example:
      // {
      //   type: "BinaryExpression",
      //   operator: "+",
      //   left: { type: "Literal", value: 10 },
      //   right: { type: "Literal", value: 5 }
      // }
      // Output: 15
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
      // Evaluate only the branch selected by the test result.
      // Input node example:
      // {
      //   type: "ConditionalExpression",
      //   test: { type: "Literal", value: true },
      //   consequent: { type: "Literal", value: "big" },
      //   alternate: { type: "Literal", value: "small" }
      // }
      // Output: "big"
      return evaluateAst(node.test, scope)
        ? evaluateAst(node.consequent, scope)
        : evaluateAst(node.alternate, scope);
    case "CallExpression": {
      // Only allow direct helper calls like max(a, b), not obj.method().
      // Input node example:
      // {
      //   type: "CallExpression",
      //   callee: { type: "Identifier", name: "max" },
      //   arguments: [
      //     { type: "Literal", value: 10 },
      //     { type: "Literal", value: 20 }
      //   ]
      // }
      // Input scope: { max: Math.max }
      // Output: 20
      if (node.callee.type !== "Identifier") {
        throw new Error("Only direct helper calls are allowed in expressions.");
      }

      const fn = scope[node.callee.name];
      if (typeof fn !== "function") {
        throw new Error(`Unknown helper "${node.callee.name}"`);
      }

      // Evaluate all arguments first, then call the helper with those values.
      return fn(...node.arguments.map((argument) => evaluateAst(argument, scope)));
    }
    default:
      throw new Error(`Unsupported expression node: ${node.type}`);
  }
}

// converts string into  an AST and evaluates it against a scope of state, derived, runtime, and helper functions.
export function parseExpression(expression) {
  // Public parser helper used by validation and evaluation.
  const parser = createParser(tokenize(expression));
  return parser.parse();
}

export function validateExpression(expression) {
  // If parsing succeeds, the expression is syntactically valid.
  parseExpression(expression);
  return true;
}

export function evaluate(expression, scope = {}) {
  // Blank expressions resolve to undefined instead of throwing.
  if (typeof expression !== "string" || expression.trim() === "") {
    return undefined;
  }

  // Parse the expression into an AST, then evaluate it against the provided scope.
  const ast = parseExpression(expression);

  // The scope object provides access to state, derived values, runtime helpers, and custom functions.
  return evaluateAst(ast, scope);
}
