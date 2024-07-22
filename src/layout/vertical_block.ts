import { cropEnd } from "@tui/strings";
import { Block, type BlockOptions } from "../block.ts";
import { normalizeUnit, type Unit } from "../unit.ts";
import { flexibleCompute } from "./shared.ts";
import type { StringStyler } from "../types.ts";

interface VerticalBlockOptions {
    string?: StringStyler;
    width?: Unit;
    height?: Unit;
    verticalAlign?: Unit;
    horizontalAlign?: Unit;
    gap?: Unit;
}

export class VerticalBlock extends Block {
    declare children: Block[];

    #occupiedHeight = 0;

    string?: StringStyler;
    horizontalAlign: Unit;
    verticalAlign: Unit;
    gap: Unit;

    computedGap = 0;

    constructor(options: VerticalBlockOptions, ...children: Block[]) {
        options.width ??= "auto";
        options.height ??= "auto";
        super(options as BlockOptions);

        this.children = children;
        this.horizontalAlign = options.horizontalAlign ?? 0;
        this.verticalAlign = options.verticalAlign ?? 0;
        this.gap = options.gap ?? 0;
        this.string = options.string;
    }

    compute(parent: Block): void {
        flexibleCompute(this, parent);

        this.computedGap = normalizeUnit(this.gap, this.computedHeight);
        if (this.computedGap < 0) throw new Error("Gap cannot be negative");

        if (this.height === "auto") {
            this.computedHeight += (this.children.length - 2) * this.computedGap;
        }
    }

    layout(child: Block): void {
        child.draw();

        const widthDiff = this.computedWidth - child.computedWidth;
        const offsetX = normalizeUnit(this.horizontalAlign, widthDiff);

        // FIXME: VerticalBlock.computedTop
        child.computedTop = this.computedTop + this.computedHeight;
        child.computedLeft = this.computedLeft + offsetX;

        const leftVerticalSpace = this.computedHeight - this.lines.length;
        if (leftVerticalSpace <= 0) return;

        let linesInBounds = Math.min(child.lines.length, leftVerticalSpace);

        // Gap
        if (this.#occupiedHeight !== 0) {
            const emptyLine = " ".repeat(this.computedWidth);
            const styledLine = this.string ? this.string(emptyLine) : emptyLine;

            const gapLinesInBounds = Math.min(linesInBounds, this.computedGap);

            this.#occupiedHeight += this.computedGap;
            for (let i = 0; i < gapLinesInBounds; ++i) {
                this.lines.push(styledLine);
            }
            linesInBounds -= gapLinesInBounds;
        }

        // TODO: Decide whether child lines should be styled
        //       For now it seems like a good idea, however there might be some odd edge-cases

        // Align and add child lines
        this.#occupiedHeight += linesInBounds;
        if (child.computedWidth < this.computedWidth) {
            // FIXME: what if offsetX > width or something?
            const lacksLeft = offsetX;
            const lacksRight = widthDiff - lacksLeft;
            const padLeft = " ".repeat(lacksLeft);
            const padRight = " ".repeat(lacksRight);

            for (let i = 0; i < linesInBounds; ++i) {
                const line = child.lines[i];
                const paddedLine = padLeft + cropEnd(line, this.computedWidth) + padRight;
                this.lines.push(this.string ? this.string(paddedLine) : paddedLine);
            }
        } else if (child.computedWidth > this.computedWidth) {
            for (let i = 0; i < linesInBounds; ++i) {
                const line = child.lines[i];
                const croppedLine = cropEnd(line, this.computedWidth);
                this.lines.push(this.string ? this.string(croppedLine) : croppedLine);
            }
        } else {
            for (let i = 0; i < linesInBounds; ++i) {
                const line = child.lines[i];
                this.lines.push(this.string ? this.string(line) : line);
            }
        }
    }

    finishLayout(): void {
        const heightDiff = this.computedHeight - this.#occupiedHeight;
        const offsetY = normalizeUnit(this.verticalAlign, heightDiff);
        if (offsetY === 0) return;

        const lacksTop = offsetY;
        const lacksBottom = heightDiff - lacksTop;

        const emptyLine = " ".repeat(this.computedWidth);
        const styledLine = this.string ? this.string(emptyLine) : emptyLine;

        for (let i = 0; i < lacksTop; ++i) {
            this.lines.unshift(styledLine);
        }

        for (let i = 0; i < lacksBottom; ++i) {
            this.lines.push(styledLine);
        }
    }
}
