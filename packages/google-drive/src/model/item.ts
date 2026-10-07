import * as v from "valibot";
import { Model } from "@result-tea/valibot";

export type Input = {
  id: string;
  name: string;
  kind: "drive#file";
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
};

export type Type = Omit<Input, "createdTime" | "modifiedTime"> & {
  createdTime: Date;
  modifiedTime: Date;
};

type Entries = {
  [Key in keyof Input]: v.GenericSchema<Input[Key], Type[Key]>;
};

const timestamp: v.GenericSchema<string, Date> = v.pipe(
  v.string(),
  v.isoTimestamp(),
  v.transform((s) => new Date(s)),
  v.date(),
);

/** Metadata for a Drive resource, including folders, documents, and shortcuts. */
export const schema: v.ObjectSchema<Entries, undefined> = v.object({
  id: v.pipe(v.string(), v.regex(/^[0-9a-zA-Z_-]+$/)),
  name: v.pipe(v.string(), v.minLength(1)),
  kind: v.literal("drive#file"),
  mimeType: v.pipe(v.string(), v.minLength(1)),
  createdTime: timestamp,
  modifiedTime: timestamp,
});

const model = Model.define(schema);

export const parse = model.parse;
export const create = model.create;

export const filterByMimeType =
  (mimeType: string) => (items: Type[]): Type[] => {
    return items.filter((item) => item.mimeType === mimeType);
  };
