import { textWidth } from "../src/deps.ts";

import { crop, cropEnd, cropStart } from "../src/utils/strings.ts";

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
