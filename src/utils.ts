// Copyright 2023 Im-Beast. All rights reserved. MIT license.

import { characterWidth, stripStyles, textWidth } from "./deps.ts";

export { characterWidth, stripStyles, textWidth };

/** Crops {text} to given {width} */
export function cropToWidth(text: string, width: number): string {
  const stripped = stripStyles(text);
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
