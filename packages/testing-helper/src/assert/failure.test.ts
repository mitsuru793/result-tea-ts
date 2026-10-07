import { R } from "@praha/byethrow";
import { assertEquals, AssertionError, assertThrows } from "@std/assert";

import { assertFailure } from "./failure.ts";

Deno.test("assertFailure() returns the error from a failure result", () => {
  const error = new Error("expected failure");

  assertEquals(assertFailure(R.fail(error)), error);
});

Deno.test("assertFailure() throws for a success result", () => {
  assertThrows(
    () => assertFailure(R.succeed("value")),
    AssertionError,
    "Expected value to be a failure result",
  );
});

Deno.test("assertFailure() throws for a non-result value", () => {
  assertThrows(
    () => assertFailure(null),
    AssertionError,
    "Expected value to be a failure result",
  );
});
