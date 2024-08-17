import crayon from "@crayon/crayon";
import { TestCase } from "../nice-test-runner.ts";

import { VerticalBlock } from "../../src/layout/vertical_block.ts";
import { HorizontalBlock } from "../../src/layout/horizontal_block.ts";
import type { Block } from "../../src/block.ts";
import { Style } from "../../src/style_block.ts";
import { BorderCharsets } from "../../src/border/charsets.ts";
import { OverlayBlock } from "../../src/layout/overlay_block.ts";

const noCornerCharset = BorderCharsets.rounded;
noCornerCharset.topLeft = " ";
noCornerCharset.topRight = " ";
noCornerCharset.bottomLeft = " ";
noCornerCharset.bottomRight = " ";

const style = new Style({
  string: crayon.white,
  border: {
    all: true,
    type: "custom",
    charset: noCornerCharset,
  },
});

const HUE_STEP = 20;
let i = 0;
const blocks: Block[] = [];
function block(padded = false) {
  const block = style.derive({
    padding: padded ? { all: 1 } : undefined,
    border: { style: crayon.hsl(i++ * HUE_STEP, 50, 50) },
  }).create(`Item ${i}`);
  blocks.push(block);
  return block;
}

function render() {
  const SCREEN_FG = new VerticalBlock(
    { x: "70%" },
    new VerticalBlock(
      { x: "50%" },
      block(),
      new HorizontalBlock(
        { y: "50%" },
        block(),
        block(),
      ),
    ),
    new HorizontalBlock(
      { y: "50%" },
      block(),
      block(),
      block(),
      block(true),
      block(),
      block(),
    ),
    new VerticalBlock(
      { y: "50%", x: "50%" },
      block(),
      new HorizontalBlock(
        { y: "20%" },
        block(),
        block(),
        new VerticalBlock(
          { x: "80%" },
          block(),
          block(),
          new OverlayBlock(
            {
              x: "50%",
              y: "50%",
              fg: block(),
              bg: new HorizontalBlock(
                { width: 30, x: 2 },
                block(true),
                block(true),
              ),
            },
          ),
        ),
      ),
    ),
  );

  console.log(SCREEN_FG.render());

  const textEncoder = new TextEncoder();
  // We have to draw corners below the test introduction
  const tcblock = testCase.block();
  tcblock.draw();
  const OFFSET_Y = tcblock.computedHeight;
  function draw(y: number, x: number, s: string): void {
    Deno.stdout.writeSync(textEncoder.encode(
      `\x1b[${y + OFFSET_Y + 1};${x + 1}H${s}`,
    ));
  }

  let maxRow = 0;
  for (const [i, block] of blocks.entries()) {
    const style = crayon.hsl(i * HUE_STEP, 50, 50);

    const { top, left, width, height } = block.boundingRectangle();

    draw(top, left, style("╭"));
    draw(top, left + width - 1, style("╮"));
    draw(top + height - 1, left + width - 1, style("╯"));
    draw(top + height - 1, left, style("╰"));

    maxRow = Math.max(maxRow, top + height - 1);
  }

  // move cursor so it doesn't interfere with just drawn things
  draw(SCREEN_FG.computedHeight, 0, "");
}

export const testCase = new TestCase(
  "Metadata",
  crayon`\
{bold This test showcases metadata stored by blocks.}
Every rectangle drawn on the screen should have rounded corners.
If corners are either wrong color, do not align or don't render – the test fails.`,
  render,
);

if (import.meta.main) {
  testCase.run();
}
