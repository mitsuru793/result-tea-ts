import { assertEquals, assertStrictEquals } from "@std/assert";
import { withFailure, withSuccess } from "@mitsuru793/bythrow-assert";
import * as v from "valibot";
import { createParse } from "./model.ts";

Deno.test("createParse() returns the transformed output", () => {
  const parse = createParse(v.pipe(v.string(), v.transform(Number)));
  withSuccess(parse("42"), (value) => {
    assertEquals(value, 42);
  });
});

Deno.test("createParse() preserves validation issues", () => {
  const schema = v.string();
  const input = 42;
  const expected = v.safeParse(schema, input);
  withFailure(createParse(schema)(input), (error) => {
    assertEquals(error.issues, expected.issues);
  });
});

Deno.test("createParse() preserves a Promise-valued output in a synchronous Result", async () => {
  const value = Promise.resolve("body");
  const parse = createParse(v.pipe(v.string(), v.transform(() => value)));
  const result = parse("input");
  withSuccess(result, (output) => {
    assertStrictEquals(output, value);
  });
  assertEquals(await value, "body");
});
