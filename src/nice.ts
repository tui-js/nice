// Copyright 2023 Im-Beast. All rights reserved. MIT license.
import { fitIntoDimensions } from "../mod.ts";
import { Border, type BorderStyle } from "./border.ts";
import { crop, insert, textWidth } from "./utils/strings.ts";

// FIXME: Negative positions
// TODO: modularize the Nice class
// TODO: Tests, especially with weird characters
// TODO: Store metadata about generated definitions

export function normalizePosition(position: number, relative: number): number {
  if (Number.isInteger(position)) {
    return position;
  }

  return Math.round(relative * position);
}

export interface Style {
  (text: string): string;
}

type Side = "top" | "bottom" | "left" | "right";
export type MarginStyle = { [side in Side]: number };
export type PaddingStyle = { [side in Side]: number };

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
  margin?: Partial<MarginStyle>;
  padding?: Partial<PaddingStyle>;
  border?: Border | (Partial<Omit<BorderStyle, "type" | "style">> & Pick<BorderStyle, "type" | "style">);
}

export class Nice {
  style: Style;

  width?: number;
  height?: number;

  margin: MarginStyle;
  padding: PaddingStyle;

  text: TextStyle;
  border?: Border;

  constructor(options: NiceOptions) {
    this.style = options.style;

    const { border, text, margin, padding, width, height } = options;

    this.width = width;
    this.height = height;

    if (border) {
      this.border = border instanceof Border ? border : new Border({
        top: true,
        bottom: true,
        left: true,
        right: true,
        ...border,
      });
    }

    this.text = {
      overflow: "clip",
      wrap: "wrap",
      verticalAlign: "top",
      horizontalAlign: "left",
      ...text,
    };

    this.margin = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      ...margin,
    };

