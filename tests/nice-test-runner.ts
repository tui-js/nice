import crayon from "@crayon/crayon";
import "@crayon/literal";

import { Style } from "../src/style_block.ts";
import type { Block } from "../src/block.ts";
import { OverlayBlock } from "../src/layout/overlay_block.ts";

const Title = new Style({
  string: crayon.bold,
  border: { type: "thick", x: crayon.white },
  padding: { all: 0 },
});

const Description = new Style({
  string: crayon.white,
  border: { type: "thick", all: crayon.white },
  padding: { all: 1 },
});

export class TestCase {
  constructor(
    public title: string,
    public description: string,
    public render: () => void,
  ) {}

  block(): Block {
    return new OverlayBlock({
      bg: Description.create(this.description),
      fg: Title.create(this.title),
      x: "50%",
      y: 0,
    });
  }

  run() {
    console.clear();
    console.log(this.block().render());
    this.render();
  }
}
