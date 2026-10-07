import * as v from "valibot";
import { Model } from "@result-tea/valibot";
import * as Item from "./item.ts";

export type Input = Omit<Item.Input, "mimeType"> & {
  mimeType: "application/vnd.google-apps.folder";
};

export type Type = Omit<Item.Type, "mimeType"> & {
  mimeType: "application/vnd.google-apps.folder";
};

const schema = v.object({
  ...Item.schema.entries,
  mimeType: v.literal("application/vnd.google-apps.folder"),
});

const model = Model.define(schema);

export const parse = model.parse;
export const create = model.create;
