import { normalizePosition } from "../utils/normalization.ts";
import { insert, textWidth } from "../utils/strings.ts";

export function overlay(
  horizontalPosition: number,
  verticalPosition: number,
  fg: string[],
  bg: string[],
): string[] {
  const fgWidth = textWidth(fg[0]);
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
    output.push(insert(bgLine, fgLine, offsetX));
  }

  return output;
}
