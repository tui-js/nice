import type { TextWrapType } from "./wrap.ts";
import type { TextOverflowType } from "./overflow.ts";
import type { TextHorizontalAlign } from "./align_horizontal.ts";
import type { TextVerticalAlign } from "./align_vertical.ts";

export interface TextDefinition {
  wrap: TextWrapType;
  overflow: TextOverflowType;
  ellipsisString?: string;

  horizontalAlign: TextHorizontalAlign;
  verticalAlign: TextVerticalAlign;
}

const NORMALIZED_TEXT_DEFINITION = Symbol("Nice.NormalizedTextDefinition");
export interface NormalizedTextDefinition {
  wrap: TextWrapType;
  overflow: TextOverflowType;
  ellipsisString: string;

  horizontalAlign: TextHorizontalAlign;
  verticalAlign: TextVerticalAlign;

  [NORMALIZED_TEXT_DEFINITION]: true;
}

export function isNormalizedTextDefinition(object?: object): object is NormalizedTextDefinition {
  return !!object && NORMALIZED_TEXT_DEFINITION in object;
}

export function normalizeTextDefinition(
  text?: Partial<TextDefinition> | NormalizedTextDefinition,
): NormalizedTextDefinition {
  if (isNormalizedTextDefinition(text)) {
    return text;
  }

  return {
    wrap: text?.wrap ?? "wrap",
    overflow: text?.overflow ?? "clip",
    ellipsisString: text?.ellipsisString ?? "…",
    horizontalAlign: text?.horizontalAlign ?? "left",
    verticalAlign: text?.verticalAlign ?? "top",
    [NORMALIZED_TEXT_DEFINITION]: true,
  };
}
