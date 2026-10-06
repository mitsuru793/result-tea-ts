import { R } from "@praha/byethrow";
import { ReadFileError, RemoveFileError, WriteFileError } from "./errors.ts";

type Write = (
  content: string,
) => (path: string) => R.Result<void, WriteFileError>;

export const write: Write = (content) => (path) => {
  try {
    Deno.writeTextFileSync(path, content);
    return R.succeed(undefined);
  } catch (error) {
    return R.fail(new WriteFileError({ cause: error, path }));
  }
};

type Read = (path: string) => R.Result<string, ReadFileError>;

export const read: Read = (path) => {
  try {
    const content = Deno.readTextFileSync(path);
    return R.succeed(content);
  } catch (error) {
    return R.fail(new ReadFileError({ cause: error, path }));
  }
};

type Append = (
  content: string,
) => (path: string) => R.Result<void, WriteFileError>;

export const append: Append = (content) => (path) => {
  try {
    Deno.writeTextFileSync(path, content, { append: true });
    return R.succeed(undefined);
  } catch (error) {
    return R.fail(new WriteFileError({ cause: error, path }));
  }
};

type Prepend = (
  content: string,
) => (path: string) => R.Result<void, WriteFileError>;

export const prepend: Prepend = (content) => (path) => {
  try {
    const existingContent = Deno.readTextFileSync(path);
    Deno.writeTextFileSync(path, content + existingContent);
    return R.succeed(undefined);
  } catch (error) {
    return R.fail(new WriteFileError({ cause: error, path }));
  }
};

type Remove = (path: string) => R.Result<void, RemoveFileError>;

export const remove: Remove = (path) => {
  try {
    Deno.removeSync(path);
    return R.succeed(undefined);
  } catch (error) {
    return R.fail(new RemoveFileError({ cause: error, path }));
  }
};

export type IsEmpty = (path: string) => R.Result<boolean, ReadFileError>;

export const isEmpty: IsEmpty = (path) => {
  try {
    const content = Deno.readTextFileSync(path);
    return R.succeed(content.length === 0);
  } catch (error) {
    return R.fail(new ReadFileError({ cause: error, path }));
  }
};

export type IsFilled = (path: string) => R.Result<boolean, ReadFileError>;

export const isFilled: IsFilled = (path) => {
  try {
    const content = Deno.readTextFileSync(path);
    return R.succeed(content.length > 0);
  } catch (error) {
    return R.fail(new ReadFileError({ cause: error, path }));
  }
};
