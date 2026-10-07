import { R } from "@praha/byethrow";
import { AssertionError } from "@std/assert";

export function assertIsFailure(
  actual: unknown,
  callback?: (error: unknown) => void,
): asserts actual is R.Failure<unknown> {
  if (!(R.isResult(actual) && R.isFailure(actual))) {
    throw new AssertionError(
      `Expected value to be a failure result, but received:\n ${
        Deno.inspect(actual)
      }`,
    );
  }

  if (callback) {
    callback(actual.error);
  }
}
