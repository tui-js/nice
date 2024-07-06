import crayon from "@crayon/crayon";
import { TestCase } from "../nice-test-runner.ts";

import { Style } from "../../mod.ts";
import { horizontal, vertical } from "../../src/layout/mod.ts";

const TEXT = `\
Sneaky

Tippity tick tapity typing test theoritically taking time to test the tight text

snack
smack`;

const wrapLabel = crayon.bold.green("wrap");
const nowrapLabel = crayon.bold.magenta("nowrap");

const titleStyle = new Style({
  text: { horizontalAlign: "center" },
});

const wrapStyle = new Style({
  style: crayon.bgRed.bold.white,

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

const nowrapStyle = wrapStyle.derive({
  style: crayon.bgBlue.bold.white,
  text: { wrap: "nowrap" },
});

function render() {
  const SCREEN_FG = Style.render(
    horizontal(
      0.5,
      vertical(0.5, titleStyle.create(wrapLabel), wrapStyle.create(TEXT)),
      vertical(0.5, titleStyle.create(nowrapLabel), nowrapStyle.create(TEXT)),
    ),
  );

  console.log(SCREEN_FG);
}

export const testCase = new TestCase(
  "Text wrapping",
  crayon`\
{bold This test showcases the different text wrapping modes.}
Words starting with an "S" should be alone on their line.
There should be 1 line of space between words starting with an "S" and words starting with "T".

${wrapLabel} should contain 3 words starting with an "S" and 13 words starting with "T".

${nowrapLabel} should contain 3 words starting with an "S" and 2 words starting with "T".`,
  render,
);

if (import.meta.main) {
  testCase.run();
}
