export type UnitKeyword =
  | "middle"
  | "center"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "row";

export type Unit =
  | "col"
  | "row"
  | "cell"
  | "%";

export function unit(amount: number, unit: Unit): number;
export function unit(keyword: UnitKeyword): number;
export function unit(amountOrKeyword: number | UnitKeyword, unit?: string): number {
  if (!unit) {
    const keyword = amountOrKeyword;
    switch (keyword) {
      case "middle":
      case "center":
        return percent(50);
      case "left":
      case "top":
        return percent(0);
      case "right":
      case "bottom":
        return percent(100);
    }

    throw new Error(`Invalid keyword: ${keyword}`);
  }

  const amount = amountOrKeyword as number;
  if (!Number.isInteger(amount) && unit !== "%") {
    throw new Error("Amount should be an integer.");
  }

  switch (unit) {
    case "col":
    case "row":
      return amount;
    case "cell":
      return amount * 2;
    case "%":
      return percent(amount);
  }

  throw new Error(`Invalid unit: ${unit}`);
}

export function percent(amount: number): number {
  return (amount / 100) - 1e-15;
}
