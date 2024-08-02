import { Block } from "../block.ts";
import { type NoAutoUnit, normalizeUnit } from "#src/unit.ts";
import { insert } from "@tui/strings";

export interface OverlayBlockOptions {
    bg: Block;
    fg: Block;
    x: NoAutoUnit;
    y: NoAutoUnit;
}

export class OverlayBlock extends Block {
    name = "Overlay";

    declare children: [bg: Block, fg: Block];

    x: NoAutoUnit;
    y: NoAutoUnit;
    computedX = 0;
    computedY = 0;

    constructor({ bg, fg, x, y }: OverlayBlockOptions) {
        super({ width: bg.width, height: bg.height });

        this.addChild(bg);
        this.addChild(fg);

        this.x = x;
        this.y = y;
    }

    compute(parent: Block): void {
        const [bg, fg] = this.children;

        bg.compute(parent);
        bg.draw();
        fg.compute(parent);
        fg.draw();

        this.computedWidth = bg.computedWidth;
        this.computedHeight = bg.computedHeight;

        this.computedX = normalizeUnit(this.x, bg.computedWidth - fg.computedWidth);
        this.computedY = normalizeUnit(this.y, bg.computedHeight - fg.computedHeight);

        fg.computedTop += this.computedY;
        fg.computedLeft += this.computedX;
    }

    layout(): void {}

    finishLayout(): void {
        const [bg, fg] = this.children;

        for (let bgLinePos = 0; bgLinePos < bg.computedHeight; ++bgLinePos) {
            const fgLinePos = bgLinePos - this.computedY;
            const bgLine = bg.lines[bgLinePos];

            if (fgLinePos < 0 || fgLinePos >= fg.computedHeight) {
                this.lines.push(bgLine);
                continue;
            }

            const fgLine = fg.lines[fgLinePos];
            if (fg.computedWidth === bg.computedWidth) {
                this.lines.push(fgLine);
            } else {
                this.lines.push(insert(bgLine, fgLine, this.computedX, true));
            }
        }
    }
}
