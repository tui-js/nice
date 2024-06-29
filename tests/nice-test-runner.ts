import crayon from "@crayon/crayon";
import "@crayon/literal";

import { walk } from "@std/fs";

import { Nice, overlay } from "../mod.ts";

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

  run() {
    console.log(Nice.render(
      overlay(
        0.5,
        0,
        Title.draw(this.title),
        Description.draw(this.description),
      ),
    ));

    this.render();
  }
}

if (import.meta.main) {
  const currentPath = new URL(import.meta.resolve("./"));

  for await (
    const file of walk(currentPath, { includeDirs: false, includeSymlinks: false, exts: ["nt.ts"] })
  ) {
    const testName = file.name.replace(".nt.ts", "");

    console.log(file.path);
    const testCase: TestCase = (await import(file.path)).testCase;
    testCase.run();

    inner: do {
      const input = prompt("Does this look correct? [y/n]:");

      switch (input) {
        case "y":
          break inner;
        case "n":
          console.log(`Test case "${testName}" failed.`);
          Deno.exit(1);
          break;
        case null:
          Deno.exit(2);
          break;
      }
    } while (true);
  }
}
