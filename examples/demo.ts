// Copyright 2023 Im-Beast. All rights reserved. MIT license.
import { crayon } from "https://deno.land/x/crayon@3.3.3/mod.ts";
import { Nice } from "../mod.ts";

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

export function render() {
  const SCREEN_BG = Nice.horizontal(
    0.5,
    Nice.vertical(
      0.5,
      a.draw(
        "This gets justified\nAlone\none two three four five six\nlonger words come here\nbig spacing now",
      ),
      Nice.horizontal(
        0.5,
        c.draw("Hello"),
        c.draw("there"),
        d.draw("This should get clipped"),
      ),
    ),
    b.draw(
      "Nice 🔥\n（╯°□°）╯︵┻━┻\ndevanagari आआॠऋॲपॉ\nﾊﾊﾊThis text should get wrapped because widthəəə is explicit as日本verylongstringthaəə💩twillwrapnomatterwhat\nwowə\nالعربية",
    ),
    Nice.vertical(
      0.5,
      e.draw("very long text that will wrap and will fit"),
      e.draw("日本 long text that will wrap and totally won't fit"),
    ),
    Nice.vertical(
      0.5,
      f.draw(`ISBN: 978-0-1234-5678-7\n\nCSS: הרפתקה חדשה!`),
      g.draw(`ISBN: 978-0-1234-5678-7\n\nCSS: הרפתקה חדשה!`),
      h.draw(`ISBN: 978-0-1234-5678-7\n\nCSS: הרפתקה חדשה!`),
    ),
  );

  const SCREEN_FG = popup.draw(`;)`);
  const SCREEN_FG2 = popup2.draw("hi");
  const SCREEN_FG3 = popup3.draw("Im on 13th column\nand fourth row");

  const rendered = Nice.render(
    Nice.overlay(
      13,
      4,
      SCREEN_FG3,
      Nice.overlay(
        0.2,
        0.2,
        SCREEN_FG2,
        Nice.overlay(
          0.5,
          0.5,
          SCREEN_FG,
          SCREEN_BG,
        ),
      ),
    ),
  );

  return rendered;
}

if (import.meta.main) {
  Deno.stdout.writeSync(new TextEncoder().encode("\x1b[1;1H\x1b[0J" + render()));
}
