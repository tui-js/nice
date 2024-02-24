import { cropEnd, textWidth } from "@tui/strings";
import type { NormalizedTextDefinition } from "./normalization.ts";

export function resizeHorizontally(
  lines: string[],
  desiredWidth: number,
  textDefinition: NormalizedTextDefinition,
): void {
  for (let i = 0; i < lines.length; i++) {
    lines[i] = resizeLineHorizontally(lines[i], desiredWidth, textDefinition);
  }
}

export function resizeLineHorizontally(
  line: string,
  desiredWidth: number,
  { ellipsisString, overflow }: NormalizedTextDefinition,
): string {
  const lineWidth = textWidth(line);
  if (lineWidth < desiredWidth) {
    return line;
  }

  switch (overflow) {
    case "clip":
      return cropEnd(line, desiredWidth, "");
    case "ellipsis":
      return cropEnd(line, desiredWidth, ellipsisString);
  }
}
