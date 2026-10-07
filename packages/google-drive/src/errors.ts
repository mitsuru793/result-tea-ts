import { ErrorFactory } from "@praha/error-factory";

const FailedResponseErrorBase: ReturnType<
  typeof ErrorFactory<
    "FailedResponseError",
    "Failed response from the server.",
    { status: number }
  >
> = ErrorFactory({
  name: "FailedResponseError",
  message: "Failed response from the server.",
  fields: ErrorFactory.fields<{
    status: number;
  }>(),
});

export class FailedResponseError extends FailedResponseErrorBase {}

const RequestErrorBase: ReturnType<
  typeof ErrorFactory<
    "RequestError",
    "The Google Drive request could not be completed."
  >
> = ErrorFactory({
  name: "RequestError",
  message: "The Google Drive request could not be completed.",
});

export class RequestError extends RequestErrorBase {}

const NotDirectoryErrorBase: ReturnType<
  typeof ErrorFactory<
    "NotDirectoryError",
    "The specified file is not a directory.",
    { mimeType: string }
  >
> = ErrorFactory({
  name: "NotDirectoryError",
  message: "The specified file is not a directory.",
  fields: ErrorFactory.fields<{
    mimeType: string;
  }>(),
});

export class NotDirectoryError extends NotDirectoryErrorBase {}
