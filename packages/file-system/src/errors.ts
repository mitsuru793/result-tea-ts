import { ErrorFactory } from "@praha/error-factory";

export type FileSystemErrorCode =
  | "NOT_FOUND"
  | "ALREADY_EXISTS"
  | "PERMISSION_DENIED"
  | "NOT_CAPABLE"
  | "UNKNOWN";

export function classifyCause(cause: unknown): FileSystemErrorCode {
  if (cause instanceof Deno.errors.NotFound) {
    return "NOT_FOUND";
  }
  if (cause instanceof Deno.errors.AlreadyExists) {
    return "ALREADY_EXISTS";
  }
  if (cause instanceof Deno.errors.PermissionDenied) {
    return "PERMISSION_DENIED";
  }
  if (cause instanceof Deno.errors.NotCapable) {
    return "NOT_CAPABLE";
  }
  return "UNKNOWN";
}

export type FileSystemErrorContext =
  | {
    readonly operation:
      | "read"
      | "write"
      | "remove"
      | "append"
      | "createDirectory"
      | "ensureDirectory"
      | "removeDirectory"
      | "readDirectory"
      | "parentDirectory"
      | "lastExtension"
      | "allExtensions"
      | "baseName";
    readonly path: string;
  }
  | {
    readonly operation: "prepend";
    readonly path: string;
    readonly phase: "read" | "write";
  }
  | {
    readonly operation: "createTemporaryDirectory";
    readonly prefix: string;
  }
  | {
    readonly operation: "join";
    readonly paths: readonly string[];
  }
  | {
    readonly operation: "execPath";
  }
  | {
    readonly operation: "glob";
    readonly pattern: string;
  };

export class FileSystemError extends ErrorFactory({
  name: "FileSystemError",
  message: ({ code, context }) =>
    `File system operation failed: ${context.operation} (${code})`,
  fields: ErrorFactory.fields<{
    code: FileSystemErrorCode;
    context: FileSystemErrorContext;
  }>(),
}) {}

export function createFileSystemError(
  context: FileSystemErrorContext,
  cause: unknown,
): FileSystemError {
  return new FileSystemError({
    code: classifyCause(cause),
    context,
    cause,
  });
}
