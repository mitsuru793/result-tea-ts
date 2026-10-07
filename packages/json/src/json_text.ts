import { R } from "@praha/byethrow";
import { JsonError } from "./json_error.ts";

declare const brand: unique symbol;

/** A string guaranteed to be syntactically valid JSON text. */
export type Type = string & { readonly [brand]: "JsonText" };

export type From = (text: string) => R.Result<Type, JsonError>;

/** Validates that `text` parses as JSON, branding it without keeping the parsed value. */
export const from: From = (text) => {
  try {
    JSON.parse(text);
    return R.succeed(text as Type);
  } catch (cause) {
    return R.fail(JsonError.fromCause("parse", cause));
  }
};
