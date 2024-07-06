import { type BorderCharset, BorderCharsets, type BorderCharsetType } from "./charsets.ts";
import type { EitherType, StringStyler } from "../types.ts";

// FIXME: { all: true } without style is a valid border
export type BorderX<T> = EitherType<[{ left: T; right: T }, { x: T }, { all: T }]>;
export type BorderY<T> = EitherType<[{ top: T; bottom: T }, { y: T }, { all: T }]>;
export type BorderTypeDefinition = EitherType<[
  { type: BorderCharsetType },
  { type: "custom"; charset: BorderCharset },
]>;

export type UniqueStyleBorder =
  & BorderX<StringStyler>
  & BorderY<StringStyler>
  & BorderTypeDefinition;
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
  $border?: Partial<BorderDefinition> | NormalizedBorderDefinition,
): NormalizedBorderDefinition {
  if (isNormalizedBorderDefinition($border)) {
    return $border;
  }

  if ($border) {
    if ("style" in $border) {
      const border = $border as SharedStyleBorder;
      const { all, x, y, top, bottom, left, right, style } = border;

      return {
        charset: (border.type === "custom" || border.charset)
          ? border.charset
          : BorderCharsets[border.type],
        top: (all || top || y) ? style : null,
        bottom: (all || bottom || y) ? style : null,
        left: (all || left || x) ? style : null,
        right: (all || right || x) ? style : null,
      };
    }

    const border = $border as UniqueStyleBorder;
    const { all, x, y, top, bottom, left, right } = border;

    return {
      charset: (border.type === "custom" || border.charset)
        ? border.charset
        : BorderCharsets[border.type],
      top: all ?? top ?? y ?? null,
      bottom: all ?? bottom ?? y ?? null,
      left: all ?? left ?? x ?? null,
      right: all ?? right ?? x ?? null,
    };
  }

  return {
    charset: BorderCharsets.sharp,
    top: null,
    bottom: null,
    left: null,
    right: null,
  };
}
