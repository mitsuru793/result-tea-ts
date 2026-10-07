import { assertEquals, assertInstanceOf } from "@std/assert";
import { withFailure, withSuccess } from "@result-tea/bythrow-assert";
import { CsvError } from "./csv_error.ts";
import { from } from "./csv_text.ts";

Deno.test("from() brands syntactically valid CSV text", () => {
  const text = "a,b\n1,2\n";
  withSuccess(from(text), (csvText) => {
    assertEquals(csvText, text);
  });
});

Deno.test("from() returns a CsvError and preserves the cause for an unterminated quoted field", () => {
  const result = from('a,"b\n1,2\n');
  withFailure(result, (error) => {
    assertInstanceOf(error, CsvError);
    assertEquals(error.operation, "parse");
    assertInstanceOf(error.cause, SyntaxError);
  });
});
