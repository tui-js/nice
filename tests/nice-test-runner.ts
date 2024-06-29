import crayon from "@crayon/crayon";
import "@crayon/literal";

import { Nice, overlay } from "../mod.ts";
import type { NiceBlock } from "../src/metadata.ts";

const Title = new Nice({
  style: crayon.bold,
  border: { type: "thick", x: true, style: crayon.white },
  padding: { all: 0 },
});

const Description = new Nice({
  border: { type: "thick", x: true, y: true, style: crayon.white },
  padding: { all: 1 },
});

export class TestCase {
  constructor(
    public title: string,
    public description: string,
    public render: () => void,
  ) {}

  block(): NiceBlock {
    return overlay(
      0.5,
      0,
      Title.draw(this.title),
      Description.draw(this.description),
    );
  }

  run() {
    console.clear();

    console.log(Nice.render(this.block()));

    this.render();
  }
}
