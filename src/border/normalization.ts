import { type BorderCharset, BorderCharsets, type BorderCharsetType } from "./charsets.ts";
import type { EitherType, StringStyler } from "../types.ts";

export type BorderX<T> = EitherType<[{ left: T; right: T }, { x: T }, { all: T }]>;
export type BorderY<T> = EitherType<[{ top: T; bottom: T }, { y: T }, { all: T }]>;

export type BorderTypeDefinition = EitherType<
  [{ type: BorderCharsetType }, { type: "custom"; charset: BorderCharset }]
>;

export type UniqueStyleBorder = BorderX<StringStyler> & BorderY<StringStyler> & BorderTypeDefinition;

export type SharedStyleBorder = BorderX<boolean> & BorderY<boolean> & BorderTypeDefinition & {
  style: StringStyler;
};

export type BorderDefinition = EitherType<[UniqueStyleBorder, SharedStyleBorder]>;

const NORMALIZED_BORDER_DEFINITION = Symbol("Nice.NormalizedBorderDefinition");
export interface NormalizedBorderDefinition {
  charset: BorderCharset;
  top: StringStyler | null;
  bottom: StringStyler | null;
  left: StringStyler | null;
  right: StringStyler | null;
}

export function isNormalizedBorderDefinition(
  object?: object,
): object is NormalizedBorderDefinition {
  return !!object && NORMALIZED_BORDER_DEFINITION in object;
}

export function normalizeBorder(
  border?: Partial<BorderDefinition> | NormalizedBorderDefinition,
): NormalizedBorderDefinition {
  if (isNormalizedBorderDefinition(border)) {
    return border;
  }

  if (!border) {
    return { charset: BorderCharsets.sharp, top: null, bottom: null, left: null, right: null };
  }

  const { all, x, y, top, bottom, left, right } = border;
  const $top = all || top || y || null;
  const $bottom = all || bottom || y || null;
  const $left = all || left || x || null;
  const $right = all || right || x || null;

  const charset = (border.type === "custom" || border.charset) ? border.charset! : BorderCharsets[border.type!];

  if ("style" in border) {
    const { style } = border as SharedStyleBorder;

    return {
      charset,
      top: $top && style,
      bottom: $bottom && style,
      left: $left && style,
      right: $right && style,
    };
  }

  return {
    charset,
    top: $top as StringStyler | null,
    bottom: $bottom as StringStyler | null,
    left: $left as StringStyler | null,
    right: $right as StringStyler | null,
  };
}
