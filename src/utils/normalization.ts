export function normalizePosition(position: number, relative: number): number {
  if (Number.isInteger(position)) {
    return position;
  }

  return Math.round(relative * position);
}
