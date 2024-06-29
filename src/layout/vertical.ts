import {
  applyMetadata,
  NICE_ANCHOR,
  NICE_HEIGHT,
  NICE_LEFT,
  NICE_TOP,
  NICE_WIDTH,
  type NiceBlock,
} from "../metadata.ts";

export function vertical(horizontalPosition: number, ...blocks: NiceBlock[]): NiceBlock {
  const output: string[] = [];

  let maxWidth = 0;
  let height = 0;
  for (const block of blocks) {
    block[NICE_ANCHOR] = output as NiceBlock;

    const blockWidth = block[NICE_WIDTH];
    maxWidth = Math.max(maxWidth, blockWidth);

    block[NICE_TOP] = height;
    height += block[NICE_HEIGHT];
  }

  for (const block of blocks) {
    const blockWidth = block[NICE_WIDTH];

    if (blockWidth === maxWidth) {
      output.push(...block);
      continue;
    }

    const diff = maxWidth - blockWidth;
    const lacksLeft = Math.round(diff * horizontalPosition);
    const lacksRight = diff - lacksLeft;

    block[NICE_LEFT] = lacksLeft;

    const leftPad = " ".repeat(lacksLeft);
    const rightPad = " ".repeat(lacksRight);

    for (const line of block) {
      output.push(leftPad + line + rightPad);
    }
  }

  return applyMetadata(output, {
    type: "Vertical",
    top: 0,
    left: 0,
    width: maxWidth,
    height,
  });
}
