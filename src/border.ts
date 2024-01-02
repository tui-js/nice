// Copyright 2023 Im-Beast. All rights reserved. MIT license.
import { EitherType, Style } from "./types.ts";

interface BorderCharset {
  top: string;
  bottom: string;
  left: string;
  right: string;
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
}

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
};

export type BorderType = keyof typeof Borders;

export type BorderX<T> = EitherType<[{ left: T; right: T }, { x: T }, { all: T }]>;
export type BorderY<T> = EitherType<[{ top: T; bottom: T }, { y: T }, { all: T }]>;

export type BorderTypeDefinition = EitherType<[{ type: BorderType }, { type: "custom"; charset: BorderCharset }]>;

export type UniqueStyleBorder = BorderX<Style> & BorderY<Style> & BorderTypeDefinition;
export type SharedStyleBorder = BorderX<boolean> & BorderY<boolean> & BorderTypeDefinition & { style: Style };

export type BorderDefinition = EitherType<[UniqueStyleBorder, SharedStyleBorder]>;

export interface NormalizedBorderDefinition {
  charset: BorderCharset;
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
      charset: (border.type === "custom" || border.charset) ? border.charset : Borders[border.type],
      top: (border.all || border.top || border.y) ? style : false,
      bottom: (border.all || border.bottom || border.y) ? style : false,
      left: (border.all || border.left || border.x) ? style : false,
      right: (border.all || border.right || border.x) ? style : false,
    };
  }

  const border = $border as Partial<UniqueStyleBorder>;
  return {
    charset: (border.type === "custom" || border.charset) ? border.charset! : Borders[border.type!],
    top: border?.all || border?.top || border?.y || false,
    bottom: border?.all || border?.bottom || border?.y || false,
    left: border?.all || border?.left || border?.x || false,
    right: border?.all || border?.right || border?.x || false,
  };
}

export function applyBorder(lines: string[], width: number, border: NormalizedBorderDefinition): void {
  const {
    top,
    bottom,
    left,
    right,
    charset,
  } = border;

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
