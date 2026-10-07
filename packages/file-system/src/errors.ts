import { ErrorFactory } from "@praha/error-factory";

export class FileSystemError extends ErrorFactory({
  name: "FileSystemError",
  message: "An error occurred in the file system",
  fields: ErrorFactory.fields<{ path: string }>(),
}) {}

export class CreateDirectoryError extends ErrorFactory({
  name: "CreateDirectoryError",
  message: ({ path }) => `Cannot create the directory "${path}"`,
  fields: ErrorFactory.fields<{ path: string }>(),
}) {}

export class WriteFileError extends ErrorFactory({
  name: "WriteFileError",
  message: ({ path }) => `Cannot write the file "${path}"`,
  fields: ErrorFactory.fields<{ path: string }>(),
}) {}

export class ReadGlobError extends ErrorFactory({
  name: "ReadGlobError",
  message: ({ pattern }) => `Cannot read the glob pattern "${pattern}"`,
  fields: ErrorFactory.fields<{ pattern: string }>(),
}) {}

export class ReadDirectoryError extends ErrorFactory({
  name: "ReadDirectoryError",
  message: ({ path }) => `Cannot read the directory "${path}"`,
  fields: ErrorFactory.fields<{ path: string }>(),
}) {}

export class ReadFileError extends ErrorFactory({
  name: "ReadFileError",
  message: ({ path }) => `Cannot read the file "${path}"`,
  fields: ErrorFactory.fields<{ path: string }>(),
}) {}

export class PathError extends ErrorFactory({
  name: "PathError",
  message: ({ path }) => `Cannot resolve the path "${path}"`,
  fields: ErrorFactory.fields<{ path: string }>(),
}) {}

export class JoinPathError extends ErrorFactory({
  name: "JoinPathError",
  message: ({ paths }) => `Cannot join the paths "${paths.join(", ")}"`,
  fields: ErrorFactory.fields<{ paths: string[] }>(),
}) {}

export class ResolveExecPathError extends ErrorFactory({
  name: "ResolveExecPathError",
  message: "Cannot resolve the executable path",
}) {}

export class RemoveDirectoryError extends ErrorFactory({
  name: "RemoveDirectoryError",
  message: ({ path }) => `Cannot remove the directory "${path}"`,
  fields: ErrorFactory.fields<{ path: string }>(),
}) {}

export class RemoveFileError extends ErrorFactory({
  name: "RemoveFileError",
  message: ({ path }) => `Cannot remove the file "${path}"`,
  fields: ErrorFactory.fields<{ path: string }>(),
}) {}
