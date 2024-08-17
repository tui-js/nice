import crayon from "@crayon/crayon";

import { TestCase } from "../nice-test-runner.ts";

import { Style, type StyleOptions } from "../../src/style_block.ts";
import type { Block } from "../../src/block.ts";
import { VerticalBlock } from "../../src/layout/vertical_block.ts";
import { HorizontalBlock } from "../../src/layout/horizontal_block.ts";

const VERY_LONG_TEXT = `Ladies and gentlemen,
Today, we gather to celebrate the freedom and collaboration that the GNU Project and the Linux kernel have brought to the world of software. Together, they form what we like to call GNU/Linux. It's a powerful, free operating system that respects users' freedom and community spirit.
Imagine, if you will, a world where stoats and sables join forces. The stoat, nimble and clever, represents the adaptability and efficiency of the Linux kernel. The sable, with its rich and luxurious fur, embodies the robustness and versatility of the GNU utilities and applications. Together, these two creatures form a harmonious, unstoppable duo.
Now, just as the stoat and sable complement each other in the wild, GNU and Linux work together to create an ecosystem that is more than the sum of its parts. The stoat may dart through the underbrush, catching bugs and optimizing performance, while the sable ensures that the system remains stable and user-friendly, providing the tools and utilities we all rely on.
In this metaphorical forest, every user is like a fellow stoat or sable, contributing to the richness and diversity of the ecosystem. We share our improvements, help each other, and defend our freedom to explore and innovate.
So, next time you boot up your GNU/Linux system, think of the stoat and the sable, working together in perfect harmony. It's a testament to what we can achieve when we embrace the principles of free software and open collaboration.
Thank you, and may the spirit of stoats and sables guide your path to freedom!`;

const wrapLabel = crayon.magenta.bold("wrap");
const nowrapLabel = crayon.cyan.bold("nowrap");

const STYLES: [string, StyleOptions["text"]][] = [
  [`ellipsis\n${nowrapLabel}`, { overflow: "ellipsis", wrap: "nowrap" }],
  [`custom ellipsis\n${nowrapLabel}`, {
    overflow: "ellipsis",
    wrap: "nowrap",
    ellipsisString: "...",
  }],
  [`clip\n${nowrapLabel}`, { overflow: "clip", wrap: "nowrap" }],

  [`ellipsis\n${wrapLabel}`, { overflow: "ellipsis", wrap: "wrap" }],
  [`custom ellipsis\n${wrapLabel}`, {
    overflow: "ellipsis",
    wrap: "wrap",
    ellipsisString: "...",
  }],
  [`clip\n${wrapLabel}`, { overflow: "clip", wrap: "wrap" }],
];

const titleStyle = new Style({
  string: crayon.bold,
  text: {
    horizontalAlign: "center",
  },
});

const style = new Style({
  string: crayon.bgYellow,

  width: 13,
  height: 12,

  border: { type: "sharp", all: true, style: crayon.white },
});

function render() {
  const blocks: Block[] = [];
  for (const [title, textStyle] of STYLES) {
    const elementStyle = style.derive({
      text: textStyle,
    });

    blocks.push(
      new VerticalBlock(
        { x: "50%" },
        titleStyle.create(title),
        elementStyle.create(VERY_LONG_TEXT),
      ),
    );
  }

  const SCREEN_FG = new HorizontalBlock({ y: "50%" }, ...blocks);

  console.log(SCREEN_FG.render());
}

export const testCase = new TestCase(
  "Overflow support",
  crayon`\
{bold This test showcases ways to manage text that's too large to fit in a block.}

Each ${wrapLabel} block should only ellipse or clip* at the last row of the block.
${wrapLabel} blocks should not contain any cut words – every word should be whole.

Each ${nowrapLabel} block should ellipse or clip* at every line of the block.

* – Should elipse or clip – ellipse if overflow is set to "ellipsis", clip otherwise.`,
  render,
);

if (import.meta.main) {
  testCase.run();
}
