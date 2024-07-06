import type { NormalizedBorderDefinition } from "./normalization.ts";

export function applyBorder(
  lines: string[],
  width: number,
  border: NormalizedBorderDefinition,
): void {
  const { top, bottom, left, right, charset } = border;

  if (left || right) {
    const leftChar = left ? left(charset.left) : "";
    const rightChar = right ? right(charset.right) : "";

    for (const i in lines) {
      lines[i] = leftChar + lines[i] + rightChar;
    }
  }

  if (top) {
    let topLine = "";
    if (left) topLine += charset.topLeft;
    topLine += charset.top.repeat(width);
    if (right) topLine += charset.topRight;

    lines.unshift(top(topLine));
  }

  if (bottom) {
    let bottomLine = "";
    if (left) bottomLine += charset.bottomLeft;
    bottomLine += charset.bottom.repeat(width);
    if (right) bottomLine += charset.bottomRight;

    lines.push(bottom(bottomLine));
  }
}
