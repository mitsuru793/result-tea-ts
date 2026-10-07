import { R } from "@praha/byethrow";
import * as v from "valibot";
import { ParseError } from "./parse_error.ts";

export function createParse<Schema extends v.GenericSchema>(
  schema: Schema,
): (input: unknown) => R.Result<v.InferOutput<Schema>, ParseError> {
  return (input) => {
    const parsed = v.safeParse(schema, input);
    if (parsed.success) {
      // R.succeed unwraps Promises; parsing must preserve the schema output.
      return { type: "Success", value: parsed.output };
    }
    return R.fail(new ParseError({ issues: parsed.issues }));
  };
}
