import { type NoAutoUnit, normalizeUnit } from "../unit.ts";
import type { Block } from "../block.ts";
import type { MaybeSignal } from "../../../signals/mod.ts";
import { getValue } from "../../../signals/src/base.ts";

type ComputationCallback = (index: number, child: Block) => void;
type BasicComputableBlock = MaybeSignal<Block & { width: NoAutoUnit; height: NoAutoUnit }>;

export function isBasicComputable(blockSignal: MaybeSignal<Block>): blockSignal is BasicComputableBlock {
  const block = getValue(blockSignal);
  return !block.autoParentDependant || (block.width !== "auto" && block.height !== "auto");
}

// TODO: Use custom basicCompute in layouts, because children might overflow it, so it might need to adjust the final child width
export function basicCompute(selfSignal: BasicComputableBlock, parent: Block, computation: ComputationCallback): void {
  const self = getValue(selfSignal);

  if (!self.children) {
    return;
  }

  self.computedWidth = normalizeUnit(self.width, parent.computedWidth, parent.usedWidth);
  self.computedHeight = normalizeUnit(self.height, parent.computedHeight, parent.usedHeight);

  let i = 0;
  for (const childSignal of self.children) {
    const child = getValue(childSignal);
    child.compute(self);
    child.draw();
    computation(i++, child);
  }
}

/**
 * {@linkcode Block.compute} methods which computes width and height depending on its children sizes.
 */
export function flexibleCompute(self: Block, parent: Block, computation: ComputationCallback): void {
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
  for (const childSignal of self.children) {
    const child = getValue(childSignal);

    if (!isBasicComputable(child)) {
      deferred ??= [];
      deferred.push(child);
      continue;
    }

    child.compute(self);
    child.draw();
    computation(i++, child);
  }

  if (deferred) {
    if (self.width === "auto") self.computedWidth = self.usedWidth;
    if (self.height === "auto") self.computedHeight = self.usedHeight;

    for (const child of deferred) {
      child.compute(self);
      child.draw();
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
