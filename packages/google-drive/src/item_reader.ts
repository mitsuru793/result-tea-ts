import { R } from "@praha/byethrow";
import type { ParseFailure } from "@result-tea/valibot";
import type { DriveClient } from "./client/mod.ts";
import { FileBody } from "./model/mod.ts";
import { request, type RequestFailure } from "./request.ts";

export type GetMedia = (
  itemId: string,
) => R.ResultAsync<FileBody.Type, ParseFailure | RequestFailure>;

/** Downloads text content; binary files and Workspace document exports are not supported. */
const getFileBody = (client: DriveClient.Type): GetMedia => async (itemId) => {
  return R.pipe(
    await request(() =>
      client.files.get({
        fileId: itemId,
        alt: "media",
      }, { responseType: "text" })
    ),
    R.andThen((data) => FileBody.parse(data)),
  );
};

export const bind = (client: DriveClient.Type): { getMedia: GetMedia } => ({
  getMedia: getFileBody(client),
});
