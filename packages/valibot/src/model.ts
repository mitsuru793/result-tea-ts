import { R } from "@praha/byethrow";
import * as v from "valibot";
import { ParseError } from "./parse_error.ts";
import { ValidationExecutionError } from "./validation_execution_error.ts";

export type ParseFailure = ParseError | ValidationExecutionError;

export type DefinedModel<Schema extends v.GenericSchema> = {
  readonly schema: Schema;
  readonly create: (
    input: v.InferInput<Schema>,
  ) => R.Result<v.InferOutput<Schema>, ParseFailure>;
  readonly parse: (
    input: unknown,
  ) => R.Result<v.InferOutput<Schema>, ParseFailure>;
};

/**
 * Defines a model with its schema, a typed constructor, and an unknown-input parser.
 * Both functions validate synchronously and preserve the schema output.
 */
export function define<Schema extends v.GenericSchema>(
  schema: Schema,
): DefinedModel<Schema> {
  const parse = createParse(schema);
  return { schema, create: parse, parse };
}

/**
 * Creates a synchronous parser, preserving schema output without unwrapping it.
 * Thrown validation errors become failures; later Promise rejections do not.
 */
export function createParse<Schema extends v.GenericSchema>(
  schema: Schema,
): (
  input: unknown,
) => R.Result<v.InferOutput<Schema>, ParseFailure> {
  return (input) => {
    let parsed: v.SafeParseResult<Schema>;

    try {
      parsed = v.safeParse(schema, input);
    } catch (cause) {
      return R.fail(new ValidationExecutionError({ cause }));
    }

    if (parsed.success) {
      // R.succeed unwraps Promises; preserve Promise-valued output in a synchronous Result.
      return { type: "Success", value: parsed.output };
    }

    return R.fail(new ParseError({ issues: parsed.issues }));
  };
}
