import { Block, type BlockOptions } from "../block.ts";
import { normalizeUnit, type Unit } from "../unit.ts";
import { flexibleCompute } from "./shared.ts";
import type { StringStyler } from "../types.ts";
import { cropEnd } from "@tui/strings";

interface HorizontalBlockOptions {
    string?: StringStyler;
    width?: Unit;
    height?: Unit;
    verticalAlign?: Unit;
    horizontalAlign?: Unit;
    gap?: Unit;
}

export class HorizontalBlock extends Block {
    name = "Horizontal";

    declare children: Block[];

    string?: StringStyler;
    verticalAlign: Unit;
    horizontalAlign: Unit;
    gap: Unit;

    computedGap = 0;
    #occupiedWidth = 0;

    constructor(options: HorizontalBlockOptions, ...children: Block[]) {
        options.width ??= "auto";
        options.height ??= "auto";
        super(options as BlockOptions);

        this.children = children;
        this.verticalAlign = options.verticalAlign ?? 0;
        this.horizontalAlign = options.horizontalAlign ?? 0;
        this.gap = options.gap ?? 0;
        this.string = options.string;
    }

    compute(parent: Block): void {
        flexibleCompute(this, parent, (child, size) => {
            size.width += child.computedWidth;
            size.height = Math.max(size.height, child.computedHeight);
        });

        this.computedGap = normalizeUnit(this.gap, this.computedHeight);
        if (this.computedGap < 0) throw new Error("Gap cannot be negative");

        if (this.width === "auto") {
            this.computedWidth += (this.children.length - 1) * this.computedGap;
        }
    }

    layout(child: Block): void {
        child.draw();

        const offsetX = normalizeUnit(
            this.horizontalAlign,
            this.computedWidth - child.computedWidth,
        );
        // FIXME: child computedLeft
        child.computedLeft = this.computedLeft + offsetX;

        const offsetY = normalizeUnit(
            this.verticalAlign,
            this.computedHeight - child.computedHeight,
        );
        child.computedTop = this.computedTop + offsetY;

        let maxWidthInBounds = this.computedWidth - this.#occupiedWidth;
        if (maxWidthInBounds <= 0) return;

        // Gap
        let gapString = "";
        if (this.#occupiedWidth !== 0 && this.computedGap) {
            const gapWidthInBounds = Math.min(maxWidthInBounds, this.computedGap);

            gapString = " ".repeat(gapWidthInBounds);
            if (this.string) gapString = this.string(gapString);

            this.#occupiedWidth += gapWidthInBounds;
            maxWidthInBounds -= gapWidthInBounds;
        }

        const line = " ".repeat(child.computedWidth);

        // Align and add child lines
        if (child.computedWidth <= maxWidthInBounds) {
            this.#occupiedWidth += child.computedWidth;

            for (let i = 0; i < this.computedHeight; ++i) {
                this.lines[i] ??= "";
                this.lines[i] += gapString + (child.lines[i - offsetY] ?? line);
            }
        } else {
            this.#occupiedWidth += maxWidthInBounds;

            for (let i = 0; i < this.computedHeight; ++i) {
                this.lines[i] ??= "";
                this.lines[i] += gapString + cropEnd(
                    child.lines[i - offsetY] ?? line,
                    maxWidthInBounds,
                );
            }
        }
    }

    finishLayout(): void {
        // FIXME: What if occupiedWidth > computedWidth
        const widthDiff = this.computedWidth - this.#occupiedWidth;
        const offsetX = normalizeUnit(this.horizontalAlign, widthDiff);

        const lacksLeft = offsetX;
        const lacksRight = widthDiff - lacksLeft;
        const padLeft = " ".repeat(lacksLeft);
        const padRight = " ".repeat(lacksRight);

        for (let i = 0; i < this.lines.length; ++i) {
            const line = this.lines[i];
            const paddedLine = padLeft + line + padRight;
            this.lines[i] = this.string ? this.string(paddedLine) : paddedLine;
        }
    }
}
