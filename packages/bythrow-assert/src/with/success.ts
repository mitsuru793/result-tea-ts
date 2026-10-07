import type { R } from "@praha/byethrow";
import { assertSuccess } from "../assert/mod.ts";

export function withSuccess<T, E>(
  result: R.Result<T, E>,
  callback: (value: T) => void,
): void {
  const value = assertSuccess(result);
  callback(value);
}
