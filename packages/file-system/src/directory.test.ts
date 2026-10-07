import { assertEquals, assertThrows } from "@std/assert";
import { withSuccess } from "@mitsuru793/bythrow-assert";

import {
  create,
  createTmp,
  ensure,
  glob,
  isEmpty,
  isFilled,
  removeForce,
  writeFile,
} from "./directory.ts";

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

fileSystemTest("create() creates nested directories", async () => {
  await withTempDirectory((root) => {
    const path = `${root}/one/two`;

    withSuccess(create(path), (actual) => {
      assertEquals(actual, undefined);
    });
    assertEquals(Deno.statSync(path).isDirectory, true);
  });
});

fileSystemTest(
  "createTmp() creates a temporary directory with the prefix",
  () => {
    const result = createTmp("file-system-test-");
    if (result.type === "Failure") throw result.error;

    try {
      withSuccess(result, (actual) => {
        assertEquals(
          actual.split("/").at(-1)?.startsWith("file-system-test-"),
          true,
        );
        assertEquals(Deno.statSync(actual).isDirectory, true);
      });
    } finally {
      Deno.removeSync(result.value, { recursive: true });
    }
  },
);

fileSystemTest("ensure() creates a directory that does not exist", async () => {
  await withTempDirectory((root) => {
    const path = `${root}/created`;

    withSuccess(ensure(path), (actual) => {
      assertEquals(actual, undefined);
    });
    assertEquals(Deno.statSync(path).isDirectory, true);

    // Ensure the directory still exists when calling ensure() again
    withSuccess(ensure(path), (actualAgain) => {
      assertEquals(actualAgain, undefined);
    });
    assertEquals(Deno.statSync(path).isDirectory, true);
  });
});

fileSystemTest("writeFile() writes content to a file", async () => {
  await withTempDirectory((root) => {
    const path = `${root}/file.txt`;

    withSuccess(writeFile("content")(path), (actual) => {
      assertEquals(actual, undefined);
    });
    assertEquals(Deno.readTextFileSync(path), "content");
  });
});

fileSystemTest("glob() lists files matching a pattern", async () => {
  await withTempDirectory(async (root) => {
    Deno.writeTextFileSync(`${root}/first.txt`, "1");
    Deno.writeTextFileSync(`${root}/second.txt`, "2");
    Deno.writeTextFileSync(`${root}/ignored.md`, "3");

    const result = glob()(`${root}/*.txt`);
    if (result.type === "Failure") throw result.error;

    const names: string[] = [];
    for await (const entry of result.value) {
      names.push(entry.name);
    }
    names.sort();

    assertEquals(names, ["first.txt", "second.txt"]);
  });
});

fileSystemTest(
  "removeForce() removes a directory and its contents",
  async () => {
    await withTempDirectory((root) => {
      const path = `${root}/to-remove`;
      Deno.mkdirSync(`${path}/nested`, { recursive: true });
      Deno.writeTextFileSync(`${path}/nested/file.txt`, "content");

      withSuccess(removeForce(path), (actual) => {
        assertEquals(actual, undefined);
      });
      assertThrows(() => Deno.statSync(path));
    });
  },
);

fileSystemTest("isEmpty() returns true for empty directories", async () => {
  await withTempDirectory((root) => {
    Deno.mkdirSync(`${root}/empty`);
    Deno.mkdirSync(`${root}/filled`);
    Deno.writeTextFileSync(`${root}/filled/file.txt`, "content");

    withSuccess(isEmpty(`${root}/empty`), (actual) => {
      assertEquals(actual, true);
    });
    withSuccess(isEmpty(`${root}/filled`), (actualFilled) => {
      assertEquals(actualFilled, false);
    });
  });
});

fileSystemTest(
  "isEmpty() and isFilled() report whether a directory has entries",
  async () => {
    await withTempDirectory((root) => {
      Deno.mkdirSync(`${root}/empty`);
      Deno.mkdirSync(`${root}/filled`);
      Deno.writeTextFileSync(`${root}/filled/file.txt`, "content");

      withSuccess(isFilled(`${root}/empty`), (actualEmpty) => {
        assertEquals(actualEmpty, false);
      });
      withSuccess(isFilled(`${root}/filled`), (actualFilled) => {
        assertEquals(actualFilled, true);
      });
    });
  },
);

fileSystemTest(
  "directory operations return failures for invalid paths",
  async () => {
    await withTempDirectory((root) => {
      const missingPath = `${root}/missing/file.txt`;
      Deno.writeTextFileSync(`${root}/file`, "not a directory");

      assertEquals(create(`${root}/file/child`).type, "Failure");
      assertEquals(writeFile("content")(missingPath).type, "Failure");
      assertEquals(removeForce(missingPath).type, "Failure");
      assertEquals(isEmpty(missingPath).type, "Failure");
      assertEquals(isFilled(missingPath).type, "Failure");
    });
  },
);
