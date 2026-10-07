import { R } from "@praha/byethrow";
import {
  assertEquals,
  AssertionError,
  assertStrictEquals,
  assertThrows,
} from "@std/assert";

import { withFailure } from "./failure.ts";

Deno.test("withFailure() calls its callback once with the failure error", () => {
  const error = new Error("expected failure");
  const result: R.Result<string, Error> = R.fail(error);
  let callCount = 0;

  const returned = withFailure(result, (actualError) => {
    assertStrictEquals(actualError, error);
    assertEquals(actualError.message, "expected failure");
    callCount++;
  });

  assertEquals(callCount, 1);
  assertEquals(returned, undefined);
});

Deno.test("withFailure() throws for a success result without calling its callback", () => {
  let callCount = 0;

  assertThrows(
    () =>
      withFailure(R.succeed("value"), () => {
        callCount++;
      }),
    AssertionError,
    "Expected value to be a failure result",
  );

  assertEquals(callCount, 0);
});

Deno.test("withFailure() propagates errors thrown by its callback", () => {
  const error = new Error("callback failure");

  const thrown = assertThrows(
    () =>
      withFailure(R.fail(new Error("expected failure")), () => {
        throw error;
      }),
    Error,
    "callback failure",
  );

  assertStrictEquals(thrown, error);
});
