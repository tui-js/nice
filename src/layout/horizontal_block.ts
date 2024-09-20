import { cropEnd, cropStart } from "@tui/strings";
import type { MaybeSignal } from "@tui/signals";

import type { Block } from "../block.ts";
import { type NoAutoUnit, normalizeUnit, type Unit } from "../unit.ts";
import { flexibleCompute } from "./shared.ts";
import type { StringStyler } from "../types.ts";
import { LayoutBlock } from "../layout_block.ts";
import { maybeComputed } from "../utils.ts";

export interface HorizontalBlockOptions {
  id?: string;
  string?: MaybeSignal<StringStyler>;
  width?: MaybeSignal<Unit>;
  height?: MaybeSignal<Unit>;
  x?: MaybeSignal<NoAutoUnit>;
  y?: MaybeSignal<NoAutoUnit>;
  gap?: MaybeSignal<NoAutoUnit>;
}

export class HorizontalBlock extends LayoutBlock {
  name = "Horizontal";

  string?: StringStyler;
  x!: NoAutoUnit;
  y!: NoAutoUnit;
  gap!: NoAutoUnit;

  computedX = 0;
  computedGap = 0;

  #occupiedWidth = 0;

  constructor(options: HorizontalBlockOptions, ...children: MaybeSignal<Block>[]) {
    super({
      id: options.id,
      width: options.width ??= "auto",
      height: options.height ??= "auto",
      children,
    });

    const { string, x, y, gap } = options;

    maybeComputed(string, (string) => {
      this.string = string;
      this.changed = true;
    });

    maybeComputed(x, (x) => {
      this.x = x ?? 0;
      this.changed = true;
    });

    maybeComputed(y, (y) => {
      this.y = y ?? 0;
      this.changed = true;
    });

    maybeComputed(gap, (gap) => {
      this.gap = gap ?? 0;
      this.changed = true;
    });
  }

  compute(parent: Block): void {
    super.compute(parent);

    this.usedWidth = 0;
    this.usedHeight = 0;
    this.#occupiedWidth = 0;

    this.computedGap = normalizeUnit(this.gap, this.computedHeight);
    if (this.computedGap < 0) throw new Error("Gap cannot be negative");

    flexibleCompute(this, parent, (i, child) => {
      if (i !== 0) this.usedWidth += this.computedGap;
      this.usedWidth += child.computedWidth;
      this.usedHeight = Math.max(this.usedHeight, child.computedHeight);
    });

    this.usedWidth = Math.min(this.computedWidth, this.usedWidth);
    this.computedX = normalizeUnit(this.x, this.computedWidth - this.usedWidth);

    this.maybeResize();
  }

  startLayout(): void {
    this.lines.length = 0;
  }

  layout(child: Block): void {
    const childChanged = child.hasChanged();
    if (childChanged) {
      child.draw();
    }

    let freeSpace = this.computedWidth - this.#occupiedWidth;
    if (freeSpace <= 0) {
      child.visible = false;
      return;
    }

    const offsetY = normalizeUnit(this.y, this.computedHeight - child.computedHeight);

    let gapString = "";
    if (this.#occupiedWidth !== 0 && this.computedGap > 0) {
      const gapLinesInBounds = Math.min(freeSpace, this.computedGap);
      gapString = " ".repeat(gapLinesInBounds);

      this.#occupiedWidth += gapLinesInBounds;
      freeSpace -= gapLinesInBounds;
    }

    if (freeSpace <= 0) {
      child.visible = false;
      return;
    }

    if (childChanged) {
      child.computedTop += offsetY;
      child.computedLeft += this.#occupiedWidth + this.computedX;
    }

    if (child.computedWidth <= freeSpace) {
      const emptyLine = " ".repeat(child.computedWidth);

      for (let i = 0; i < this.computedHeight; ++i) {
        this.lines[i] ??= "";
        const line = child.lines[i - offsetY] ?? emptyLine;

        this.lines[i] += gapString + line;
      }
      this.#occupiedWidth += child.computedWidth;
    } else {
      const emptyLine = " ".repeat(freeSpace);

      for (let i = 0; i < this.computedHeight; ++i) {
        this.lines[i] ??= "";
        const line = child.lines[i - offsetY] ?? emptyLine;
        this.lines[i] += gapString + cropEnd(line, freeSpace, " ") + "\x1b[0m";
      }
      this.#occupiedWidth += freeSpace;
    }
  }

  finishLayout(): void {
    if (this.computedX < 0) {
      const padRight = " ".repeat(this.computedWidth - this.#occupiedWidth - this.computedX);
      const croppedLineWidth = this.computedWidth + this.computedX;

      for (let i = 0; i < this.lines.length; ++i) {
        const paddedLine = cropStart(this.lines[i], croppedLineWidth, " ") + padRight;
        this.lines[i] = this.string ? this.string(paddedLine) : paddedLine;
      }
      return;
    }

    const padLeft = " ".repeat(this.computedX);
    const padRight = " ".repeat(this.computedWidth - this.#occupiedWidth - this.computedX);

    for (let i = 0; i < this.lines.length; ++i) {
      const paddedLine = padLeft + this.lines[i] + padRight;
      this.lines[i] = this.string ? this.string(paddedLine) : paddedLine;
    }
  }
}
