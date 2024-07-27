// Copyright 2024 Im-Beast. All rights reserved. MIT license.
import crayon from "@crayon/crayon";
import { Style, StyleBlock } from "../src/style_block.ts";
import { VerticalBlock } from "../src/layout/vertical_block.ts";
import { HorizontalBlock } from "../src/layout/horizontal_block.ts";
import { createdBlocks } from "../src/block.ts";

let h = 1;
const color = () => crayon.bgHsl(((++h) * 60) % 360, 60, 40);

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

export function render() {
  console.time("render time");

  const root = new HorizontalBlock(
    {
      string: crayon.bgBlack,
      width: "100%",

      horizontalAlign: "50%",

      gap: 2,
    },
    new VerticalBlock(
      { width: "49%", string: color() },
      style.create("First column", { string: color() }),
      style.create("Test", { string: color() }),
    ),
    new VerticalBlock(
      { width: "49%", string: color(), gap: 4 },
      style.create("Second column", { string: color() }),
      style.create("Test 2", { string: color() }),
      new HorizontalBlock(
        { width: "100%", string: color(), gap: 5 },
        style.create("Test 3", { string: color() }, { width: "30%" }),
        style.create("Test 4", { string: color() }, { width: "30%" }),
        style.create("Test 4", { string: color() }, { width: "30%" }),
      ),
    ),
  );

  root.draw();

  console.timeEnd("render time");
  return root.lines.join("\n");
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
      : (block instanceof VerticalBlock || block instanceof HorizontalBlock) && block.string
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
