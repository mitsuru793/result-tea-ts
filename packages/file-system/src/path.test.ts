import { assertEquals } from "@std/assert";
import {
  allExtensions,
  baseName,
  execPath,
  join,
  lastExtension,
  parentDir,
} from "./path.ts";

Deno.test("parentDir() returns the parent directory", () => {
  assertEquals(parentDir("src/path.ts"), {
    type: "Success",
    value: "src",
  });
  assertEquals(parentDir("src/dir1/dir2/"), {
    type: "Success",
    value: "src/dir1",
  });
});

Deno.test("lastExtension() returns the text after the final dot", () => {
  assertEquals(lastExtension("/tmp/archive.tar.gz"), {
    type: "Success",
    value: "gz",
  });
  assertEquals(lastExtension("README"), {
    type: "Success",
    value: "",
  });
});

Deno.test("allExtensions() returns all text after each dot", () => {
  assertEquals(allExtensions("/tmp/archive.tar.gz"), {
    type: "Success",
    value: ["tar", "gz"],
  });
  assertEquals(allExtensions("README"), {
    type: "Success",
    value: [],
  });
});

Deno.test("baseName() returns the final path segment", () => {
  assertEquals(baseName("/home/user/file.txt"), {
    type: "Success",
    value: "file.txt",
  });
  assertEquals(baseName("/home/user/"), {
    type: "Success",
    value: "",
  });
});

Deno.test("join() joins paths with a slash", () => {
  assertEquals(join(["home", "user", "file.txt"]), {
    type: "Success",
    value: "home/user/file.txt",
  });
  assertEquals(join([]), {
    type: "Success",
    value: "",
  });
});

Deno.test("execPath() returns the current executable path", () => {
  assertEquals(execPath(), {
    type: "Success",
    value: Deno.execPath(),
  });
});
