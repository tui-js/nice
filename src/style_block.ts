import { textWidth } from "@tui/strings/text_width";
import { type BaseSignal, computed, type MaybeSignal } from "@tui/signals";

import { Block, type BoundingRectangle } from "./block.ts";
import { normalizeUnit, type Unit } from "./unit.ts";
import type { StringStyler } from "./types.ts";

import {
  alignHorizontally,
  alignVertically,
  applyStyle,
  type NormalizedTextDefinition,
  resizeHorizontally,
  resizeVertically,
  type TextDefinition,
  wrapLines,
} from "./text/mod.ts";
import { normalizeTextDefinition } from "./text/normalization.ts";
import { applyMargin } from "./margin/mod.ts";
import { type MarginDefinition, type NormalizedMarginDefinition, normalizeMargin } from "./margin/normalization.ts";
import { type BorderDefinition, normalizeBorder, type NormalizedBorderDefinition } from "./border/normalization.ts";
import { applyBorder } from "./border/border.ts";
import { getValue } from "@tui/signals";

export interface StyleOptions {
  width?: MaybeSignal<Unit>;
  height?: MaybeSignal<Unit>;
  skipIfTooSmall?: boolean;

  string: StringStyler;

  text?: Partial<TextDefinition> | NormalizedTextDefinition;
  margin?: Partial<MarginDefinition> | NormalizedMarginDefinition;
  padding?: Partial<MarginDefinition> | NormalizedMarginDefinition;
  border?: Partial<BorderDefinition> | NormalizedBorderDefinition;
}

export class Style {
  width: MaybeSignal<Unit>;
  height: MaybeSignal<Unit>;
  skipIfTooSmall: boolean;

  string: StringStyler;

  text: NormalizedTextDefinition;
  margin: NormalizedMarginDefinition;
  padding: NormalizedMarginDefinition;
  border: NormalizedBorderDefinition;

  constructor({ string, text, margin, padding, border, skipIfTooSmall, width, height }: StyleOptions) {
    this.string = string;
    this.text = normalizeTextDefinition(text);
    this.margin = normalizeMargin(margin);
    this.padding = normalizeMargin(padding);
    this.border = normalizeBorder(border);
    this.skipIfTooSmall = skipIfTooSmall ?? false;
    this.width = width ?? "auto";
    this.height = height ?? "auto";
  }

  create(content: string | BaseSignal<string>, options?: Partial<StyleOptions>): StyleBlock {
    return new StyleBlock(options ? this.derive(options) : this, content);
  }

  derive(overrides: Partial<StyleOptions>): Style {
    const pick = <const K extends keyof StyleOptions>(key: K) => {
      if (typeof overrides[key] === "object" && typeof this[key] === "object") {
        return { ...this[key], ...overrides[key] };
      }
      return key in overrides ? overrides[key]! : this[key];
    };

    // Required is set here in case any more properties have been added
    // to warn that it has to be updated here as well
    const derived: Required<StyleOptions> = {
      width: pick("width"),
      height: pick("height"),
      string: pick("string"),
      text: pick("text"),
      margin: pick("margin"),
      padding: pick("padding"),
      border: pick("border"),
      skipIfTooSmall: pick("skipIfTooSmall"),
    };

    return new Style(derived);
  }
}

export class StyleBlock extends Block {
  content!: string;

  contentWidth?: number;
  contentHeight?: number;

  autoParentDependant = false;
  #style: Style;

  #rawLines!: string[];

  constructor(style: Style, content: string | BaseSignal<string>) {
    super({
      id: getValue(content),
      width: style.width,
      height: style.height,
    });

    this.#style = style;
    if (typeof content === "string") {
      this.content = content;
      this.#rawLines = content.split("\n");
      this.updateLines();
    } else {
      computed(() => {
        this.content = content.get();
        this.#rawLines = this.content.split("\n");
        this.updateLines();
      });
    }
  }

  get style(): Style {
    return this.#style;
  }

