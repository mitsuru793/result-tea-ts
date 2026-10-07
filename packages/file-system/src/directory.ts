import { R } from "@praha/byethrow";

import { ensureDirSync, expandGlob, type WalkEntry } from "@std/fs";

import { FileSystemError } from "./file_system_error.ts";

export type Create = (path: string) => R.Result<void, FileSystemError>;

export const create: Create = (path) => {
  try {
    Deno.mkdirSync(path, { recursive: true });
    return R.succeed(undefined);
  } catch (error) {
    return R.fail(
      FileSystemError.fromCause({ operation: "createDirectory", path }, error),
    );
  }
};

export type CreateTmp = (
  prefix?: string,
) => R.Result<string, FileSystemError>;

export const createTmp: CreateTmp = (prefix = "") => {
  try {
    const tempDirectory = Deno.makeTempDirSync({ prefix });
    return R.succeed(tempDirectory);
  } catch (error) {
    return R.fail(
      FileSystemError.fromCause(
        { operation: "createTemporaryDirectory", prefix },
        error,
      ),
    );
  }
};

export type Ensure = (path: string) => R.Result<void, FileSystemError>;

export const ensure: Ensure = (path) => {
  try {
    ensureDirSync(path);
    return R.succeed(undefined);
  } catch (error) {
    return R.fail(
      FileSystemError.fromCause({ operation: "ensureDirectory", path }, error),
    );
  }
};

export type WriteFile = (
  content: string,
) => (childPath: string) => R.Result<void, FileSystemError>;

export const writeFile: WriteFile = (content) => (childPath) => {
  try {
    Deno.writeTextFileSync(childPath, content);
    return R.succeed(undefined);
  } catch (error) {
    return R.fail(
      FileSystemError.fromCause({ operation: "write", path: childPath }, error),
    );
  }
};

export type Glob = (
  options?: Parameters<typeof expandGlob>[1],
) => (
  pattern: string,
) => R.Result<AsyncIterableIterator<WalkEntry>, FileSystemError>;

export const glob: Glob = (options = {}) => (pattern) => {
  try {
    const files = expandGlob(pattern, options);
    return R.succeed(files);
  } catch (error) {
    return R.fail(
      FileSystemError.fromCause({ operation: "glob", pattern }, error),
    );
  }
};

export type RemoveForce = (
  path: string,
) => R.Result<void, FileSystemError>;

export const removeForce: RemoveForce = (path) => {
  try {
    Deno.removeSync(path, { recursive: true });
    return R.succeed(undefined);
  } catch (error) {
    return R.fail(
      FileSystemError.fromCause({ operation: "removeDirectory", path }, error),
    );
  }
};

export type IsEmpty = (path: string) => R.Result<boolean, FileSystemError>;

export const isEmpty: IsEmpty = (path) => {
  try {
    for (const _ of Deno.readDirSync(path)) {
      return R.succeed(false);
    }
    return R.succeed(true);
  } catch (error) {
    return R.fail(
      FileSystemError.fromCause({ operation: "readDirectory", path }, error),
    );
  }
};

export type IsFilled = (path: string) => R.Result<boolean, FileSystemError>;

export const isFilled: IsFilled = (path) => {
  try {
    for (const _ of Deno.readDirSync(path)) {
      return R.succeed(true);
    }
    return R.succeed(false);
  } catch (error) {
    return R.fail(
      FileSystemError.fromCause({ operation: "readDirectory", path }, error),
    );
  }
};
