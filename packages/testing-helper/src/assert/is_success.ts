import { R } from "@praha/byethrow";
import { AssertionError } from "@std/assert";

export function assertIsSuccess(
  actual: unknown,
  callback?: (value: unknown) => void,
): asserts actual is R.Success<unknown> {
  if (!(R.isResult(actual) && R.isSuccess(actual))) {
    throw new AssertionError(
      `Expected value to be a success result, but received:\n ${
        Deno.inspect(actual)
      }`,
    );
  }

  if (callback) {
    callback(actual.value);
  }
}
