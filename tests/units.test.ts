import { percent, unit } from "../mod.ts";
import { assert, assertAlmostEquals, assertEquals, assertThrows } from "./deps.ts";

Deno.test("unit", () => {
  assertEquals(unit("center"), percent(50));
  assertEquals(unit("middle"), percent(50));
  assertEquals(unit("top"), percent(0));
  assertEquals(unit("bottom"), percent(100));
  assertEquals(unit("left"), percent(0));
  assertEquals(unit("right"), percent(100));
  assertEquals(unit(1, "%"), percent(1));
  assertEquals(unit(1, "col"), 1);
  assertEquals(unit(1, "row"), 1);
  assertEquals(unit(1, "cell"), 2);

  assertThrows(() => unit(1.5, "cell"));
  // @ts-expect-error -
  assertThrows(() => unit(1, "foo"));
  // @ts-expect-error -
  assertThrows(() => unit("foo"));
});

Deno.test("percent", () => {
  for (let i = -1000; i < 1000; ++i) {
    assert(!Number.isInteger(percent(i)));
    assertAlmostEquals(percent(i), i / 100, 1e-14);
  }
});
