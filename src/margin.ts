import { characterWidth } from "../mod.ts";
import type { EitherType } from "./types.ts";

export type MarginX = EitherType<[{ left: number; right: number }, { x: number }, { all: number }]>;
export type MarginY = EitherType<[{ top: number; bottom: number }, { y: number }, { all: number }]>;
export type MarginDefinition = MarginX & MarginY;

export interface NormalizedMarginDefinition {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export function normalizeMargin(margin?: Partial<MarginDefinition>): NormalizedMarginDefinition {
  return {
    top: margin?.all ?? margin?.top ?? margin?.y ?? 0,
    bottom: margin?.all ?? margin?.bottom ?? margin?.y ?? 0,
    left: margin?.all ?? margin?.left ?? margin?.x ?? 0,
    right: margin?.all ?? margin?.right ?? margin?.x ?? 0,
  };
}

export function applyMargin(lines: string[], width: number, margin: NormalizedMarginDefinition, char = " "): void {
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
