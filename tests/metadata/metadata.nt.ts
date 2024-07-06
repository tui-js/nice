import crayon from "@crayon/crayon";
import { TestCase } from "../nice-test-runner.ts";

import { BorderCharsets, horizontal, overlay, Style, vertical } from "../../mod.ts";
import { getBoundingRect, type NiceBlock } from "../../src/metadata.ts";

const noCornerCharset = BorderCharsets.rounded;
noCornerCharset.topLeft = " ";
noCornerCharset.topRight = " ";
noCornerCharset.bottomLeft = " ";
noCornerCharset.bottomRight = " ";

const style = new Style({
  border: {
    all: true,
    type: "custom",
    charset: noCornerCharset,
  },
});

const HUE_STEP = 20;
let i = 0;
const blocks: NiceBlock[] = [];
function block(padded = false) {
  const block = style.derive({
    padding: padded ? { all: 1 } : undefined,
    border: { style: crayon.hsl(i++ * HUE_STEP, 50, 50) },
  }).create(`Item ${i}`);
  blocks.push(block);
  return block;
}

function render() {
  const SCREEN_FG = vertical(
    0.7,
    vertical(
      0.5,
      block(),
      horizontal(
        0.5,
        block(),
        block(),
      ),
    ),
    horizontal(
      0,
      block(),
      block(),
      block(),
      block(),
      block(),
      block(),
    ),
    overlay(
      0.5,
      0.4,
      block(),
      horizontal(
        0,
        block(),
        block(),
        vertical(
          0.5,
          block(),
          block(),
          overlay(
            0.5,
            0.5,
            block(),
            horizontal(
              0,
              block(true),
              block(true),
            ),
          ),
        ),
      ),
    ),
  );

  console.log(Style.render(SCREEN_FG));

  const textEncoder = new TextEncoder();
  // We have to draw corners below the test introduction
  const OFFSET_Y = testCase.block().length;
  function draw(y: number, x: number, s: string): void {
    Deno.stdout.writeSync(textEncoder.encode(
      `\x1b[${y + OFFSET_Y + 1};${x + 1}H${s}`,
    ));
  }

  let maxRow = 0;
  for (const [i, block] of blocks.entries()) {
    const style = crayon.hsl(i * HUE_STEP, 50, 50);

    const { top, left, width, height } = getBoundingRect(block);

    draw(top, left, style("╭"));
    draw(top, left + width - 1, style("╮"));
    draw(top + height - 1, left + width - 1, style("╯"));
    draw(top + height - 1, left, style("╰"));

    maxRow = Math.max(maxRow, top + height - 1);
  }

  // move cursor so it doesn't interfere with just drawn things
  draw(SCREEN_FG.length, 0, "");
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
