import type { R } from "@praha/byethrow";
import * as v from "valibot";
import { createParse, type ParseFailure } from "@result-tea/valibot";
import * as FileSystemPath from "./file_system_path.ts";

/** Text to write at a path, regardless of extension or file existence. */
export const schema = v.pipe(
  v.object({
    path: FileSystemPath.schema,
    content: v.string(),
  }),
  v.readonly(),
  v.brand("TextFileData"),
);

export type Input = v.InferInput<typeof schema>;
export type Type = v.InferOutput<typeof schema>;

/** Validates unknown data without I/O; unknown object keys are removed. */
export const parse = createParse(schema);

export type Create = (input: Input) => R.Result<Type, ParseFailure>;

/** Constructs a validated model, not a file on disk. */
export const create: Create = (input) => parse(input);
