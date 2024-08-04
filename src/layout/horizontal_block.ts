import { Block, type BlockOptions } from "../block.ts";
import { type NoAutoUnit, normalizeUnit, type Unit } from "../unit.ts";
import { flexibleCompute } from "./shared.ts";
import type { StringStyler } from "../types.ts";
import { cropEnd } from "@tui/strings";

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

  declare children: Block[];

  string?: StringStyler;
  x: NoAutoUnit;
  y: NoAutoUnit;
  gap: NoAutoUnit;

  computedX = 0;
  computedGap = 0;

  #occupiedWidth = 0;

  constructor(options: HorizontalBlockOptions, ...children: Block[]) {
    options.width ??= "auto";
    options.height ??= "auto";
    super(options as BlockOptions);

    for (const child of children) {
      this.addChild(child);
    }

    this.y = options.y ?? 0;
    this.x = options.x ?? 0;
    this.gap = options.gap ?? 0;
    this.string = options.string;
  }

  compute(parent: Block): void {
    this.computedGap = normalizeUnit(this.gap, this.computedHeight);
    if (this.computedGap < 0) throw new Error("Gap cannot be negative");

    flexibleCompute(this, parent, (i, child) => {
      if (i !== 0) this.usedWidth += this.computedGap;

      child.computedLeft += this.usedWidth;

      this.usedWidth += child.computedWidth;
      this.usedHeight = Math.max(this.usedHeight, child.computedHeight);
    });

    this.computedX = normalizeUnit(this.x, this.computedWidth - this.usedWidth);
    this.#occupiedWidth = 0;
  }

  layout(child: Block): void {
    let freeSpace = this.computedWidth - this.#occupiedWidth;
    if (freeSpace <= 0) return;

    const offsetY = normalizeUnit(this.y, this.computedHeight - child.computedHeight);
    child.computedTop += offsetY;
    child.computedLeft += this.computedX;

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
    const lacksLeft = this.computedX;
    const lacksRight = this.computedWidth - this.#occupiedWidth - lacksLeft;

    if (lacksLeft <= 0 && lacksRight <= 0 && !this.string) return;

    const padLeft = " ".repeat(lacksLeft);
    const padRight = " ".repeat(lacksRight);

    for (let i = 0; i < this.lines.length; ++i) {
      const paddedLine = padLeft + this.lines[i] + padRight;
      this.lines[i] = this.string ? this.string(paddedLine) : paddedLine;
    }
  }
}
