import crayon from "@crayon/crayon";

import { TestCase } from "../nice-test-runner.ts";
import { Style } from "#src/style_block.ts";
import { HorizontalBlock } from "#src/layout/horizontal_block.ts";

const style = new Style({
  string: crayon.bgBlue,

  width: "100%",
  height: "100%",

  padding: { all: 1 },
  margin: { right: 1 },
  border: { type: "rounded", all: true, style: crayon.white },

  text: {
    wrap: "wrap",
    verticalAlign: "middle",
  },
});

function render() {
  // deno-fmt-ignore
  const EMOJIS = [
    "🍇", "🍈", "🍉", "🍊", "🍋", "🍌", "🍍", "🥭", "🍎", "🍏", "🍐", "🍑",
    "🍒", "🍓", "🥝", "🍅", "🥥", "🥑", "🍆", "🥔", "🥕", "🌽", "🌶", "🥒",
    "🥬", "🥦", "🧄", "🧅", "🍄", "🥜", "🌰", "🍞", "🥐", "🥖", "🫓", "🥨",
    "🥯", "🥞", "🧇", "🧀", "🍖", "🍗", "🥩", "🥓", "🍔", "🍟", "🍕", "🌭",
    "🥪", "🌮", "🌯", "🥙", "🧆", "🥚", "🍳", "🥘", "🍲", "🥣", "🥗", "🍿",
    "🧈", "🧂", "🥫", "🍱", "🍘", "🍙", "🍚", "🍛", "🍜", "🍝", "🍠", "🍢",
    "🍣", "🍤", "🍥", "🥮", "🍡", "🥟", "🥠", "🥡", "🦀", "🦞", "🦐", "🦑",
    "🦪", "🍦", "🍧", "🍨", "🍩", "🍪", "🎂", "🍰", "🧁", "🥧", "🍫", "🍬",
  ];

  const SCREEN_FG = new HorizontalBlock(
    { verticalAlign: 0, width: 22, height: 20 },
    style.create(EMOJIS.join(" ")),
  );

  console.log(SCREEN_FG.render());
}

export const testCase = new TestCase(
  "Emoji support",
  crayon`\
{bold This test showcases emoji support.}
This test should only show emojis.
If anything is off – width/question marks instead of emoji appearing – the test fails.

If emoji seems to be misplaced but background aligns nicely – ignore it, test passes.
Some terminals still struggle with some emojis.`,
  render,
);

if (import.meta.main) {
  testCase.run();
}
