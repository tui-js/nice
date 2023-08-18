// Copyright 2023 Im-Beast. All rights reserved. MIT license.
import { Border, Borders, BorderType, stylePieces } from "./border.ts";
import { cropByWidth, cropToWidth, textWidth } from "./utils.ts";

// TODO: Fit to console size
// TODO: Tests, especially with weird characters

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
}

export type BorderStyle =
  & { type: BorderType; style: Style }
  & { [side in Side]: boolean };

export interface NiceOptions {
  style: Style;
  width?: number;
  height?: number;
  text?: Partial<TextStyle>;
  margin?: Partial<MarginStyle>;
  padding?: Partial<PaddingStyle>;
  border?: Partial<Omit<BorderStyle, "type" | "style">> & Pick<BorderStyle, "type" | "style">;
}

export class Nice {
  style: Style;

  width?: number;
  height?: number;

  margin: MarginStyle;
  padding: PaddingStyle;

  text: TextStyle;
  border?: BorderStyle;

  constructor(options: NiceOptions) {
    this.style = options.style;

    const { border, text, margin, padding, width, height } = options;

    this.width = width;
    this.height = height;

    if (border) {
      this.borderPieces = stylePieces(Borders[border.type], border.style);

      this.border = {
        top: true,
        bottom: true,
        left: true,
        right: true,
        ...border,
      };
    }

    this.text = {
      overflow: "clip",
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

  borderPieces?: Border;

  render(input: string): string {
    const { style, border, margin, padding, text } = this;
    let { width, height } = this;

    const autoWidth = !width;
    const autoHeight = !height;

    const textLines = input.split("\n");

    let longestLine = textLines.reduce((p, c) => textWidth(p) > textWidth(c) ? p : c);

    width ??= textWidth(longestLine);
    height ??= textLines.length;

    const { overflow } = text;
    // Wrap sticking text
    if (width < textWidth(longestLine)) {
      const initialTextLines = [...textLines];

      for (let i = 0; i < textLines.length; ++i) {
        const textLine = textLines[i];
        const lineWidth = textWidth(textLine);

        if (lineWidth <= width) {
          if (!autoHeight && textLines.length > (i + 1) && i >= (height - 1) && overflow === "ellipsis") {
            const ellipsisString = text.ellipsisString ?? "…";
            const ellipsisWidth = textWidth(ellipsisString);

            const expectedWidth = width - ellipsisWidth;

            if (lineWidth === width) {
              textLines[i] = cropToWidth(textLine, expectedWidth) + ellipsisString;
            } else if (lineWidth > 0) {
              textLines[i] = cropToWidth(textLine, expectedWidth) + ellipsisString;
            } else {
              const lastLine = textLines[i - 1];
              const lastLineWidth = textWidth(lastLine);

              if (lastLineWidth === width) {
                textLines[i - 1] = cropToWidth(lastLine, expectedWidth) + ellipsisString;
              } else {
                textLines[i - 1] = cropToWidth(lastLine, expectedWidth) + ellipsisString;
              }
            }
          }

          continue;
        }

        const nextLine = textLines[i + 1];

        if (textLine.includes(" ")) {
          let lastSpace = textLine.indexOf(" ", width);
          if (lastSpace === -1) lastSpace = textLine.lastIndexOf(" ");

          const start = textLine.slice(0, lastSpace);
          const end = textLine.slice(lastSpace + 1);

          input = input.replace(textLine, start + "\n" + end);
          if (nextLine && !initialTextLines.includes(nextLine)) {
            textLines.splice(i, 2, start, end + " " + nextLine);
          } else {
            textLines.splice(i, 1, start, end);
          }
          --i;
        } else {
          const start = textLine.slice(0, width);
          const end = textLine.slice(width);
          input = input.replace(textLine, start + "\n" + end);

          if (nextLine && !initialTextLines.includes(nextLine)) {
            textLines.splice(i, 2, start, end + " " + nextLine);
          } else {
            textLines.splice(i, 1, start, end);
          }
          --i;
        }
      }

      longestLine = textLines.reduce((p, c) => p.length > c.length ? p : c);
      if (autoWidth) width = longestLine.length;
      if (autoHeight) height = textLines.length;
    }

    let string = "";

    const cell = style(" ");

    const borderPieces: Border = this.borderPieces!;

    const marginX = (margin?.left ?? 0) + (margin?.right ?? 0);
    const _marginY = (margin?.top ?? 0) + (margin?.bottom ?? 0);

    const paddingX = (padding?.left ?? 0) + (padding?.right ?? 0);
    const _paddingY = (padding?.top ?? 0) + (padding?.bottom ?? 0);

    const borderX = (border?.left ? 1 : 0) + (border?.right ? 1 : 0);
    const _borderY = (border?.top ? 1 : 0) + (border?.bottom ? 1 : 0);

    const marginLine = " ".repeat(width + marginX + paddingX + borderX);

    if (margin?.top) {
      string += (marginLine + "\n").repeat(margin.top);
    }

    if (border?.top) {
      if (margin?.left) string += " ".repeat(margin.left);

      if (border.left) string += borderPieces.topLeft;
      string += borderPieces.top.repeat(width + paddingX);
      if (border.right) string += borderPieces.topRight;

      if (margin?.right) string += " ".repeat(margin.right);

      string += "\n";
    }

    let line = "";
    let leftSide = "";
    let rightSide = "";

    if (border?.left) {
      line += borderPieces.left;
      leftSide += borderPieces.left;
    }

    if (padding?.left) {
      const padLeft = cell.repeat(padding.left);
      line += padLeft;
      leftSide += padLeft;
    }

    line += cell.repeat(width);

    if (padding?.right) {
      const padRight = cell.repeat(padding.right);
      line += padRight;
      rightSide += padRight;
    }

    if (border?.right) {
      line += borderPieces.right;
      rightSide = rightSide + borderPieces.right;
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
      if (h >= textStartY && h < textStartY + textLines.length) {
        const textLine = textLines[i++];
        const lineWidth = textWidth(textLine);

        switch (horizontalAlign) {
          case "center":
            {
              const lacksLeft = Math.max(0, Math.round((width - lineWidth) / 2));
              const lacksRight = Math.max(0, width - lineWidth - lacksLeft);
              string += leftSide + cell.repeat(lacksLeft) + style(textLine) + cell.repeat(lacksRight) + rightSide;
            }
            break;
          case "left":
            {
              const lacksRight = Math.max(0, width - lineWidth);
              string += leftSide + style(textLine) + cell.repeat(lacksRight) + rightSide;
            }
            break;
          case "right":
            {
              const lacksLeft = Math.max(0, width - lineWidth);
              string += leftSide + cell.repeat(lacksLeft) + style(textLine) + rightSide;
            }
            break;
          case "justify":
            {
              let justifiedLine = textLine.trim();

              if (justifiedLine.indexOf(" ") === -1) {
                justifiedLine += cell.repeat(width - justifiedLine.length);
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
      } else {
        string += line;
      }
      if (h !== height - 1) string += "\n";
    }

    if (padding?.bottom) {
      string += "\n" + (line + "\n").repeat(padding.bottom - 1) + line;
    }

    if (border?.bottom) {
      string += "\n";

      if (margin?.left) string += " ".repeat(margin.left);
      if (border.left) string += borderPieces.bottomLeft;
      string += borderPieces.bottom.repeat(width + paddingX);
      if (border.right) string += borderPieces.bottomRight;
      if (margin?.right) string += " ".repeat(margin.right);
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

  // TODO: Way to determine Y position (top/middle/bottom)
  // TODO:  cache horizontal blocks too
  static layoutHorizontally(...strings: string[]): string {
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

        let line = block[y] ?? "";
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

  static #blockWidthCache = new Map<string | string[], number>();
  static #blockCache = new Map<string, string[]>();
  static #blocks: string[][] = [];

  // TODO: Way to determine X position (left/center/right)
  static layoutVertically(...strings: string[]): string {
    const blockCache = this.#blockCache;
    const blocks = this.#blocks;
    const blockWidthCache = this.#blockWidthCache;

    let maxWidth = 0;

    for (const string of strings) {
      const cachedBlock = blockCache.get(string);
      const block = cachedBlock ?? string.split("\n");
      if (!cachedBlock) blockCache.set(string, block);

      blocks.push(block);

      const cachedWidth = blockWidthCache.get(block);
      if (cachedWidth) {
        maxWidth = Math.max(maxWidth, cachedWidth);
      } else {
        const width = textWidth(block[0]);
        maxWidth = Math.max(maxWidth, width);
        blockWidthCache.set(block, width);
      }
    }

    let string = "";

    for (const block of blocks) {
      for (let line of block) {
        const lineWidth = textWidth(line);
        if (lineWidth < maxWidth) {
          line += " ".repeat(maxWidth - lineWidth);
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
    horizontalPosition: HorizontalPosition,
    verticalPosition: VerticalPosition,
    fg: string,
    bg: string,
  ): string {
    if (!isValidPosition(horizontalPosition) || !isValidPosition(verticalPosition)) {
      throw "Positions should be in range from 0 to 1.";
    }

    const blockCache = this.#blockCache;
    const blockWidthCache = this.#blockWidthCache;

    const fgCachedBlock = blockCache.get(fg);
    const fgBlock = fgCachedBlock ?? fg.split("\n");
    if (!fgCachedBlock) blockCache.set(fg, fgBlock);

    const bgCachedBlock = blockCache.get(bg);
    const bgBlock = bgCachedBlock ?? bg.split("\n");
    if (!bgCachedBlock) blockCache.set(bg, bgBlock);

    const fgHeight = fgBlock.length;
    const bgHeight = bgBlock.length;
    if (fgHeight > bgHeight) {
      throw "You can't overlay foreground that's higher than background";
    }

    let fgWidth = blockWidthCache.get(fg) ?? 0;
    if (!fgWidth) {
      const line = fgBlock[0];
      fgWidth = textWidth(line);
      blockWidthCache.set(fg, fgWidth);
    }

    let bgWidth = blockWidthCache.get(bg) ?? 0;
    if (!bgWidth) {
      const line = bgBlock[0];
      bgWidth = textWidth(line);
      blockWidthCache.set(bg, bgWidth);
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

      const left = cropToWidth(bgLine, offsetX);
      const center = fgLine;
      const right = cropByWidth(bgLine.replace(left, ""), fgWidth);

      string += left + "\x1b[0m" + center + "\x1b[0m" + right + "\n";
    }

    return string;
  }
}
