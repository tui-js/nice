import { cropEnd } from "@tui/strings";
import { Block, type BlockOptions } from "../block.ts";
import { type NoAutoUnit, normalizeUnit, type Unit } from "../unit.ts";
import { flexibleCompute } from "./shared.ts";
import type { StringStyler } from "../types.ts";

interface VerticalBlockOptions {
    string?: StringStyler;
    width?: Unit;
    height?: Unit;
    verticalAlign?: NoAutoUnit;
    horizontalAlign?: NoAutoUnit;
    gap?: NoAutoUnit;
}

export class VerticalBlock extends Block {
    name = "Vertical";

    declare children: Block[];

    string?: StringStyler;
    horizontalAlign: NoAutoUnit;
    verticalAlign: NoAutoUnit;
    gap: NoAutoUnit;

    computedGap = 0;

    constructor(options: VerticalBlockOptions, ...children: Block[]) {
        options.width ??= "auto";
        options.height ??= "auto";
        super(options as BlockOptions);

        for (const child of children) {
            this.addChild(child);
        }

        this.horizontalAlign = options.horizontalAlign ?? 0;
        this.verticalAlign = options.verticalAlign ?? 0;
        this.gap = options.gap ?? 0;
        this.string = options.string;
    }

    compute(parent: Block): void {
        // TODO: Consider moving normalization of units into compute
        this.computedGap = normalizeUnit(this.gap, this.computedHeight);
        if (this.computedGap < 0) throw new Error("Gap cannot be negative");

        flexibleCompute(this, parent, (i, child) => {
            this.usedWidth = Math.max(this.usedWidth, child.computedWidth);
            this.usedHeight += child.computedHeight;
            if (i !== 0) this.usedHeight += this.computedGap;
        });
    }

    layout(child: Block): void {
        let maxLinesInBounds = this.computedHeight - this.lines.length;
        if (maxLinesInBounds <= 0) return;

        //#region Gap
        if (this.lines.length !== 0 && this.computedGap) {
            const emptyLine = " ".repeat(this.computedWidth);
            const styledLine = this.string ? this.string(emptyLine) : emptyLine;

            const gapLinesInBounds = Math.min(maxLinesInBounds, this.computedGap);
            for (let i = 0; i < gapLinesInBounds; ++i) {
                this.lines.push(styledLine);
            }

            maxLinesInBounds -= gapLinesInBounds;
        }
        //#endregion

        // TODO: Decide whether child lines should be styled
        //       For now it seems like a good idea, however there might be some odd edge-cases

        //#region Align and add child lines
        child.computedTop += this.lines.length;
        const childLinesInBounds = Math.min(child.lines.length, maxLinesInBounds);
        if (child.computedWidth < this.computedWidth) {
            const widthDiff = this.computedWidth - child.computedWidth;
            const offsetX = normalizeUnit(this.horizontalAlign, widthDiff);

            // FIXME: what if offsetX > width or something?
            const lacksLeft = offsetX;
            const lacksRight = widthDiff - lacksLeft;
            const padLeft = " ".repeat(lacksLeft);
            const padRight = " ".repeat(lacksRight);

            for (let i = 0; i < childLinesInBounds; ++i) {
                const line = child.lines[i];
                const paddedLine = padLeft + cropEnd(line, this.computedWidth) + padRight;
                this.lines.push(this.string ? this.string(paddedLine) : paddedLine);
            }

            child.computedLeft += offsetX;
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
        //#endregion
    }

    finishLayout(): void {
        const heightDiff = this.computedHeight - this.lines.length;
        const offsetY = normalizeUnit(this.verticalAlign, heightDiff);

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
