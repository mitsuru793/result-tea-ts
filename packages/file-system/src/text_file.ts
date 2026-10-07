import { R } from "@praha/byethrow";
import { FileSystemError } from "./file_system_error.ts";

type Write = (
  content: string,
) => (path: string) => R.Result<void, FileSystemError>;

export const write: Write = (content) => (path) => {
  try {
    Deno.writeTextFileSync(path, content);
    return R.succeed(undefined);
  } catch (error) {
    return R.fail(
      FileSystemError.fromCause({ operation: "write", path }, error),
    );
  }
};

type Read = (path: string) => R.Result<string, FileSystemError>;

export const read: Read = (path) => {
  try {
    const content = Deno.readTextFileSync(path);
    return R.succeed(content);
  } catch (error) {
    return R.fail(
      FileSystemError.fromCause({ operation: "read", path }, error),
    );
  }
};

export type Ensure = (path: string) => R.Result<void, FileSystemError>;

export const ensure: Ensure = (path) => {
  try {
    const file = Deno.openSync(path, { create: true, write: true });
    file.close();
    return R.succeed(undefined);
  } catch (error) {
    return R.fail(
      FileSystemError.fromCause({ operation: "ensure", path }, error),
    );
  }
};

type Append = (
  content: string,
) => (path: string) => R.Result<void, FileSystemError>;

export const append: Append = (content) => (path) => {
  try {
    Deno.writeTextFileSync(path, content, { append: true });
    return R.succeed(undefined);
  } catch (error) {
    return R.fail(
      FileSystemError.fromCause({ operation: "append", path }, error),
    );
  }
};

type Prepend = (
  content: string,
) => (path: string) => R.Result<void, FileSystemError>;

export const prepend: Prepend = (content) => (path) => {
  let phase: "read" | "write" = "read";
  try {
    const existingContent = Deno.readTextFileSync(path);
    phase = "write";
    Deno.writeTextFileSync(path, content + existingContent);
    return R.succeed(undefined);
  } catch (error) {
    return R.fail(
      FileSystemError.fromCause({ operation: "prepend", path, phase }, error),
    );
  }
};

type Remove = (path: string) => R.Result<void, FileSystemError>;

export const remove: Remove = (path) => {
  try {
    Deno.removeSync(path);
    return R.succeed(undefined);
  } catch (error) {
    return R.fail(
      FileSystemError.fromCause({ operation: "remove", path }, error),
    );
  }
};

export type IsEmpty = (path: string) => R.Result<boolean, FileSystemError>;

export const isEmpty: IsEmpty = (path) => {
  try {
    const content = Deno.readTextFileSync(path);
    return R.succeed(content.length === 0);
  } catch (error) {
    return R.fail(
      FileSystemError.fromCause({ operation: "read", path }, error),
    );
  }
};

export type IsFilled = (path: string) => R.Result<boolean, FileSystemError>;

export const isFilled: IsFilled = (path) => {
  try {
    const content = Deno.readTextFileSync(path);
    return R.succeed(content.length > 0);
  } catch (error) {
    return R.fail(
      FileSystemError.fromCause({ operation: "read", path }, error),
    );
  }
};
