import type { R } from "@praha/byethrow";
import * as v from "valibot";
import { createParse } from "./model.ts";
import type { ParseError } from "./parse_error.ts";

/** Text to write at a path, regardless of extension or file existence. */
export const schema = v.pipe(
  v.object({
    path: v.pipe(v.string(), v.minLength(1)),
    content: v.string(),
  }),
  v.readonly(),
  v.brand("TextFileData"),
);

export type Input = v.InferInput<typeof schema>;
export type Type = v.InferOutput<typeof schema>;

/** Validates unknown data without I/O; unknown object keys are removed. */
export const parse = createParse(schema);

export type Create = (input: Input) => R.Result<Type, ParseError>;

/** Constructs a validated model, not a file on disk. */
export const create: Create = (input) => parse(input);
