import { assertEquals, assertInstanceOf } from "@std/assert";
import { withFailure, withSuccess } from "@result-tea/bythrow-assert";
import { ParseError } from "@result-tea/valibot";
import * as v from "valibot";
import { FileSystemPath, TextFileData } from "./mod.ts";

Deno.test.each([
  { name: "relative path", input: "folder/file.txt" },
  { name: "absolute path", input: "/folder/file.txt" },
  { name: "Windows-style path", input: "C:\\folder\\file.txt" },
  { name: "directory path", input: "folder/" },
  { name: "root", input: "/" },
  { name: "current directory", input: "." },
  { name: "parent directory", input: ".." },
  { name: "whitespace-only path", input: " " },
  { name: "surrounding spaces", input: " file.txt " },
  { name: "unnormalized path", input: "./folder/../file.txt" },
])("FileSystemPath accepts $name without normalization", ({ input }) => {
  for (const construct of [FileSystemPath.create, FileSystemPath.parse]) {
    withSuccess(construct(input), (path) => {
      assertEquals<string>(path, input);
    });
  }
});

Deno.test.each([
  { name: "empty string", input: "" },
  { name: "null", input: null },
  { name: "undefined", input: undefined },
  { name: "number", input: 123 },
  { name: "object", input: { path: "file.txt" } },
  { name: "array", input: ["file.txt"] },
])("FileSystemPath.parse() rejects $name", ({ input }) => {
  withFailure(FileSystemPath.parse(input), (error) => {
    assertInstanceOf(error, ParseError);
    assertEquals(error.issues.length > 0, true);
  });
});

Deno.test("FileSystemPath.create() rejects an empty string", () => {
  withFailure(FileSystemPath.create(""), (error) => {
    assertInstanceOf(error, ParseError);
    assertEquals(error.issues[0].type, "min_length");
  });
});

Deno.test("FileSystemPath.schema supports direct validation", () => {
  assertEquals(v.safeParse(FileSystemPath.schema, "file.txt").success, true);
  assertEquals(v.safeParse(FileSystemPath.schema, "").success, false);
});

Deno.test("FileSystemPath types require validation and are preserved by TextFileData", () => {
  const input: FileSystemPath.Input = "file.txt";
  // @ts-expect-error Plain strings do not carry the path validation brand.
  const unvalidated: FileSystemPath.Type = input;
  void unvalidated;

  withSuccess(FileSystemPath.create(input), (path) => {
    const validated: FileSystemPath.Type = path;
    assertEquals<string>(validated, input);
  });

  withSuccess(TextFileData.create({ path: input, content: "" }), (file) => {
    const path: FileSystemPath.Type = file.path;
    assertEquals<string>(path, input);
  });
});
