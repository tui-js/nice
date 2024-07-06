import type { StringStyler } from "../types.ts";

export function applyStyle(lines: string[], style: StringStyler): void {
  for (let i = 0; i < lines.length; i++) {
    lines[i] = style(lines[i]);
  }
}
