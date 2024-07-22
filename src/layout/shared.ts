import { normalizeUnit } from "../unit.ts";
import type { Block } from "../block.ts";

/**
 * {@linkcode Block.compute} methods which computes width and height depending on its children sizes.
 */
export function flexibleCompute(self: Block, parent: Block): void {
    if (!self.children) {
        throw new Error(
            "flexibleCompute requires Block which implements it to always have children",
        );
    }

    let deferred: Block[] | undefined;

    if (self.width !== "auto") {
        self.computedWidth = normalizeUnit(self.width, parent.computedWidth);
    }

    if (self.height !== "auto") {
        self.computedHeight = normalizeUnit(self.height, parent.computedHeight);
    }

    if (self.computedWidth && self.computedHeight) {
        for (const child of self.children) {
            child.compute(self);
        }
        return;
    }

    let width = 0;
    let height = 0;
    for (const child of self.children) {
        if (
            (!child.computedWidth && !self.computedWidth) ||
            (!child.computedHeight && !self.computedHeight)
        ) {
            deferred ??= [];
            deferred.push(child);
            continue;
        }

        width += child.computedWidth;
        height += child.computedHeight;

        child.compute(self);
    }

    self.computedWidth ||= width;
    self.computedHeight ||= height;

    if (!deferred) return;

    for (const child of deferred) {
        child.compute(self);
    }
}
