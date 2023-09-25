// Copyright 2023 Im-Beast. All rights reserved. MIT license.
import { Style } from "./nice.ts";

export interface BorderStyle {
  type: BorderType;
  style: Style;

  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
}

export interface BorderDefinition<_Styled extends boolean> {
  top: string;
  bottom: string;
  left: string;
  right: string;
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
}

export type BorderType = "sharp" | "rounded" | "thick" | "double" | "block";
export const Borders: Record<BorderType, BorderDefinition<false>> = {
  sharp: {
    top: "─",
    bottom: "─",
    left: "│",
    right: "│",
    topLeft: "┌",
    topRight: "┐",
    bottomLeft: "└",
    bottomRight: "┘",
  },
  rounded: {
    top: "─",
    bottom: "─",
    left: "│",
    right: "│",
    topLeft: "╭",
    topRight: "╮",
    bottomLeft: "╰",
    bottomRight: "╯",
  },
  thick: {
    top: "━",
    bottom: "━",
    left: "┃",
    right: "┃",
    topLeft: "┏",
    topRight: "┓",
    bottomLeft: "┗",
    bottomRight: "┛",
  },
  double: {
    top: "═",
    bottom: "═",
    left: "║",
    right: "║",
    topLeft: "╔",
    topRight: "╗",
    bottomLeft: "╚",
    bottomRight: "╝",
  },
  block: {
    top: "█",
    bottom: "█",
    left: "█",
    right: "█",
    topLeft: "█",
    topRight: "█",
    bottomLeft: "█",
    bottomRight: "█",
  },
};

export class Border {
  borderStyle: BorderStyle;
  definition: BorderDefinition<true>;

  constructor(borderStyle: BorderStyle) {
    this.borderStyle = borderStyle;
    this.definition = Border.styleDefinition(borderStyle);
  }

  getTop(width: number) {
    const { topLeft, top, topRight } = this.definition;
    return topLeft + top.repeat(width) + topRight;
  }

  getBottom(width: number) {
    const { bottomLeft, bottom, bottomRight } = this.definition;
    return bottomLeft + bottom.repeat(width) + bottomRight;
  }

  getLeft() {
    return this.definition.left;
  }

  getRight() {
    return this.definition.right;
  }

  restyleDefinition(): void {
    const { top, left, bottom, right, type, style } = this.borderStyle;

    const styledDefinition = this.definition;
    const definition = Borders[type];

    if (top) {
      styledDefinition.top = style(definition.top);
      styledDefinition.topLeft = left ? style(definition.topLeft) : " ";
      styledDefinition.topRight = right ? style(definition.topRight) : " ";
    } else {
      styledDefinition.top = " ";
      styledDefinition.topLeft = " ";
      styledDefinition.topRight = " ";
    }

    if (bottom) {
      styledDefinition.bottom = style(definition.bottom);

      styledDefinition.bottomLeft = left ? style(definition.bottomLeft) : " ";
      styledDefinition.bottomRight = right ? style(definition.bottomRight) : " ";
    } else {
      styledDefinition.bottom = " ";
      styledDefinition.bottomLeft = " ";
      styledDefinition.bottomRight = " ";
    }

    styledDefinition.left = left ? style(definition.left) : " ";
    styledDefinition.right = right ? style(definition.right) : " ";
  }

  static styleDefinition(borderStyle: BorderStyle): BorderDefinition<true> {
    const definition = Borders[borderStyle.type];
    const style = borderStyle.style;

    const styledDefinition: BorderDefinition<true> = {
      top: "",
      topLeft: "",
      topRight: "",
      bottom: "",
      bottomLeft: "",
      bottomRight: "",
      left: "",
      right: "",
    };

    const { top, left, bottom, right } = borderStyle;

    if (top) {
      console.log(borderStyle, definition);
      styledDefinition.top = style(definition.top);

      if (left) {
        styledDefinition.topLeft = style(definition.topLeft);
      }

      if (right) {
        styledDefinition.topRight = style(definition.topRight);
      }
    }

    if (bottom) {
      styledDefinition.bottom = style(definition.bottom);

      if (left) {
        styledDefinition.bottomLeft = style(definition.bottomLeft);
      }

      if (right) {
        styledDefinition.bottomRight = style(definition.bottomRight);
      }
    }

    if (left) styledDefinition.left = style(definition.left);
    if (right) styledDefinition.right = style(definition.right);

    return styledDefinition;
  }
}
