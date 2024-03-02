import { textWidth } from "@tui/strings/text_width";
import { insert } from "@tui/strings/insert";
import { cropStart } from "@tui/strings/crop_start";

import { normalizePosition } from "../utils/normalization.ts";

export function overlay(
  horizontalPosition: number,
  verticalPosition: number,
  fg: string[],
  bg: string[],
): string[] {
  let fgWidth = textWidth(fg[0]);
  const bgWidth = textWidth(bg[0]);
  if (fgWidth > bgWidth) {
    throw new Error("You can't overlay foreground that's wider than background");
  }

  const fgBlock = fg;
  const bgBlock = bg;

  const fgHeight = fgBlock.length;
  const bgHeight = bgBlock.length;
  if (fgHeight > bgHeight) {
    throw new Error("You can't overlay foreground that's higher than background");
  }

  if (horizontalPosition < 0) {
    fgWidth += horizontalPosition;
    horizontalPosition = 0;

    for (let i = 0; i < fg.length; ++i) {
      fg[i] = cropStart(fg[i], fgWidth);
    }
  }

  const offsetX = normalizePosition(horizontalPosition, bgWidth - fgWidth);
  const offsetY = normalizePosition(verticalPosition, bgHeight - fgHeight);

  const output = [];

  for (let i = 0; i < bgHeight; ++i) {
    const j = i - offsetY;
    const bgLine = bgBlock[i];

    if (j < 0 || j >= fgHeight) {
      output.push(bgLine);
      continue;
    }

    const fgLine = fgBlock[j];
    output.push(insert(bgLine, fgLine, offsetX, true));
  }

  return output;
}
