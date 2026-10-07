import { R } from "@praha/byethrow";
import { assertEquals, AssertionError, assertThrows } from "@std/assert";

import { assertIsSuccess } from "./is_success.ts";

Deno.test("assertIsSuccess() accepts a success result", () => {
  assertIsSuccess(R.succeed("value"));
});

Deno.test("assertIsSuccess() passes the success value to its callback", () => {
  let receivedValue: unknown;

  assertIsSuccess(R.succeed("value"), (value) => {
    receivedValue = value;
  });

  assertEquals(receivedValue, "value");
});

Deno.test("assertIsSuccess() throws for a failure result", () => {
  assertThrows(
    () => assertIsSuccess(R.fail(new Error("expected failure"))),
    AssertionError,
    "Expected value to be a success result",
  );
});

Deno.test("assertIsSuccess() throws for a non-result value", () => {
  assertThrows(
    () => assertIsSuccess(null),
    AssertionError,
    "Expected value to be a success result",
  );
});
