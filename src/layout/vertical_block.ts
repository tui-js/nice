import { cropEnd, cropStart } from "@tui/strings";
import { Block, type BlockOptions } from "../block.ts";
import { type NoAutoUnit, normalizeUnit, type Unit } from "../unit.ts";
import { flexibleCompute } from "./shared.ts";
import type { StringStyler } from "../types.ts";

export interface VerticalBlockOptions {
  string?: StringStyler;
  width?: Unit;
  height?: Unit;
  x?: NoAutoUnit;
  y?: NoAutoUnit;
  gap?: NoAutoUnit;
}

export class VerticalBlock extends Block {
  name = "Vertical";

  declare children: Block[];

  string?: StringStyler;
  x: NoAutoUnit;
  y: NoAutoUnit;
  gap: NoAutoUnit;

  computedY = 0;
  computedGap = 0;

  constructor(options: VerticalBlockOptions, ...children: Block[]) {
    options.width ??= "auto";
    options.height ??= "auto";
    super(options as BlockOptions);

    for (const child of children) {
      this.addChild(child);
    }

    this.x = options.x ?? 0;
    this.y = options.y ?? 0;
    this.gap = options.gap ?? 0;
    this.string = options.string;
  }

  compute(parent: Block): void {
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

    this.lines.length = 0;
  }

  layout(child: Block): void {
    let freeSpace = this.computedHeight - this.lines.length;
    if (freeSpace <= 0) return;

    if (freeSpace < this.computedHeight && this.computedGap > 0) {
      const emptyLine = " ".repeat(this.computedWidth);
      // TODO: compute styledLine?
      const styledLine = this.string ? this.string(emptyLine) : emptyLine;

      const gapLinesInBounds = Math.min(freeSpace, this.computedGap);
      for (let i = 0; i < gapLinesInBounds; ++i) {
        this.lines.push(styledLine);
      }
      freeSpace -= gapLinesInBounds;
    }

    if (freeSpace <= 0) return;

    // TODO: Decide whether child lines should be styled
    //       For now it seems like a good idea, however there might be some odd edge-cases

    child.computedTop += this.lines.length;
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

      child.computedLeft += computedX;
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
    if (!this.computedY) return;

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
