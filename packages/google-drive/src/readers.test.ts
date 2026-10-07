import {
  assert,
  assertEquals,
  assertInstanceOf,
  assertStrictEquals,
} from "@std/assert";
import { drive_v3 } from "@googleapis/drive";
import { ParseError } from "@result-tea/valibot";
import { FolderReader, ItemReader } from "./mod.ts";
import {
  FailedResponseError,
  NotDirectoryError,
  RequestError,
} from "./errors.ts";

import { Folder, Item } from "./model/mod.ts";
import { request } from "./request.ts";

const metadata = {
  id: "item_1",
  name: "example",
  kind: "drive#file",
  mimeType: "application/vnd.google-apps.folder",
  createdTime: "2026-01-01T00:00:00.000Z",
  modifiedTime: "2026-01-02T00:00:00.000Z",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function client(handler: (url: URL) => Response | Promise<Response>) {
  return new drive_v3.Drive({
    retry: false,
    fetchImplementation: async (input) =>
      await handler(
        new URL(input instanceof Request ? input.url : String(input)),
      ),
  });
}

Deno.test("public entrypoint exposes the client factory", async () => {
  const { DriveClient } = await import("@result-tea/google-drive");
  assertEquals(typeof DriveClient.create, "function");
});

Deno.test("getById returns validated folder metadata", async () => {
  const mockClient = client((url) => {
    assertEquals(url.pathname, "/drive/v3/files/item_1");
    assertEquals(
      url.searchParams.get("fields"),
      "id, kind, name, mimeType, createdTime, modifiedTime",
    );
    return json(metadata);
  });
  const result = await FolderReader.bind(mockClient).getById("item_1");
  assert(result.type === "Success");
  assertEquals(result.value.id, metadata.id);
  assertEquals(result.value.createdTime, new Date(metadata.createdTime));
  assertEquals(result.value.modifiedTime, new Date(metadata.modifiedTime));
});

Deno.test("getById rejects non-folder metadata", async () => {
  const result = await FolderReader.bind(
    client(() => json({ ...metadata, mimeType: "text/plain" })),
  ).getById("item_1");
  assert(result.type === "Failure");
  assertInstanceOf(result.error, NotDirectoryError);
  assertEquals(result.error.mimeType, "text/plain");
});

Deno.test("getById preserves metadata validation failures", async () => {
  const result = await FolderReader.bind(
    client(() => json({ ...metadata, createdTime: "invalid" })),
  ).getById("item_1");
  assert(result.type === "Failure");
  assertInstanceOf(result.error, ParseError);
});

const operations = [
  {
    name: "getById",
    run: (drive: drive_v3.Drive) => FolderReader.bind(drive).getById("item_1"),
  },
  {
    name: "listItems",
    run: (drive: drive_v3.Drive) =>
      FolderReader.bind(drive).listItems("item_1"),
  },
  {
    name: "getMedia",
    run: (drive: drive_v3.Drive) => ItemReader.bind(drive).getMedia("item_1"),
  },
];

for (const operation of operations) {
  Deno.test(`${operation.name} converts HTTP errors to Failure`, async () => {
    for (const status of [403, 404, 500]) {
      const result = await operation.run(
        client(() => json({ error: { message: "Mock HTTP error" } }, status)),
      );
      assert(result.type === "Failure");
      assertInstanceOf(result.error, FailedResponseError);
      assertEquals(result.error.status, status);
      assertInstanceOf(result.error.cause, Error);
    }
  });

  Deno.test(`${operation.name} preserves a rejected request cause`, async () => {
    const cause = new Error("Mock request failed");
    const result = await operation.run(client(() => {
      throw cause;
    }));
    assert(result.type === "Failure");
    assertInstanceOf(result.error, RequestError);
    assertInstanceOf(result.error.cause, Error);
    assertStrictEquals(result.error.cause.cause, cause);
  });

  Deno.test(`${operation.name} rejects unexpected successful HTTP statuses`, async () => {
    const result = await operation.run(
      client(() => new Response(null, { status: 204 })),
    );
    assert(result.type === "Failure");
    assertInstanceOf(result.error, FailedResponseError);
    assertEquals(result.error.status, 204);
  });
}

Deno.test("listItems follows tokens even when an intermediate page is empty", async () => {
  const tokens: (string | null)[] = [];
  const mockClient = client((url) => {
    assertEquals(url.searchParams.get("q"), "'folder_1' in parents");
    assertEquals(
      url.searchParams.get("fields"),
      "nextPageToken, files(id, kind, name, mimeType, createdTime, modifiedTime)",
    );
    const token = url.searchParams.get("pageToken");
    tokens.push(token);
    if (token === null) {
      return json({ files: [metadata], nextPageToken: "second" });
    }
    if (token === "second") {
      return json({ files: [], nextPageToken: "third" });
    }
    assertEquals(token, "third");
    return json({
      files: [{ ...metadata, id: "item_2", mimeType: "text/plain" }],
    });
  });
  const result = await FolderReader.bind(mockClient).listItems("folder_1");
  assert(result.type === "Success");
  assertEquals(result.value.map((item) => item.id), ["item_1", "item_2"]);
  assertEquals(tokens, [null, "second", "third"]);
});

Deno.test("listItems returns an empty list when files are omitted", async () => {
  const result = await FolderReader.bind(client(() => json({}))).listItems(
    "folder_1",
  );
  assertEquals(result, { type: "Success", value: [] });
});

Deno.test("listItems aggregates parse failures across pages", async () => {
  const result = await FolderReader.bind(
    client((url) =>
      url.searchParams.has("pageToken")
        ? json({ files: [{ ...metadata, modifiedTime: "invalid" }] })
        : json({
          files: [{ ...metadata, id: "" }],
          nextPageToken: "second",
        })
    ),
  ).listItems("folder_1");
  assert(result.type === "Failure");
  assert(Array.isArray(result.error));
  assertEquals(result.error.length, 2);
  for (const error of result.error) {
    assertInstanceOf(error, ParseError);
  }
});

Deno.test("listItems does not return partial success when a later page fails", async () => {
  const result = await FolderReader.bind(
    client((url) =>
      url.searchParams.has("pageToken")
        ? json({ error: { message: "Mock forbidden" } }, 403)
        : json({ files: [metadata], nextPageToken: "second" })
    ),
  ).listItems("folder_1");
  assert(result.type === "Failure");
  assertInstanceOf(result.error, FailedResponseError);
  assertEquals(result.error.status, 403);
});

for (
  const { contentType, text } of [
    { contentType: "text/plain", text: "hello" },
    { contentType: "application/json", text: '{"hello":"world"}' },
    { contentType: "text/plain", text: "" },
  ]
) {
  Deno.test(`getMedia preserves ${contentType} text ${JSON.stringify(text)}`, async () => {
    const result = await ItemReader.bind(client((url) => {
      assertEquals(url.searchParams.get("alt"), "media");
      return new Response(text, { headers: { "Content-Type": contentType } });
    })).getMedia("item_1");
    assertEquals(result, { type: "Success", value: text });
  });
}

for (const [name, model] of [["Item", Item], ["Folder", Folder]] as const) {
  for (const field of ["createdTime", "modifiedTime"] as const) {
    Deno.test(`${name} rejects invalid ${field}`, () => {
      for (const value of ["", "not-a-date", "2026-99-99T99:99:99Z"]) {
        const result = model.parse({ ...metadata, [field]: value });
        assert(result.type === "Failure");
        assertInstanceOf(result.error, ParseError);
      }
    });
  }
}

Deno.test("Item accepts files and shortcuts; Folder only accepts folders", () => {
  for (
    const mimeType of [
      "text/plain",
      "application/vnd.google-apps.shortcut",
      "application/vnd.google-apps.document",
    ]
  ) {
    assertEquals(Item.parse({ ...metadata, mimeType }).type, "Success");
    assertEquals(Folder.parse({ ...metadata, mimeType }).type, "Failure");
  }
});

Deno.test("request preserves authentication and non-Error rejection causes", async () => {
  for (
    const cause of [new Error("Mock authentication failed"), "failed", null]
  ) {
    const result = await request(() => Promise.reject(cause));
    assert(result.type === "Failure");
    assertInstanceOf(result.error, RequestError);
    assertStrictEquals(result.error.cause, cause);
  }
});

Deno.test("request recognizes HTTP error shapes and preserves the original cause", async () => {
  const causes = [
    { response: { status: 404, data: "not found" }, message: "failed" },
    Object.assign(new Error("forbidden"), { response: { status: 403 } }),
  ];
  for (const cause of causes) {
    const result = await request(() => Promise.reject(cause));
    assert(result.type === "Failure");
    assertInstanceOf(result.error, FailedResponseError);
    assertEquals(result.error.status, cause.response.status);
    assertStrictEquals(result.error.cause, cause);
  }
});

Deno.test("request treats malformed HTTP error shapes as request failures", async () => {
  for (
    const cause of [
      undefined,
      {},
      { response: null },
      { response: "failed" },
      { response: {} },
      { response: { status: "404" } },
    ]
  ) {
    const result = await request(() => Promise.reject(cause));
    assert(result.type === "Failure");
    assertInstanceOf(result.error, RequestError);
    assertStrictEquals(result.error.cause, cause);
  }
});
