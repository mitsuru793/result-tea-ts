import { Model } from "@result-tea/valibot";
import * as v from "valibot";

export type Input = string;

export type Type = string;

export const schema: v.GenericSchema<Input, Type> = v.pipe(
  v.string(),
  v.regex(/^statement_\d{4}\d{2}\.pdf$/),
  v.brand("RakutenCardPdfFileName"),
);

export const { parse, create } = Model.define(schema);
