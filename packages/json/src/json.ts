import { R } from "@praha/byethrow";
import { JsonError } from "./json_error.ts";

export type Parse = (text: string) => R.Result<unknown, JsonError>;

export const parse: Parse = (text) => {
  try {
    const value: unknown = JSON.parse(text);
    return R.succeed(value);
  } catch (cause) {
    return R.fail(JsonError.fromCause("parse", cause));
  }
};

export type Stringify = (value: unknown) => R.Result<string, JsonError>;

export const stringify: Stringify = (value) => {
  try {
    const text = JSON.stringify(value);
    if (text === undefined) {
      return R.fail(
        JsonError.fromCause(
          "stringify",
          new TypeError("JSON.stringify returned undefined"),
        ),
      );
    }
    return R.succeed(text);
  } catch (cause) {
    return R.fail(JsonError.fromCause("stringify", cause));
  }
};
