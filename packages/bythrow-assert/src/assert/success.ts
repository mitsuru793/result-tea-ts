import { R } from "@praha/byethrow";
import { AssertionError } from "@std/assert";

export function assertSuccess<T, E>(
  actual: R.Result<T, E>,
): T {
  if (!(R.isResult(actual) && R.isSuccess(actual))) {
    throw new AssertionError(
      `Expected value to be a success result, but received: "${
        Deno.inspect(actual)
      }"`,
    );
  }

  return actual.value;
}
