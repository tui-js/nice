// Copyright 2023 Im-Beast. All rights reserved. MIT license.
import { cropEnd, type Dimensions, textWidth } from "@tui/strings";

export function fitIntoDimensions(text: string[], { columns, rows }: Dimensions): void {
  while (text.length > rows) {
    text.pop();
  }

  for (const i in text) {
    const line = text[i];
    if (textWidth(line) <= columns) continue;
    text[i] = cropEnd(line, columns);
  }
}
