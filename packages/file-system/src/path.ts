import { R } from "@praha/byethrow";
import * as p from "@std/path";
import { FileSystemError } from "./file_system_error.ts";

export type ParentDirectory = (
  path: string,
) => R.Result<string, FileSystemError>;

export const parentDirectory: ParentDirectory = (path) => {
  try {
    const directory = p.dirname(path);
    return R.succeed(directory);
  } catch (error) {
    return R.fail(
      FileSystemError.fromCause({ operation: "parentDirectory", path }, error),
    );
  }
};

export type LastExtension = (path: string) => R.Result<string, FileSystemError>;

export const lastExtension: LastExtension = (path) => {
  try {
    if (!path.includes(".")) {
      return R.succeed("");
    }

    const ext = path.split(".").pop() ?? "";
    return R.succeed(ext);
  } catch (error) {
    return R.fail(
      FileSystemError.fromCause({ operation: "lastExtension", path }, error),
    );
  }
};

export type AllExtensions = (
  path: string,
) => R.Result<string[], FileSystemError>;

export const allExtensions: AllExtensions = (path) => {
  try {
    if (!path.includes(".")) {
      return R.succeed([]);
    }

    const exts = path.split(".").slice(1);
    return R.succeed(exts);
  } catch (error) {
    return R.fail(
      FileSystemError.fromCause({ operation: "allExtensions", path }, error),
    );
  }
};

export type BaseName = (path: string) => R.Result<string, FileSystemError>;

export const baseName: BaseName = (path) => {
  try {
    const base = path.split("/").pop() ?? "";
    return R.succeed(base);
  } catch (error) {
    return R.fail(
      FileSystemError.fromCause({ operation: "baseName", path }, error),
    );
  }
};

export type Join = (paths: string[]) => R.Result<string, FileSystemError>;

export const join: Join = (paths) => {
  try {
    const joined = paths.join("/");
    return R.succeed(joined);
  } catch (error) {
    return R.fail(
      FileSystemError.fromCause({ operation: "join", paths }, error),
    );
  }
};

export type ExecPath = () => R.Result<string, FileSystemError>;

export const execPath: ExecPath = () => {
  try {
    const path = Deno.execPath();
    return R.succeed(path);
  } catch (error) {
    return R.fail(FileSystemError.fromCause({ operation: "execPath" }, error));
  }
};
