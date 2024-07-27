import { normalizeUnit } from "../unit.ts";
import type { Block } from "../block.ts";

interface BlockSize {
    width: number;
    height: number;
}

type CalculationCallback = (index: number, child: Block, size: BlockSize) => void;

/**
 * {@linkcode Block.compute} methods which computes width and height depending on its children sizes.
 */
export function flexibleCompute(self: Block, parent: Block, calculation: CalculationCallback): void {
    if (!self.children) {
        throw new Error(
            "flexibleCompute requires Block which implements it to always have children",
        );
    }

    if (self.width !== "auto") self.computedWidth = normalizeUnit(self.width, parent.computedWidth);
    if (self.height !== "auto") self.computedHeight = normalizeUnit(self.height, parent.computedHeight);
    if (self.width !== "auto" && self.height !== "auto") {
        for (const child of self.children) {
            child.compute(self);
        }
        return;
    }

    let i = 0;
    let deferred: Block[] | undefined;
    const size = { width: 0, height: 0 };
    for (const child of self.children) {
        if (
            (!child.computedWidth && self.width === "auto") ||
            (!child.computedHeight && self.height === "auto")
        ) {
            deferred ??= [];
            deferred.push(child);
            continue;
        }

        child.compute(self);
        calculation(i++, child, size);
    }

    if (deferred) {
        if (self.width === "auto") self.computedWidth = size.width;
        if (self.height === "auto") self.computedHeight = size.height;

        for (const child of deferred) {
            child.compute(self);
            calculation(i++, child, size);
        }
    }

    if ((self.width === "auto" && size.width === 0)) {
        throw new Error(`${self.name}'s width is set to "auto" yet has no children that have predictable width`);
    } else if (self.height === "auto" && size.height === 0) {
        throw new Error(`${self.name}'s height is set to "auto" yet has no children that have predictable height`);
    }

    if (self.width === "auto") self.computedWidth = size.width;
    if (self.height === "auto") self.computedHeight = size.height;
}
