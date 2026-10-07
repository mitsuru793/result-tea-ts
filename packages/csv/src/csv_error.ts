import { ErrorFactory } from "@praha/error-factory";

export type CsvOperation = "parse" | "stringify";

export class CsvError extends ErrorFactory({
  name: "CsvError",
  message: ({ operation }) => `CSV operation failed: ${operation}`,
  fields: ErrorFactory.fields<{
    operation: CsvOperation;
  }>(),
}) {
  static fromCause(operation: CsvOperation, cause: unknown): CsvError {
    return new CsvError({ operation, cause });
  }
}
