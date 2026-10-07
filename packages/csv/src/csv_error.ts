import { ErrorFactory } from "@praha/error-factory";

export type CsvOperation = "parse" | "stringify";

type CsvErrorFields = {
  operation: CsvOperation;
};

const CsvErrorBase: ReturnType<
  typeof ErrorFactory<"CsvError", string, CsvErrorFields>
> = ErrorFactory({
  name: "CsvError",
  message: ({ operation }) => `CSV operation failed: ${operation}`,
  fields: ErrorFactory.fields<CsvErrorFields>(),
});

export class CsvError extends CsvErrorBase {
  static fromCause(operation: CsvOperation, cause: unknown): CsvError {
    return new CsvError({ operation, cause });
  }
}
