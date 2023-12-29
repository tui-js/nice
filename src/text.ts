import { cropEnd } from "./utils/strings.ts";
import { textWidth } from "./deps.ts";

import type { Style } from "./types.ts";

export type TextWrapType = "wrap" | "nowrap" | "balance";
export type TextOverflowType = "clip" | "ellipsis";
export type TextHorizontalAlign = "left" | "center" | "right" | "justify";
export type TextVerticalAlign = "top" | "middle" | "bottom";

export interface TextDefinition {
  wrap: TextWrapType;
  overflow: TextOverflowType;
  ellipsisString?: string;

  horizontalAlign: TextHorizontalAlign;
  verticalAlign: TextVerticalAlign;
}

export function applyStyle(lines: string[], style: Style): void {
  for (let i = 0; i < lines.length; i++) {
    lines[i] = style(lines[i]);
  }
}

export function wrapLinesNormal(lines: string[], desiredWidth: number): void {
  for (let i = 0; i < lines.length; i++) {
    // Lets say it should wrap here (desiredWidth: 12)
    //            |
    //            v
    // Slippity sip suspiciously snip sacrificingly
    //
    // Expected output:
    //
    // Slippity sip
    // suspiciously
    // snip
    // sacrificingly  <----------------------------------------\ Sacrifingly is 13 units wide
    //                                                         | Where our desiredWidth is 12!
    // Keep in mind that words longer than desiredWidth        |
    // will not be modified, and instead kept in their own line.

    let offset = 0;
    let currentWidth = 0;

    const words = lines[i].split(" ");
    const currentSplit: string[] = [];

    for (const word of words) {
      const wordWidth = textWidth(word);
      currentWidth += wordWidth;

      if (wordWidth >= desiredWidth || currentWidth >= desiredWidth) {
        currentSplit.push(word);
        offset += 1;
        currentWidth = 0;
        continue;
      }

      if (currentSplit[offset]) {
        currentSplit[offset] += " " + word;
      } else {
        currentSplit[offset] = word;
      }
    }

    lines.splice(i, 1, ...currentSplit);
  }
}

export function wrapLines(lines: string[], desiredWidth: number, type: TextWrapType): void {
  switch (type) {
    case "wrap":
      wrapLinesNormal(lines, desiredWidth);
      break;
    case "balance":
      throw new Error("Not implemented yet");
  }
}

export function resizeAndAlignHorizontally(lines: string[], desiredWidth: number, options: TextDefinition): void {
  for (let i = 0; i < lines.length; i++) {
    lines[i] = resizeAndAlignHorizontallyLine(lines[i], desiredWidth, options);
  }
}

export function resizeAndAlignHorizontallyLine(line: string, desiredWidth: number, {
  overflow,
  horizontalAlign,
  ellipsisString = "…",
}: TextDefinition): string {
  let lineWidth = textWidth(line);
  if (lineWidth === desiredWidth) return line;

  if (overflow === "clip") ellipsisString = "";
  const ellipsisWidth = textWidth(ellipsisString);

  if (lineWidth > desiredWidth) {
    return cropEnd(line, lineWidth - desiredWidth + ellipsisWidth) + ellipsisString;
  }

  let result = alignLineHorizontally(line, desiredWidth, horizontalAlign);
  lineWidth = textWidth(result);

  if (lineWidth < desiredWidth) {
    result += " ".repeat(desiredWidth - lineWidth);
  }

  return result;
}

export function alignLineHorizontally(
  line: string,
  desiredWidth: number,
  horizontalAlign: TextHorizontalAlign,
): string {
  const lineWidth = textWidth(line);
  switch (horizontalAlign) {
    case "left":
      return line;
    case "right":
      return " ".repeat(desiredWidth - lineWidth) + line;
    case "center": {
      const left = Math.round((desiredWidth - lineWidth) / 2);
      const right = desiredWidth - lineWidth - left;
      return " ".repeat(left) + line + " ".repeat(right);
    }
    case "justify": {
      let result = line.trim();

      if (result.indexOf(" ") === -1) {
        result += " ".repeat(desiredWidth - lineWidth);
      } else {
        let i = result.indexOf(" ");
        while (textWidth(result) < desiredWidth) {
          result = result.slice(0, i) + " " + result.slice(i);
          i = result.indexOf(" ", i + 2);
          if (i === -1) i = result.indexOf(" ");
        }
      }

      return result;
    }
  }
}

export function resizeAndAlignVertically(
  lines: string[],
  desiredHeight: number,
  { verticalAlign, overflow, ellipsisString = "…" }: TextDefinition,
): void {
  const textHeight = lines.length;
  if (textHeight === desiredHeight) {
    return;
  } else if (textHeight > desiredHeight) {
    while (lines.length > desiredHeight) {
      lines.pop();
    }

    if (overflow === "ellipsis") {
      lines[lines.length - 1] = cropEnd(lines[lines.length - 1], textWidth(ellipsisString)) + ellipsisString;
    }
    return;
  }

  const verticalLine = " ".repeat(textWidth(lines[0]));

  while (lines.length < desiredHeight) {
    switch (verticalAlign) {
      case "top":
        lines.unshift(verticalLine);
        break;
      case "middle":
        if (lines.unshift(verticalLine) < desiredHeight) {
          lines.push(verticalLine);
        }
        break;
      case "bottom":
        lines.push(verticalLine);
        break;
    }
  }
}
