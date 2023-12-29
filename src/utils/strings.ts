// Copyright 2023 Im-Beast. All rights reserved. MIT license.
import { characterWidth, stripStyles } from "../deps.ts";
import { ConsoleDimensions } from "../types.ts";
export { characterWidth, stripStyles };

export function fitIntoDimensions(text: string[], { columns, rows }: ConsoleDimensions): void {
  while (text.length > rows) {
    text.pop();
  }

  for (const i in text) {
    const line = text[i];
    if (textWidth(line) <= columns) continue;
    text[i] = crop(line, columns);
  }
}

export function dimensions(text: string): { width: number; height: number } {
  let width = 0;
  let height = 0;

  let ansi = false;
  let gotWidth = false;
  const len = text.length;

  for (let i = 0; i < len; ++i) {
    const char = text[i];

    if (char === "\x1b") {
      ansi = true;
      i += 2; // ["\x1b", "[", "X", "m"] <-- shortest ansi sequence
    } else if (isFinalAnsiByte(char) && ansi) {
      ansi = false;
    } else if (!ansi) {
      if (char === "\n") {
        height++;
        gotWidth = true;
      } else if (!gotWidth) {
        width += characterWidth(char);
      }
    }
  }

  return { width, height };
}

/**
 * Crops the {text} to given {width}
 *
 * Keep in mind that this function might return string shorter than {width} in two scenarios:
 *  - Input text was shorter than specified width
 *  - Input text had full-width characters which couldn't fit into {width}
 */
export function crop(text: string, width: number, ellipsis = "…"): string {
  let cropped = "";
  let croppedWidth = 0;
  let ansi = 0;

  const len = text.length;
  for (let i = 0; i < len; ++i) {
    const char = text[i];

    if (char === "\x1b") {
      ansi = 1;
    } else if (ansi >= 3 && isFinalAnsiByte(char)) {
      ansi = 0;
    } else if (ansi > 0) {
      ansi += 1;
    } else {
      const charWidth = characterWidth(char);

      if (croppedWidth + charWidth > width) {
        if (croppedWidth + 1 === width) {
          cropped += ellipsis;
        }
        break;
      } else {
        croppedWidth += charWidth;
      }
    }

    cropped += char;
  }

  return cropped;
}

/**
 * Crops the start of {text} by given {width}
 */
export function cropStart(text: string, width: number, ellipsis = "…"): string {
  let ansi = 0;

  let croppedWidth = 0;
  let lastAnsiKind = "";
  let preserveAnsiSeq = "";

  for (let i = 0; i < text.length; ++i) {
    const char = text[i];

    if (char === "\x1b") {
      ansi = 1;
      preserveAnsiSeq += char;
    } else if (ansi >= 3 && isFinalAnsiByte(char)) {
      if (lastAnsiKind === "0") {
        preserveAnsiSeq = "";
      }
      preserveAnsiSeq += char;
      ansi = 0;
    } else if (ansi > 0) {
      if (ansi === 2) {
        lastAnsiKind += char;
      }

      ansi += 1;
      preserveAnsiSeq += char;
    } else {
      const charWidth = characterWidth(char);
      if (croppedWidth === width) {
        return preserveAnsiSeq + text.slice(i);
      } else if (croppedWidth === width + 1) {
        return preserveAnsiSeq + ellipsis + text.slice(i);
      } else {
        croppedWidth += charWidth;
      }
    }
  }

  return "";
}

/**
 * Crops the end of {text} by given {width}
 */
export function cropEnd(text: string, width: number): string {
  return crop(text, textWidth(text) - width);
}

/**
 * `String.prototype.slice` but using widths
 */
export function slice(text: string, from: number, to: number): string {
  let ansi = 0;
  let croppedWidth = 0;
  let sliced = "";

  const len = text.length;
  for (let i = 0; i < len; ++i) {
    const char = text[i];

    if (char === "\x1b") {
      ansi = 1;
    } else if (ansi >= 3 && isFinalAnsiByte(char)) {
      ansi = 0;
    } else if (ansi > 0) {
      ansi += 1;
    } else {
      const charWidth = characterWidth(char);

      if (croppedWidth + charWidth > to) {
        break;
      } else {
        croppedWidth += charWidth;
      }
    }

    if (croppedWidth > from) {
      sliced += char;
    }
  }

  return sliced;
}

export function isFinalAnsiByte(character: string): boolean {
  // TODO: Remove this check later on, for now its used as a safeguard
  if (character === "[") {
    throw new Error("Bad ANSI handling logic");
  }

  const codePoint = character.charCodeAt(0);
  // don't include 0x70–0x7E range because its considered "private"
  return codePoint >= 0x40 && codePoint < 0x70;
}

// TODO: tests
/** Insert {fg} on top of {bg} starting from {pos} */
export function insert(bg: string, fg: string, pos: number, ellipsis = "…"): string {
  const fgWidth = textWidth(fg);
  const border = pos + fgWidth;

  const start = crop(bg, pos, ellipsis);
  const end = cropStart(bg, border, ellipsis);

  const output = start + "\x1b[0m" + fg + end;
  return output;
}

/**
 * Returns real {text} width
 * Returns width of the first line if {text} contains newlines
 */
export function textWidth(text: string, start = 0): number {
  if (!text) return 0;

  let width = 0;
  let ansi = false;
  const len = text.length;
  loop: for (let i = start; i < len; ++i) {
    const char = text[i];

    switch (char) {
      case "\x1b":
        ansi = true;
        i += 2;
        break;
      case "\n":
        break loop;
      default:
        if (!ansi) {
          width += characterWidth(char);
        } else if (isFinalAnsiByte(char)) {
          ansi = false;
        }
        break;
    }
  }

  return width;
}
