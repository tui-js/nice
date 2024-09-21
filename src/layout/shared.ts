import { type NoAutoUnit, normalizeUnit } from "../unit.ts";
import type { Block } from "../block.ts";

type ComputationCallback = (index: number, child: Block) => void;
type BasicComputableBlock = Block & { width: NoAutoUnit; height: NoAutoUnit };

export function isBasicComputable(block: Block): block is BasicComputableBlock {
  return !block.autoParentDependant || (block.width !== "auto" && block.height !== "auto");
}

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
 * {@linkcode Block.compute} methods which computes width and height depending on its children sizes.
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
