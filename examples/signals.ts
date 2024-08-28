import crayon from "@crayon/crayon";
import { computed, signal } from "@tui/signals";

import { HorizontalBlock, Style } from "../mod.ts";

const style = new Style({
    width: 20,
    string: crayon.bgMagenta,
    text: {
        horizontalAlign: "center",
    },
    padding: { all: 1 },
    margin: { all: 1 },
    border: {
        all: true,
        style: crayon.black.bgYellow,
        type: "rounded",
    },
});

const a = signal("Chuj");
const b = computed(() => {
    return a.get() + "ek";
});

const z = style.create(b);
const dog = new HorizontalBlock({ width: "100%" }, style.create("woof"), z, style.create(a));

console.log(dog.render());
a.set("Pen");
console.log(dog.render());
a.set("Zen");
console.log(dog.render());
z.setStyle(style.derive({ string: crayon.bgRed, padding: { all: 3 } }));
console.log(dog.render());
