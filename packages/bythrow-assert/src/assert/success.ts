import { R } from "@praha/byethrow";
import { AssertionError } from "@std/assert";

export function assertSuccess(
  actual: unknown,
): unknown {
  if (!(R.isResult(actual) && R.isSuccess(actual))) {
    throw new AssertionError(
      `Expected value to be a success result, but received:\n ${
        Deno.inspect(actual)
      }`,
    );
  }

  return actual.value;
}
