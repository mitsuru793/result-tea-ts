import {
  assertEquals,
  assertInstanceOf,
  assertStrictEquals,
} from "@std/assert";
import { withFailure, withSuccess } from "@result-tea/bythrow-assert";
import { CsvError, parse, stringify } from "./mod.ts";

Deno.test("parse() without options returns rows of strings", () => {
  withSuccess(parse("a,b\n1,2\n"), (rows) => {
    assertEquals(rows, [["a", "b"], ["1", "2"]]);
  });
});

Deno.test("parse() with skipFirstRow returns row objects keyed by the header", () => {
  withSuccess(parse("a,b\n1,2\n", { skipFirstRow: true }), (rows) => {
    assertEquals(rows, [{ a: "1", b: "2" }]);
  });
});

Deno.test("parse() with columns returns row objects keyed by the given names", () => {
  withSuccess(parse("1,2\n3,4\n", { columns: ["x", "y"] }), (rows) => {
    assertEquals(rows, [{ x: "1", y: "2" }, { x: "3", y: "4" }]);
  });
});

Deno.test("parse() returns a CsvError and preserves the cause for an unterminated quoted field", () => {
  const result = parse('a,"b\n1,2\n');
  withFailure(result, (error) => {
    assertInstanceOf(error, CsvError);
    assertEquals(error.operation, "parse");
    assertInstanceOf(error.cause, SyntaxError);
  });
});

Deno.test("parse() returns a CsvError when a row's field count does not match fieldsPerRecord", () => {
  const result = parse("a,b\n1,2,3\n", { fieldsPerRecord: 2 });
  withFailure(result, (error) => {
    assertInstanceOf(error, CsvError);
    assertEquals(error.operation, "parse");
    assertInstanceOf(error.cause, SyntaxError);
  });
});

Deno.test("stringify() serializes an array of arrays", () => {
  withSuccess(stringify([["a", "b"], ["1", "2"]]), (text) => {
    assertEquals(text, "a,b\r\n1,2\r\n");
  });
});

Deno.test("stringify() serializes an array of objects using the given columns", () => {
  const data = [{ a: "1", b: "2" }];
  withSuccess(stringify(data, { columns: ["a", "b"] }), (text) => {
    assertEquals(text, "a,b\r\n1,2\r\n");
  });
});

Deno.test("stringify() returns a CsvError when objects are given without a columns option", () => {
  const result = stringify([{ a: "1", b: "2" }]);
  withFailure(result, (error) => {
    assertInstanceOf(error, CsvError);
    assertEquals(error.operation, "stringify");
    assertInstanceOf(error.cause, TypeError);
  });
});

Deno.test("CsvError preserves unknown causes", () => {
  const cause = "unexpected";
  const error = CsvError.fromCause("parse", cause);

  assertEquals(error.message, "CSV operation failed: parse");
  assertStrictEquals(error.cause, cause);
});
