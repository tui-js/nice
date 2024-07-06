// Copyright 2024 Im-Beast. All rights reserved. MIT license.
import { cropEnd, textWidth } from "@tui/strings";

import {
  alignHorizontally,
  alignVertically,
  applyStyle,
  type NormalizedTextDefinition,
  normalizeTextDefinition,
  resizeHorizontally,
  resizeVertically,
  type TextDefinition,
  wrapLines,
} from "./text/mod.ts";

import {
  applyBorder,
  type BorderDefinition,
  normalizeBorder,
  type NormalizedBorderDefinition,
} from "./border/mod.ts";

import {
  applyMargin,
  type MarginDefinition,
  type NormalizedMarginDefinition,
  normalizeMargin,
} from "./margin/mod.ts";

import type { StringStyler } from "./types.ts";

import { Block } from "./block.ts";

export interface StyleOptions {
  style?: StringStyler;
  width?: number;
  height?: number;
  text?: Partial<TextDefinition> | NormalizedTextDefinition;
  margin?: Partial<MarginDefinition> | NormalizedMarginDefinition;
  padding?: Partial<MarginDefinition> | NormalizedMarginDefinition;
  border?: Partial<BorderDefinition> | NormalizedBorderDefinition;
}

export class Style {
  style?: StringStyler;

  width?: number;
  height?: number;

  margin: NormalizedMarginDefinition;
  padding: NormalizedMarginDefinition;
  border: NormalizedBorderDefinition;
  text: NormalizedTextDefinition;

  constructor(options: StyleOptions) {
    this.style = options.style;

    const { border, text, margin, padding, width, height } = options;

    this.width = width;
    this.height = height;

    this.text = normalizeTextDefinition(text);
    this.border = normalizeBorder(border);
    this.margin = normalizeMargin(margin);
    this.padding = normalizeMargin(padding);
  }

  /**
   * In-place modifies {block} so it fits in the console.\
   * It considers both dimensions and positioning.
   */
  static fitIntoConsole(block: Block): Block {
    const { columns, rows } = Deno.consoleSize();

    const { top, left, width } = block.boundingRect();

    while ((top + block.height) > rows) {
      block.lines.pop();
      block.height -= 1;
    }

    if ((left + width) >= columns) {
      if (columns - left <= 0) {
        block.lines = [];
        return block;
      }

      for (const [i, line] of block.lines.entries()) {
        block.lines[i] = cropEnd(line, columns - left);
      }
    }

    return block;
  }

  /**
   * Render NiceBlock into a string which can be printed out to the console.\
   * It ensures that block fits into the console.
   *
   * It uses newline ("\n") for changing rows.\
   * If block might be rendered on different column than the first one, consider using {@linkcode Style.renderRelative}.
   */
  static render(input: Block): string {
    Style.fitIntoConsole(input);
    return input.toString();
  }

  /**
   * Compose string of NiceBlock which uses ANSI escape codes to position lines.\
   * This allows the block to be rendered in any part of the terminal without causing visual glitches.
   *
   * If you know that block will always be rendered on the first column consider using {@linkcode Style.render}.
   *
   * It ensures that block fits into the console.
   */
  static renderRelative(input: Block): string {
    Style.fitIntoConsole(input);

    // This does these steps to render lines in correct position:
    //  1. Save cursor position
    //  2. Line
    //  3. Reset cursor position
    //  4. Move cursor down
    //  5. Save cursor position
    return "\x1b7" + input.toString("\x1b8\x1b[1B\x1b7");
  }

  create(content: string): Block {
    const { style, border, margin, padding, text } = this;

    const output = content.split("\n");

    let width = this.width ?? output.reduce((maxWidth, line) => (
      Math.max(maxWidth, textWidth(line))
    ), 0);

    wrapLines(output, width, text.wrap);

    let height = this.height ?? output.length;
    resizeVertically(output, height, text);
    alignVertically(output, height, text.verticalAlign);

    resizeHorizontally(output, width, text);
    alignHorizontally(output, width, text.horizontalAlign);

    applyMargin(output, width, padding, " ");
    if (style) applyStyle(output, style);
    width += padding.left + padding.right;

    applyBorder(output, width, border);
    width += (border.left ? 1 : 0) + (border.right ? 1 : 0);

    applyMargin(output, width, margin);
    width += margin.left + margin.right;

    height = output.length;

    return new Block(output, {
      top: 0,
      left: 0,
      width,
      height,
    });
  }

  clone(): Style {
    return new Style({
      style: this.style,
      width: this.width,
      height: this.height,
      text: structuredClone(this.text),
      margin: structuredClone(this.margin),
      padding: structuredClone(this.padding),
      border: structuredClone(this.border),
    });
  }

  derive(options: Partial<StyleOptions>): Style {
    return new Style({
      style: "style" in options ? options.style : this.style,
      width: "width" in options ? options.width : this.width,
      height: "height" in options ? options.height : this.height,
      text: { ...this.text, ...options.text },
      margin: { ...this.margin, ...options.margin },
      padding: { ...this.padding, ...options.padding },
      border: { ...this.border, ...options.border } as StyleOptions["border"],
    });
  }
}
