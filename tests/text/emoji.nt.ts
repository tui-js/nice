import crayon from "@crayon/crayon";
import { TestCase } from "../nice-test-runner.ts";

import { horizontal, Style } from "../../mod.ts";

const style = new Style({
  style: crayon.bgBlue,

  width: 14,
  height: 19,

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

  const SCREEN_FG = Style.render(horizontal(0.5, style.create(EMOJIS.join(" "))));

  console.log(SCREEN_FG);
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
