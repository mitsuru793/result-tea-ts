import { R } from "@praha/byethrow";
import { AssertionError } from "@std/assert";

export function assertFailure(
  actual: unknown,
): unknown {
  if (!(R.isResult(actual) && R.isFailure(actual))) {
    throw new AssertionError(
      `Expected value to be a failure result, but received:\n ${
        Deno.inspect(actual)
      }`,
    );
  }
  
  return actual.error;
}

