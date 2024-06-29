import {
  applyMetadata,
  NICE_ANCHOR,
  NICE_HEIGHT,
  NICE_LEFT,
  NICE_TOP,
  NICE_WIDTH,
  type NiceBlock,
} from "../metadata.ts";

export function horizontal(verticalPosition: number, ...blocks: NiceBlock[]): NiceBlock {
  const widths: number[] = [];
  let maxHeight = 0;
  let width = 0;

  for (const block of blocks) {
    const blockWidth = block[NICE_WIDTH];
    width += blockWidth;
    widths.push(blockWidth);
    maxHeight = Math.max(maxHeight, block[NICE_HEIGHT]);
  }

  const output = Array<string>(maxHeight).fill("");

  let left = 0;
  for (const block of blocks) {
    const yOffset = Math.round((maxHeight - block[NICE_HEIGHT]) * verticalPosition);
    const blockWidth = block[NICE_WIDTH];

    block[NICE_ANCHOR] = output as NiceBlock;
    block[NICE_LEFT] = left;
    block[NICE_TOP] = yOffset;

    for (let y = 0; y < maxHeight; ++y) {
      output[y] += block[y - yOffset] ?? " ".repeat(blockWidth);
    }

    left += blockWidth;
  }

  return applyMetadata(output, {
    type: "Horizontal",
    top: 0,
    left: 0,
    width,
    height: maxHeight,
  });
}
