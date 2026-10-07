import { R } from "@praha/byethrow";

import type { ParseFailure } from "@result-tea/valibot";

import type { DriveClient } from "./client/mod.ts";
import { NotDirectoryError } from "./errors.ts";
import { Folder, Item } from "./model/mod.ts";
import { request, type RequestFailure } from "./request.ts";

export type GetById = (
  id: string,
) => R.ResultAsync<
  Folder.Type,
  ParseFailure | RequestFailure | NotDirectoryError
>;

const getById = (client: DriveClient.Type): GetById => async (id) => {
  return R.pipe(
    await request(() =>
      client.files.get({
        fileId: id,
        fields: "id, kind, name, mimeType, createdTime, modifiedTime",
      })
    ),
    R.andThen((data) => {
      if (data.mimeType !== "application/vnd.google-apps.folder") {
        return R.fail(
          new NotDirectoryError({ mimeType: data.mimeType || "" }),
        );
      }

      return Folder.parse(data);
    }),
  )
};

export type ListItems = (
  id: string,
) => R.ResultAsync<Item.Type[], ParseFailure[] | RequestFailure>;

/** Lists all direct children, following every page returned by Google Drive. */
const listItems = (client: DriveClient.Type): ListItems => async (id) => {
  const parsed: R.Result<Item.Type, ParseFailure>[] = [];
  let pageToken: string | undefined;
  do {
    const response = await request(() =>
      client.files.list({
        q: `'${id}' in parents`,
        fields:
          "nextPageToken, files(id, kind, name, mimeType, createdTime, modifiedTime)",
        pageToken,
      })
    );
    if (response.type === "Failure") {
      return response;
    }
    parsed.push(...(response.value.files ?? []).map(Item.parse));
    pageToken = response.value.nextPageToken ?? undefined;
  } while (pageToken);
  return R.collect(parsed);
};

export const bind = (client: DriveClient.Type): {
  getById: GetById;
  listItems: ListItems;
} => ({
  getById: getById(client),
  listItems: listItems(client),
});
