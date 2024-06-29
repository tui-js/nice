// Copyright 2023 Im-Beast. All rights reserved. MIT license.
import { crayon } from "https://deno.land/x/crayon@3.3.3/mod.ts";
import { Nice } from "../mod.ts";
import { horizontal, overlay, vertical } from "../src/layout/mod.ts";

console.clear();

const a = new Nice({
  style: crayon.bgLightBlue.lightWhite.bold,
  text: {
    horizontalAlign: "justify",
    verticalAlign: "middle",
    overflow: "ellipsis",
  },
  border: {
    type: "thick",
    style: crayon.white.bold,
    x: true,
    y: true,
  },
  padding: {
    bottom: 1,
    top: 1,
    right: 2,
    left: 2,
  },
  margin: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});

const b = a.derive({
  style: crayon.bgRed,
  width: 25,
  height: 13,
  text: {
    horizontalAlign: "center",
  },
});

const c = a.derive({
  style: crayon.bgGreen,
});

const d = c.derive({
  width: 5,
  height: 2,
  style: crayon.bgMagenta,
});

const e = d.derive({
  style: crayon.bgYellow,
  width: 10,
  height: 5,
  text: {
    horizontalAlign: "justify",
    overflow: "ellipsis",
  },
});

const f = e.derive({
  style: crayon.bgLightGreen,
  width: 22,
  height: 3,
  text: {
    horizontalAlign: "right",
  },
});

const g = f.derive({
  text: {
    overflow: "clip",
  },
});

const h = f.derive({
  text: {
    overflow: "ellipsis",
    ellipsisString: "...",
  },
});

const popup = a.derive({
  style: crayon.bgLightYellow.red.bold,
  margin: { top: 1, bottom: 1, left: 2, right: 2 },
  width: 17,
  height: 1,
  text: { horizontalAlign: "center" },
});

const popup2 = popup.derive({
  style: crayon.bgBlue.lightWhite,
  height: 1,
  width: 4,
  margin: { top: 0, bottom: 0, left: 0, right: 0 },
  padding: { top: 0, bottom: 0, left: 0, right: 0 },
});

const popup3 = popup2.derive({
  style: crayon.bgMagenta.lightWhite,
  width: undefined,
  height: undefined,
});

const popup4 = popup3.derive({
  style: crayon.bgYellow.blue,
});

export function render() {
  console.time("render time");
  const SCREEN_BG = horizontal(
    0.5,
    vertical(
      0.5,
      a.draw(
        "This gets justified\nAlone\none two three four five six\nlonger words come here\nbig spacing now",
      ),
      horizontal(
        0.5,
        c.draw("Hello"),
        c.draw("there"),
        d.draw("This should get clipped"),
      ),
    ),
    b.draw(
      "Nice 🔥\n（╯°□°）╯︵┻━┻\ndevanagari आआॠऋॲपॉ\nﾊﾊﾊThis text should get wrapped because widthəəə is explicit as日本verylongstringthaəə💩twillwrapnomatterwhat\nwowə\nالعربية",
    ),
    vertical(
      0.5,
      e.draw("very long text that will wrap and will fit"),
      e.draw("日本 long text that will wrap and totally won't fit"),
    ),
    vertical(
      0.5,
      f.draw(`ISBN: 978-0-1234-5678-7\n\nCSS: הרפתקה חדשה!`),
      g.draw(`ISBN: 978-0-1234-5678-7\n\nCSS: הרפתקה חדשה!`),
      h.draw(`ISBN: 978-0-1234-5678-7\n\nCSS: הרפתקה חדשה!`),
    ),
  );

  const SCREEN_FG = popup.draw(`;)`);
  const SCREEN_FG2 = popup2.draw("hi");
  const SCREEN_FG3 = popup3.draw("Im on 13th column\nand fourth row");
  const SCREEN_FG4 = popup4.draw("Im gone\nIm on negative coords\npart of me will get cut off");

  const rendered = Nice.render(
    overlay(
      -4,
      -2,
      SCREEN_FG4,
      overlay(
        13,
        4,
        SCREEN_FG3,
        overlay(
          0.2,
          0.2,
          SCREEN_FG2,
          overlay(
            0.5,
            0.5,
            SCREEN_FG,
            SCREEN_BG,
          ),
        ),
      ),
    ),
  );

  console.timeEnd("render time");
  return rendered;
}

if (import.meta.main) {
  console.log(render());
}
