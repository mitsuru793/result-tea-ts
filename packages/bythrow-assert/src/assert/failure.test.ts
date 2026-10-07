import { R } from "@praha/byethrow";
import { assertEquals, AssertionError, assertThrows } from "@std/assert";

import { assertFailure } from "./failure.ts";

Deno.test("assertFailure() returns the error from a failure result", () => {
  const error = new Error("expected failure");

  assertEquals(assertFailure(R.fail(error)), error);
});

Deno.test("assertFailure() throws for a success result", () => {
  const successResult = R.succeed("value");
  assertThrows(
    () => assertFailure(successResult),
    AssertionError,
    `Expected value to be a failure result, but received: "${
      Deno.inspect(successResult)
    }"`,
  );
});

Deno.test.each([
  [null],
  [undefined],
  [42],
  ["string"],
  [{}],
  [[]],
  [Symbol("symbol")],
  [true],
  [false],
])("assertFailure() throws for a non-result value %#", (value) => {
  assertThrows(
    // @ts-expect-error: for runtime when the input is not a result
    () => assertFailure(value),
    AssertionError,
    `Expected value to be a failure result, but received: "${
      Deno.inspect(value)
    }"`,
  );
});
