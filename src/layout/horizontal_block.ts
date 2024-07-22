import { Block, type BlockOptions } from "../block.ts";
import { normalizeUnit, type Unit } from "../unit.ts";
import { flexibleCompute } from "./shared.ts";
import type { StringStyler } from "../types.ts";

interface HorizontalBlockOptions {
    string?: StringStyler;
    width?: Unit;
    height?: Unit;
    verticalAlign?: Unit;
    horizontalAlign?: Unit;
}

export class HorizontalBlock extends Block {
    declare children: Block[];

    #occupiedWidth = 0;

    string?: StringStyler;
    verticalAlign: Unit;
    horizontalAlign: Unit;

    constructor(options: HorizontalBlockOptions, ...children: Block[]) {
        options.width ??= "auto";
        options.height ??= "auto";
        super(options as BlockOptions);

        this.children = children;
        this.verticalAlign = options.verticalAlign ?? 0;
        this.horizontalAlign = options.horizontalAlign ?? 0;
        this.string = options.string;
    }

    compute(parent: Block): void {
        flexibleCompute(this, parent);
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

        this.#occupiedWidth += child.computedWidth;
        const line = " ".repeat(child.computedWidth);
        for (let i = 0; i < this.computedHeight; ++i) {
            this.lines[i] ??= "";
            this.lines[i] += child.lines[i - offsetY] ?? line;
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
