import { textWidth } from "@tui/strings";

export type TextVerticalAlign = "top" | "middle" | "bottom";

export function alignVertically(
  lines: string[],
  desiredHeight: number,
  verticalAlign: TextVerticalAlign,
): void {
  if (lines.length === desiredHeight) return;

  const verticalLine = " ".repeat(textWidth(lines[0]));

  while (lines.length < desiredHeight) {
    switch (verticalAlign) {
      case "top":
        lines.push(verticalLine);
        break;
      case "middle":
        if (lines.unshift(verticalLine) < desiredHeight) {
          lines.push(verticalLine);
        }
        break;
      case "bottom":
        lines.unshift(verticalLine);
        break;
    }
  }
}
