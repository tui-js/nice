export type Auto = "auto";
export type Percent = `${number}%`;
export type Cell = number;
export type Unit = Auto | Percent | Cell;

export function normalizeUnit(value: Unit, relative: number): number {
    if (value === "auto") throw new Error(`Cannot normalize unit "auto"`);
    if (typeof value === "number") return value;
    const percentage = +value.slice(0, -1);
    return Math.round(percentage / 100 * relative);
}
