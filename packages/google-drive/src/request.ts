import { R } from "@praha/byethrow";
import * as v from "valibot";
import { FailedResponseError, RequestError } from "./errors.ts";

export type RequestFailure = FailedResponseError | RequestError;

type Response<T> = { status: number; data: T };

const httpErrorSchema = v.object({
  response: v.object({
    status: v.number(),
  }),
});

type Request = <T>(
  execute: () => Promise<Response<T>>,
) => R.ResultAsync<T, RequestFailure>;

export const request: Request = async <T>(
  execute: () => Promise<Response<T>>,
) => {
  let response: Response<T>;
  try {
    response = await execute();
  } catch (cause) {
    const httpError = v.safeParse(httpErrorSchema, cause);
    if (httpError.success) {
      return R.fail(
        new FailedResponseError({
          status: httpError.output.response.status,
          cause,
        }),
      );
    }
    return R.fail(new RequestError({ cause }));
  }

  if (response.status !== 200) {
    return R.fail(new FailedResponseError({ status: response.status }));
  }
  return { type: "Success", value: response.data };
};
