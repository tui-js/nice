import { type NoAutoUnit, normalizeUnit } from "../unit.ts";
import type { Block } from "../block.ts";
import type { LayoutBlock } from "../layout_block.ts";

export interface BasicComputableBlock extends Block {
  width: NoAutoUnit;
  height: NoAutoUnit;
}

type ComputationCallback = (index: number, child: Block) => void;

/**
 * Checks whether {@linkcode block} can be computed only by knowing its own or its parent size.
 */
export function isBasicComputable(block: Block): block is BasicComputableBlock {
  return !block.autoParentDependant || (block.width !== "auto" && block.height !== "auto");
}

/**
 * {@linkcode Block.compute} of {@linkcode self} depending on its children.
 *
 * It's used when both width and height of {@linkcode self} are known to not be `"auto"`,
 * thus initial size can be computed directly from {@linkcode parent}.
 *
 * Most of the time it shouldn't be used directly and {@linkcode flexibleCompute} should be used instead.\
 * {@linkcode flexibleCompute} detects whether {@linkcode self} is an {@linkcode BasicComputableBlock} and calls
 * this method when appropriate.
 *
 * @example Same as flexibleCompute
 */
export function basicCompute(self: BasicComputableBlock, parent: Block, computation: ComputationCallback): void {
  if (!self.children) {
    return;
  }

  self.computedWidth = normalizeUnit(self.width, parent.computedWidth, parent.usedWidth);
  self.computedHeight = normalizeUnit(self.height, parent.computedHeight, parent.usedHeight);

  let i = 0;
  for (const child of self.children) {
    if (child.hasChanged()) {
      child.compute(self);
    }
    computation(i++, child);
  }
}

/**
 * {@linkcode Block.compute} method which computes width and height of {@linkcode self} depending on its children.
 *
 * @example
 * Compute element so its bounding box fits all its children vertically
 * ```ts
 * flexibleCompute(this, parent, (i, child) => {
 *   this.usedWidth = Math.max(this.usedWidth, child.computedWidth);
 *   this.usedHeight += child.computedHeight;
 * }
 * ```
 */
export function flexibleCompute(self: LayoutBlock, parent: Block, computation: ComputationCallback): void {
  if (!self.children) {
    return;
  }

  if (isBasicComputable(self)) {
    return basicCompute(self, parent, computation);
  }

  if (self.width !== "auto") {
    self.computedWidth = normalizeUnit(
      self.width,
      parent.computedWidth,
      parent.usedWidth,
    );
  }
  if (self.height !== "auto") {
    self.computedHeight = normalizeUnit(
      self.height,
      parent.computedHeight,
      parent.usedHeight,
    );
  }

  let i = 0;
  let deferred: Block[] | undefined;
  for (const child of self.children) {
    if (!isBasicComputable(child)) {
      deferred ??= [];
      deferred.push(child);
      continue;
    }

    if (child.hasChanged()) {
      child.compute(self);
    }
    computation(i++, child);
  }

  if (deferred) {
    if (self.width === "auto") self.computedWidth = self.usedWidth;
    if (self.height === "auto") self.computedHeight = self.usedHeight;

    for (const child of deferred) {
      if (child.hasChanged()) {
        child.compute(self);
      }
      computation(i++, child);
    }
  }

  if ((self.width === "auto" && self.usedWidth === 0)) {
    throw new Error(`${self.name}'s width is set to "auto" yet has no children that have predictable width`);
  } else if (self.height === "auto" && self.usedHeight === 0) {
    throw new Error(`${self.name}'s height is set to "auto" yet has no children that have predictable height`);
  }

  if (self.width === "auto") self.computedWidth = self.usedWidth;
  if (self.height === "auto") self.computedHeight = self.usedHeight;
}
