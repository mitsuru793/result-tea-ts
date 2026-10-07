import {
  assertEquals,
  assertInstanceOf,
  assertStrictEquals,
} from "@std/assert";
import { withFailure, withSuccess } from "@result-tea/bythrow-assert";
import { JsonError, JsonText, parse, stringify } from "./mod.ts";

Deno.test("parse() returns the parsed JSON value", () => {
  withSuccess(parse('{"answer":42}'), (value) => {
    assertEquals(value, { answer: 42 });
  });
});

Deno.test("parse() returns a JsonError and preserves the cause for invalid JSON", () => {
  const result = parse("{");
  withFailure(result, (error) => {
    assertInstanceOf(error, JsonError);
    assertEquals(error.operation, "parse");
    assertInstanceOf(error.cause, SyntaxError);
  });
});

Deno.test("stringify() returns serialized JSON", () => {
  withSuccess(stringify({ answer: 42 }), (text) => {
    assertEquals(text, '{"answer":42}');
  });
});

Deno.test("stringify()'s output round-trips as valid JsonText", () => {
  withSuccess(stringify({ answer: 42 }), (text) => {
    withSuccess(JsonText.from(text), (jsonText) => {
      assertStrictEquals(jsonText, text);
    });
  });
});

Deno.test("stringify() returns a JsonError for circular values", () => {
  const circular: { self?: unknown } = {};
  circular.self = circular;

  withFailure(stringify(circular), (error) => {
    assertInstanceOf(error, JsonError);
    assertEquals(error.operation, "stringify");
    assertInstanceOf(error.cause, TypeError);
  });
});

Deno.test("stringify() fails explicitly when JSON has no string representation", () => {
  withFailure(stringify(undefined), (error) => {
    assertInstanceOf(error, JsonError);
    assertEquals(error.operation, "stringify");
    assertInstanceOf(error.cause, TypeError);
  });
});

Deno.test("JsonError preserves unknown causes", () => {
  const cause = "unexpected";
  const error = JsonError.fromCause("parse", cause);

  assertEquals(error.message, "JSON operation failed: parse");
  assertStrictEquals(error.cause, cause);
});
