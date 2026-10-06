import { R } from "@praha/byethrow";

import { ensureDirSync, expandGlob, WalkEntry } from "@std/fs";

import {
  CreateDirectoryError,
  ReadDirError,
  ReadGlobError,
  RemoveDirError,
  WriteFileError,
} from "./errors.ts";

export type Create = (path: string) => R.Result<void, CreateDirectoryError>;

export const create: Create = (path) => {
  try {
    Deno.mkdirSync(path, { recursive: true });
    return R.succeed(undefined);
  } catch (error) {
    return R.fail(new CreateDirectoryError({ cause: error, path }));
  }
};

export type CreateTmp = (
  prefix?: string,
) => R.Result<string, CreateDirectoryError>;

export const createTmp: CreateTmp = (prefix = "") => {
  try {
    const tempDir = Deno.makeTempDirSync({ prefix });
    return R.succeed(tempDir);
  } catch (error) {
    return R.fail(new CreateDirectoryError({ cause: error, path: prefix }));
  }
};

export type Ensure = (path: string) => R.Result<void, CreateDirectoryError>;

export const ensure: Ensure = (path) => {
  try {
    ensureDirSync(path);
    return R.succeed(undefined);
  } catch (error) {
    return R.fail(new CreateDirectoryError({ cause: error, path }));
  }
};

export type WriteFile = (
  content: string,
) => (childPath: string) => R.Result<void, WriteFileError>;

export const writeFile: WriteFile = (content) => (childPath) => {
  try {
    Deno.writeTextFileSync(childPath, content);
    return R.succeed(undefined);
  } catch (error) {
    return R.fail(new WriteFileError({ cause: error, path: childPath }));
  }
};

export type Glob = (
  options?: Parameters<typeof expandGlob>[1],
) => (
  pattern: string,
) => R.Result<AsyncIterableIterator<WalkEntry>, ReadGlobError>;

export const glob: Glob = (options = {}) => (pattern) => {
  try {
    const files = expandGlob(pattern, options);
    return R.succeed(files);
  } catch (error) {
    return R.fail(new ReadGlobError({ cause: error, pattern }));
  }
};

export type RemoveForce = (path: string) => R.Result<void, RemoveDirError>;

export const removeForce: RemoveForce = (path) => {
  try {
    Deno.removeSync(path, { recursive: true });
    return R.succeed(undefined);
  } catch (error) {
    return R.fail(new RemoveDirError({ cause: error, path }));
  }
};

export type IsEmpty = (path: string) => R.Result<boolean, ReadDirError>;

export const isEmpty: IsEmpty = (path) => {
  try {
    for (const _ of Deno.readDirSync(path)) {
      return R.succeed(false);
    }
    return R.succeed(true);
  } catch (error) {
    return R.fail(new ReadDirError({ cause: error, path }));
  }
};

export type IsFilled = (path: string) => R.Result<boolean, ReadDirError>;

export const isFilled: IsFilled = (path) => {
  try {
    for (const _ of Deno.readDirSync(path)) {
      return R.succeed(true);
    }
    return R.succeed(false);
  } catch (error) {
    return R.fail(new ReadDirError({ cause: error, path }));
  }
};
