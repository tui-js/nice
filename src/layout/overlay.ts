import { insert } from "@tui/strings/insert";
import { cropStart } from "@tui/strings/crop_start";

import { normalizePosition } from "../utils/normalization.ts";
import { Block } from "../block.ts";

export function overlay(
  horizontalPosition: number,
  verticalPosition: number,
  fg: Block,
  bg: Block,
): Block {
  // TODO: check actual boundaries, not just width and height
  let fgWidth = fg.width;
  const bgWidth = bg.width;
  if (fgWidth > bgWidth) {
    throw new Error("You can't overlay foreground that's wider than background");
  }

  const fgHeight = fg.height;
  const bgHeight = bg.height;
  if (fgHeight > bgHeight) {
    throw new Error("You can't overlay foreground that's higher than background");
  }

  const output = Block.from({
    type: "Overlay",
    width: bgWidth,
    height: bgHeight,
  });

  bg.anchor = output;
  fg.anchor = output;

  if (horizontalPosition < 0) {
    fgWidth += horizontalPosition;
    horizontalPosition = 0;

    for (let i = 0; i < fg.lines.length; ++i) {
      fg.lines[i] = cropStart(fg.lines[i], fgWidth);
    }
  }

  const offsetY = normalizePosition(verticalPosition, bgHeight - fgHeight);
  const offsetX = normalizePosition(horizontalPosition, bgWidth - fgWidth);

  fg.top = offsetY;
  fg.left = offsetX;

  for (let i = 0; i < bgHeight; ++i) {
    const j = i - offsetY;
    const bgLine = bg.lines[i];

    if (j < 0 || j >= fgHeight) {
      output.lines.push(bgLine);
      continue;
    }

    const fgLine = fg.lines[j];
    output.lines.push(insert(bgLine, fgLine, offsetX, true));
  }

  return output;
}
