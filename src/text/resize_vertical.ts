import { cropEnd, textWidth } from "../utils/strings.ts";
import type { NormalizedTextDefinition } from "./normalization	.ts";

export function resizeVertically(
  lines: string[],
  desiredHeight: number,
  { ellipsisString, overflow }: NormalizedTextDefinition,
): void {
  const textHeight = lines.length;
  if (textHeight > desiredHeight) {
    while (lines.length > desiredHeight) {
      lines.pop();
    }

    if (overflow === "ellipsis") {
      lines[lines.length - 1] = cropEnd(lines[lines.length - 1], textWidth(ellipsisString)) +
        ellipsisString;
    }
  }
}
