// Copyright 2024 Im-Beast. All rights reserved. MIT license.
import crayon from "@crayon/crayon";
import { Style } from "../src/style_block.ts";
import { VerticalBlock } from "../src/layout/vertical_block.ts";
import { HorizontalBlock } from "../src/layout/horizontal_block.ts";

const red = new Style({
  string: crayon.bgRed,
  text: {
    horizontalAlign: "center",
  },
  padding: { all: 1 },
  border: {
    all: true,
    style: crayon.green,
    type: "rounded",
  },
});
const blue = new Style({
  string: crayon.bgBlue,
  padding: {
    all: 1,
  },
});
const green = new Style({ string: crayon.bgGreen });
const spacer = new Style({ string: crayon });

export function render() {
  console.time("render time");

  const root = new VerticalBlock(
    { string: crayon.bgLightYellow, width: "100%", height: "100%" },
    new VerticalBlock(
      {
        string: crayon.bgYellow,
        width: "100%",
        height: 25,
        horizontalAlign: "50%",
        verticalAlign: "50%",
      },
      red.create(
        "Nice 🔥\n（╯°□°）╯︵┻━┻\ndevanagari आआॠऋॲपॉ\nﾊﾊﾊThis text should get wrapped because widthəəə is explicit as日本verylongstringthaəə💩twillwrapnomatterwhat\nwowə\nالعربية",
        { width: 10 },
      ),
      blue.create("hello2", { width: "20%" }),
      green.create("hello3"),
    ),
    spacer.create(""),
    new HorizontalBlock(
      {
        string: crayon.bgMagenta,
        width: "100%",
        height: 15,
        horizontalAlign: "100%",
        verticalAlign: "50%",
      },
      red.create(
        "Nice 🔥\n（╯°□°）╯︵┻━┻\ndevanagari आआॠऋॲपॉ\nﾊﾊﾊThis text should get wrapped because widthəəə is explicit as日本verylongstringthaəə💩twillwrapnomatterwhat\nwowə\nالعربية",
        { width: 10 },
      ),
      blue.create("hello2", { width: "20%" }),
      green.create("hello3", { width: "50%", height: "100%" }),
    ),
  );

  root.draw();
  console.timeEnd("render time");
  return root.lines.join("\n");
}

if (import.meta.main) {
  console.log(render());
}
