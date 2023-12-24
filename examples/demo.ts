// Copyright 2023 Im-Beast. All rights reserved. MIT license.
import { crayon } from "https://deno.land/x/crayon@3.3.3/mod.ts";
import { Nice, unit } from "../mod.ts";

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
e.text.horizontalAlign = "justify";
e.style = crayon.bgYellow;
e.text.overflow = "ellipsis";

const f = e.clone();
f.style = crayon.bgLightGreen;
f.width = 22;
f.height = 3;
f.text.horizontalAlign = "right";

const g = f.clone();
g.text.overflow = "clip";

const h = f.clone();
h.text.overflow = "ellipsis";
h.text.ellipsisString = "...";

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

const popup3 = popup2.clone();
popup3.style = crayon.bgMagenta.lightWhite;
popup3.width = undefined;
popup3.height = undefined;

let x = unit(100, "%");
let xdir = -1;

let y = unit(30, "%");
let ydir = -1;

let fps = 0;
let frametime = 0;
let minFrametime = 1000;
let maxFrametime = 0;

let lastFps = 0;
setInterval(() => {
  lastFps = fps;
  fps = 0;
  minFrametime = frametime;
  maxFrametime = frametime;
}, 1000);

export function render() {
  const start = performance.now();

  x += 0.01 * xdir;
  if (x > unit(100, "%") || x < 0) {
    xdir *= -1;
    x = Math.round(x) - 1e-15;
  }
  y += 0.01 * ydir;
  if (y >= unit(100, "%") || y < 0) {
    ydir *= -1;
    y = Math.round(y) - 1e-15;
  }

  const SCREEN_BG = Nice.layoutVertically(
    unit("left"),
    `FPS: ${lastFps} |\
 Avg Frametime: ${crayon.lightBlue(frametime.toFixed(2))}ms |\
 Min: ${crayon.lightGreen(minFrametime.toFixed(2))}ms |\
 Max: ${crayon.lightRed(maxFrametime.toFixed(2))}ms`,
    Nice.layoutHorizontally(
      unit("middle"),
      Nice.layoutVertically(
        unit("center"),
        a.render(
          "This gets justified\nAlone\none two three four five six\nlonger words come here\nbig spacing now",
        ),
        Nice.layoutHorizontally(
          unit("center"),
          c.render("Hello"),
          c.render("there"),
          d.render("This should get clipped"),
        ),
      ),
      b.render(
        "Nice 🔥\n（╯°□°）╯︵┻━┻\ndevanagari आआॠऋॲपॉ\nﾊﾊﾊThis text should get wrapped because widthəəə is explicit as日本verylongstringthaəə💩twillwrapnomatterwhat\nwowə\nالعربية",
      ),
      Nice.layoutVertically(
        unit("center"),
        e.render("very long text that will wrap and will fit"),
        e.render("日本 long text that will wrap and totally won't fit"),
      ),
      Nice.layoutVertically(
        unit("center"),
        f.render(`ISBN: 978-0-1234-5678-7\n\nCSS: הרפתקה חדשה!`),
        g.render(`ISBN: 978-0-1234-5678-7\n\nCSS: הרפתקה חדשה!`),
        h.render(`ISBN: 978-0-1234-5678-7\n\nCSS: הרפתקה חדשה!`),
      ),
    ),
  );

  const SCREEN_FG = popup.render(`Hello ${x.toFixed(2)}/${y.toFixed(2)}`);
  const SCREEN_FG2 = popup2.render("hi");
  const SCREEN_FG3 = popup3.render("Im on 13th cell (26th column)\nand fourth row");

  const rendered = Nice.fitToScreen(
    Nice.overlay(
      unit(13, "cell"),
      unit(4, "row"),
      SCREEN_FG3,
      Nice.overlay(
        x,
        y,
        SCREEN_FG2,
        Nice.overlay(
          unit("center"),
          unit("middle"),
          SCREEN_FG,
          SCREEN_BG,
        ),
      ),
    ),
  );

  const currentFrametime = performance.now() - start;
  ++fps;
  minFrametime = Math.min(minFrametime, currentFrametime);
  maxFrametime = Math.max(maxFrametime, currentFrametime);
  frametime = ((frametime * 29) + currentFrametime) / 30;

  return rendered;
}

if (import.meta.main) {
  const textEncoder = new TextEncoder();
  setInterval(() => {
    Deno.stdout.writeSync(textEncoder.encode("\x1b[1;1H\x1b[0J" + render()));
  }, 16);
}
