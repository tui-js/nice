import { Block, type BlockOptions } from "../block.ts";
import { type NoAutoUnit, normalizeUnit, type Unit } from "../unit.ts";
import { flexibleCompute } from "./shared.ts";
import type { StringStyler } from "../types.ts";
import { cropEnd, cropStart } from "@tui/strings";
import { getValue, type MaybeSignal } from "../../../signals/mod.ts";
import { effect } from "../../../signals/src/computed.ts";

export interface HorizontalBlockOptions {
  string?: StringStyler;
  width?: Unit;
  height?: Unit;
  x?: NoAutoUnit;
  y?: NoAutoUnit;
  gap?: NoAutoUnit;
}

export class HorizontalBlock extends Block {
  name = "Horizontal";

  string?: StringStyler;
  x: NoAutoUnit;
  y: NoAutoUnit;
  gap: NoAutoUnit;

  computedX = 0;
  computedGap = 0;

  #occupiedWidth = 0;

  constructor(options: HorizontalBlockOptions, ...children: MaybeSignal<Block>[]) {
    options.width ??= "auto";
    options.height ??= "auto";
    super(options as BlockOptions);

    effect(() => {
      // Associate children signals with this
      for (const childSignal of children) {
        getValue(childSignal);
      }
      this.changed = true;
    });

    for (const child of children) {
      this.addChild(child);
    }

    this.y = options.y ?? 0;
    this.x = options.x ?? 0;
    this.gap = options.gap ?? 0;
    this.string = options.string;
  }

  compute(parent: MaybeSignal<Block>): void {
    super.compute(parent);
    if (!this.hasChanged()) return;

    this.computedGap = normalizeUnit(this.gap, this.computedHeight);
    if (this.computedGap < 0) throw new Error("Gap cannot be negative");

    this.usedWidth = 0;
    this.usedHeight = 0;
    flexibleCompute(this, getValue(parent), (i, child) => {
      if (i !== 0) this.usedWidth += this.computedGap;

      this.usedWidth += child.computedWidth;
      this.usedHeight = Math.max(this.usedHeight, child.computedHeight);
    });

    this.usedWidth = Math.min(this.computedWidth, this.usedWidth);
    this.computedX = normalizeUnit(this.x, this.computedWidth - this.usedWidth);
    this.#occupiedWidth = 0;
  }

  startLayout(): void {
    if (this.hasChanged()) {
      this.compute(this.parent!);
      this.lines.length = 0;
    }
  }

  layout(childSignal: MaybeSignal<Block>): void {
    if (!this.hasChanged()) return;

    const child = getValue(childSignal);

    const childChanged = child.hasChanged();
    if (childChanged) {
      child.compute(this);
      child.draw();
    }

    let freeSpace = this.computedWidth - this.#occupiedWidth;
    if (freeSpace <= 0) return;

    const offsetY = normalizeUnit(this.y, this.computedHeight - child.computedHeight);

    if (childChanged || !child.computedLeft) {
      child.computedTop += offsetY;
      child.computedLeft += this.#occupiedWidth;
      child.computedLeft += this.computedX;
    }

    let gapString = "";
    if (this.#occupiedWidth !== 0 && this.computedGap > 0) {
      const gapLinesInBounds = Math.min(freeSpace, this.computedGap);
      gapString = " ".repeat(gapLinesInBounds);

      this.#occupiedWidth += gapLinesInBounds;
      freeSpace -= gapLinesInBounds;
    }

    if (freeSpace <= 0) return;

    if (child.computedWidth <= freeSpace) {
      // TODO: compute styledLine?
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
        this.lines[i] += gapString + cropEnd(line, freeSpace) + "\x1b[0m";
      }
      this.#occupiedWidth += freeSpace;
    }
  }

  finishLayout(): void {
    if (!this.hasChanged()) return;
    this.changed = false;

    if (this.computedX < 0) {
      const padRight = " ".repeat(this.computedWidth - this.#occupiedWidth - this.computedX);
      const croppedLineWidth = this.computedWidth + this.computedX;

      for (let i = 0; i < this.lines.length; ++i) {
        const paddedLine = cropStart(this.lines[i], croppedLineWidth) + padRight;
        this.lines[i] = this.string ? this.string(paddedLine) : paddedLine;
      }
      return;
    }

    if (!this.computedX && !this.string) return;

    const padLeft = " ".repeat(this.computedX);
    const padRight = " ".repeat(this.computedWidth - this.#occupiedWidth - this.computedX);

    for (let i = 0; i < this.lines.length; ++i) {
      const paddedLine = padLeft + this.lines[i] + padRight;
      this.lines[i] = this.string ? this.string(paddedLine) : paddedLine;
    }
  }
}
