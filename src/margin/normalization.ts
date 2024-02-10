import type { EitherType } from "../types.ts";

export type MarginX = EitherType<[{ left: number; right: number }, { x: number }, { all: number }]>;
export type MarginY = EitherType<[{ top: number; bottom: number }, { y: number }, { all: number }]>;
export type MarginDefinition = MarginX & MarginY;

const NORMALIZED_MARGIN_DEFINITION = Symbol("Nice.NormalizedMarginDefinition");
export interface NormalizedMarginDefinition {
  top: number;
  bottom: number;
  left: number;
  right: number;
  [NORMALIZED_MARGIN_DEFINITION]: true;
}

export function isNormalizedMarginDefinition(
  object?: object,
): object is NormalizedMarginDefinition {
  return !!object && NORMALIZED_MARGIN_DEFINITION in object;
}

export function normalizeMargin(margin?: Partial<MarginDefinition>): NormalizedMarginDefinition {
  return {
    top: margin?.all ?? margin?.top ?? margin?.y ?? 0,
    bottom: margin?.all ?? margin?.bottom ?? margin?.y ?? 0,
    left: margin?.all ?? margin?.left ?? margin?.x ?? 0,
    right: margin?.all ?? margin?.right ?? margin?.x ?? 0,
    [NORMALIZED_MARGIN_DEFINITION]: true,
  };
}
