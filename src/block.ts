import { normalizeUnit, type Unit } from "./unit.ts";

// FIXME: Negative values

export interface BlockOptions {
    width: Unit;
    height: Unit;
}

export class Block {
    width: Unit;
    height: Unit;

    computedTop = 0;
    computedLeft = 0;
    computedWidth = 0;
    computedHeight = 0;

    children?: Block[];

    lines: string[] = [];

    constructor(options: BlockOptions) {
        this.width = options.width;
        this.height = options.height;
        if (typeof this.width === "number") this.computedWidth = this.width;
        if (typeof this.height === "number") this.computedHeight = this.height;
    }

    addChild(block: Block): void {
        this.children ??= [];
        this.children.push(block);
    }

    draw() {
        if (!this.computedHeight || !this.computedWidth) {
            const { rows, columns } = Deno.consoleSize();
            const terminal = new Block({ height: rows, width: columns });
            this.compute(terminal);
        }

        if (this.children) {
            for (const child of this.children) {
                this.layout(child);
            }
        }

        this.finishLayout();
    }

    layout(_child: Block): void {
        throw new Error("Default block doesn't implement 'Block.layout'");
    }

    finishLayout(): void {}

    compute(parent: Block): void {
        this.computedWidth = normalizeUnit(this.width, parent.computedWidth);
        this.computedHeight = normalizeUnit(this.height, parent.computedHeight);

        if (this.children) {
            for (const child of this.children) {
                child.compute(this);
            }
        }
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
