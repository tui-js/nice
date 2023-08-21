// Copyright 2023 Im-Beast. All rights reserved. MIT license.

import { characterWidth, stripStyles, textWidth } from "./deps.ts";

export { characterWidth, stripStyles, textWidth };

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

  for (let i = 0; i < text.length; ++i) {
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

  for (let i = 0; i < text.length; ++i) {
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
