import type { Unit } from "./unit.ts";

// FIXME: Negative values

export const createdBlocks: Block[] = [];

export interface BlockOptions {
    width: Unit;
    height: Unit;
}

export interface BoundingRectangle {
    top: number;
    left: number;
    width: number;
    height: number;
}

export class Block {
    name?: string;

    // Whether block depends on parent when width or height are set to "auto"
    autoParentDependant = true;
    width: Unit;
    height: Unit;

    computedTop = 0;
    computedLeft = 0;
    computedWidth = 0;
    computedHeight = 0;

    usedWidth = 0;
    usedHeight = 0;

    parent?: Block;
    children?: Block[];

    lines: string[] = [];

    constructor(options: BlockOptions) {
        this.width = options.width;
        this.height = options.height;
        if (typeof this.width === "number") this.computedWidth = this.width;
        if (typeof this.height === "number") this.computedHeight = this.height;
        createdBlocks.push(this);
    }

    boundingRectangle(): BoundingRectangle {
        let top = this.computedTop;
        let left = this.computedLeft;

        let parent = this.parent;
        while (parent) {
            top += parent.computedTop;
            left += parent.computedLeft;
            parent = parent.parent;
        }

        return { top, left, width: this.computedWidth, height: this.computedHeight };
    }

    addChild(block: Block): void {
        this.children ??= [];
        this.children.push(block);
    }

    draw() {
        if (!this.computedHeight || !this.computedWidth) {
            const { rows, columns } = Deno.consoleSize();
            const terminal = new Block({ height: rows, width: columns });
            this.parent = terminal;
            this.compute(terminal);
            this.draw();
        }

        if (this.children) {
            for (const child of this.children) {
                this.layout(child);
            }
            this.finishLayout();
        }
    }

    layout(_child: Block): void {
        throw new Error("Default block doesn't implement 'Block.layout'");
    }

    finishLayout(): void {
        throw new Error("Default block doesn't implement 'Block.finishLayout'");
    }

    compute(_parent: Block): void {
        throw new Error("Default block doesn't implement 'Block.compute'");
    }

    render(relative = false): string {
        if (relative) {
            // This does these steps to render lines in correct position no matter the cursor position:
            //  1. Save cursor position
            //  2. Line
            //  3. Reset cursor position
            //  4. Move cursor down
            //  5. Save cursor position
            return `\x1b${this.lines.join("\x1b8\x1b[1B\x1b7")}`;
        }

        return this.lines.join("\n");
    }
}
