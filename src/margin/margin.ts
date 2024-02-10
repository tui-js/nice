import { characterWidth } from "../../mod.ts";
import type { NormalizedMarginDefinition } from "./normalization.ts";

export function applyMargin(
  lines: string[],
  width: number,
  margin: NormalizedMarginDefinition,
  char = " ",
): void {
  const charWidth = characterWidth(char);
  const leftSide = char.repeat(margin.left / charWidth);
  const rightSide = margin.left === margin.right ? leftSide : char.repeat(margin.right / charWidth);
  const verticalSide = char.repeat((width + margin.left + margin.right) / charWidth);

  for (const i in lines) {
    lines[i] = `${leftSide}${lines[i]}${rightSide}`;
  }

  for (let i = 0; i < margin.top; i++) {
    lines.unshift(verticalSide);
  }

  for (let i = 0; i < margin.bottom; i++) {
    lines.push(verticalSide);
  }
}
