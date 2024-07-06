import crayon from "@crayon/crayon";
import "@crayon/literal";

import { overlay, Style } from "../mod.ts";
import type { NiceBlock } from "../src/metadata.ts";

const Title = new Style({
  style: crayon.bold,
  border: { type: "thick", x: true, style: crayon.white },
  padding: { all: 0 },
});

const Description = new Style({
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
      Title.create(this.title),
      Description.create(this.description),
    );
  }

  run() {
    console.clear();

    console.log(Style.render(this.block()));

    this.render();
  }
}
