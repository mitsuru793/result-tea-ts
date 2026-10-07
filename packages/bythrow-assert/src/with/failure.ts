import type { R } from "@praha/byethrow";
import { assertFailure } from "../assert/mod.ts";

export function withFailure<T, E>(
  result: R.Result<T, E>,
  callback: (error: E) => void,
): void {
  const error = assertFailure(result);
  callback(error);
}
