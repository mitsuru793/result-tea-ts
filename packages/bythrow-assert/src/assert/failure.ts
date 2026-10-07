import { R } from "@praha/byethrow";
import { AssertionError } from "@std/assert";

export function assertFailure<T, E>(
  actual: R.Result<T, E>,
): E {
  if (!(R.isResult(actual) && R.isFailure(actual))) {
    throw new AssertionError(
      `Expected value to be a failure result, but received: "${
        Deno.inspect(actual)
      }"`,
    );
  }

  return actual.error;
}
