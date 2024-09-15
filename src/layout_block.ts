import { signal } from "@tui/signals";
import { Block } from "./block.ts";

export class LayoutBlock extends Block {
    name = "Layout";

    usedWidth = 0;
    usedHeight = 0;

    compute(parent: Block): void {
        super.compute(parent);
        this.usedWidth = 0;
        this.usedHeight = 0;
    }

    draw() {
        let { parent } = this;
        if (!parent) {
            const width = signal(0);
            const height = signal(0);

            const resize = () => {
                const { columns, rows } = Deno.consoleSize();
                width.set(columns);
                height.set(rows);
            };

            resize();
            Deno.addSignalListener("SIGWINCH", resize);

            parent = new Block({
                id: "terminal",
                width,
                height,
                children: [this],
            });
        }

        this.compute(parent);

        if (this.children) {
            this.startLayout(parent);
            for (const child of this.children) {
                this.layout(child);
            }
            this.finishLayout(parent);
        }

        this.changed = false;
    }

    startLayout(parent: Block): void;
    startLayout(): void {}

    finishLayout(parent: Block): void;
    finishLayout(): void {}

    layout(child: Block): void;
    layout(): void {}
}
