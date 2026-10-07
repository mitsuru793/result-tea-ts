import { ErrorFactory } from "@praha/error-factory";

export type JsonOperation = "parse" | "stringify";

type JsonErrorFields = {
  operation: JsonOperation;
};

const JsonErrorBase: ReturnType<
  typeof ErrorFactory<"JsonError", string, JsonErrorFields>
> = ErrorFactory({
  name: "JsonError",
  message: ({ operation }) => `JSON operation failed: ${operation}`,
  fields: ErrorFactory.fields<JsonErrorFields>(),
});

export class JsonError extends JsonErrorBase {
  static fromCause(operation: JsonOperation, cause: unknown): JsonError {
    return new JsonError({ operation, cause });
  }
}
