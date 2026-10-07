import { R } from "@praha/byethrow";
import { assertEquals, AssertionError, assertThrows } from "@std/assert";

import { assertIsFailure } from "./is_failure.ts";

Deno.test("assertIsFailure() accepts a failure result", () => {
  const error = new Error("expected failure");

  assertIsFailure(R.fail(error));
});

Deno.test("assertIsFailure() passes the failure error to its callback", () => {
  const error = new Error("expected failure");
  let receivedError: unknown;

  assertIsFailure(R.fail(error), (actualError) => {
    receivedError = actualError;
  });

  assertEquals(receivedError, error);
});

Deno.test("assertIsFailure() throws for a success result", () => {
  assertThrows(
    () => assertIsFailure(R.succeed("value")),
    AssertionError,
    "Expected value to be a failure result",
  );
});

Deno.test("assertIsFailure() throws for a non-result value", () => {
  assertThrows(
    () => assertIsFailure(null),
    AssertionError,
    "Expected value to be a failure result",
  );
});
