import {
  assertEquals,
  assertInstanceOf,
  assertStrictEquals,
} from "@std/assert";
import { withFailure, withSuccess } from "@result-tea/bythrow-assert";
import * as v from "valibot";
import {
  createParse,
  ParseError,
  type ParseFailure,
  ValidationExecutionError,
} from "@result-tea/valibot";

Deno.test("createParse() returns the transformed output", () => {
  const parse = createParse(v.pipe(v.string(), v.transform(Number)));
  withSuccess(parse("42"), (value) => {
    assertEquals(value, 42);
  });
});

Deno.test("createParse() preserves validation issues", () => {
  const schema = v.string();
  const input = 42;
  const expected = v.safeParse(schema, input);
  withFailure(createParse(schema)(input), (error) => {
    assertInstanceOf(error, ParseError);
    assertEquals(error.issues, expected.issues);
  });
});

Deno.test.each([
  { name: "Error", cause: new TypeError("transform failed") },
  { name: "string", cause: "transform failed" },
  { name: "null", cause: null },
  { name: "undefined", cause: undefined },
])(
  "createParse() preserves a thrown $name as an execution failure",
  ({ cause }) => {
    const schema = v.pipe(
      v.string(),
      v.transform(() => {
        throw cause;
      }),
    );
    withFailure(createParse(schema)("input"), (error) => {
      assertInstanceOf(error, ValidationExecutionError);
      assertInstanceOf(error, Error);
      assertEquals(error.name, "ValidationExecutionError");
      assertEquals(error.message, "Schema validation could not be completed");
      assertStrictEquals(error.cause, cause);
      assertEquals(typeof error.stack, "string");
    });
  },
);

Deno.test("ParseFailure supports narrowing by the error name", () => {
  const executionFailure: ParseFailure = new ValidationExecutionError({
    cause: "unexpected",
  });
  const validationFailure: ParseFailure = new ParseError({ issues: [] });
  const failures: ParseFailure[] = [validationFailure, executionFailure];
  for (const error of failures) {
    switch (error.name) {
      case "ParseError":
        assertEquals(error.issues, []);
        break;
      case "ValidationExecutionError":
        assertStrictEquals(error.cause, "unexpected");
        break;
      default: {
        const unreachable: never = error;
        throw new Error(`Unexpected failure: ${unreachable}`);
      }
    }
  }
});

Deno.test("createParse() preserves a Promise-valued output in a synchronous Result", async () => {
  const value = Promise.resolve("body");
  const parse = createParse(v.pipe(v.string(), v.transform(() => value)));
  const result = parse("input");
  withSuccess(result, (output) => {
    assertStrictEquals(output, value);
  });
  assertEquals(await value, "body");
});
