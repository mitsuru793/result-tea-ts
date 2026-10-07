import { assertEquals } from "@std/assert";
import { withSuccess } from "@mitsuru793/bythrow-assert";
import {
  allExtensions,
  baseName,
  execPath,
  join,
  lastExtension,
  parentDir,
} from "./path.ts";

Deno.test("parentDir() returns the parent directory", () => {
  withSuccess(parentDir("src/path.ts"), (actual) => {
    assertEquals(actual, "src");
  });
  withSuccess(parentDir("src/dir1/dir2/"), (actual) => {
    assertEquals(actual, "src/dir1");
  });
});

Deno.test("lastExtension() returns the text after the final dot", () => {
  withSuccess(lastExtension("/tmp/archive.tar.gz"), (actual) => {
    assertEquals(actual, "gz");
  });
  withSuccess(lastExtension("README"), (actual) => {
    assertEquals(actual, "");
  });
});

Deno.test("allExtensions() returns all text after each dot", () => {
  withSuccess(allExtensions("/tmp/archive.tar.gz"), (actual) => {
    assertEquals(actual, ["tar", "gz"]);
  });
  withSuccess(allExtensions("README"), (actual) => {
    assertEquals(actual, []);
  });
});

Deno.test("baseName() returns the final path segment", () => {
  withSuccess(baseName("/home/user/file.txt"), (actual) => {
    assertEquals(actual, "file.txt");
  });
  withSuccess(baseName("/home/user/"), (actual) => {
    assertEquals(actual, "");
  });
});

Deno.test("join() joins paths with a slash", () => {
  withSuccess(join(["home", "user", "file.txt"]), (actual) => {
    assertEquals(actual, "home/user/file.txt");
  });
  withSuccess(join([]), (actual) => {
    assertEquals(actual, "");
  });
});

Deno.test("execPath() returns the current executable path", () => {
  withSuccess(execPath(), (actual) => {
    assertEquals(actual, Deno.execPath());
  });
});
