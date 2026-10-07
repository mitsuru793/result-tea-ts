import * as v from "valibot";
import { Model } from "@result-tea/valibot";

export type Input = {
  clientEmail: string;
  privateKey: string;
};

export type Type = Input;

const NonEmptyString = v.pipe(v.string(), v.minLength(1));

export const schema: v.GenericSchema<Input, Type> = v.object({
  clientEmail: NonEmptyString,
  privateKey: NonEmptyString,
});

const model: Model.DefinedModel<typeof schema> = Model.define(schema);

export const parse = model.parse;
export const create = model.create;
