import { cropEnd, cropStart } from "@tui/strings";
import { effect, getValue, type MaybeSignal } from "@tui/signals";

import type { Block } from "../block.ts";
import { type NoAutoUnit, normalizeUnit, type Unit } from "../unit.ts";
import { flexibleCompute } from "./shared.ts";
import type { StringStyler } from "../types.ts";
import { LayoutBlock } from "../layout_block.ts";

export interface VerticalBlockOptions {
  id?: string;
  string?: StringStyler;
  width?: MaybeSignal<Unit>;
  height?: MaybeSignal<Unit>;
  x?: MaybeSignal<NoAutoUnit>;
  y?: MaybeSignal<NoAutoUnit>;
  gap?: MaybeSignal<NoAutoUnit>;
}

export class VerticalBlock extends LayoutBlock {
  name = "Vertical";

  declare children: Block[];

  string?: StringStyler;
  x!: NoAutoUnit;
  y!: NoAutoUnit;
  gap!: NoAutoUnit;

  computedY = 0;
  computedGap = 0;

  constructor(options: VerticalBlockOptions, ...children: MaybeSignal<Block>[]) {
    super({
      id: options.id,
      width: options.width ??= "auto",
      height: options.height ??= "auto",
      children,
    });

    effect(() => {
      this.string = getValue(options.string);
      this.x = getValue(options.x) ?? 0;
      this.y = getValue(options.y) ?? 0;
      this.gap = getValue(options.gap) ?? 0;

      this.changed = true;
    });
  }

  compute(parent: Block): void {
    super.compute(parent);

    this.usedWidth = 0;
    this.usedHeight = 0;
    this.computedTop = 0;

    this.computedGap = normalizeUnit(this.gap, this.computedHeight);
    if (this.computedGap < 0) throw new Error("Gap cannot be negative");

    flexibleCompute(this, parent, (i, child) => {
      this.usedWidth = Math.max(this.usedWidth, child.computedWidth);
      this.usedHeight += child.computedHeight;
      if (i !== 0) this.usedHeight += this.computedGap;
    });

    this.usedHeight = Math.min(this.computedHeight, this.usedHeight);
    this.computedY = normalizeUnit(this.y, this.computedHeight - this.usedHeight);

    this.computedTop += this.computedY;
  }

  startLayout(): void {
    this.lines.length = 0;
  }

  layout(child: Block): void {
    const childChanged = child.hasChanged();
    if (childChanged) {
      child.draw();
    }

    child.visible = false;

    let freeSpace = this.computedHeight - this.computedY - this.lines.length;
    if (freeSpace <= 0) return;

    if (freeSpace < this.computedHeight && this.computedGap > 0) {
      const emptyLine = " ".repeat(this.computedWidth);
      const styledLine = this.string ? this.string(emptyLine) : emptyLine;

      const gapLinesInBounds = Math.min(freeSpace, this.computedGap);
      for (let i = 0; i < gapLinesInBounds; ++i) {
        this.lines.push(styledLine);
      }
      freeSpace -= gapLinesInBounds;
    }

    if (freeSpace <= 0) return;

    child.visible = true;
    if (childChanged) {
      child.computedTop += this.lines.length;
    }

    const childLinesInBounds = Math.min(child.lines.length, freeSpace);

    if (child.computedWidth < this.computedWidth) {
      const widthDiff = this.computedWidth - child.computedWidth;
      const computedX = normalizeUnit(this.x, widthDiff);

      if (computedX < 0) {
        const padRight = " ".repeat(widthDiff - computedX);
        const croppedLineWidth = child.computedWidth + computedX;

        for (let i = 0; i < childLinesInBounds; ++i) {
          const line = cropStart(child.lines[i], croppedLineWidth);
          const paddedLine = line + padRight;
          this.lines.push(this.string ? this.string(paddedLine) : paddedLine);
        }
      } else {
        const padLeft = " ".repeat(computedX);
        const padRight = " ".repeat(widthDiff - computedX);

        for (let i = 0; i < childLinesInBounds; ++i) {
          const line = child.lines[i];
          const paddedLine = padLeft + line + padRight;
          this.lines.push(this.string ? this.string(paddedLine) : paddedLine);
        }
      }

      if (childChanged) {
        child.computedLeft += computedX;
      }
    } else if (child.computedWidth > this.computedWidth) {
      for (let i = 0; i < childLinesInBounds; ++i) {
        const line = child.lines[i];
        const croppedLine = cropEnd(line, this.computedWidth);
        this.lines.push(this.string ? this.string(croppedLine) : croppedLine);
      }
    } else {
      for (let i = 0; i < childLinesInBounds; ++i) {
        const line = child.lines[i];
        this.lines.push(this.string ? this.string(line) : line);
      }
    }
  }

  finishLayout(): void {
    const heightDiff = this.computedHeight - this.lines.length;

    if (this.computedY < 0) {
      for (let i = 0; i < -this.computedY; ++i) {
        this.lines.shift();
      }
      return;
    }

    const emptyLine = " ".repeat(this.computedWidth);
    const styledLine = this.string ? this.string(emptyLine) : emptyLine;

    for (let i = 0; i < this.computedY; ++i) {
      this.lines.unshift(styledLine);
    }

    for (let i = 0; i < heightDiff - this.computedY; ++i) {
      this.lines.push(styledLine);
    }
  }
}
