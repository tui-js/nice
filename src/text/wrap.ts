import { textWidth } from "@tui/strings/text_width";

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
  for (let i = 0; i < lines.length; i++) {
    let offset = 0;
    let currentWidth = 0;

    const words = lines[i].split(" ");
    const currentSplit: string[] = [];

    for (const word of words) {
      let wordWidth = textWidth(word);
      currentWidth += wordWidth;

      if (offset > 0 && currentSplit[offset]) {
        wordWidth += 1;
        currentWidth += 1;
      }

      if (wordWidth >= desiredWidth || currentWidth >= desiredWidth) {
        currentSplit.push(word);
        offset += 1;
        currentWidth = 0;
        continue;
      }

      if (currentSplit[offset]) {
        currentSplit[offset] += " " + word;
      } else {
        currentSplit[offset] = word;
      }
    }

    lines.splice(i, 1, ...currentSplit);
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
