import {
  assertEquals,
  assertInstanceOf,
  assertStrictEquals,
} from "@std/assert";
import { withFailure, withSuccess } from "@result-tea/bythrow-assert";
import * as v from "valibot";
import {
  createParse,
  Model,
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

Deno.test("Model.define() exposes the original schema", () => {
  const schema = v.string();
  assertStrictEquals(Model.define(schema).schema, schema);
});

Deno.test.each([
  { method: "create" as const },
  { method: "parse" as const },
])("Model.define().$method() returns transformed output", ({ method }) => {
  const model = Model.define(v.pipe(v.string(), v.transform(Number)));
  withSuccess(model[method]("42"), (value) => {
    assertEquals(value, 42);
  });
});

Deno.test.each([
  { method: "create" as const },
  { method: "parse" as const },
])("Model.define().$method() validates runtime constraints", ({ method }) => {
  const schema = v.pipe(v.string(), v.minLength(1));
  const model = Model.define(schema);
  const expected = v.safeParse(schema, "");
  withFailure(model[method](""), (error) => {
    assertInstanceOf(error, ParseError);
    assertEquals(error.issues, expected.issues);
  });
});

Deno.test("Model.define().parse() validates unknown input", () => {
  const model = Model.define(v.string());
  const input: unknown = 42;
  withFailure(model.parse(input), (error) => {
    assertInstanceOf(error, ParseError);
  });
});

Deno.test.each([
  { method: "create" as const },
  { method: "parse" as const },
])("Model.define().$method() preserves execution failures", ({ method }) => {
  const cause = new TypeError("transform failed");
  const model = Model.define(v.pipe(
    v.string(),
    v.transform(() => {
      throw cause;
    }),
  ));
  withFailure(model[method]("input"), (error) => {
    assertInstanceOf(error, ValidationExecutionError);
    assertStrictEquals(error.cause, cause);
  });
});

Deno.test.each([
  { method: "create" as const },
  { method: "parse" as const },
])(
  "Model.define().$method() preserves Promise-valued output synchronously",
  async ({ method }) => {
    const value = Promise.resolve("body");
    const model = Model.define(
      v.pipe(v.string(), v.transform(() => value)),
    );
    withSuccess(model[method]("input"), (output) => {
      assertStrictEquals(output, value);
    });
    assertEquals(await value, "body");
  },
);

Deno.test("Model.define() preserves defaults, readonly fields, and brands", () => {
  const schema = v.pipe(
    v.object({ name: v.optional(v.string(), "tea") }),
    v.readonly(),
    v.brand("Tea"),
  );
  const model = Model.define(schema);
  withSuccess(model.create({}), (value) => {
    const output: v.InferOutput<typeof schema> = value;
    assertEquals<v.InferInput<typeof schema>>(output, { name: "tea" });
    const checkReadonly = () => {
      // @ts-expect-error Schema output fields are readonly.
      value.name = "coffee";
    };
    void checkReadonly;
  });
});

Deno.test("Model.define() distinguishes constructor input from parser input", () => {
  const schema = v.pipe(v.string(), v.transform(Number), v.brand("Count"));
  const model = Model.define(schema);
  const checkInput = (input: unknown) => {
    model.parse(input);
    // @ts-expect-error The constructor requires the schema input type.
    model.create(input);
    // @ts-expect-error Transformed output is not the schema input type.
    model.create(42);
    // @ts-expect-error Unvalidated numbers do not carry the output brand.
    const output: v.InferOutput<typeof schema> = 42;
    void output;
  };
  void checkInput;
  withSuccess(model.create("42"), (value) => {
    const output: v.InferOutput<typeof schema> = value;
    assertEquals<number>(output, 42);
  });
});
