import {
  assertEquals,
  assertInstanceOf,
  assertStrictEquals,
} from "@std/assert";
import { withFailure, withSuccess } from "@result-tea/bythrow-assert";
import { FileSystemError } from "./file_system_error.ts";
import {
  append,
  isEmpty,
  isFilled,
  prepend,
  read,
  remove,
  write,
} from "./text_file.ts";

function fileSystemTest(
  name: string,
  fn: () => void | Promise<void>,
): void {
  Deno.test({ name, fn, permissions: { read: true, write: true } });
}

async function withTempDirectory(
  fn: (root: string) => void | Promise<void>,
): Promise<void> {
  const root = Deno.makeTempDirSync();
  try {
    await fn(root);
  } finally {
    Deno.removeSync(root, { recursive: true });
  }
}

fileSystemTest("write() creates or replaces file content", async () => {
  await withTempDirectory((root) => {
    const path = `${root}/file.txt`;

    withSuccess(write("initial")(path), (actual) => {
      assertEquals(actual, undefined);
    });
    withSuccess(write("replaced")(path), (actual) => {
      assertEquals(actual, undefined);
    });
    assertEquals(Deno.readTextFileSync(path), "replaced");
  });
});

Deno.test({
  name: "write() returns NOT_CAPABLE when write permission is denied",
  permissions: { write: false },
  fn: () => {
    const path = "permission-denied.txt";
    withFailure(write("content")(path), (error) => {
      assertInstanceOf(error, FileSystemError);
      assertEquals(error.code, "NOT_CAPABLE");
      assertEquals(error.context, { operation: "write", path });
      assertInstanceOf(error.cause, Deno.errors.NotCapable);
    });
  },
});

fileSystemTest("read() returns file content", async () => {
  await withTempDirectory((root) => {
    const path = `${root}/file.txt`;
    Deno.writeTextFileSync(path, "content");

    withSuccess(read(path), (actual) => {
      assertEquals(actual, "content");
    });
  });
});

fileSystemTest("append() adds content to the end of a file", async () => {
  await withTempDirectory((root) => {
    const path = `${root}/file.txt`;
    Deno.writeTextFileSync(path, "first");

    withSuccess(append(" second")(path), (actual) => {
      assertEquals(actual, undefined);
    });
    assertEquals(Deno.readTextFileSync(path), "first second");
  });
});

fileSystemTest(
  "prepend() adds content to the beginning of a file",
  async () => {
    await withTempDirectory((root) => {
      const path = `${root}/file.txt`;
      Deno.writeTextFileSync(path, "last");

      withSuccess(prepend("first ")(path), (actual) => {
        assertEquals(actual, undefined);
      });
      assertEquals(Deno.readTextFileSync(path), "first last");
    });
  },
);

fileSystemTest("remove() removes a file", async () => {
  await withTempDirectory((root) => {
    const path = `${root}/file.txt`;
    Deno.writeTextFileSync(path, "content");

    withSuccess(remove(path), (actual) => {
      assertEquals(actual, undefined);
    });
    withFailure(read(path), (error) => {
      assertEquals(error.context, { operation: "read", path });
      assertEquals(error.code, "NOT_FOUND");
    });
  });
});

fileSystemTest("isEmpty() returns true for empty files", async () => {
  await withTempDirectory((root) => {
    Deno.writeTextFileSync(`${root}/empty.txt`, "");
    Deno.writeTextFileSync(`${root}/filled.txt`, "content");

    withSuccess(isEmpty(`${root}/empty.txt`), (actual) => {
      assertEquals(actual, true);
    });
    withSuccess(isEmpty(`${root}/filled.txt`), (actual) => {
      assertEquals(actual, false);
    });
  });
});

fileSystemTest("isFilled() returns true for non-empty files", async () => {
  await withTempDirectory((root) => {
    Deno.writeTextFileSync(`${root}/empty.txt`, "");
    Deno.writeTextFileSync(`${root}/filled.txt`, "content");

    withSuccess(isFilled(`${root}/empty.txt`), (actual) => {
      assertEquals(actual, false);
    });
    withSuccess(isFilled(`${root}/filled.txt`), (actual) => {
      assertEquals(actual, true);
    });
  });
});

// TODO: move test cases for invalid paths to each test case for functions
fileSystemTest(
  "file operations return failures for invalid paths",
  async () => {
    await withTempDirectory((root) => {
      const missingPath = `${root}/missing/file.txt`;

      withFailure(write("content")(missingPath), (error) => {
        assertInstanceOf(error, FileSystemError);
        assertEquals(error.code, "NOT_FOUND");
        assertEquals(error.context, {
          operation: "write",
          path: missingPath,
        });
        assertInstanceOf(error.cause, Deno.errors.NotFound);
      });
      withFailure(read(missingPath), (error) => {
        assertInstanceOf(error, FileSystemError);
        assertEquals(error.code, "NOT_FOUND");
        assertEquals(error.context, { operation: "read", path: missingPath });
        assertInstanceOf(error.cause, Deno.errors.NotFound);
      });
      withFailure(append("content")(missingPath), (error) => {
        assertInstanceOf(error, FileSystemError);
        assertEquals(error.code, "NOT_FOUND");
        assertEquals(error.context, { operation: "append", path: missingPath });
        assertInstanceOf(error.cause, Deno.errors.NotFound);
      });
      withFailure(prepend("content")(missingPath), (error) => {
        assertInstanceOf(error, FileSystemError);
        assertEquals(error.code, "NOT_FOUND");
        assertEquals(error.context, {
          operation: "prepend",
          path: missingPath,
          phase: "read",
        });
        assertInstanceOf(error.cause, Deno.errors.NotFound);
      });
      withFailure(remove(missingPath), (error) => {
        assertInstanceOf(error, FileSystemError);
        assertEquals(error.code, "NOT_FOUND");
        assertEquals(error.context, { operation: "remove", path: missingPath });
        assertInstanceOf(error.cause, Deno.errors.NotFound);
      });
      withFailure(isEmpty(missingPath), (error) => {
        assertInstanceOf(error, FileSystemError);
        assertEquals(error.code, "NOT_FOUND");
        assertEquals(error.context, { operation: "read", path: missingPath });
        assertInstanceOf(error.cause, Deno.errors.NotFound);
      });
      withFailure(isFilled(missingPath), (error) => {
        assertInstanceOf(error, FileSystemError);
        assertEquals(error.code, "NOT_FOUND");
        assertEquals(error.context, { operation: "read", path: missingPath });
        assertInstanceOf(error.cause, Deno.errors.NotFound);
      });
    });
  },
);

fileSystemTest(
  "prepend() preserves a write-phase failure without changing the content",
  async () => {
    await withTempDirectory((root) => {
      const path = `${root}/file.txt`;
      Deno.writeTextFileSync(path, "original");
      const cause = new Deno.errors.PermissionDenied("write denied");
      const originalWrite = Deno.writeTextFileSync;
      Deno.writeTextFileSync = () => {
        throw cause;
      };
      try {
        withFailure(prepend("prefix")(path), (error) => {
          assertEquals(error.code, "PERMISSION_DENIED");
          assertEquals(error.context, {
            operation: "prepend",
            path,
            phase: "write",
          });
          assertStrictEquals(error.cause, cause);
        });
      } finally {
        Deno.writeTextFileSync = originalWrite;
      }
      assertEquals(Deno.readTextFileSync(path), "original");
    });
  },
);
