import { ErrorFactory } from "@praha/error-factory";

export type JsonOperation = "parse" | "stringify";

export class JsonError extends ErrorFactory({
  name: "JsonError",
  message: ({ operation }) => `JSON operation failed: ${operation}`,
  fields: ErrorFactory.fields<{
    operation: JsonOperation;
  }>(),
}) {
  static fromCause(operation: JsonOperation, cause: unknown): JsonError {
    return new JsonError({ operation, cause });
  }
}
