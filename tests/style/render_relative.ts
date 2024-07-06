import crayon from "@crayon/crayon";
import { TestCase } from "../nice-test-runner.ts";
import { Style } from "../../mod.ts";

const style = new Style({
  border: {
    all: true,
    type: "rounded",
    style: crayon.white.bold,
  },
  padding: { x: 3, y: 1 },
  style: crayon.bgBlue,
});

function render() {
  console.log(Style.render(style.create("Hello there")));
  console.log(Style.renderRelative(style.create("Hello there")));
  console.log("\x1b[10C", Style.renderRelative(style.create("Hello there")));
  console.log("\x1b[10A\x1b[30C", Style.renderRelative(style.create("Hello there")), "\x1b[10B");
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
