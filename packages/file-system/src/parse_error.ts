import { ErrorFactory } from "@praha/error-factory";
import type * as v from "valibot";

export class ParseError extends ErrorFactory({
  name: "ParseError",
  message: "Model validation failed",
  fields: ErrorFactory.fields<{
    issues: readonly v.BaseIssue<unknown>[];
  }>(),
}) {}
