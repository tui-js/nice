import { Block } from "../block.ts";
import { type NoAutoUnit, normalizeUnit } from "#src/unit.ts";
import { cropStart, insert } from "@tui/strings";

export interface OverlayBlockOptions {
  bg: Block;
  fg: Block;
  x: NoAutoUnit;
  y: NoAutoUnit;
}

export class OverlayBlock extends Block {
  name = "Overlay";

  declare children: [bg: Block, fg: Block];

  x: NoAutoUnit;
  y: NoAutoUnit;
  computedX = 0;
  computedY = 0;

  constructor({ bg, fg, x, y }: OverlayBlockOptions) {
    super({ width: bg.width, height: bg.height });

    this.addChild(bg);
    this.addChild(fg);

    this.x = x;
    this.y = y;
  }

  compute(parent: Block): void {
    const [bg, fg] = this.children;

    bg.compute(parent);
    bg.draw();
    fg.compute(parent);
    fg.draw();

    this.computedWidth = bg.computedWidth;
    this.computedHeight = bg.computedHeight;

    this.computedX = normalizeUnit(this.x, bg.computedWidth - fg.computedWidth);
    this.computedY = normalizeUnit(this.y, bg.computedHeight - fg.computedHeight);

    fg.computedTop += this.computedY;
    fg.computedLeft += this.computedX;

    this.lines.length = 0;
  }

  layout(): void {}

  finishLayout(): void {
    const [bg, fg] = this.children;
    const { computedX, computedY } = this;

    for (let bgLinePos = 0; bgLinePos < bg.computedHeight; ++bgLinePos) {
      const fgLinePos = bgLinePos - computedY;
      const bgLine = bg.lines[bgLinePos];

      if (fgLinePos < 0 || fgLinePos >= fg.computedHeight) {
        this.lines.push(bgLine);
        continue;
      }

      const fgLine = fg.lines[fgLinePos];
      if (computedX < 0) {
        this.lines.push(
          cropStart(fgLine, fg.computedWidth + computedX) +
            cropStart(bgLine, bg.computedWidth - fg.computedWidth - computedX),
        );
      } else {
        if (fg.computedWidth === bg.computedWidth) {
          this.lines.push(fgLine);
        } else {
          // TODO: Just inlining insert and using computedWidths instead of recalculating them
          //       is an easy way to improve perf, but maybe @tui/strings should add a way to
          //       set widths if they are known instead
          this.lines.push(insert(bgLine, fgLine, computedX, true));
        }
      }
    }
  }
}
