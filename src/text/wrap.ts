import { textWidth } from "@tui/strings/text_width";

// TODO: Prettier text wrap based on Knuth–Plass algorithm
export type TextWrapType = "wrap" | "nowrap";

// Lets say it should wrap here (desiredWidth: 12)
//            |
//            v
// Slippity sip suspiciously snip sacrificingly
//
// Expected output:
//
// Slippity sip
// suspiciously
// snip
// sacrificingly  <----------------------------------------\ Sacrifingly is 13 units wide
//                                                         | Where our desiredWidth is 12!
// Keep in mind that words longer than desiredWidth        |
// will not be modified, and instead kept in their own line.
export function wrapLinesNormal(lines: string[], desiredWidth: number): void {
  let spaceLeft = desiredWidth;

  let j = 0;
  for (const line of lines.splice(0)) {
    const words = line.split(" ");

    if (words[0] === "") {
      lines[++j] = "";
      lines[++j] = "";
      spaceLeft = desiredWidth;
      continue;
    }

    for (const word of words) {
      const wordWidth = textWidth(word);
      const currentLine = lines[j];

      if (wordWidth + (currentLine ? 1 : 0) > spaceLeft) {
        lines[++j] = word;
        spaceLeft = desiredWidth - wordWidth;
      } else {
        if (currentLine) {
          lines[j] += " " + word;
          spaceLeft -= wordWidth + 1;
        } else {
          lines[j] = word;
          spaceLeft -= wordWidth;
        }
      }
    }
  }
}

export function wrapLines(lines: string[], desiredWidth: number, type: TextWrapType): void {
  switch (type) {
    case "wrap":
      wrapLinesNormal(lines, desiredWidth);
      break;
    case "nowrap":
      break;
  }
}
