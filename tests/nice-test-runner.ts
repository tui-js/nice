import crayon from "@crayon/crayon";
import "@crayon/literal";

import { Style } from "#src/style_block.ts";
import { VerticalBlock } from "#src/layout/vertical_block.ts";
import type { Block } from "#src/block.ts";

const Title = new Style({
  string: crayon.bold,
  border: { type: "thick", x: true, style: crayon.white },
  padding: { all: 0 },
});

const Description = new Style({
  string: crayon.white,
  border: { type: "thick", x: true, y: true, style: crayon.white },
  padding: { all: 1 },
});

export class TestCase {
  constructor(
    public title: string,
    public description: string,
    public render: () => void,
  ) {}

  block(): Block {
    return new VerticalBlock(
      { horizontalAlign: "50%" },
      Title.create(this.title),
      Description.create(this.description),
    );
  }

  run() {
    console.clear();
    console.log(this.block().render());
    this.render();
  }
}
