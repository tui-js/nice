import { textWidth } from "../utils/strings.ts";

export type TextHorizontalAlign = "left" | "center" | "right" | "justify";

export function alignHorizontally(
  lines: string[],
  desiredWidth: number,
  horizontalAlign: TextHorizontalAlign,
): void {
  for (let i = 0; i < lines.length; i++) {
    lines[i] = alignLineHorizontally(lines[i], desiredWidth, horizontalAlign);
  }
}

export function alignLineHorizontally(
  line: string,
  desiredWidth: number,
  horizontalAlign: TextHorizontalAlign,
): string {
  const lineWidth = textWidth(line);
  switch (horizontalAlign) {
    case "left":
      return line + " ".repeat(desiredWidth - lineWidth);
    case "right":
      return " ".repeat(desiredWidth - lineWidth) + line;
    case "center": {
      const left = Math.round((desiredWidth - lineWidth) / 2);
      const right = desiredWidth - lineWidth - left;
      return " ".repeat(left) + line + " ".repeat(right);
    }
    case "justify": {
      let result = line.trim();

      if (result.indexOf(" ") === -1) {
        result += " ".repeat(desiredWidth - lineWidth);
      } else {
        let i = result.indexOf(" ");
        while (textWidth(result) < desiredWidth) {
          result = result.slice(0, i) + " " + result.slice(i);
          i = result.indexOf(" ", i + 2);
          if (i === -1) i = result.indexOf(" ");
        }
      }

      return result;
    }
  }
}
