import type { Crayon } from "@crayon/crayon";
import { textWidth } from "@tui/strings/text_width";

import { Block, type BlockOptions } from "./block.ts";
import type { Unit } from "./unit.ts";

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
import {
    type MarginDefinition,
    type NormalizedMarginDefinition,
    normalizeMargin,
} from "./margin/normalization.ts";
import {
    type BorderDefinition,
    normalizeBorder,
    type NormalizedBorderDefinition,
} from "./border/normalization.ts";
import { applyBorder } from "./border/border.ts";

interface StyleOptions {
    string: Crayon;
    text?: Partial<TextDefinition> | NormalizedTextDefinition;
    margin?: Partial<MarginDefinition> | NormalizedMarginDefinition;
    padding?: Partial<MarginDefinition> | NormalizedMarginDefinition;
    border?: BorderDefinition | NormalizedBorderDefinition;
    skipIfTooSmall?: boolean;
}

export class Style {
    string: Crayon;
    text: NormalizedTextDefinition;
    margin: NormalizedMarginDefinition;
    padding: NormalizedMarginDefinition;
    border: NormalizedBorderDefinition;
    skipIfTooSmall: boolean;

    constructor({ string, text, margin, padding, border, skipIfTooSmall }: StyleOptions) {
        this.string = string;
        this.text = normalizeTextDefinition(text);
        this.margin = normalizeMargin(margin);
        this.padding = normalizeMargin(padding);
        this.border = normalizeBorder(border);
        this.skipIfTooSmall = skipIfTooSmall ?? false;
    }

    create(content: string, options?: Partial<BlockOptions>): StyleBlock {
        return new StyleBlock(this, content, options);
    }

    derive<T extends Partial<StyleOptions>>(overrides: T): Style {
        const extract = <K extends (keyof T & keyof Style)>(key: K) => {
            if (key in overrides) {
                const value = overrides[key];
                if (typeof value !== "object") return value;
                else return { ...this[key] as T[K], ...value };
            }

            return this[key];
        };

        // Required is set here in case any more properties have been added
        // to warn that it has to be updated here as well
        const style: Required<StyleOptions> = {
            string: extract("string")!,
            text: extract("text")!,
            margin: extract("margin")!,
            padding: extract("padding")!,
            border: extract("border")!,
            skipIfTooSmall: extract("skipIfTooSmall")!,
        };

        return new Style(style);
    }
}

export class StyleBlock extends Block {
    declare width: Unit;
    declare height: Unit;
    declare children: never;

    style: Style;
    content: string;

    constructor(style: Style, content: string, options: Partial<BlockOptions> = {}) {
        const lines = content.split("\n");

        if (typeof options.width === "undefined" || options.width === "auto") {
            const { padding, margin, border } = style;

            const paddingWidth = padding.left + padding.right;
            const marginWidth = margin.left + margin.right;
            const borderWidth = (border.left ? 1 : 0) + (border.right ? 1 : 0);

            options.width = lines.reduce(
                (maxWidth, line) => Math.max(maxWidth, textWidth(line)),
                0,
            ) + paddingWidth + marginWidth + borderWidth;
        }

        if (typeof options.height === "undefined" || options.height === "auto") {
            const { padding, margin, border } = style;

            const paddingHeight = padding.top + padding.bottom;
            const marginHeight = margin.top + margin.bottom;
            const borderHeight = (border.top ? 1 : 0) + (border.bottom ? 1 : 0);
            options.height = lines.length + paddingHeight + marginHeight + borderHeight;
        }
        super(options as BlockOptions);

        this.style = style;
        this.lines = lines;
        this.content = content;
    }

    draw(): void {
        const { lines, computedHeight, computedWidth } = this;
        const { text, margin, padding, border } = this.style;

        const paddingWidth = padding.left + padding.right;
        const marginWidth = margin.left + margin.right;
        const borderWidth = (border.left ? 1 : 0) + (border.right ? 1 : 0);

        const paddingHeight = padding.top + padding.bottom;
        const marginHeight = margin.top + margin.bottom;
        const borderHeight = (border.top ? 1 : 0) + (border.bottom ? 1 : 0);

        let width = computedWidth - paddingWidth - marginWidth - borderWidth;
        let height = computedHeight - paddingHeight - marginHeight - borderHeight;

        if (this.style.skipIfTooSmall && (width < 0 || height < 0)) {
            this.lines = [];
            this.computedWidth = 0;
            this.computedHeight = 0;
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
        width += paddingWidth;
        height += paddingHeight;
        applyStyle(lines, this.style.string);

        applyBorder(lines, width, border);
        width += borderWidth;
        height += borderHeight;

        applyMargin(lines, width, margin);
        width += marginWidth;
        height += marginHeight;
    }
}
