import crayon from "@crayon/crayon";
import { horizontal, Nice, overlay, vertical } from "../../mod.ts";
import { getBoundingRect, NICE_ANCHOR } from "../../src/metadata.ts";
import { BorderCharsets } from "../../src/border/charsets.ts";

console.clear();

const noCornerCharset = BorderCharsets.rounded;
noCornerCharset.topLeft = " ";
noCornerCharset.topRight = " ";
noCornerCharset.bottomLeft = " ";
noCornerCharset.bottomRight = " ";

const style = new Nice({
  border: {
    all: true,
    type: "custom",
    charset: noCornerCharset,
  },
});

const ITEMS_AMOUNT = 20;
const elements = Array.from({ length: ITEMS_AMOUNT }, (_, i) => {
  return style.derive({
    border: { style: crayon.hsl((360 / ITEMS_AMOUNT) * i, 50, 50) },
  }).draw(`Item ${i}`);
});

const render = vertical(
  0.5,
  vertical(
    0.5,
    elements[0],
    horizontal(
      0.5,
      elements[1],
      elements[2],
    ),
  ),
  horizontal(
    0,
    elements[3],
    elements[4],
    elements[5],
    elements[6],
    elements[7],
    elements[8],
  ),
  overlay(
    0.5,
    0.5,
    elements[11], // overlay element 1
    horizontal(
      0.5,
      elements[9],
      elements[10],
      vertical(
        0.5,
        elements[12],
        elements[13],
        overlay(
          0.5,
          0.5,
          elements[16], // overlay element 16 on top of horizontal block of 14 and 15
          horizontal(
            0.99,
            elements[14],
            elements[15],
          ),
        ),
      ),
    ),
  ),
);

console.log(
  Nice.render(render),
);

const textEncoder = new TextEncoder();

function draw(y: number, x: number, s: string): void {
  Deno.stdout.writeSync(textEncoder.encode(
    `\x1b[${y + 1};${x + 1}H${s}`,
  ));
}

let maxRow = 0;
for (const [i, element] of elements.entries()) {
  if (!element[NICE_ANCHOR]) break;

  const style = crayon.hsl((360 / ITEMS_AMOUNT) * i, 50, 50);

  const { top, left, width, height } = getBoundingRect(element);

  draw(top, left, style("╭"));
  draw(top, left + width - 1, style("╮"));
  draw(top + height - 1, left + width - 1, style("╯"));
  draw(top + height - 1, left, style("╰"));

  maxRow = Math.max(maxRow, top + height - 1);
}

Deno.stdout.writeSync(textEncoder.encode(
  `\x1b[${maxRow + 2};0H$`,
));

// console.log(ov);
