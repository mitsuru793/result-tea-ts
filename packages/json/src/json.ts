import { R } from "@praha/byethrow";
import { JsonError } from "./json_error.ts";
import type * as JsonText from "./json_text.ts";

export type Parse = (text: string) => R.Result<unknown, JsonError>;

export const parse: Parse = (text) => {
  try {
    const value: unknown = JSON.parse(text);
    return R.succeed(value);
  } catch (cause) {
    return R.fail(JsonError.fromCause("parse", cause));
  }
};

export type Stringify = (value: unknown) => R.Result<JsonText.Type, JsonError>;

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
    // JSON.stringify's output is valid JSON text by construction; skip re-validation.
    return R.succeed(text as JsonText.Type);
  } catch (cause) {
    return R.fail(JsonError.fromCause("stringify", cause));
  }
};
