// Copyright 2023 Im-Beast. All rights reserved. MIT license.
import { fitIntoDimensions } from "../mod.ts";
import { insert, textWidth } from "./utils/strings.ts";

import { applyBorder, type BorderDefinition, normalizeBorder, type NormalizedBorderDefinition } from "./border.ts";
import { applyMargin, type MarginDefinition, type NormalizedMarginDefinition, normalizeMargin } from "./margin.ts";
import {
  applyStyle,
  type NormalizedTextDefinition,
  normalizeTextDefinition,
  resizeAndAlignHorizontally,
  resizeAndAlignVertically,
  type TextDefinition,
  wrapLines,
} from "./text.ts";

import type { Style } from "./types.ts";

// FIXME: Negative positions
// TODO: Tests, especially with weird characters

export function normalizePosition(position: number, relative: number): number {
  if (Number.isInteger(position)) {
    return position;
  }

  return Math.round(relative * position);
}

export interface NiceOptions {
  style: Style;
  width?: number;
  height?: number;
  text?: Partial<TextDefinition>;
  margin?: Partial<MarginDefinition>;
  padding?: Partial<MarginDefinition>;
  border?: Partial<BorderDefinition>;
}

export class Nice {
  style: Style;

  width?: number;
  height?: number;

  margin: NormalizedMarginDefinition;
  padding: NormalizedMarginDefinition;
  border: NormalizedBorderDefinition;
  text: NormalizedTextDefinition;

  constructor(options: NiceOptions) {
    this.style = options.style;

    const { border, text, margin, padding, width, height } = options;

    this.width = width;
    this.height = height;

    this.text = normalizeTextDefinition(text);
    this.border = normalizeBorder(border);
    this.margin = normalizeMargin(margin);
    this.padding = normalizeMargin(padding);
  }

  static render(input: string[]): string {
    fitIntoDimensions(input, Deno.consoleSize());
    return input.join("\n");
  }

  draw(input: string): string[] {
    const { style, border, margin, padding, text } = this;

    const output = input.split("\n");

    let width = this.width ??
      output.reduce((maxWidth, line) => (
        Math.max(maxWidth, textWidth(line))
      ), 0);

    wrapLines(output, width, text.wrap);
    resizeAndAlignHorizontally(output, width, text);

    let height = this.height ?? output.length;
    resizeAndAlignVertically(output, height, text);
    height = output.length;

    applyStyle(output, style);

    applyMargin(output, width, padding, style(" "));
    width += padding.left + padding.right;

    applyBorder(output, width, border);
    width += (border.left ? 1 : 0) + (border.right ? 1 : 0);

    applyMargin(output, width, margin);

    return output;
  }

  clone(): Nice {
    return new Nice({
      style: this.style,
      width: this.width,
      height: this.height,
      text: this.text,
      margin: this.margin,
      padding: this.padding,
      border: {
        top: this.border.top || undefined,
        bottom: this.border.bottom || undefined,
        left: this.border.left || undefined,
        right: this.border.right || undefined,
        type: this.border.type,
      },
    });
  }

  static clone(from: Nice): Nice {
    return from.clone();
  }

  static horizontal(verticalPosition: number, ...blocks: string[][]): string[] {
    const widths = blocks.map((x) => textWidth(x[0]));

    const maxHeight = blocks.reduce(
      (maxHeight, block) => Math.max(maxHeight, block.length),
      0,
    );

    const output = [];

    for (let y = 0; y < maxHeight; ++y) {
      let row = "";

      for (const i in blocks) {
        const block = blocks[i];
        const maxWidth = widths[i];

        const yOffset = Math.round((maxHeight - block.length) * verticalPosition);
        let line = block[y - yOffset] ?? "";

        const lineWidth = line ? textWidth(line) : 0;
        if (lineWidth < maxWidth) {
          line += " ".repeat(maxWidth - lineWidth);
        }

        row += line;
      }

      output.push(row);
    }

    return output;
  }

  static vertical(horizontalPosition: number, ...strings: string[][]): string[] {
    const output = [];

    const widths = strings.map((x) => textWidth(x[0]));
    const maxWidth = widths.reduce((maxWidth, x) => {
      return Math.max(maxWidth, x);
    }, 0);

    for (let i = 0; i < strings.length; ++i) {
      const string = strings[i];
      const width = widths[i];

      if (width === maxWidth) {
        output.push(...string);
        continue;
      }

      for (let line of string) {
        const lineWidth = textWidth(line);

        if (lineWidth < maxWidth) {
          const lacksLeft = Math.round((maxWidth - lineWidth) * horizontalPosition);
          const lacksRight = maxWidth - lineWidth - lacksLeft;
          line = " ".repeat(lacksLeft) + line + " ".repeat(lacksRight);
        }

        output.push(line);
      }
    }

    return output;
  }

  // overlay one string on top of another
  static overlay(horizontalPosition: number, verticalPosition: number, fg: string[], bg: string[]): string[] {
    const fgWidth = textWidth(fg[0]);
    const bgWidth = textWidth(bg[0]);
    if (fgWidth > bgWidth) {
      throw new Error("You can't overlay foreground that's wider than background");
    }

    const fgBlock = fg;
    const bgBlock = bg;

    const fgHeight = fgBlock.length;
    const bgHeight = bgBlock.length;
    if (fgHeight > bgHeight) {
      throw new Error("You can't overlay foreground that's higher than background");
    }

    const offsetX = normalizePosition(horizontalPosition, bgWidth - fgWidth);
    const offsetY = normalizePosition(verticalPosition, bgHeight - fgHeight);

    const output = [];

    for (let i = 0; i < bgHeight; ++i) {
      const j = i - offsetY;
      const bgLine = bgBlock[i];

      if (j < 0 || j >= fgHeight) {
        output.push(bgLine);
        continue;
      }

      const fgLine = fgBlock[j];
      output.push(insert(bgLine, fgLine, offsetX));
    }

    return output;
  }
}
