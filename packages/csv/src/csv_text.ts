import { R } from "@praha/byethrow";
import { parse as parseCsv } from "@std/csv";
import { CsvError } from "./csv_error.ts";

declare const brand: unique symbol;

/** A string guaranteed to be syntactically valid CSV text. */
export type Type = string & { readonly [brand]: "CsvText" };

export type From = (text: string) => R.Result<Type, CsvError>;

/** Validates that `text` parses as CSV, branding it without keeping the parsed rows. */
export const from: From = (text) => {
  try {
    parseCsv(text);
    return R.succeed(text as Type);
  } catch (cause) {
    return R.fail(CsvError.fromCause("parse", cause));
  }
};
