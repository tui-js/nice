import { BaseSignal, computed, type MaybeSignal } from "@tui/signals";

import type { Unit } from "./unit.ts";
import type { MaybeSignalValues } from "./types.ts";
import { maybeComputed } from "./utils.ts";

export type BlockOptions =
  & {
    id?: string;
    children?: MaybeSignal<Block>[];
  }
  & MaybeSignalValues<{
    width: Unit;
    height: Unit;
  }>;

export interface BoundingRectangle {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface BlockEventListeners {
  mount: (() => void)[];
  unmount: (() => void)[];
  resize: (() => void)[];
}

export class Block {
  name = "Block";
  id: string;

  listeners: BlockEventListeners = {
    mount: [],
    unmount: [],
    resize: [],
  };

  // Whether block depends on parent when width or height are set to "auto"
  autoParentDependant = true;
  width!: Unit;
  height!: Unit;

  visible = true;
  changed = true;

  computedTop = 0;
  computedLeft = 0;
  computedWidth = 0;
  computedHeight = 0;

  previousWidth = 0;
  previousHeight = 0;

  usedWidth?: number;
  usedHeight?: number;

  parent?: Block;
  children?: Block[];

  lines: string[] = [];

  constructor(options: BlockOptions) {
    this.id = options.id ?? "not set";

    const { width, height } = options;

    maybeComputed(width, (width) => {
      this.width = width;
      if (typeof this.width === "number") {
        this.computedWidth = this.width;
      }
      this.changed = true;
    });

    maybeComputed(height, (height) => {
      this.height = height;
      if (typeof this.height === "number") {
        this.computedHeight = this.height;
      }
      this.changed = true;
    });

    if (!options.children) return;

    for (const [position, child] of options.children.entries()) {
      if (!(child instanceof BaseSignal)) {
        this.addChild(child, position);
        continue;
      }

      let previousChild: Block | undefined;
      computed([child], (child) => {
        if (previousChild) {
          if (child.similiarTo(previousChild)) {
            return;
          }
          this.removeChild(previousChild);
        }

        this.addChild(child, position);
        previousChild = child;

        this.parent?.forceChange();
      });
    }
  }

  similiarTo(other: Block): boolean {
    if (this === other) return true;

    if (this.id !== other.id) {
      return false;
    }

    if (this.children?.length) {
      if (!other.children?.length) return false;
      if (this.children.length !== other.children.length) return false;

      for (let i = 0; i < this.children.length; ++i) {
        const child = this.children[i];
        const otherChild = other.children![i];

        if (!child.similiarTo(otherChild)) return false;
      }
    } else if (other.children?.length) {
      return false;
    }

    return true;
  }

  forceChange(): void {
    this.changed = true;

    if (this.children) {
      for (const child of this.children) {
        child.forceChange();
      }
    }
  }

  hasChanged(): boolean {
    // TODO: This might be unnecesarily slow
    return (this.changed = this.changed || (this.children?.some((block) => block.hasChanged()) ?? false));
  }

  addEventListener(event: keyof BlockEventListeners, listener: () => void) {
    this.listeners[event].push(listener);
  }

  maybeResize() {
    if (
      this.computedWidth === this.previousWidth &&
      this.computedHeight === this.previousHeight
    ) return;

    this.resize();
  }

  resize() {
    for (const listener of this.listeners.resize) {
      listener();
    }
  }

  mount() {
    this.changed = true;
    for (const listener of this.listeners.mount) {
      listener();
    }

    if (this.children) {
      for (const child of this.children) child.mount();
    }
  }

  unmount() {
    for (const listener of this.listeners.unmount) {
      listener();
    }

    if (this.children) {
      for (const child of this.children) child.unmount();
    }
  }

  addChild(block: Block, position?: number): void {
    block.parent = this;

    this.children ??= [];
    if (typeof position === "number") {
      this.children.splice(position, 0, block);
    } else {
      this.children.push(block);
    }

    block.mount();
    this.changed = true;
  }

  clearChildren(): void {
    if (!this.children) return;
    for (const child of this.children.splice(0)) {
      child.parent = undefined;
      child.unmount();
    }
    this.changed = true;
  }

  removeChild(block: Block): void {
    block.parent = undefined;

    const index = this.children?.findIndex((value) => value === block || value === block);
    if (typeof index !== "number" || index === -1) {
      return;
    }

    this.children!.splice(index, 1);
    block.unmount();
    this.changed = true;
  }

  draw() {
    throw new Error("Default Block doesn't implement `draw`");
  }

  compute(parent: Block): void;
  compute(): void {
    this.visible = true;

    // We call resize in case both units were statically analyzable during construction
    // Such, they started with a computed width and height already
    if (
      (!this.previousWidth && this.computedWidth) &&
      (!this.previousHeight && this.computedHeight)
    ) {
      // We delay the resize call to happen after its children has been computed
      // to make it consistent to how it works on elements with not precomputed sizes
      //
      // queueMicrotask here works, but maybe it can be done cleaner?
      queueMicrotask(() => this.resize());
    }

    this.previousWidth = this.computedWidth;
    this.previousHeight = this.computedHeight;

    this.computedTop = 0;
    this.computedLeft = 0;
    this.computedWidth = 0;
    this.computedHeight = 0;
  }

  render(relative = false): string {
    this.draw();

    if (relative) {
      // This does these steps to render lines in correct position no matter the cursor position:
      //  1. Save cursor position
      //  2. Line
      //  3. Reset cursor position
      //  4. Move cursor down
      //  5. Save cursor position
      return `\x1b7${this.lines.join("\x1b8\x1b[1B\x1b7")}`;
    }

    return this.lines.join("\n");
  }

  boundingRectangle(): BoundingRectangle | null {
    if (!this.visible) return null;

    let top = this.computedTop;
    let left = this.computedLeft;

    const parent = this.parent;

    let block = parent;
    while (block) {
      if (!block.visible) return null;
      top += block.computedTop;
      left += block.computedLeft;
      block = block.parent;
    }

    // Clamp bounding box to the parents bounding box
    // To make sure it doesn't stick out
    let width = this.computedWidth;
    let height = this.computedHeight;
    if (parent) {
      const parentBB = parent.boundingRectangle()!;
      const minTop = parentBB.top;
      const maxTop = parentBB.top + parentBB.height;
      const minLeft = parentBB.left;
      const maxLeft = parentBB.left + parentBB.width;

      const actualTop = Math.min(Math.max(top, minTop), maxTop);
      const actualLeft = Math.min(Math.max(left, minLeft), maxLeft);
      const topDiff = top - actualTop;
      const leftDiff = left - actualLeft;

      width -= leftDiff;
      height -= topDiff;

      top = actualTop;
      left = actualLeft;
    }

    return {
      top,
      left,
      width,
      height,
    };
  }
}
