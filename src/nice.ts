// Copyright 2023 Im-Beast. All rights reserved. MIT license.
import { fitIntoDimensions } from "../mod.ts";
import { Border, type BorderStyle } from "./border.ts";
import { crop, insert, textWidth } from "./utils/strings.ts";

// TODO: modularize the Nice class
// TODO: temporarily store blocks in a map
// TODO: Tests, especially with weird characters
// TODO: Store metadata about generated definitions

export function isValidPosition(position: HorizontalPosition | VerticalPosition | number): boolean {
  return position >= 0 && position <= 1;
}

export enum VerticalPosition {
  Top = 0,
  Middle = 0.5,
  Bottom = 1,
}

export enum HorizontalPosition {
  Left = 0,
  Center = 0.5,
  Right = 1,
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
      const initialTextLines = [...textLines];

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
            const nextLine = textLines[i + 1];
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

            input = input.replace(textLine, start + "\n" + end);
            if (nextLine && !initialTextLines.includes(nextLine)) {
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
      string += (marginLine + "\n").repeat(margin.top);
    }

    const leftMargin = " ".repeat(margin.left);
    const rightMargin = " ".repeat(margin.right);

    if (border) {
      string += leftMargin + border.getTop(width + paddingX) + rightMargin + "\n";
    }

    // TODO: Try to create line only when there's no text on current line
    let line = "";
    let leftSide = "";
    let rightSide = "";

    if (border) {
      line += border.getLeft();
      leftSide += border.getLeft();
    }

    if (padding?.left) {
      const padLeft = style(" ".repeat(padding.left));
      line += padLeft;
      leftSide += padLeft;
    }

    line += style(" ".repeat(width));

    if (padding?.right) {
      const padRight = style(" ".repeat(padding.right));
      line += padRight;
      rightSide += padRight;
    }

    if (border) {
      const right = border.getRight();
      line += right;
      rightSide += right;
    }

    if (margin?.left) {
      const marLeft = " ".repeat(margin.left);
      line = marLeft + line;
      leftSide = marLeft + leftSide;
    }

    if (margin?.right) {
      const marRight = " ".repeat(margin.right);
      line += marRight;
      rightSide += marRight;
    }

    if (padding?.top) {
      string += (line + "\n").repeat(padding.top);
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
      string += "\n" + (line + "\n").repeat(padding.bottom - 1) + line;
    }

    if (border) {
      string += "\n" + leftMargin + border.getBottom(width + paddingX) + rightMargin;
    }

    if (margin?.bottom) {
      string += "\n" + (marginLine + "\n").repeat(margin.bottom - 1) + marginLine;
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
    const maxWidths = blocks.map((x) =>
      x.reduce((p, n) => {
        const nextWidth = textWidth(n);
        return p > nextWidth ? p : nextWidth;
      }, 0)
    );
    const maxHeight = blocks.reduce((p, n) => p > n.length ? p : n.length, 0);

    let string = "";
    for (let y = 0; y < maxHeight; ++y) {
      let row = "";

      for (const i in blocks) {
        const block = blocks[i];
        const maxWidth = maxWidths[i];

        const yOffset = Math.round((maxHeight - block.length) * verticalPosition);
        let line = block[y - yOffset] ?? "";

        const lineWidth = line ? textWidth(line) : 0;
        if (lineWidth < maxWidth) {
          line += " ".repeat(maxWidth - lineWidth);
        }

        row += line;
      }

      string += row + "\n";
    }

    return string;
  }

  static #blocks: string[][] = [];

  static layoutVertically(horizontalPosition: number, ...strings: string[]): string {
    const blocks = this.#blocks;

    let maxWidth = 0;

    for (const string of strings) {
      const block = string.split("\n");
      blocks.push(block);

      const width = textWidth(block[0]);
      maxWidth = Math.max(maxWidth, width);
    }

    let string = "";

    for (const block of blocks) {
      for (let line of block) {
        const lineWidth = textWidth(line);
        if (lineWidth < maxWidth) {
          const lacksLeft = Math.round((maxWidth - lineWidth) * horizontalPosition);
          const lacksRight = maxWidth - lineWidth - lacksLeft;
          line = " ".repeat(lacksLeft) + line + " ".repeat(lacksRight);
        }

        string += line + "\n";
      }
    }

    // Clean blocks
    while (blocks.length) {
      blocks.pop();
    }

    return string;
  }

  // overlay one string on top of another
  static overlay(
    horizontalPosition: number,
    verticalPosition: number,
    fg: string,
    bg: string,
  ): string {
    if (!isValidPosition(horizontalPosition) || !isValidPosition(verticalPosition)) {
      throw "Positions should be in range from 0 to 1.";
    }

    const fgBlock = fg.split("\n");
    const bgBlock = bg.split("\n");

    const fgHeight = fgBlock.length;
    const bgHeight = bgBlock.length;
    if (fgHeight > bgHeight) {
      throw "You can't overlay foreground that's higher than background";
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
      throw "You can't overlay foreground that's wider than background";
    }

    const offsetX = Math.round((bgWidth - fgWidth) * horizontalPosition);
    const offsetY = Math.round((bgHeight - fgHeight) * verticalPosition);

    let string = "";

    for (const i in bgBlock) {
      const index = +i - offsetY;
      const bgLine = bgBlock[i];

      if (index < 0 || index >= fgHeight) {
        string += bgLine + "\n";
        continue;
      }

      const fgLine = fgBlock[index];
      string += insert(bgLine, fgLine, offsetX) + "\n";
    }

    return string;
  }

  static fitToScreen(string: string): string {
    const { columns, rows } = Deno.consoleSize();
    return fitIntoDimensions(string, columns, rows);
  }
}
