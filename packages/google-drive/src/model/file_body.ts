import * as v from "valibot";
import { Model } from "@result-tea/valibot";

export type Input = string;

export type Type = string;

export const schema = v.string();

const model = Model.define(schema);

export const parse = model.parse;
export const create = model.create;
