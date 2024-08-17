import crayon from "@crayon/crayon";
import { TestCase } from "../nice-test-runner.ts";
import { Style } from "../../src/style_block.ts";

const style = new Style({
  string: crayon.bgBlue,
  border: {
    all: true,
    type: "rounded",
    style: crayon.white.bold,
  },
  padding: { x: 3, y: 1 },
});

function render() {
  console.log(style.create("Hello there").render());
  console.log("\x1b[3A\x1b[30C", style.create("Hello there").render(true));
  console.log(style.create("Hello there").render(true));
  console.log("\x1b[10C", style.create("Hello there").render(true));
  console.log(
    "\x1b[10A\x1b[30C",
    style.create("Hello there").render(true),
    "\x1b[10B",
  );
}

export const testCase = new TestCase(
  "Nice.renderRelative",
  crayon`\
{bold This test showcases rendering via Nice.renderRelative.}
Rendered blocks should not have any glitches.`,
  render,
);

if (import.meta.main) {
  testCase.run();
}