  set style(style: Style) {
    if (this.#style === style) return;
    this.#style = style;
    this.updateLines();
  }

  updateLines() {
    this.lines.splice(0, Infinity, ...this.#rawLines);
    this.changed = true;
  }

  almostTheSame(other: Block): boolean {
    if (other instanceof StyleBlock) {
      if (this.style !== other?.style) return false;
      else if (this.#rawLines.length !== other.#rawLines.length) return false;
    }

    return super.almostTheSame(other);
  }

  forceUpdate(): void {
    this.updateLines();
    super.forceUpdate();
  }

  mount(): void {
    super.mount();
    this.updateLines();
  }

  boundingRectangle(includeMargins = false): BoundingRectangle {
    const rectangle = super.boundingRectangle();

    if (!includeMargins) {
      const { margin } = this.style;
      rectangle.top += margin.top;
      rectangle.left += margin.left;
      rectangle.width -= margin.right + margin.left;
      rectangle.height -= margin.bottom + margin.top;
    }

    return rectangle;
  }

  compute(parentSignal?: MaybeSignal<Block>): void {
    const parent = getValue(parentSignal);

    super.compute(parent!);
    if (!this.hasChanged()) return;

    if (this.width === "auto") {
      const { padding, margin, border } = this.style;

      const paddingWidth = padding.left + padding.right;
      const marginWidth = margin.left + margin.right;
      const borderWidth = (border.left ? 1 : 0) + (border.right ? 1 : 0);

      this.contentWidth = this.lines.reduce((maxWidth, line) => Math.max(maxWidth, textWidth(line)), 0);
      this.computedWidth = this.contentWidth + paddingWidth + marginWidth + borderWidth;
    } else {
      const { padding, border, margin } = this.style;
      const paddingWidth = padding.left + padding.right;
      const marginWidth = margin.left + margin.right;
      const borderWidth = (border.left ? 1 : 0) + (border.right ? 1 : 0);

      if (typeof this.width !== "number" && !parent) {
        throw new Error(
          `StyleBlock's has no parent and its width is not statically analyzable: ${this.width}`,
        );
      }

      this.computedWidth = normalizeUnit(this.width, parent!.computedWidth, parent!.usedWidth);
      this.contentWidth = this.computedWidth - paddingWidth - marginWidth - borderWidth;
    }

    if (this.height === "auto") {
      const { padding, margin, border } = this.style;
      const paddingHeight = padding.top + padding.bottom;
      const marginHeight = margin.top + margin.bottom;
      const borderHeight = (border.top ? 1 : 0) + (border.bottom ? 1 : 0);

      this.contentHeight = this.lines.length;
      this.computedHeight = this.contentHeight + paddingHeight + marginHeight +
        borderHeight;
    } else {
      const { padding, border, margin } = this.style;
      const paddingHeight = padding.top + padding.bottom;
      const marginHeight = margin.top + margin.bottom;
      const borderHeight = (border.top ? 1 : 0) + (border.bottom ? 1 : 0);

      if (typeof this.height !== "number" && !parent) {
        throw new Error(`StyleBlock's has no parent and its height is not statically analyzable: ${this.height}`);
      }

      this.computedHeight = normalizeUnit(
        this.height,
        parent!.computedHeight,
        parent!.usedHeight,
      );
      this.contentHeight = this.computedHeight - paddingHeight - marginHeight -
        borderHeight;
    }

    if (this.style.skipIfTooSmall && (this.contentWidth < 0 || this.contentHeight < 0)) {
      this.lines = [];
      this.computedWidth = 0;
      this.computedHeight = 0;
    }
  }

  draw(): void {
    super.draw();
    if (!this.hasChanged()) return;
    this.changed = false;

    const { lines } = this;
    const { text, margin, padding, border } = this.style;

    let width = this.contentWidth!;
    let height = this.contentHeight!;

    if (this.style.skipIfTooSmall && (width < 0 || height < 0)) {
      return;
    } else if (width < 0) {
      throw new Error(
        `Element is too narrow to be created, its width is ${this.computedWidth}, too small by ${-width}`,
      );
    } else if (height < 0) {
      throw new Error(
        `Element is too short to be created, its height is ${this.computedHeight}, too small by ${-height}`,
      );
    }

    wrapLines(lines, width, text.wrap);

    resizeVertically(lines, height, text);
    alignVertically(lines, height, text.verticalAlign);

    resizeHorizontally(lines, width, height, text);
    alignHorizontally(lines, width, height, text.horizontalAlign);

    applyMargin(lines, width, padding);
    width += padding.left + padding.right;
    height += padding.top + padding.bottom;

    applyStyle(lines, this.style.string);

    applyBorder(lines, width, border);
    width += (border.left ? 1 : 0) + (border.right ? 1 : 0);
    height += (border.top ? 1 : 0) + (border.bottom ? 1 : 0);

    applyMargin(lines, width, margin);
    width += margin.left + margin.right;
    height += margin.top + margin.bottom;
  }
}
