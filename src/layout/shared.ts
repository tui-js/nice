import { normalizeUnit } from "../unit.ts";
import type { Block } from "../block.ts";

/**
 * {@linkcode Block.compute} methods which computes width and height depending on its children sizes.
 */
export function flexibleCompute(this: Block, parent: Block): void {
    if (!this.children) {
        throw new Error(
            "flexibleCompute requires Block which implements it to always have children",
        );
    }

    let deferred: Block[] | undefined;

    if (this.width !== "auto") {
        this.computedWidth = normalizeUnit(this.width, parent.computedWidth);
    }

    if (this.height !== "auto") {
        this.computedHeight = normalizeUnit(this.height, parent.computedHeight);
    }

    if (this.computedWidth && this.computedHeight) {
        for (const child of this.children) {
            child.compute(this);
        }
        return;
    }

    let width = 0;
    let height = 0;
    for (const child of this.children) {
        if (
            (!child.computedWidth && !this.computedWidth) ||
            (!child.computedHeight && !this.computedHeight)
        ) {
            deferred ??= [];
            deferred.push(child);
            continue;
        }

        width += child.computedWidth;
        height = Math.max(height, child.computedHeight);

        child.compute(this);
    }

    this.computedWidth ||= width;
    this.computedHeight ||= height;

    if (!deferred) return;

    for (const child of deferred) {
        child.compute(this);
    }
}
