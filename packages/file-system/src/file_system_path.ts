import type { R } from "@praha/byethrow";
import { createParse, type ParseFailure } from "@result-tea/valibot";
import * as v from "valibot";

/**
 * A non-empty file or directory path, relative or absolute, without normalization.
 * Does not guarantee existence, permissions, or OS-specific path validity.
 */
export const schema = v.pipe(
  v.string(),
  v.minLength(1),
  v.brand("FileSystemPath"),
);

export type Input = v.InferInput<typeof schema>;
export type Type = v.InferOutput<typeof schema>;

export const parse = createParse(schema);

export type Create = (input: Input) => R.Result<Type, ParseFailure>;

export const create: Create = (input) => parse(input);
