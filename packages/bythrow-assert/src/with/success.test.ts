import { R } from "@praha/byethrow";
import {
  assertEquals,
  AssertionError,
  assertStrictEquals,
  assertThrows,
} from "@std/assert";

import { withSuccess } from "./success.ts";

Deno.test("withSuccess() calls its callback once with the success value", () => {
  const value = { name: "value" };
  const result = R.succeed(value);
  let callCount = 0;

  const returned = withSuccess(result, (actualValue) => {
    assertStrictEquals(actualValue, value);
    assertEquals(actualValue.name, "value");
    callCount++;
  });

  assertEquals(callCount, 1);
  assertEquals(returned, undefined);
});

Deno.test("withSuccess() throws for a failure result without calling its callback", () => {
  let callCount = 0;

  const failureResult = R.fail(new Error("expected failure"));
  assertThrows(
    () => {
      withSuccess(failureResult, () => {
        callCount++;
      });
    },
    AssertionError,
    "Expected value to be a success result",
  );

  assertEquals(callCount, 0);
});

Deno.test("withSuccess() propagates errors thrown by its callback", () => {
  const error = new Error("callback failure");

  const thrown = assertThrows(
    () =>
      withSuccess(R.succeed("value"), () => {
        throw error;
      }),
    Error,
    "callback failure",
  );

  assertStrictEquals(thrown, error);
});
