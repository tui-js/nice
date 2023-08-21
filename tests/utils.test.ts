import { textWidth } from "../src/deps.ts";

import { crop, cropEnd, cropStart, slice } from "../src/utils/strings.ts";

import { assertAlmostEquals, assertEquals, crayon } from "./deps.ts";

const texts = [
  "Nice 🔥",
  "（╯°□°）╯︵┻━┻",
  "devanagari आआॠऋॲपॉ",
  "ﾊﾊﾊThis text should get wrapped because widthəəə is explicit verylongstringthaəə💩twillwrapnomatterwhat",
  "wowə",

  crayon.bgBlue.yellow("Nice " + crayon.red("🔥")),
  crayon.magenta("（╯°□°）╯︵┻━┻"),
  crayon.bold("devanagari" + crayon.green.bgLightRed("आआॠऋॲपॉ")),
  crayon.bgRed.bgGreen.magenta.yellow.blue.cyan.underline.doubleUnderline(
    "ﾊﾊﾊThis text should get wrapped because widthəəə is explicit verylongstringthaəə💩twillwrapnomatterwhat",
  ),
  crayon.yellow("w" + crayon.green("o" + crayon.bold("w" + crayon.bgYellow("ə")))),
];

const cropsNicelyTexts = [
  "Nice",
  "devanagari आआॠऋॲपॉ",
  "ﾊﾊﾊThis text should get wrapped because widthəəə is explicit verylongstringthaəətwillwrapnomatterwhat",
  "wowə",
  crayon.bgBlue.yellow("Nice " + crayon.red("<3")),
  crayon.bold("devanagari" + crayon.green.bgLightRed("आआॠऋॲपॉ")),
  crayon.bgRed.bgGreen.magenta.yellow.blue.cyan.underline.doubleUnderline(
    "ﾊﾊﾊThis text should get wrapped because widthəəə is explicit verylongstringthaəətwillwrapnomatterwhat",
  ),
  crayon.yellow("w" + crayon.green("o" + crayon.bold("w" + crayon.bgYellow("ə")))),
];

Deno.test("crop", () => {
  for (const text of texts) {
    const width = textWidth(text);
    for (let i = 1; i < width; ++i) {
      const cropped = crop(text, i);
      assertAlmostEquals(textWidth(cropped), i, 1);
    }
  }

  for (const text of cropsNicelyTexts) {
    const width = textWidth(text);
    for (let i = 1; i < width; ++i) {
      const cropped = crop(text, i);
      assertEquals(textWidth(cropped), i);
    }
  }
});

Deno.test("cropStart", () => {
  for (const text of texts) {
    const width = textWidth(text);
    for (let i = 1; i < width; ++i) {
      const cropped = cropStart(text, i);
      assertAlmostEquals(textWidth(cropped), width - i, 1);
    }
  }

  for (const text of cropsNicelyTexts) {
    const width = textWidth(text);
    for (let i = 1; i < width; ++i) {
      const cropped = cropStart(text, i);
      assertEquals(textWidth(cropped), width - i);
    }
  }
});

Deno.test("cropEnd", () => {
  for (const text of texts) {
    const width = textWidth(text);
    for (let i = 1; i < width; ++i) {
      const cropped = cropEnd(text, i);
      assertAlmostEquals(textWidth(cropped), width - i, 1);
    }
  }

  for (const text of cropsNicelyTexts) {
    const width = textWidth(text);
    for (let i = 1; i < width; ++i) {
      const cropped = cropEnd(text, i);
      assertEquals(textWidth(cropped), width - i);
    }
  }
});

Deno.test("slice", () => {
  assertEquals(slice("Nice", 0, 4), "Nice");
  assertEquals(slice("Nice", 1, 3), "ic");
  assertEquals(slice("devanagari आआॠऋॲपॉ", 7, 8), "a");
  assertEquals(
    slice(
      "ﾊﾊﾊThis text should get wrapped because widthəəə is explicit verylongstringthaəətwillwrapnomatterwhat",
      7,
      13,
    ),
    " text ",
  );
  assertEquals(slice("wowə", 1, 3), "ow");
  assertEquals(slice(crayon.bgBlue.yellow("Nice " + crayon.red("<3")), 2, 4), "ce");
  assertEquals(
    slice(crayon.bold("devanagari" + crayon.green.bgLightRed("आआॠऋॲपॉ")), 8, 999),
    "ri\x1b[32m\x1b[101mआआॠऋॲपॉ\x1b[0m\x1b[1m\x1b[0m\x1b[0m",
  );
  assertEquals(
    slice(
      crayon.bgRed.bgGreen.magenta.yellow.blue.cyan.underline.doubleUnderline(
        "ﾊﾊﾊThis text should get wrapped because widthəəə is explicit verylongstringthaəətwillwrapnomatterwhat",
      ),
      20,
      30,
    ),
    "get wrappe",
  );
  assertEquals(
    slice(crayon.yellow("w" + crayon.green("o" + crayon.bold("w" + crayon.bgYellow("ə")))), 2, 4),
    "w\x1b[43mə\x1b[0m\x1b[1m\x1b[0m\x1b[32m\x1b[0m\x1b[33m\x1b[0m\x1b[0m",
  );
});
