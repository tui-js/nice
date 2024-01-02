// Copyright 2023 Im-Beast. All rights reserved. MIT license.
import { EitherType, Style } from "./types.ts";

export const Borders = {
  sharp: {
    top: "─",
    bottom: "─",
    left: "│",
    right: "│",
    topLeft: "┌",
    topRight: "┐",
    bottomLeft: "└",
    bottomRight: "┘",
  },
  rounded: {
    top: "─",
    bottom: "─",
    left: "│",
    right: "│",
    topLeft: "╭",
    topRight: "╮",
    bottomLeft: "╰",
    bottomRight: "╯",
  },
  thick: {
    top: "━",
    bottom: "━",
    left: "┃",
    right: "┃",
    topLeft: "┏",
    topRight: "┓",
    bottomLeft: "┗",
    bottomRight: "┛",
  },
  double: {
    top: "═",
    bottom: "═",
    left: "║",
    right: "║",
    topLeft: "╔",
    topRight: "╗",
    bottomLeft: "╚",
    bottomRight: "╝",
  },
  block: {
    top: "█",
    bottom: "█",
    left: "█",
    right: "█",
    topLeft: "█",
    topRight: "█",
    bottomLeft: "█",
    bottomRight: "█",
  },
} as const;

export type BorderType = keyof typeof Borders;

export type BorderX<T> = EitherType<[{ left: T; right: T }, { x: T }, { all: T }]>;
export type BorderY<T> = EitherType<[{ top: T; bottom: T }, { y: T }, { all: T }]>;

export type UniqueStyleBorder = BorderX<Style> & BorderY<Style> & { type: BorderType };
export type SharedStyleBorder = BorderX<boolean> & BorderY<boolean> & { type: BorderType; style: Style };

export type BorderDefinition = EitherType<[UniqueStyleBorder, SharedStyleBorder]>;

export interface NormalizedBorderDefinition {
  type: BorderType;
  top: Style | false;
  bottom: Style | false;
  left: Style | false;
  right: Style | false;
}

export function normalizeBorder($border?: Partial<BorderDefinition>): NormalizedBorderDefinition {
  if ($border && "style" in $border) {
    const border = $border as SharedStyleBorder;
    const style = border.style;
    return {
      type: border.type,
      top: (border.all || border.top || border.y) ? style : false,
      bottom: (border.all || border.bottom || border.y) ? style : false,
      left: (border.all || border.left || border.x) ? style : false,
      right: (border.all || border.right || border.x) ? style : false,
    };
  }

  const border = $border as UniqueStyleBorder | undefined;
  return {
    type: border?.type || "sharp",
    top: border?.all || border?.top || border?.y || false,
    bottom: border?.all || border?.bottom || border?.y || false,
    left: border?.all || border?.left || border?.x || false,
    right: border?.all || border?.right || border?.x || false,
  };
}

export function applyBorder(lines: string[], width: number, border: NormalizedBorderDefinition): void {
  const top = border.top;
  const bottom = border.bottom;
  const left = border.left;
  const right = border.right;

  const charMap = Borders[border.type];

  if (left || right) {
    const leftChar = left ? left(charMap.left) : "";
    const rightChar = right ? right(charMap.right) : "";

    for (const i in lines) {
      lines[i] = leftChar + lines[i] + rightChar;
    }
  }

  if (top) {
    let topLine = "";
    if (left) topLine += charMap.topLeft;
    topLine += charMap.top.repeat(width);
    if (right) topLine += charMap.topRight;

    lines.unshift(top(topLine));
  }

  if (bottom) {
    let bottomLine = "";
    if (left) bottomLine += charMap.bottomLeft;
    bottomLine += charMap.bottom.repeat(width);
    if (right) bottomLine += charMap.bottomRight;

    lines.push(bottom(bottomLine));
  }
}
