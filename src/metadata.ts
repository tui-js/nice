export const NICE_TYPE = Symbol("Nice.blockType");
export const NICE_ANCHOR = Symbol("Nice.blockAnchor");
export const NICE_TOP = Symbol("Nice.blockTop");
export const NICE_LEFT = Symbol("Nice.blockLeft");
export const NICE_WIDTH = Symbol("Nice.blockWidth");
export const NICE_HEIGHT = Symbol("Nice.blockHeight");

export interface NiceMetadata {
  [NICE_ANCHOR]?: NiceMetadata;
  [NICE_TYPE]?: string;
  [NICE_TOP]: number;
  [NICE_LEFT]: number;
  [NICE_WIDTH]: number;
  [NICE_HEIGHT]: number;
}

export interface MetadataOptions {
  anchor?: NiceMetadata;
  type?: string;
  top: number;
  left: number;
  width: number;
  height: number;
}

export type NiceBlock = string[] & NiceMetadata;

export function applyMetadata(
  block: string[],
  { anchor, type, top, left, width, height }: MetadataOptions,
): NiceBlock {
  const element = block as NiceBlock;
  element[NICE_TYPE] = type;
  element[NICE_ANCHOR] = anchor;
  element[NICE_TOP] = top;
  element[NICE_LEFT] = left;
  element[NICE_WIDTH] = width;
  element[NICE_HEIGHT] = height;
  return element;
}

export function getBoundingRect(element: NiceBlock) {
  let top = element[NICE_TOP];
  let left = element[NICE_LEFT];

  let anchor = element[NICE_ANCHOR];
  while (anchor) {
    top += anchor[NICE_TOP];
    left += anchor[NICE_LEFT];

    anchor = anchor[NICE_ANCHOR];
  }

  return { top, left, width: element[NICE_WIDTH], height: element[NICE_HEIGHT] };
}
