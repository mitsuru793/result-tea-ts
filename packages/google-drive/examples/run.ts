import { R } from "@praha/byethrow";
import {
  Credential,
  DriveClient,
  FolderReader,
  ItemReader,
} from "@result-tea/google-drive";

import credentials from "./google-service-account-credentials.json" with {
  type: "json",
};

function main(): void {
  const folderId = Deno.args[0];

  R.pipe(
    Credential.create({
      clientEmail: credentials.client_email,
      privateKey: credentials.private_key,
    }),
    R.andThen(DriveClient.create),
    R.andThrough((client) => {
      const folderReader = FolderReader.bind(client);
      const itemReader = ItemReader.bind(client);

      R.pipe(
        folderReader.getById(folderId),
        R.andThen((folder) => {
          console.log({ folder });
          return folderReader.listItems(folder.id);
        }),
        R.andThen((items) => {
          console.log({ items });
          return itemReader.getMedia(items[0].id);
        }),
        R.andThrough((item) => {
          console.log({ item });
          return R.succeed(item);
        }),
      );

      return R.succeed(client);
    }),
  );
}

main();
