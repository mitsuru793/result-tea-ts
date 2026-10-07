import { assertEquals, assertInstanceOf } from "@std/assert";
import { withFailure, withSuccess } from "@result-tea/bythrow-assert";
import { JsonError } from "./json_error.ts";
import { from } from "./json_text.ts";

Deno.test("from() brands syntactically valid JSON text", () => {
  const text = '{"answer":42}';
  withSuccess(from(text), (jsonText) => {
    assertEquals(jsonText, text);
  });
});

Deno.test("from() returns a JsonError and preserves the cause for invalid JSON", () => {
  const result = from("{");
  withFailure(result, (error) => {
    assertInstanceOf(error, JsonError);
    assertEquals(error.operation, "parse");
    assertInstanceOf(error.cause, SyntaxError);
  });
});
