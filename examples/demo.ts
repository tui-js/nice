// Copyright 2024 Im-Beast. All rights reserved. MIT license.
import crayon from "@crayon/crayon";
import { Style } from "../src/style_block.ts";
import { VerticalBlock } from "../src/layout/vertical_block.ts";
import { HorizontalBlock } from "../src/layout/horizontal_block.ts";

console.clear();

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
const separator = new Style({ string: crayon.bgBlack });

export function render() {
  console.time("render time");

  const root = new VerticalBlock(
    { string: crayon.bgLightYellow, width: "100%", height: "100%" },
    new VerticalBlock(
      {
        string: crayon.bgYellow,
        width: "100%",
        // FIXME: if width/height is set to 0 it inferes that as "auto"
        horizontalAlign: "50%",
        verticalAlign: "50%",
        gap: 2,
      },
      // new HorizontalBlock(
      //   { width: "100%", height: "auto" },
      //   red.create(
      //     "Nice 🔥\n（╯°□°）╯︵┻━┻\ndevanagari आआॠऋॲपॉ\nﾊﾊﾊThis text should get wrapped because widthəəə is explicit as日本verylongstringthaəə💩twillwrapnomatterwhat\nwowə\nالعربية",
      //     { width: "50%" },
      //   ),
      //   red.create(
      //     "Nice 🔥\n（╯°□°）╯︵┻━┻\ndevanagari आआॠऋॲपॉ\nﾊﾊﾊThis text should get wrapped because widthəəə is explicit as日本verylongstringthaəə💩twillwrapnomatterwhat\nwowə\nالعربية",
      //     { width: "50%" },
      //   ),
      // ),
      red.create(
        "Nice 🔥\n（╯°□°）╯︵┻━┻\ndevanagari आआॠऋॲपॉ\nﾊﾊﾊThis text should get wrapped because widthəəə is explicit as日本verylongstringthaəə💩twillwrapnomatterwhat\nwowə\nالعربية",
        { width: "50%" },
      ),
      blue.create("hello2", { width: "20%" }),
      green.create("hello3"),
    ),
    separator.create("", { width: "100%" }),
    new HorizontalBlock(
      {
        string: crayon.bgMagenta,
        height: "30%",
        width: "100%",
        horizontalAlign: "100%",
        verticalAlign: "50%",
        gap: "15%",
      },
      red.create(
        "Nice 🔥\n（╯°□°）╯︵┻━┻\ndevanagari आआॠऋॲपॉ\nﾊﾊﾊThis text should get wrapped because widthəəə is explicit as日本verylongstringthaəə💩twillwrapnomatterwhat\nwowə\nالعربية",
        { width: "30%" },
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
