import {
  assertEquals,
  assertInstanceOf,
  assertStrictEquals,
} from "@std/assert";
import {
  classifyCause,
  FileSystemError,
  type FileSystemErrorCode,
  type FileSystemErrorContext,
} from "./file_system_error.ts";
import { FileSystemError as PublicFileSystemError } from "./mod.ts";

const cases = {
  NOT_FOUND: [new Deno.errors.NotFound("missing")],
  ALREADY_EXISTS: [new Deno.errors.AlreadyExists("exists")],
  PERMISSION_DENIED: [new Deno.errors.PermissionDenied("denied")],
  NOT_CAPABLE: [new Deno.errors.NotCapable("not allowed")],
  UNKNOWN: [new Error("unexpected"), "unexpected", null, undefined],
} satisfies Record<FileSystemErrorCode, readonly unknown[]>;

for (const [code, causes] of Object.entries(cases)) {
  Deno.test(`classifyCause() returns ${code}`, () => {
    for (const cause of causes) {
      assertEquals(classifyCause(cause), code);
      const context = { operation: "read", path: "file.txt" } as const;
      const error = FileSystemError.fromCause(context, cause);
      assertInstanceOf(error, FileSystemError);
      assertEquals(error.code, code);
      assertEquals(error.context, context);
      assertStrictEquals(error.cause, cause);
    }
  });
}

Deno.test("the public entry point exports the FileSystemError class", () => {
  assertStrictEquals(PublicFileSystemError, FileSystemError);
});

Deno.test("FileSystemError.fromCause preserves every context shape and unknown causes", () => {
  const contexts = [
    { operation: "read", path: "file.txt" },
    { operation: "prepend", path: "file.txt", phase: "read" },
    { operation: "createTemporaryDirectory", prefix: "test-" },
    { operation: "glob", pattern: "*.txt" },
    { operation: "join", paths: ["one", "two"] },
    { operation: "execPath" },
  ] satisfies FileSystemErrorContext[];

  for (const context of contexts) {
    const cause = "unexpected failure";
    const error = FileSystemError.fromCause(context, cause);
    assertInstanceOf(error, FileSystemError);
    assertEquals(error.code, "UNKNOWN");
    assertEquals(error.context, context);
    assertStrictEquals(error.cause, cause);
  }
});

Deno.test("FileSystemError preserves the code, context, and original cause", () => {
  const cause = new Deno.errors.NotFound("missing");
  const context = { operation: "write", path: "missing/file.txt" } as const;
  const error = new FileSystemError({
    code: classifyCause(cause),
    context,
    cause,
  });

  assertInstanceOf(error, Error);
  assertEquals(error.name, "FileSystemError");
  assertEquals(
    error.message,
    "File system operation failed: write (NOT_FOUND)",
  );
  assertEquals(error.code, "NOT_FOUND");
  assertEquals(error.context, context);
  assertStrictEquals(error.cause, cause);
  assertEquals(typeof error.stack, "string");
});
