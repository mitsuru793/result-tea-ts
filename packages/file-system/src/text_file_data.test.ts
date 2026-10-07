import { assertEquals, assertInstanceOf } from "@std/assert";
import { withFailure, withSuccess } from "@mitsuru793/bythrow-assert";
import * as v from "valibot";
import { ParseError, TextFileData } from "./mod.ts";

Deno.test.each([
  { name: ".txt extension", path: "hello.txt" },
  { name: ".json extension", path: "hello.json" },
  { name: "no extension", path: "README" },
  { name: "whitespace-only path", path: " " },
])(
  "TextFileData.create() accepts $name and empty content",
  ({ path }) => {
    withSuccess(TextFileData.create({ path, content: "" }), (file) => {
      assertEquals<TextFileData.Input>(file, { path, content: "" });
    });
  },
);

Deno.test("TextFileData.parse() preserves paths and content without normalization", () => {
  const input: unknown = { path: " file.json ", content: " body\n" };
  withSuccess(TextFileData.parse(input), (file) => {
    assertEquals(file, input);
  });
});

Deno.test("TextFileData.create() rejects an empty path", () => {
  withFailure(TextFileData.create({ path: "", content: "body" }), (error) => {
    assertInstanceOf(error, ParseError);
    assertInstanceOf(error, Error);
    assertEquals(error.issues[0].path?.[0].key, "path");
    assertEquals(error.issues[0].type, "min_length");
  });
});

Deno.test.each([
  { name: "empty path", input: { path: "", content: "body" }, field: "path" },
  {
    name: "numeric path",
    input: { path: 123, content: "body" },
    field: "path",
  },
  { name: "missing path", input: { content: "body" }, field: "path" },
  {
    name: "null content",
    input: { path: "file.txt", content: null },
    field: "content",
  },
  { name: "missing content", input: { path: "file.txt" }, field: "content" },
])(
  "TextFileData.parse() rejects $name with a $field issue",
  ({ input, field }) => {
    withFailure(TextFileData.parse(input), (error) => {
      assertInstanceOf(error, ParseError);
      assertEquals(error.issues[0].path?.[0].key, field);
    });
  },
);

Deno.test.each([
  { name: "null", input: null },
  { name: "undefined", input: undefined },
  { name: "number", input: 123 },
  { name: "string", input: "file.txt" },
  { name: "array", input: [] },
])(
  "TextFileData.parse() rejects $name input",
  ({ input }) => {
    withFailure(TextFileData.parse(input), (error) => {
      assertInstanceOf(error, ParseError);
      assertEquals(error.issues.length > 0, true);
    });
  },
);

Deno.test("TextFileData.parse() removes unknown object keys", () => {
  withSuccess(
    TextFileData.parse({ path: "file.txt", content: "body", extra: true }),
    (file) =>
      assertEquals<TextFileData.Input>(file, {
        path: "file.txt",
        content: "body",
      }),
  );
});

Deno.test("TextFileData.schema supports Valibot validation directly", () => {
  assertEquals(
    v.safeParse(TextFileData.schema, { path: "file.txt", content: "" }).success,
    true,
  );
});

function checkModelTypes(file: TextFileData.Type): void {
  // @ts-expect-error Parsed model fields are readonly.
  file.path = "other.txt";
  // @ts-expect-error Parsed model fields are readonly.
  file.content = "other";
}

Deno.test("TextFileData types distinguish input from a validated model", () => {
  const input: TextFileData.Input = { path: "file.txt", content: "body" };
  // @ts-expect-error A plain input does not carry the validation brand.
  const unvalidated: TextFileData.Type = input;
  void unvalidated;
  void checkModelTypes;
  withSuccess(TextFileData.create(input), (file) => {
    const validated: TextFileData.Type = file;
    assertEquals(validated, input);
  });
});
