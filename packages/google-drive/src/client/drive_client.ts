import { R } from "@praha/byethrow";
import { auth, drive_v3 } from "@googleapis/drive";
import type { Credential } from "./mod.ts";

export type Type = drive_v3.Drive;

export const create = (credential: Credential.Type): R.Result<Type, Error> => {
  const jwt = createJWT(credential);
  if (!jwt) {
    // TODO: create custom error type for JWT creation failure
    return R.fail(new Error("Failed to create JWT"));
  }

  const client = new drive_v3.Drive({ auth: jwt });
  return R.succeed(client);
};

const createJWT = (credential: Credential.Type) => {
  return new auth.JWT({
    email: credential.clientEmail,
    key: credential.privateKey,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
};
