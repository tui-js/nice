// Copyright 2023 Im-Beast. All rights reserved. MIT license.
import { fitIntoDimensions } from "../mod.ts";
import { textWidth } from "@tui/strings/text_width";

import { applyBorder } from "./border/mod.ts";
import { applyMargin } from "./margin/margin.ts";
import {
  alignHorizontally,
  alignVertically,
  applyStyle,
  resizeHorizontally,
  resizeVertically,
  wrapLines,
} from "./text/mod.ts";

import type { Style } from "./types.ts";
import {
  type NormalizedTextDefinition,
  normalizeTextDefinition,
  type TextDefinition,
} from "./text/normalization.ts";
import {
  type BorderDefinition,
  normalizeBorder,
  type NormalizedBorderDefinition,
} from "./border/normalization.ts";
import {
  type MarginDefinition,
  type NormalizedMarginDefinition,
  normalizeMargin,
} from "./margin/mod.ts";

import { applyMetadata, NICE_HEIGHT, NICE_WIDTH, type NiceBlock } from "./metadata.ts";

export { overlay } from "./layout/mod.ts";
export { horizontal } from "./layout/horizontal.ts";
export { vertical } from "./layout/vertical.ts";

// TODO: Tests, especially with weird characters

export interface NiceOptions {
  style?: Style;
  width?: number;
  height?: number;
  text?: Partial<TextDefinition> | NormalizedTextDefinition;
  margin?: Partial<MarginDefinition> | NormalizedMarginDefinition;
  padding?: Partial<MarginDefinition> | NormalizedMarginDefinition;
  border?: Partial<BorderDefinition> | NormalizedBorderDefinition;
}

export class Nice {
  style?: Style;

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

  static render(input: NiceBlock): string {
    const consoleSize = Deno.consoleSize();
    if (input[NICE_WIDTH] > consoleSize.columns || input[NICE_HEIGHT] > consoleSize.rows) {
      fitIntoDimensions(input, consoleSize);
    }
    return input.join("\n");
  }

  draw(input: string): NiceBlock {
    const { style, border, margin, padding, text } = this;

    const output = input.split("\n");

    let width = this.width ?? output.reduce((maxWidth, line) => (
      Math.max(maxWidth, textWidth(line))
    ), 0);

    wrapLines(output, width, text.wrap);
    resizeHorizontally(output, width, text);
    alignHorizontally(output, width, text.horizontalAlign);

    let height = this.height ?? output.length;
    resizeVertically(output, height, text);
    alignVertically(output, height, text.verticalAlign);

    if (style) {
      applyStyle(output, style);
      applyMargin(output, width, padding, style(" "));
    } else {
      applyMargin(output, width, padding);
    }

    width += padding.left + padding.right;

    applyBorder(output, width, border);
    width += (border.left ? 1 : 0) + (border.right ? 1 : 0);

    applyMargin(output, width, margin);
    height = output.length;

    return applyMetadata(output, {
      top: 0,
      left: 0,
      width,
      height,
    });
  }

  clone(): Nice {
    return new Nice({
      style: this.style,
      width: this.width,
      height: this.height,
      text: structuredClone(this.text),
      margin: structuredClone(this.margin),
      padding: structuredClone(this.padding),
      border: structuredClone(this.border),
    });
  }

  derive(options: Partial<NiceOptions>): Nice {
    return new Nice({
      style: "style" in options ? options.style : this.style,
      width: "width" in options ? options.width : this.width,
      height: "height" in options ? options.height : this.height,
      text: { ...this.text, ...options.text },
      margin: { ...this.margin, ...options.margin },
      padding: { ...this.padding, ...options.padding },
      border: { ...this.border, ...options.border } as NiceOptions["border"],
    });
  }
}
