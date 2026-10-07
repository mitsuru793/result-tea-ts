import { R } from "@praha/byethrow";
import { assertEquals, AssertionError, assertThrows } from "@std/assert";

import { assertSuccess } from "./success.ts";

Deno.test("assertSuccess() returns the value from a success result", () => {
  assertEquals(assertSuccess(R.succeed("value")), "value");
});

Deno.test("assertSuccess() throws for a failure result", () => {
  const failureResult = R.fail(new Error("expected failure"));
  assertThrows(
    () => assertSuccess(failureResult),
    AssertionError,
    `Expected value to be a success result, but received: "${
      Deno.inspect(failureResult)
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
])("assertSuccess() throws for a non-result value %#", (value) => {
  assertThrows(
    // @ts-expect-error: for runtime when the input is not a result
    () => assertSuccess(value),
    AssertionError,
    `Expected value to be a success result, but received: "${
      Deno.inspect(value)
    }"`,
  );
});
