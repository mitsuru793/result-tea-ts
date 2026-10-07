import { ErrorFactory } from "@praha/error-factory";
import type * as v from "valibot";

type ParseErrorFields = {
  issues: readonly v.BaseIssue<unknown>[];
};

const ParseErrorBase: ReturnType<
  typeof ErrorFactory<
    "ParseError",
    "Model validation failed",
    ParseErrorFields
  >
> = ErrorFactory({
  name: "ParseError",
  message: "Model validation failed",
  fields: ErrorFactory.fields<ParseErrorFields>(),
});

export class ParseError extends ParseErrorBase {}
