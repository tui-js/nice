import { textWidth } from "@tui/strings";

export function horizontal(verticalPosition: number, ...blocks: string[][]): string[] {
  const widths = blocks.map((x) => textWidth(x[0]));

  const maxHeight = blocks.reduce(
    (maxHeight, block) => Math.max(maxHeight, block.length),
    0,
  );

  const output = [];

  for (let y = 0; y < maxHeight; ++y) {
    let row = "";

    for (const i in blocks) {
      const block = blocks[i];
      const maxWidth = widths[i];

      const yOffset = Math.round((maxHeight - block.length) * verticalPosition);
      let line = block[y - yOffset] ?? "";

      const lineWidth = line ? textWidth(line) : 0;
      if (lineWidth < maxWidth) {
        line += " ".repeat(maxWidth - lineWidth);
      }

      row += line;
    }

    output.push(row);
  }

  return output;
}
