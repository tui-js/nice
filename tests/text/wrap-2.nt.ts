import crayon from "@crayon/crayon";
import { TestCase } from "../nice-test-runner.ts";
import { Style } from "../../src/style_block.ts";
import { HorizontalBlock } from "../../src/layout/horizontal_block.ts";
import { VerticalBlock } from "../../src/layout/vertical_block.ts";

const TEXT = `one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen`;

const wrapLabel = crayon.bold.green("wrap");
const nowrapLabel = crayon.bold.magenta("nowrap");

const titleStyle = new Style({
  string: crayon.white,
  text: { horizontalAlign: "center" },
});

const wrapStyle = new Style({
  string: crayon.bgRed.bold.white,

  width: 21,
  height: 12,

  padding: { all: 1 },
  border: { type: "rounded", all: true, style: crayon.white },

  text: {
    wrap: "wrap",
    verticalAlign: "middle",
  },
});

const nowrapStyle = wrapStyle.derive({
  string: crayon.bgBlue.bold.white,
  text: { wrap: "nowrap" },
});

function render() {
  const SCREEN_FG = new HorizontalBlock(
    { y: "50%", gap: 1 },
    new VerticalBlock({ x: "50%" }, titleStyle.create(wrapLabel), wrapStyle.create(TEXT)),
    new VerticalBlock({ x: "50%" }, titleStyle.create(nowrapLabel), nowrapStyle.create(TEXT)),
  );

  console.log(SCREEN_FG.render());
}

export const testCase = new TestCase(
  "Text wrapping",
  crayon`\
{bold This test showcases the different text wrapping modes.}

${wrapLabel} should not cut any words out.

${nowrapLabel} should contain 4 whole words and 1 cut one.`,
  render,
);

if (import.meta.main) {
  testCase.run();
}
