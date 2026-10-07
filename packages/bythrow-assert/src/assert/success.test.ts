import { R } from "@praha/byethrow";
import { assertEquals, AssertionError, assertThrows } from "@std/assert";

import { assertSuccess } from "./success.ts";

Deno.test("assertSuccess() returns the value from a success result", () => {
  assertEquals(assertSuccess(R.succeed("value")), "value");
});

Deno.test("assertSuccess() throws for a failure result", () => {
  assertThrows(
    () => assertSuccess(R.fail(new Error("expected failure"))),
    AssertionError,
    "Expected value to be a success result",
  );
});

Deno.test("assertSuccess() throws for a non-result value", () => {
  assertThrows(
    () => assertSuccess(null),
    AssertionError,
    "Expected value to be a success result",
  );
});
