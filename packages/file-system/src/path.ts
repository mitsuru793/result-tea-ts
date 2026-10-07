import { R } from "@praha/byethrow";
import * as p from "@std/path";
import { JoinPathError, PathError, ResolveExecPathError } from "./errors.ts";

export type ParentDirectory = (path: string) => R.Result<string, PathError>;

export const parentDirectory: ParentDirectory = (path) => {
  try {
    const directory = p.dirname(path);
    return R.succeed(directory);
  } catch (error) {
    return R.fail(new PathError({ cause: error, path }));
  }
};

export type LastExtension = (path: string) => R.Result<string, PathError>;

export const lastExtension: LastExtension = (path) => {
  try {
    if (!path.includes(".")) {
      return R.succeed("");
    }

    const ext = path.split(".").pop() ?? "";
    return R.succeed(ext);
  } catch (error) {
    return R.fail(new PathError({ cause: error, path }));
  }
};

export type AllExtensions = (path: string) => R.Result<string[], PathError>;

export const allExtensions: AllExtensions = (path) => {
  try {
    if (!path.includes(".")) {
      return R.succeed([]);
    }

    const exts = path.split(".").slice(1);
    return R.succeed(exts);
  } catch (error) {
    return R.fail(new PathError({ cause: error, path }));
  }
};

export type BaseName = (path: string) => R.Result<string, PathError>;

export const baseName: BaseName = (path) => {
  try {
    const base = path.split("/").pop() ?? "";
    return R.succeed(base);
  } catch (error) {
    return R.fail(new PathError({ cause: error, path }));
  }
};

export type Join = (paths: string[]) => R.Result<string, JoinPathError>;

export const join: Join = (paths) => {
  try {
    const joined = paths.join("/");
    return R.succeed(joined);
  } catch (error) {
    return R.fail(new JoinPathError({ cause: error, paths: paths }));
  }
};

export type ExecPath = () => R.Result<string, ResolveExecPathError>;

export const execPath: ExecPath = () => {
  try {
    const path = Deno.execPath();
    return R.succeed(path);
  } catch (error) {
    return R.fail(new ResolveExecPathError({ cause: error }));
  }
};
