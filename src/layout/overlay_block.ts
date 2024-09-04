import { effect, getValue, type MaybeSignal } from "@tui/signals";
import { cropStart, insert } from "@tui/strings";

import { Block } from "../block.ts";
import { type NoAutoUnit, normalizeUnit } from "../unit.ts";
import { StyleBlock } from "../style_block.ts";

export interface OverlayBlockOptions {
  id?: string;
  bg: MaybeSignal<Block>;
  fg: MaybeSignal<Block>;
  x: MaybeSignal<NoAutoUnit>;
  y: MaybeSignal<NoAutoUnit>;
}

// FIXME: Sometimes fg clears style after it
export class OverlayBlock extends Block {
  name = "Overlay";

  declare children: [bg: MaybeSignal<Block>, fg: MaybeSignal<Block>];

  x!: NoAutoUnit;
  y!: NoAutoUnit;
  computedX = 0;
  computedY = 0;

  constructor(options: OverlayBlockOptions) {
    super({
      id: options.id,
      width: "auto",
      height: "auto",
      children: [options.bg, options.fg],
    });

    effect(() => {
      this.x = getValue(options.x);
      this.y = getValue(options.y);

      this.changed = true;
    });
  }

  compute(parent: Block): void {
    super.compute(parent);
    if (!this.hasChanged()) return;

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
    if (!this.hasChanged()) return;
    this.lines.length = 0;
  }

  layout(): void {}

  finishLayout(): void {
    if (!this.hasChanged()) return;
    this.changed = false;

    const [bg, fg] = this.children.map(getValue);
    const { computedX, computedY } = this;

    const emptyLine = " ".repeat(bg.computedWidth);

    for (let bgLinePos = 0; bgLinePos < bg.computedHeight; ++bgLinePos) {
      const fgLinePos = bgLinePos - computedY;
      const bgLine = bg.lines[bgLinePos] ?? emptyLine;

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
