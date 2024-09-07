export type Auto = "auto";
export type Percent = `${number}%`;
export type Cell = number | `${number}`;
export type Dynamic = (size: number) => number;

export type NoAutoUnit = Percent | Cell | Dynamic;
export type Unit = NoAutoUnit | Auto;

export function normalizeUnit(value: NoAutoUnit, size: number, usedSize?: number): number {
  if (typeof value === "number") {
    return value;
  } else if (typeof value === "function") {
    return value(size);
  } else if (value.endsWith("%")) {
    const percentage = +value.slice(0, -1);
    if (isNaN(percentage)) {
      throw new Error(`Invalid percentage unit: ${value}`);
    }
    const computedValue = percentage / 100 * size;

    const rounded = Math.round(computedValue);
    if (typeof usedSize === "undefined") {
      return rounded;
    }

    // Whenever possible, try to fit items within bounds
    if (usedSize + rounded > size) {
      return Math.floor(computedValue);
    }

    return rounded;
  }
  const cells = Number(value);
  if (isNaN(cells)) {
    throw new Error(`Invalid unit: ${value}`);
  }
  return cells;
}

type Operator = "+" | "-" | "*" | "/";
function isOperator(op: string): op is Operator {
  return op === "+" || op === "-" || op === "*" || op === "/";
}

function isUnit(op: string | number | Dynamic): op is Unit {
  if (op === "auto" || typeof op === "number") {
    return true;
  } else if (typeof op === "function") {
    return op.length === 1;
  } else if (op.endsWith("%")) {
    return !isNaN(Number(op.slice(0, -1)));
  }
  return !isNaN(Number(op));
}

/**
 * Dynamic calculation of size
 * @example
 * ```ts
 * calc("90% - 2 + 10% / 3 + 2 / 3", 10);
 * ```
 */
export function calc(formula: string): Dynamic {
  const operators: Operator[] = [];
  const operands: NoAutoUnit[] = [];

  for (const string of formula.split(" ")) {
    if (isOperator(string)) {
      operators.push(string);
    } else if (isUnit(string)) {
      if (string === "auto") throw new Error("Cannot use 'auto' in calc");
      operands.push(string);
    } else {
      throw new Error(
        `Invalid formula contains ${string} which is not a unit nor an operator`,
      );
    }
  }

  if (operands.length === 0 || operators.length + 1 !== operands.length) {
    throw new Error(`Invalid calc formula: ${formula}`);
  }

  return (size) => {
    const localOperands = [...operands];

    for (const operator of operators) {
      const a = normalizeUnit(localOperands.shift()!, size);
      const b = normalizeUnit(localOperands.shift()!, size);
      switch (operator) {
        case "+":
          localOperands.unshift(a + b);
          break;
        case "-":
          localOperands.unshift(a - b);
          break;
        case "*":
          localOperands.unshift(a * b);
          break;
        case "/":
          localOperands.unshift(a / b);
          break;
      }
    }

    if (localOperands.length > 1) {
      throw new Error(
        `Operation stack is not empty for calc with formula: ${formula}\nOperation stack: [${localOperands}]`,
      );
    }

    return localOperands[0] as number;
  };
}
