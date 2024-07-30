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
