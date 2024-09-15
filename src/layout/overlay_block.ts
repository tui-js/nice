import { getValue, type MaybeSignal } from "@tui/signals";
import { cropStart, insert } from "@tui/strings";

import type { Block } from "../block.ts";
import { type NoAutoUnit, normalizeUnit } from "../unit.ts";
import { StyleBlock } from "../style_block.ts";
import type { StringStyler } from "../types.ts";
import { LayoutBlock } from "../layout_block.ts";
import { maybeComputed } from "../utils.ts";

export interface OverlayBlockOptions {
  id?: string;
  string?: MaybeSignal<StringStyler>;
  bg: MaybeSignal<Block>;
  fg: MaybeSignal<Block>;
  x: MaybeSignal<NoAutoUnit>;
  y: MaybeSignal<NoAutoUnit>;
}

// FIXME: Sometimes fg clears style after it
export class OverlayBlock extends LayoutBlock {
  name = "Overlay";

  declare children: [bg: Block, fg: Block];

  string?: StringStyler;
  x!: NoAutoUnit;
  y!: NoAutoUnit;
  computedX = 0;
  computedY = 0;

  constructor(options: OverlayBlockOptions) {
    const { bg, fg, string, x, y } = options;

    super({
      id: options.id,
      width: "auto",
      height: "auto",
      children: [bg, fg],
    });

    maybeComputed(string, (string) => {
      this.string = string;
      this.changed = true;
    });

    maybeComputed(x, (x) => {
      this.x = x;
      this.changed = true;
    });

    maybeComputed(y, (y) => {
      this.y = y;
      this.changed = true;
    });
  }

  compute(parent: Block): void {
    super.compute(parent);

    const [bg, fg] = this.children.map(getValue);

    if (!bg.changed && bg instanceof StyleBlock) {
      bg.updateLines();
    }
    bg.compute(parent);
    bg.draw();

    this.computedWidth = bg.computedWidth;
    this.computedHeight = bg.computedHeight;

    if (!fg.changed && fg instanceof StyleBlock) {
      fg.updateLines();
    }
    fg.compute(this);
    fg.draw();

    this.computedX = normalizeUnit(this.x, bg.computedWidth - fg.computedWidth);
    this.computedY = normalizeUnit(this.y, bg.computedHeight - fg.computedHeight);

    fg.computedLeft += this.computedX;
    fg.computedTop += this.computedY;
  }

  startLayout(): void {
    this.lines.length = 0;
  }

  layout(): void {}

  finishLayout(): void {
    const [bg, fg] = this.children.map(getValue);
    const { string, computedX, computedY } = this;

    const emptyLine = string ? string(" ".repeat(bg.computedWidth)) : " ".repeat(bg.computedWidth);

    const fgWidth = fg.computedWidth;
    const bgWidth = bg.computedWidth;

    for (let bgLinePos = 0; bgLinePos < bg.computedHeight; ++bgLinePos) {
      const fgLinePos = bgLinePos - computedY;
      const bgLine = bg.lines[bgLinePos] ?? emptyLine;

      if (fgLinePos < 0 || fgLinePos >= fg.computedHeight) {
        this.lines.push(bgLine);
        continue;
      }

      const fgLine = fg.lines[fgLinePos];

      if (computedX < 0) {
        const line = cropStart(fgLine, fgWidth + computedX) + cropStart(bgLine, bgWidth - fgWidth - computedX);
        this.lines.push(string ? string(line) : line);
      } else if (fgWidth === bgWidth) {
        this.lines.push(fgLine);
      } else {
        // TODO: Just inlining insert and using computedWidths instead of recalculating them
        //       is an easy way to improve perf, but maybe @tui/strings should add a way to
        //       set widths if they are known instead
        const line = insert(bgLine, fgLine, computedX, true);

        this.lines.push(string ? string(line) : line);
      }
    }
  }
}
