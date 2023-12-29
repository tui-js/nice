// Copyright 2023 Im-Beast. All rights reserved. MIT license.
import { fitIntoDimensions } from "../mod.ts";
import { applyBorder, BorderDefinition, normalizeBorder, NormalizedBorder } from "./border.ts";
import { applyMargin, MarginDefinition, NormalizedMargin, normalizeMargin } from "./margin.ts";
import { applyStyle, resizeAndAlignHorizontally, resizeAndAlignVertically, wrapLines } from "./text.ts";
import { Style } from "./types.ts";
import { insert, textWidth } from "./utils/strings.ts";

// FIXME: Negative positions
// TODO: Tests, especially with weird characters

export function normalizePosition(position: number, relative: number): number {
  if (Number.isInteger(position)) {
    return position;
  }

  return Math.round(relative * position);
}

export interface Left {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
}

export interface TextStyle {
  horizontalAlign: "left" | "right" | "center" | "justify";
  verticalAlign: "top" | "middle" | "bottom";
  overflow: "clip" | "ellipsis";
  ellipsisString?: string;
  wrap: "wrap" | "nowrap" | "balance";
}

export interface NiceOptions {
  style: Style;
  width?: number;
  height?: number;
  text?: Partial<TextStyle>;
  margin?: Partial<MarginDefinition>;
  padding?: Partial<MarginDefinition>;
  border?: Partial<BorderDefinition>;
}

export class Nice {
  style: Style;

  width?: number;
  height?: number;

  margin: NormalizedMargin;
  padding: NormalizedMargin;
  border: NormalizedBorder;

  text: TextStyle;

  constructor(options: NiceOptions) {
    this.style = options.style;

    const { border, text, margin, padding, width, height } = options;

    this.width = width;
    this.height = height;

    this.text = {
      overflow: "clip",
      wrap: "wrap",
      verticalAlign: "top",
      horizontalAlign: "left",
      ...text,
    };

    this.border = normalizeBorder(border);
    this.margin = normalizeMargin(margin);
    this.padding = normalizeMargin(padding);
  }

  render(input: string): string {
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

    return output.join("\n");
  }

  clone(): Nice {
    return new Nice(this);
  }

  static clone(from: Nice): Nice {
    return from.clone();
  }

  static layoutHorizontally(verticalPosition: number, ...strings: string[]): string {
    const blocks = strings.map((x) => x.split("\n"));

    const widths = strings.map((x) => textWidth(x));
    const maxHeight = blocks.reduce(
      (maxHeight, block) => Math.max(maxHeight, block.length),
      0,
    );

    let output = "";
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

      output += row + "\n";
    }

    while (output.endsWith("\n")) {
      output = output.slice(0, -1);
    }

    return output;
  }

  static layoutVertically(horizontalPosition: number, ...strings: string[]): string {
    let output = "";

    const widths = strings.map((x) => textWidth(x));
    const maxWidth = widths.reduce((maxWidth, x) => {
      return Math.max(maxWidth, x);
    }, 0);

    for (const i in strings) {
      const string = strings[i];
      const width = widths[i];

      if (width === maxWidth) {
        output += string + "\n";
        continue;
      }

      for (let line of string.split("\n")) {
        const lineWidth = textWidth(line);

        if (lineWidth < maxWidth) {
          const lacksLeft = Math.round((maxWidth - lineWidth) * horizontalPosition);
          const lacksRight = maxWidth - lineWidth - lacksLeft;
          line = " ".repeat(lacksLeft) + line + " ".repeat(lacksRight);
        }

        output += line + "\n";
      }
    }

    while (output.endsWith("\n")) {
      output = output.slice(0, -1);
    }

    return output;
  }

  // overlay one string on top of another
  static overlay(horizontalPosition: number, verticalPosition: number, fg: string, bg: string): string {
    const fgWidth = textWidth(fg);
    const bgWidth = textWidth(bg);
    if (fgWidth > bgWidth) {
      throw new Error("You can't overlay foreground that's wider than background");
    }

    const fgBlock = fg.split("\n");
    const bgBlock = bg.split("\n");

    const fgHeight = fgBlock.length;
    const bgHeight = bgBlock.length;
    if (fgHeight > bgHeight) {
      throw new Error("You can't overlay foreground that's higher than background");
    }

    const offsetX = normalizePosition(horizontalPosition, bgWidth - fgWidth);
    const offsetY = normalizePosition(verticalPosition, bgHeight - fgHeight);

    let output = "";

    for (let i = 0; i < bgHeight; ++i) {
      const j = i - offsetY;
      const bgLine = bgBlock[i];

      if (j < 0 || j >= fgHeight) {
        output += bgLine + "\n";
        continue;
      }

      const fgLine = fgBlock[j];
      output += insert(bgLine, fgLine, offsetX) + "\n";
    }

    while (output.endsWith("\n")) {
      output = output.slice(0, -1);
    }

    return output;
  }

  static fitToScreen(string: string): string {
    const { columns, rows } = Deno.consoleSize();
    return fitIntoDimensions(string, columns, rows);
  }
}
