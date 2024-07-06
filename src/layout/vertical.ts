import { Block } from "../block.ts";

export function vertical(horizontalPosition: number, ...blocks: Block[]): Block {
  let maxWidth = 0;
  let height = 0;
  for (const block of blocks) {
    const blockWidth = block.width;
    maxWidth = Math.max(maxWidth, blockWidth);

    block.top = height;
    height += block.height;
  }

  const output = Block.from({
    type: "Vertical",
    width: maxWidth,
    height,
  });

  for (const block of blocks) {
    block.anchor = output;

    const blockWidth = block.width;

    if (blockWidth === maxWidth) {
      output.lines.push(...block.lines);
      continue;
    }

    const diff = maxWidth - blockWidth;
    const lacksLeft = Math.round(diff * horizontalPosition);
    const lacksRight = diff - lacksLeft;

    block.left = lacksLeft;

    const leftPad = " ".repeat(lacksLeft);
    const rightPad = " ".repeat(lacksRight);

    for (const line of block.lines) {
      output.lines.push(leftPad + line + rightPad);
    }
  }

  return output;
}
