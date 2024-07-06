import { Block } from "../block.ts";

export function horizontal(verticalPosition: number, ...blocks: Block[]): Block {
  const widths: number[] = [];
  let maxHeight = 0;
  let width = 0;

  for (const block of blocks) {
    const blockWidth = block.width;
    width += blockWidth;
    widths.push(blockWidth);
    maxHeight = Math.max(maxHeight, block.height);
  }

  const output = Block.from({
    type: "Horizontal",
    height: maxHeight,
    width,
  }, true);

  let left = 0;
  for (const block of blocks) {
    const yOffset = Math.round((maxHeight - block.height) * verticalPosition);
    const blockWidth = block.width;

    block.anchor = output;
    block.left = left;
    block.top = yOffset;

    for (let y = 0; y < maxHeight; ++y) {
      output.lines[y] += block.lines[y - yOffset] ?? " ".repeat(blockWidth);
    }

    left += blockWidth;
  }

  return output;
}
