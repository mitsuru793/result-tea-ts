import { R } from "@praha/byethrow";
import {
  type DataItem,
  parse as parseCsv,
  type ParseOptions,
  type ParseResult,
  stringify as stringifyCsv,
  type StringifyOptions,
} from "@std/csv";
import { CsvError } from "./csv_error.ts";
import type * as CsvText from "./csv_text.ts";

export type Parse = {
  (text: string): R.Result<string[][], CsvError>;
  <T extends ParseOptions>(
    text: string,
    options: T,
  ): R.Result<ParseResult<ParseOptions, T>, CsvError>;
};

/**
 * Parses a CSV string into rows. Without `options`, each row is `string[]`;
 * `columns` or `skipFirstRow` instead produce an array of row objects.
 */
export const parse: Parse = ((text: string, options?: ParseOptions) => {
  try {
    const rows = options === undefined
      ? parseCsv(text)
      : parseCsv(text, options);
    return R.succeed(rows);
  } catch (cause) {
    return R.fail(CsvError.fromCause("parse", cause));
  }
}) as Parse;

export type Stringify = (
  data: readonly DataItem[],
  options?: StringifyOptions,
) => R.Result<CsvText.Type, CsvError>;

/** Serializes rows (plain objects or arrays) into a CSV string. */
export const stringify: Stringify = (data, options) => {
  try {
    const text = stringifyCsv(data, options);
    // stringifyCsv's output is valid CSV text by construction; skip re-validation.
    return R.succeed(text as CsvText.Type);
  } catch (cause) {
    return R.fail(CsvError.fromCause("stringify", cause));
  }
};
