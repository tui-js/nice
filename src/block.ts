import { effect, getValue, type MaybeSignal } from "@tui/signals";

import type { Unit } from "./unit.ts";

// FIXME: Negative values

export const createdBlocks: Block[] = [];

export interface BlockOptions {
  width: MaybeSignal<Unit>;
  height: MaybeSignal<Unit>;
  children?: MaybeSignal<Block>[];
}

export interface BoundingRectangle {
  top: number;
  left: number;
  width: number;
  height: number;
}

export class Block {
  name?: string;

  // Whether block depends on parent when width or height are set to "auto"
  autoParentDependant = true;
  width!: Unit;
  height!: Unit;

  changed = true;
  computedTop = 0;
  computedLeft = 0;
  computedWidth = 0;
  computedHeight = 0;

  usedWidth = 0;
  usedHeight = 0;

  parent?: MaybeSignal<Block>;
  children?: MaybeSignal<Block>[];

  lines: string[] = [];

  constructor(options: BlockOptions) {
    effect(() => {
      this.width = getValue(options.width);
      if (typeof this.width === "number") this.computedWidth = this.width;

      this.height = getValue(options.height);
      if (typeof this.height === "number") this.computedHeight = this.height;

      this.changed = true;
    });

    effect(() => {
      // Associate children signals with this
      if (options.children) {
        this.clearChildren();
        for (const childSignal of options.children) {
          this.addChild(getValue(childSignal));
        }
      }
      this.changed = true;
    });

    createdBlocks.push(this);
  }

  hasChanged(): boolean {
    return (this.changed = this.changed || (
      this.children?.some((block) => getValue(block).hasChanged()) ?? false
    ));
  }

  boundingRectangle(): BoundingRectangle {
    let top = this.computedTop;
    let left = this.computedLeft;

    let parent = getValue(this.parent);
    while (parent) {
      top += parent.computedTop;
      left += parent.computedLeft;
      parent = getValue(parent.parent);
    }

    return {
      top,
      left,
      width: this.computedWidth,
      height: this.computedHeight,
    };
  }

  clearChildren(): void {
    if (!this.children) return;
    for (const child of this.children.splice(0)) {
      getValue(child).parent = undefined;
    }
  }

  addChild(block: MaybeSignal<Block>): void {
    getValue(block).parent = this;
    this.children ??= [];
    this.children.push(block);
  }

  draw() {
    if (!this.hasChanged()) {
      return;
    }

    if (!this.parent) {
      const { rows, columns } = Deno.consoleSize();
      const terminal = new Block({ height: rows, width: columns });
      terminal.addChild(this);
      this.compute(terminal);
    }

    if (this.children) {
      this.startLayout();
      for (const child of this.children) {
        this.layout(child);
      }
      this.finishLayout();
    }
  }

  startLayout(): void {
    throw new Error("Default block doesn't implement 'Block.startLayout'");
  }

  layout(_child: MaybeSignal<Block>): void {
    throw new Error("Default block doesn't implement 'Block.layout'");
  }

  finishLayout(): void {
    throw new Error("Default block doesn't implement 'Block.finishLayout'");
  }

  compute(_parent: MaybeSignal<Block>): void {
    if (this.hasChanged()) {
      this.computedTop = 0;
      this.computedLeft = 0;
      this.computedWidth = 0;
      this.computedHeight = 0;
    }
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
}
