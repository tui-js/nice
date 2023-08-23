// Copyright 2023 Im-Beast. All rights reserved. MIT license.

import { characterWidth, stripStyles, textWidth } from "../deps.ts";

export { characterWidth, stripStyles, textWidth };

export function fitIntoDimensions(text: string, width: number, height: number): string {
  let fitted = "";

  let currentWidth = 0;
  let currentHeight = 0;

  let waitTillNewline = false;

  let ansi = false;
  const len = text.length;
  for (let i = 0; i < len; ++i) {
    const char = text[i];
    if (char === "\x1b") {
      ansi = true;
    } else if (ansi && char === "m") {
      ansi = false;
    } else if (!ansi) {
      if (char === "\n") {
        if (++currentHeight > height) break;
        currentWidth = 0;
        waitTillNewline = false;
      } else if (!waitTillNewline) {
        const charWidth = characterWidth(char);
        if (currentWidth + charWidth >= width) {
          waitTillNewline = true;
        } else {
          currentWidth += charWidth;
        }
      } else continue;
    }

    fitted += char;
  }

  return fitted;
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
      i += 2; // [ "\x1b" "[" "X" "m" ] <-- shortest ansi sequence
    } else if (char === "m" && ansi) {
      ansi = false;
    } else if (!ansi) {
      if (char === "\n") {
        height++;
        gotWidth ||= true;
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
export function crop(text: string, width: number): string {
  let cropped = "";
  let croppedWidth = 0;
  let ansi = false;

  const len = text.length;
  for (let i = 0; i < len; ++i) {
    const char = text[i];

    if (char === "\x1b") {
      ansi = true;
    } else if (ansi && char === "m") {
      ansi = false;
    } else if (!ansi) {
      const charWidth = characterWidth(char);
      if (croppedWidth + charWidth > width) break;
      else {
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
export function cropStart(text: string, width: number): string {
  let ansi = false;

  let croppedWidth = 0;
  let cropFrom = 0;

  const len = text.length;
  for (let i = 0; i < len; ++i) {
    const char = text[i];

    if (char === "\x1b") {
      ansi = true;
    } else if (ansi && char === "m") {
      ansi = false;
    } else if (!ansi) {
      const charWidth = characterWidth(char);
      if (croppedWidth + charWidth > width) {
        cropFrom = i;
        break;
      } else {
        croppedWidth += charWidth;
      }
    }
  }

  return text.slice(cropFrom);
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
  let ansi = false;

  let croppedWidth = 0;
  let sliced = "";

  const len = text.length;
  for (let i = 0; i < len; ++i) {
    const char = text[i];

    if (char === "\x1b") {
      ansi = true;
    } else if (ansi && char === "m") {
      ansi = false;
    } else if (!ansi) {
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