    this.padding = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      ...padding,
    };
  }

  render(input: string): string {
    const { style, border, margin, padding, text } = this;

    let { width, height } = this;

    const textLines = input.split("\n");

    const { overflow } = text;
    // Wrap sticking text
    if (width && height) {
      for (let i = 0; i < textLines.length; ++i) {
        const textLine = textLines[i];
        const lineWidth = textWidth(textLine);

        if (lineWidth <= width) {
          if (overflow === "ellipsis" && textLines.length - 1 > i && i + 1 >= height) {
            const ellipsisString = text.ellipsisString ?? "…";
            const ellipsisWidth = textWidth(ellipsisString);

            const expectedWidth = width - ellipsisWidth;

            if (lineWidth === width || lineWidth > 0) {
              textLines[i] = crop(textLine, expectedWidth) + ellipsisString;
            } else {
              textLines[i - 1] = crop(textLines[i - 1], expectedWidth) + ellipsisString;
            }
          }

          continue;
        }

        switch (text.wrap) {
          case "wrap": {
            let spaceIndex = textLine.lastIndexOf(" ");
            let start: string;
            let end: string;

            // If there's a space in the line, try to use it as breakpoint
            if (spaceIndex !== -1) {
              // Try finding a space closest to width, if space exists before width, use it
              if (spaceIndex > width) {
                const closestSpaceAfterWidth = textLine.indexOf(" ", width);
                if (closestSpaceAfterWidth !== -1) spaceIndex = closestSpaceAfterWidth;
              }

              start = textLine.slice(0, spaceIndex);
              end = textLine.slice(spaceIndex + 1);
            } else {
              start = crop(textLine, width);
              end = textLine.slice(start.length);
            }

            const nextLine = textLines[i + 1];
            if (nextLine) {
              textLines.splice(i, 2, start, end + " " + nextLine);
            } else {
              textLines.splice(i, 1, start, end);
            }
            --i;

            break;
          }
          case "nowrap":
            textLines[i] = crop(textLine, width);
            break;
          case "balance":
            // TODO: balance wrapping
            break;
        }
      }
    } else {
      height ??= textLines.length;
      width = 0;
      for (const textLine of textLines) {
        width = Math.max(width, textWidth(textLine));
      }
    }

    let string = "";

    const marginX = margin.left + margin.right;
    const paddingX = padding.left + padding.right;
    const borderX = border ? Number(border.borderStyle.left) + Number(border.borderStyle.right) : 0;

    const marginLine = " ".repeat(width + marginX + paddingX + borderX);

    if (margin?.top) {
      const topMarginLine = marginLine + "\n";
      for (let i = 0; i < margin.top; ++i) {
        string += topMarginLine;
      }
    }

    const leftMargin = " ".repeat(margin.left);
    const rightMargin = " ".repeat(margin.right);

    if (border) {
      string += leftMargin + border.getTop(width + paddingX) + rightMargin + "\n";
    }

    let leftSide = "";
    let rightSide = "";

    if (margin?.left) leftSide += leftMargin;

    if (border) leftSide += border.getLeft();

    if (padding?.left) leftSide += style(" ".repeat(padding.left));
    if (padding?.right) rightSide += style(" ".repeat(padding.right));

    if (border) rightSide += border.getRight();

    if (margin?.right) rightSide += rightMargin;

    const line = leftSide + style(" ".repeat(width)) + rightSide;
    if (padding?.top) {
      const padTop = line + "\n";
      for (let i = 0; i < padding.top; ++i) {
        string += padTop;
      }
    }

    const { verticalAlign, horizontalAlign } = text;

    let textStartY: number;

    // TODO: replace "top" | "middle" | "bottom" with VerticalPosition
    switch (verticalAlign) {
      case "top":
        textStartY = 0;
        break;
      case "bottom":
        textStartY = height - textLines.length;
        break;
      case "middle":
        textStartY = Math.round((height - textLines.length) / 2);
        break;
    }

    // Render text
    let i = 0;
    for (let h = 0; h < height; ++h) {
      const lastLine = h !== height - 1;

      if (h < textStartY || h >= textStartY + textLines.length) {
        string += line;
        if (lastLine) string += "\n";
        continue;
      }

      const textLine = textLines[i++];
      const lineWidth = textWidth(textLine);

      if (lineWidth >= width) {
        string += leftSide + style(crop(textLine, width)) + rightSide;
        if (lastLine) {
          string += "\n";
        }
        continue;
      }

      // TODO: replace "left" | "center" | "right" with HorizontalPosition
      switch (horizontalAlign) {
        case "left":
          {
            const lacksRight = width - lineWidth;
            string += leftSide + style(textLine + " ".repeat(lacksRight)) + rightSide;
          }
          break;
        case "center":
          {
            const lacksLeft = Math.round((width - lineWidth) / 2);
            const lacksRight = width - lineWidth - lacksLeft;

            string += leftSide + style(
              " ".repeat(lacksLeft) + textLine + " ".repeat(lacksRight),
            ) + rightSide;
          }
          break;
        case "right":
          {
            const lacksLeft = width - lineWidth;
            string += leftSide + style(" ".repeat(lacksLeft) + textLine) + rightSide;
          }
          break;
        case "justify":
          {
            let justifiedLine = textLine.trim();

            if (justifiedLine.indexOf(" ") === -1) {
              justifiedLine += " ".repeat(width - justifiedLine.length);
            } else {
              let i = justifiedLine.indexOf(" ");
              while (textWidth(justifiedLine) < width) {
                justifiedLine = justifiedLine.slice(0, i) + " " + justifiedLine.slice(i);
                i = justifiedLine.indexOf(" ", i + 2);
                if (i === -1) i = justifiedLine.indexOf(" ");
              }
            }

            string += leftSide + style(justifiedLine) + rightSide;
          }
          break;
      }

      if (lastLine) {
        string += "\n";
      }
    }

    if (padding?.bottom) {
      const padLine = "\n" + line;
      for (let i = 0; i < padding.bottom; ++i) {
        string += padLine;
      }
    }

    if (border) {
      string += "\n" + leftMargin + border.getBottom(width + paddingX) + rightMargin;
    }

    if (margin?.bottom) {
      const bottomMarginLine = "\n" + marginLine;
      for (let i = 0; i < margin.bottom; ++i) {
        string += bottomMarginLine;
      }
    }

    return string;
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
  static overlay(
    horizontalPosition: number,
    verticalPosition: number,
    fg: string,
    bg: string,
  ): string {
    const fgBlock = fg.split("\n");
    const bgBlock = bg.split("\n");

    const fgHeight = fgBlock.length;
    const bgHeight = bgBlock.length;
    if (fgHeight > bgHeight) {
      throw new Error("You can't overlay foreground that's higher than background");
    }

    let fgWidth = 0;
    if (!fgWidth) {
      const line = fgBlock[0];
      fgWidth = textWidth(line);
    }

    let bgWidth = 0;
    if (!bgWidth) {
      const line = bgBlock[0];
      bgWidth = textWidth(line);
    }

    if (fgWidth > bgWidth) {
      throw new Error("You can't overlay foreground that's wider than background");
    }

    const offsetX = normalizePosition(horizontalPosition, bgWidth - fgWidth);
    const offsetY = normalizePosition(verticalPosition, bgHeight - fgHeight);

    let output = "";

    for (const bgIndex in bgBlock) {
      const index = +bgIndex - offsetY;
      const bgLine = bgBlock[bgIndex];

      if (index < 0 || index >= fgHeight) {
        output += bgLine + "\n";
        continue;
      }

      const fgLine = fgBlock[index];
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
