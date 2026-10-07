import { assertEquals } from "@std/assert";
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

    assertEquals(write("initial")(path), { type: "Success", value: undefined });
    assertEquals(write("replaced")(path), {
      type: "Success",
      value: undefined,
    });
    assertEquals(Deno.readTextFileSync(path), "replaced");
  });
});

fileSystemTest("read() returns file content", async () => {
  await withTempDir((root) => {
    const path = `${root}/file.txt`;
    Deno.writeTextFileSync(path, "content");

    assertEquals(read(path), { type: "Success", value: "content" });
  });
});

fileSystemTest("append() adds content to the end of a file", async () => {
  await withTempDir((root) => {
    const path = `${root}/file.txt`;
    Deno.writeTextFileSync(path, "first");

    assertEquals(append(" second")(path), {
      type: "Success",
      value: undefined,
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

      assertEquals(prepend("first ")(path), {
        type: "Success",
        value: undefined,
      });
      assertEquals(Deno.readTextFileSync(path), "first last");
    });
  },
);

fileSystemTest("remove() removes a file", async () => {
  await withTempDir((root) => {
    const path = `${root}/file.txt`;
    Deno.writeTextFileSync(path, "content");

    assertEquals(remove(path), { type: "Success", value: undefined });
    assertEquals(read(path).type, "Failure");
  });
});

fileSystemTest("isEmpty() returns true for empty files", async () => {
  await withTempDir((root) => {
    Deno.writeTextFileSync(`${root}/empty.txt`, "");
    Deno.writeTextFileSync(`${root}/filled.txt`, "content");

    assertEquals(isEmpty(`${root}/empty.txt`), {
      type: "Success",
      value: true,
    });
    assertEquals(isEmpty(`${root}/filled.txt`), {
      type: "Success",
      value: false,
    });
  });
});

fileSystemTest("isFilled() returns true for non-empty files", async () => {
  await withTempDir((root) => {
    Deno.writeTextFileSync(`${root}/empty.txt`, "");
    Deno.writeTextFileSync(`${root}/filled.txt`, "content");

    assertEquals(isFilled(`${root}/empty.txt`), {
      type: "Success",
      value: false,
    });
    assertEquals(isFilled(`${root}/filled.txt`), {
      type: "Success",
      value: true,
    });
  });
});

// TODO: move test cases for invalid paths to each test case for functions
fileSystemTest(
  "file operations return failures for invalid paths",
  async () => {
    await withTempDir((root) => {
      const missingPath = `${root}/missing/file.txt`;

      assertEquals(write("content")(missingPath).type, "Failure");
      assertEquals(read(missingPath).type, "Failure");
      assertEquals(append("content")(missingPath).type, "Failure");
      assertEquals(prepend("content")(missingPath).type, "Failure");
      assertEquals(remove(missingPath).type, "Failure");
      assertEquals(isEmpty(missingPath).type, "Failure");
      assertEquals(isFilled(missingPath).type, "Failure");
    });
  },
);
