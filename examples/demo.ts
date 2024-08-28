// Copyright 2024 Im-Beast. All rights reserved. MIT license.
import crayon from "@crayon/crayon";
import { Style, StyleBlock } from "../src/style_block.ts";
import { VerticalBlock } from "../src/layout/vertical_block.ts";
import { HorizontalBlock } from "../src/layout/horizontal_block.ts";
import { createdBlocks } from "../src/block.ts";
import { calc } from "../src/unit.ts";

let h = 1;
const color = () => crayon.bgHsl(((++h) * 40) % 360, 60, 40);

const style = new Style({
  string: crayon.bgMagenta,
  text: {
    horizontalAlign: "center",
  },
  padding: { all: 1 },
  margin: { all: 1 },
  border: {
    all: true,
    style: crayon.black.bgYellow,
    type: "rounded",
  },
});
const style2 = style.derive({
  width: 14,
  height: 8,
  text: {
    horizontalAlign: "justify",
    overflow: "ellipsis",
  },
});

export function render() {
  const start = performance.now();

  const root = new HorizontalBlock(
    {
      string: crayon.bgBlack,
      width: "100%",
      height: "80%",

      gap: 2,

      x: "50%",
      y: "50%",
    },
    new VerticalBlock(
      { width: calc("50% - 1"), gap: 2, string: crayon.bgLightBlack, x: "50%" },
      style.create(
        "Nice 🔥\n（╯°□°）╯︵┻━┻\ndevanagari आआॠऋॲपॉ\nﾊﾊﾊThis text should get wrapped because widthəəə is explicit as日本verylongstringthaəə💩twillwrapnomatterwhat\nwowə\nلعربيةا",
        { string: color() },
      ),
      new HorizontalBlock(
        { gap: 2, string: color(), y: "50%" },
        style.create(
          "This gets justified\nAlone\none two three four five six\nlonger words come here\nbig spacing now",
          {
            string: color(),
            text: { horizontalAlign: "justify" },
          },
        ),
        style2.create("ISBN: 978-0-1234-5678-7\n\nCSS: הרפתקה חדשה!", {
          string: color(),
        }),
        style2.create("ISBN: 978-0-1234-5678-7\n\nCSS: הרפתקה חדשה!", {
          string: color(),
          text: { overflow: "clip" },
        }),
        style2.create("ISBN: 978-0-1234-5678-7\n\nCSS: הרפתקה חדשה!", {
          string: color(),
          text: { ellipsisString: "..." },
        }),
      ),
    ),
    new VerticalBlock(
      {
        width: calc("50% - 1"),
        height: "100%",
        string: crayon.bgBlack,
        gap: 1,
      },
      new VerticalBlock(
        { width: "100%", height: "50%", string: color() },
        style.create("Second column", { string: color() }),
        style.create("Test 2", { string: color() }),
      ),
      new HorizontalBlock(
        {
          width: "100%",
          height: calc("50% - 2"),
          string: color(),
          gap: 4,
          x: "50%",
          y: "50%",
        },
        style.create("Test 3", { string: color(), width: calc("33.3% - 4%") }),
        style.create("Test 4", { string: color(), width: calc("33.3% - 4%") }),
        style.create("Test 5", {
          string: color(),
          width: calc("33.3% - 4%"),
          height: "100%",
        }),
      ),
    ),
  );

  const rendered = root.render();

  console.log("render time:", performance.now() - start);
  return rendered;
}

x: if (import.meta.main) {
  console.clear();
  console.log(render());

  if (!Deno.args.includes("bb")) break x;

  const textEncoder = new TextEncoder();
  const draw = (y: number, x: number, s: string): void => {
    Deno.stdout.writeSync(textEncoder.encode(
      `\x1b[${y + 2};${x + 1}H${s}`,
    ));
  };

  for (const block of createdBlocks) {
    const { top, left, width, height } = block.boundingRectangle();

    const style = block instanceof StyleBlock && block.style.string
      ? block.style.string
      : (block instanceof VerticalBlock || block instanceof HorizontalBlock) &&
          block.string
      ? block.string
      : undefined;
    if (!style) continue;

    draw(top, left, style("Q"));
    draw(top, left + width - 1, style("W"));
    draw(top + height - 1, left, style("A"));
    draw(top + height - 1, left + width - 1, style("D"));
  }

  draw(createdBlocks.at(-2)!.computedHeight, 0, "");
}
