import { Nice, unit } from "../../mod.ts";
import { crayon } from "https://deno.land/x/crayon@3.3.3/mod.ts";

const TEST_INFO = new Nice({
  style: crayon.bgGreen.bold.yellow,
  border: { type: "double", style: crayon.yellow },
  padding: { bottom: 1, top: 1, left: 1, right: 1 },
});

const testFail = crayon.bgRed("This should not be visible");
const testMaybePasses = crayon("This should ellipse");

const ELLIPSIS_NEWLINE_TEXT = `${testMaybePasses}\n\n${testFail}`;
const ELLIPSIS_INLINE_WRAPPING_TEXT = `${testMaybePasses} ${testFail}`;

type OverflowType = Nice["text"]["overflow"];
const possibleOverflows: (OverflowType | "ellipsis-custom")[] = ["clip", "ellipsis", "ellipsis-custom"];

type WrapType = Nice["text"]["wrap"];
const possibleWraps: WrapType[] = ["wrap", "nowrap", "balance"];

let hue = 0;
const creators: ((overflow: OverflowType, wrap: WrapType, ellipsisString?: string) => string)[] = [
  (overflow, wrap, ellipsisString) => {
    const style = crayon.bgHsl((hue += 30) % 360, 50, 50).bold;
    const borderStyle = crayon.hsl(((hue % 360) + 270) % 360, 100, 30);

    return Nice.overlay(
      0.1,
      0,
      borderStyle.bold(`${overflow} + ${wrap}`),
      new Nice({
        style,
        border: { type: "rounded", style: borderStyle },
        padding: { bottom: 1, top: 1, left: 1, right: 1 },
        margin: { bottom: 0, top: 0, right: 1 },
        width: 25,
        height: 2,
        text: { overflow, wrap, ellipsisString },
      }).render(ELLIPSIS_NEWLINE_TEXT),
    );
  },
  (overflow, wrap, ellipsisString) => {
    const style = crayon.bgHsl((hue += 30) % 360, 50, 50).bold;
    const borderStyle = crayon.hsl(((hue % 360) + 270) % 360, 100, 30);

    return Nice.overlay(
      0.1,
      0,
      borderStyle.bold(`${overflow} + ${wrap}`),
      new Nice({
        style,
        border: { type: "rounded", style: borderStyle },
        padding: { bottom: 1, top: 1, left: 1, right: 1 },
        margin: { bottom: 0, top: 0, right: 1 },
        width: 20,
        height: 1,
        text: { overflow, wrap, ellipsisString },
      }).render(ELLIPSIS_INLINE_WRAPPING_TEXT),
    );
  },
];

const verticals: string[] = [];

for (let overflow of possibleOverflows) {
  let ellipsisString: string | undefined;
  if (overflow === "ellipsis-custom") {
    overflow = "ellipsis";
    ellipsisString = "...";
  }

  const objects: string[] = [];

  for (const wrap of possibleWraps) {
    for (const creator of creators) {
      objects.push(creator(overflow, wrap, ellipsisString));
    }
  }

  verticals.push(Nice.layoutVertically(unit("center"), ...objects));
}

const frame = Nice.layoutHorizontally(unit("middle"), ...verticals);

export function render() {
  console.log(
    Nice.layoutVertically(
      unit("center"),
      TEST_INFO.render(
        `All of these boxes should contain text "${testMaybePasses}".\nIf some of the text is missing or even a part of "${testFail}" is visible test fails.`,
      ),
      frame,
    ),
  );
}

if (import.meta.main) {
  render();
}
