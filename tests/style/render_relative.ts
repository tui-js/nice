import crayon from "@crayon/crayon";
import { TestCase } from "../nice-test-runner.ts";
import { Nice } from "../../mod.ts";

const style = new Nice({
  border: {
    all: true,
    type: "rounded",
    style: crayon.white.bold,
  },
  padding: { x: 3, y: 1 },
  style: crayon.bgBlue,
});

function render() {
  console.log(Nice.render(style.draw("Hello there")));
  console.log(Nice.renderRelative(style.draw("Hello there")));
  console.log("\x1b[10C", Nice.renderRelative(style.draw("Hello there")));
  console.log("\x1b[10A\x1b[30C", Nice.renderRelative(style.draw("Hello there")), "\x1b[10B");
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
