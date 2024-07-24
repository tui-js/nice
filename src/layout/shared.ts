import { normalizeUnit } from "../unit.ts";
import type { Block } from "../block.ts";

interface BlockSize {
    width: number;
    height: number;
}

type CalculationCallback = (child: Block, size: BlockSize) => void;

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

    if (self.computedWidth && self.computedHeight) {
        for (const child of self.children) {
            child.compute(self);
        }
        return;
    }

    let deferred: Block[] | undefined;
    const size = { width: 0, height: 0 };
    for (const child of self.children) {
        if (
            (!child.computedWidth && !self.computedWidth) ||
            (!child.computedHeight && !self.computedHeight)
        ) {
            deferred ??= [];
            deferred.push(child);
            continue;
        }

        child.compute(self);
        calculation(child, size);
    }

    if (deferred) {
        for (const child of deferred) {
            child.compute(self);
            calculation(child, size);
        }
    }

    if ((self.width === "auto" && size.width === 0)) {
        throw new Error(`${self.name}'s width is set to "auto" yet has no children that have predictable width`);
    } else if (self.height === "auto" && size.height === 0) {
        throw new Error(`${self.name}'s height is set to "auto" yet has no children that have predictable height`);
    }

    if (self.width === "auto") {
        self.computedWidth = size.width;
    }

    if (self.height === "auto") {
        self.computedHeight = size.height;
    }
}
