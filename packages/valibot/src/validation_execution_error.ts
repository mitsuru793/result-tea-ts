import { ErrorFactory } from "@praha/error-factory";

const ValidationExecutionErrorBase: ReturnType<
  typeof ErrorFactory<
    "ValidationExecutionError",
    "Schema validation could not be completed"
  >
> = ErrorFactory({
  name: "ValidationExecutionError",
  message: "Schema validation could not be completed",
});

export class ValidationExecutionError extends ValidationExecutionErrorBase {}
