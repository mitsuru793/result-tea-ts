import { assertEquals } from "@std/assert";
import { withFailure, withSuccess } from "@mitsuru793/bythrow-assert";
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

async function withTempDir(
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
  await withTempDir((root) => {
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

fileSystemTest("read() returns file content", async () => {
  await withTempDir((root) => {
    const path = `${root}/file.txt`;
    Deno.writeTextFileSync(path, "content");

    withSuccess(read(path), (actual) => {
      assertEquals(actual, "content");
    });
  });
});

fileSystemTest("append() adds content to the end of a file", async () => {
  await withTempDir((root) => {
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
    await withTempDir((root) => {
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
  await withTempDir((root) => {
    const path = `${root}/file.txt`;
    Deno.writeTextFileSync(path, "content");

    withSuccess(remove(path), (actual) => {
      assertEquals(actual, undefined);
    });
    withFailure(read(path), (error) => {
      assertEquals(error.path, path);
    });
  });
});

fileSystemTest("isEmpty() returns true for empty files", async () => {
  await withTempDir((root) => {
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
  await withTempDir((root) => {
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
    await withTempDir((root) => {
      const missingPath = `${root}/missing/file.txt`;

      withFailure(write("content")(missingPath), (error) => {
        assertEquals(error.path, missingPath);
      });
      withFailure(read(missingPath), (error) => {
        assertEquals(error.path, missingPath);
      });
      withFailure(append("content")(missingPath), (error) => {
        assertEquals(error.path, missingPath);
      });
      withFailure(prepend("content")(missingPath), (error) => {
        assertEquals(error.path, missingPath);
      });
      withFailure(remove(missingPath), (error) => {
        assertEquals(error.path, missingPath);
      });
      withFailure(isEmpty(missingPath), (error) => {
        assertEquals(error.path, missingPath);
      });
      withFailure(isFilled(missingPath), (error) => {
        assertEquals(error.path, missingPath);
      });
    });
  },
);
