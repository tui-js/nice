// Copyright 2023 Im-Beast. All rights reserved. MIT license.
// TODO: import these utils from tui utils or extract them as external module

import { crayon } from "https://deno.land/x/crayon@3.3.3/mod.ts";

/** Returns real {text} width */
export function textWidth(text: string, start = 0): number {
  if (!text) return 0;

  let width = 0;
  let ansi = false;
  const len = text.length;
  for (let i = start; i < len; ++i) {
    const char = text[i];
    if (char === "\x1b") {
      ansi = true;
      i += 2; // "\x1b" "[" "X" "m" <-- shortest ansi sequence
    } else if (char === "m" && ansi) {
      ansi = false;
    } else if (!ansi) {
      width += characterWidth(char);
    }
  }

  return width;
}

function strip(string: string): string {
  let stripped = "";
  let ansi = false;
  const len = string.length;
  for (let i = 0; i < len; ++i) {
    const char = string[i];
    if (char === "\x1b") {
      ansi = true;
      i += 2; // "\x1b" "[" "X" m <-- shortest ansi sequence
    } else if (char === "m" && ansi) {
      ansi = false;
    } else if (!ansi) {
      stripped += char;
    }
  }
  return stripped;
}

/** Crops {text} to given {width} */
export function cropToWidth(text: string, width: number): string {
  const stripped = crayon.strip(text);
  const letter = stripped[width];

  if (textWidth(text) <= width) return text;

  text = text.slice(0, text.lastIndexOf(letter));
  if (textWidth(text) <= width) return text;

  const start = text.indexOf(letter);
  const knownPart = text.slice(0, start);
  const knownWidth = textWidth(knownPart);
  if (knownWidth === width) return knownPart;

  do {
    const index = text.lastIndexOf(letter);
    text = text.slice(0, index);
  } while ((knownWidth + textWidth(text, start)) > width);
  return text;
}

export function cropByWidth(text: string, width: number): string {
  const originWidth = textWidth(text);

  if (originWidth < width) {
    return text;
  }

  let widthDiff = 0;
  text = text.slice(width);
  widthDiff = originWidth - textWidth(text);

  if (widthDiff >= width) return text;

  do {
    const char = text[0];
    if (char === "\x1b") {
      const index = text.indexOf("m") + 1;
      text = text.slice(index);
    } else {
      text = text.slice(1);
      widthDiff += characterWidth(char!);
    }
  } while (widthDiff < width);
  return text;
}

/**
 * Return width of given character
 *
 * Originally created by sindresorhus: https://github.com/sindresorhus/is-fullwidth-code-point/blob/main/index.js
 */
export function characterWidth(character: string): number {
  const codePoint = character.charCodeAt(0);

  if (codePoint === 0xD83E || codePoint === 0x200B) {
    return 0;
  }

  if (
    codePoint >= 0x1100 &&
    (codePoint <= 0x115f ||
      codePoint === 0x2329 ||
      codePoint === 0x232a ||
      (0x2e80 <= codePoint && codePoint <= 0x3247 && codePoint !== 0x303f) ||
      (0x3250 <= codePoint && codePoint <= 0x4dbf) ||
      (0x4e00 <= codePoint && codePoint <= 0xa4c6) ||
      (0xa960 <= codePoint && codePoint <= 0xa97c) ||
      (0xac00 <= codePoint && codePoint <= 0xd7a3) ||
      (0xf900 <= codePoint && codePoint <= 0xfaff) ||
      (0xfe10 <= codePoint && codePoint <= 0xfe19) ||
      (0xfe30 <= codePoint && codePoint <= 0xfe6b) ||
      (0xff01 <= codePoint && codePoint <= 0xff60) ||
      (0xffe0 <= codePoint && codePoint <= 0xffe6) ||
      (0x1b000 <= codePoint && codePoint <= 0x1b001) ||
      (0x1f200 <= codePoint && codePoint <= 0x1f251) ||
      (0x20000 <= codePoint && codePoint <= 0x3fffd))
  ) {
    return 2;
  }

  return 1;
}
