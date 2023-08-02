// Copyright 2023 Im-Beast. All rights reserved. MIT license.
import { crayon } from "https://deno.land/x/crayon@3.3.3/mod.ts";
import { Nice } from "../src/nice.ts";
import { HorizontalPosition, VerticalPosition } from "../mod.ts";

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

const b = a.clone();
b.style = crayon.bgRed;
b.width = 25;
b.height = 13;
b.text.horizontalAlign = "center";

const c = a.clone();

c.style = crayon.bgGreen;

const d = c.clone();
d.width = 5;
d.height = 2;
d.style = crayon.bgMagenta;

const e = d.clone();
e.width = 10;
e.height = 5;
e.style = crayon.bgYellow;
e.text.overflow = "ellipsis";

const f = e.clone();
f.style = crayon.bgLightGreen;
f.width = 20;
f.height = 3;
f.text.horizontalAlign = "right";

const popup = a.clone();
popup.style = crayon.bgLightYellow.red.bold;
popup.margin = {
  top: 1,
  bottom: 1,
  left: 2,
  right: 2,
};
popup.width = 17;
popup.height = 1;
popup.text.horizontalAlign = "center";

const popup2 = popup.clone();
popup2.style = crayon.bgBlue.lightWhite;
popup2.height = 1;
popup2.width = 4;
popup2.margin = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};
popup2.padding = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

console.clear();

const objects: Nice[] = [];
for (let i = 0; i < 100; ++i) {
  const n = a.clone();
  n.style = crayon.bgAnsi8(~~(i * 2.55));
  objects.push(n);
}

export function render() {
  const SCREEN_BG = Nice.layoutHorizontally(
    Nice.layoutVertically(
      a.render(
        "This gets justified\nAlone\none two three four five six\nlonger words come here\nbig spacing now",
      ),
      Nice.layoutHorizontally(
        c.render("Hello"),
        c.render("there"),
        d.render("This should get clipped"),
      ),
    ),
    b.render(
      "（╯°□°）╯︵┻━┻\ndevanagari आआॠऋॲपॉ\nﾊﾊﾊThis text should get wrapped because widthəəə is explicit verylongstringthaəə💩twillwrapnomatterwhat\nwowə",
    ),
    Nice.layoutVertically(
      e.render(
        "very long text that will wrap and will fit",
      ),
      e.render(
        "very long text that will wrap and totally won't fit",
      ),
    ),
    f.render(`ISBN: 978-0-1234-5678-7\n\nCSS: הרפתקה חדשה!`),
  );

  const SCREEN_FG = popup.render("Hello");
  const SCREEN_FG2 = popup2.render("Hi");

  return Nice.overlay(
    HorizontalPosition.Left,
    VerticalPosition.Middle,
    SCREEN_FG2,
    Nice.overlay(
      HorizontalPosition.Center,
      VerticalPosition.Middle,
      SCREEN_FG,
      SCREEN_BG,
    ),
  );
}

if (import.meta.main) {
  // warmup
  render();
  render();
  render();

  console.clear();
  const start = performance.now();
  console.log(render());
  console.log("It took", performance.now() - start, "ms to render this frame");
}
