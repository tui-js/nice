import { insert } from "@tui/strings/insert";
import { cropStart } from "@tui/strings/crop_start";

import { normalizePosition } from "../utils/normalization.ts";
import {
  applyMetadata,
  NICE_ANCHOR,
  NICE_HEIGHT,
  NICE_LEFT,
  NICE_TOP,
  NICE_WIDTH,
  type NiceBlock,
} from "../metadata.ts";

export function overlay(
  horizontalPosition: number,
  verticalPosition: number,
  fg: NiceBlock,
  bg: NiceBlock,
): NiceBlock {
  let fgWidth = fg[NICE_WIDTH];
  const bgWidth = bg[NICE_WIDTH];
  if (fgWidth > bgWidth) {
    throw new Error("You can't overlay foreground that's wider than background");
  }

  const fgHeight = fg[NICE_HEIGHT];
  const bgHeight = bg[NICE_HEIGHT];
  if (fgHeight > bgHeight) {
    throw new Error("You can't overlay foreground that's higher than background");
  }

  const output: string[] = [];
  bg[NICE_ANCHOR] = output as NiceBlock;
  fg[NICE_ANCHOR] = output as NiceBlock;

  if (horizontalPosition < 0) {
    fgWidth += horizontalPosition;
    horizontalPosition = 0;

    for (let i = 0; i < fg.length; ++i) {
      fg[i] = cropStart(fg[i], fgWidth);
    }
  }

  const offsetY = normalizePosition(verticalPosition, bgHeight - fgHeight);
  const offsetX = normalizePosition(horizontalPosition, bgWidth - fgWidth);

  fg[NICE_TOP] = offsetY;
  fg[NICE_LEFT] = offsetX;

  for (let i = 0; i < bgHeight; ++i) {
    const j = i - offsetY;
    const bgLine = bg[i];

    if (j < 0 || j >= fgHeight) {
      output.push(bgLine);
      continue;
    }

    const fgLine = fg[j];
    output.push(insert(bgLine, fgLine, offsetX, true));
  }

  return applyMetadata(output, {
    type: "Overlay",
    top: 0,
    left: 0,
    width: bgWidth,
    height: bgHeight,
  });
}
