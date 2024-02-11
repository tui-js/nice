import { crayon } from "../deps.ts";
import { TestCase } from "../nice-test-runner.ts";

import { Nice } from "../../mod.ts";

const style = new Nice({
  style: crayon.bgBlue,

  width: 13,
  height: 12,

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
    "🍒", "🍓", "🥝", "🍅", "🥥", "🥑", "🍆", "🥔", "🥕", "🌽", "🌶", "🥒",,
    "🥬", "🥦", "🧄", "🧅", "🍄", "🥜", "🌰", "🍞", "🥐", "🥖", "🫓", "🥨",,
    "🥯", "🥞", "🧇", "🧀", "🍖", "🍗", "🥩", "🥓", "🍔", "🍟", "🍕", "🌭",,
    "🥪", "🌮", "🌯", "🥙", "🧆", "🥚", "🍳", "🥘", "🍲", "🥣", "🥗", "🍿",,
    "🧈", "🧂", "🥫", "🍱", "🍘", "🍙", "🍚", "🍛", "🍜", "🍝", "🍠", "🍢",,
    "🍣", "🍤", "🍥", "🥮", "🍡", "🥟", "🥠", "🥡", "🦀", "🦞", "🦐", "🦑",,
    "🦪", "🍦", "🍧", "🍨", "🍩", "🍪", "🎂", "🍰", "🧁", "🥧", "🍫", "🍬",,
    "🍭", "🍮",
  ];

  const SCREEN_FG = Nice.render(Nice.horizontal(0.5, style.draw(EMOJIS.join(" "))));

  console.log(SCREEN_FG);
}

export const testCase = new TestCase(
  "Emoji support",
  crayon`\
{bold This test showcases emoji support.}
This test should only show emojis.
If anything is off – width/question marks instead of emoji appearing – the test fails.`,
  render,
);

if (import.meta.main) {
  testCase.run();
}
