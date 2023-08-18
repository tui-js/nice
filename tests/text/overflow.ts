import { Nice } from "../../src/nice.ts";
import { crayon } from "https://deno.land/x/crayon@3.3.3/mod.ts";

const TEST_INFO = new Nice({
  style: crayon.bgGreen.bold.yellow,
  border: { type: "double", style: crayon.yellow },
  padding: { bottom: 1, top: 1, left: 1, right: 1 },
});

const testFail = crayon.bgRed("This should not be visible");
const testMaybePasses = crayon("This should ellipse");

const ELLIPSIS_NEWLINE_TEXT = `${testMaybePasses}\n\n${testFail}`;
const ELLIPSIS_INLINE_BREAK_WORD_TEXT = `${testMaybePasses} ${testFail}`;
const ELLIPSIS_INLINE_BREAK_ALL_TEXT = `${testMaybePasses}${testFail}`;

const newlineElipsis = new Nice({
  style: crayon.bgLightBlue.lightWhite.bold,
  height: 2,
  text: { overflow: "ellipsis" },
  border: { type: "thick", style: crayon.white.bold },
  padding: { bottom: 1, top: 1, right: 2, left: 2 },
  margin: { top: 0, bottom: 0, left: 0, right: 0 },
});

const newlineCustomEllipsis = newlineElipsis.clone();
newlineCustomEllipsis.text.ellipsisString = "...";

const newlineClip = newlineElipsis.clone();
newlineClip.text.overflow = "clip";

const inlineElipsis = new Nice({
  style: crayon.bgLightBlue.lightWhite.bold,
  width: 23,
  height: 1,
  text: { overflow: "ellipsis" },
  border: { type: "thick", style: crayon.white.bold },
  padding: { bottom: 1, top: 1, right: 2, left: 2 },
  margin: { top: 0, bottom: 0, left: 0, right: 0 },
});

const inlineCustomEllipsis = inlineElipsis.clone();
inlineCustomEllipsis.text.ellipsisString = "...";

const inlineClip = inlineElipsis.clone();
inlineClip.text.overflow = "clip";

console.log(
  Nice.layoutVertically(
    TEST_INFO.render(
      `All of these boxes should contain text "${testMaybePasses}".\nIf some of the text is missing or even a part of "${testFail}" is visible test fails.`,
    ),
    Nice.layoutHorizontally(
      Nice.layoutVertically(
        newlineElipsis.render(ELLIPSIS_NEWLINE_TEXT),
        newlineCustomEllipsis.render(ELLIPSIS_NEWLINE_TEXT),
        newlineClip.render(ELLIPSIS_NEWLINE_TEXT),
      ),
      Nice.layoutVertically(
        inlineElipsis.render(ELLIPSIS_INLINE_BREAK_WORD_TEXT),
        inlineCustomEllipsis.render(ELLIPSIS_INLINE_BREAK_WORD_TEXT),
        inlineClip.render(ELLIPSIS_INLINE_BREAK_WORD_TEXT),
      ),
      Nice.layoutVertically(
        inlineElipsis.render(ELLIPSIS_INLINE_BREAK_ALL_TEXT),
        inlineCustomEllipsis.render(ELLIPSIS_INLINE_BREAK_ALL_TEXT),
        inlineClip.render(ELLIPSIS_INLINE_BREAK_ALL_TEXT),
      ),
    ),
  ),
);
