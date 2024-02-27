import { textWidth } from "@tui/strings/text_width";

export function vertical(horizontalPosition: number, ...blocks: string[][]): string[] {
  const output = [];

  const widths = blocks.map((x) => textWidth(x[0]));
  const maxWidth = widths.reduce((maxWidth, x) => {
    return Math.max(maxWidth, x);
  }, 0);

  for (let i = 0; i < blocks.length; ++i) {
    const string = blocks[i];
    const width = widths[i];

    if (width === maxWidth) {
      output.push(...string);
      continue;
    }

    for (let line of string) {
      const lineWidth = textWidth(line);

      if (lineWidth < maxWidth) {
        const lacksLeft = Math.round((maxWidth - lineWidth) * horizontalPosition);
        const lacksRight = maxWidth - lineWidth - lacksLeft;
        line = " ".repeat(lacksLeft) + line + " ".repeat(lacksRight);
      }

      output.push(line);
    }
  }

  return output;
}
