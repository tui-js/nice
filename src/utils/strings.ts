// Copyright 2023 Im-Beast. All rights reserved. MIT license.

import { characterWidth, stripStyles, textWidth } from "../deps.ts";

export { characterWidth, stripStyles, textWidth };

export function fitIntoDimensions(
  text: string,
  width: number,
  height: number
): string {
  let fit = "";

  let currentWidth = 0;
  let currentHeight = 0;

  let ansi = false;
  let waitTillNewline = false;

  for (let i = 0; i < text.length; ++i) {
    const char = text[i];

    // Skip to the next newline (we reached width)
    if (waitTillNewline) {
      if (char === "\n") {
        waitTillNewline = false;
        currentWidth = 0;
        currentHeight += 1;
        if (currentHeight == height) {
          break;
        }
      }
      fit += char;
      continue;
    }

    if (char === "\x1b") {
      ansi = true;
      // ["\x1b", "[", "X", "m"] <-- shortest ansi sequence
      // skip these 3 characters
      fit += char;
      fit += text[++i];
      fit += text[++i];
      continue;
    } else if (!ansi) {
      const charWidth = characterWidth(char);
      if (currentWidth + charWidth >= width) {
        waitTillNewline = true;
      } else {
        currentWidth += charWidth;
      }
    } else if (isFinalAnsiByte(char)) {
      ansi = false;
    }

    fit += char;
  }

  return fit;
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
export function crop(text: string, width: number): string {
  let cropped = "";
  let croppedWidth = 0;
  let ansi = false;

  const len = text.length;
  for (let i = 0; i < len; ++i) {
    const char = text[i];

    if (char === "\x1b") {
      ansi = true;
    } else if (ansi && isFinalAnsiByte(char)) {
      ansi = false;
    } else if (!ansi) {
      const charWidth = characterWidth(char);
      if (croppedWidth + charWidth > width) {
        if (croppedWidth + 1 === width) {
          cropped += " ";
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
export function cropStart(text: string, width: number): string {
  let ansi = false;

  let croppedWidth = 0;
  let cropFrom = 0;

  let lastSingularAnsiSeq = "";
  let preserveAnsiSeq = "";

  const len = text.length;
  for (let i = 0; i < len; ++i) {
    const char = text[i];

    if (char === "\x1b") {
      ansi = true;

      if (lastSingularAnsiSeq === "\x1b[0m") {
        preserveAnsiSeq = "";
      } else {
        preserveAnsiSeq += lastSingularAnsiSeq;
      }

      lastSingularAnsiSeq = char;
    } else if (ansi) {
      if (isFinalAnsiByte(char)) {
        ansi = false;
      }
      lastSingularAnsiSeq += char;
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

  return preserveAnsiSeq + text.slice(cropFrom);
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
    } else if (ansi && isFinalAnsiByte(char)) {
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

export function isFinalAnsiByte(character: string): boolean {
  const codePoint = character.charCodeAt(0);
  // don't include 0x70–0x7E range because its considered "private"
  return codePoint >= 0x40 && codePoint < 0x70;
}

// TODO: tests for that
// TOOD: this can probably be optimized further
/** Insert {fg} on top of {bg} starting from {pos} */
export function insert(bg: string, fg: string, pos: number): string {
  let output = "";

  let done = false;
  let currentPos = 0;
  let ansi = 0;
  let lastStyle = "";
  let flushStyle = false;

  const border = pos + textWidth(fg);

  for (let i = 0; i < bg.length; ++i) {
    const char = bg[i];

    if (char === "\x1b") {
      // possible start of an ansi sequence
      ++ansi;
    } else if (ansi === 1) {
      // confirm whether ansi sequence has been started
      if (char === "[") {
        lastStyle += "\x1b" + char;
        ++ansi;
      } else {
        ansi = 0;
      }
    } else if (ansi > 1) {
      const isFinalByte = isFinalAnsiByte(char);
      lastStyle += char;

      if (isFinalByte) {
        flushStyle = true;

        output += lastStyle;

        // End of ansi sequence
        if (ansi === 3 && lastStyle[lastStyle.length - 2] === "0") {
          // Style is "\x1b[0m" – no need to store the last style when all of them got cleared
          lastStyle = "";
          flushStyle = false;
        }

        ansi = 0;
      } else {
        // Part of an ansi sequence
        ++ansi;
      }
    } else {
      const width = textWidth(char);
      currentPos += width;

      if (currentPos === pos + 1 && width > 1) {
        // if full width character in bg gets cut off at the start by fg replace it with space
        output += "…";
      } else if (currentPos <= pos || currentPos > border) {
        if (currentPos === border + 1 && width > 1) {
          // if full width character in bg gets cut off at the end by fg replace it with space
          output += "…";
        } else {
          output += char;
        }
      }
    }

    if (!done && !flushStyle && currentPos >= pos) {
      output += fg;
      done = true;
    }
  }

  return output;
}
