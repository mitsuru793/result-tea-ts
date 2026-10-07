import { withFailure, withSuccess } from "@result-tea/bythrow-assert";
import { ParseError } from "@result-tea/valibot";
import { CsvFileName } from "./mod.ts";
import { assertEquals, assertInstanceOf } from "@std/assert";

Deno.test("CsvFileName.parse() should correctly parse valid CSV file names", () => {
  const validFileName = "enavi202401(1234).csv";

  const result = CsvFileName.parse(validFileName);
  withSuccess(result, (value) => {
    assertEquals(value, "enavi202401(1234).csv");
  });
});

Deno.test.each([
  ["invalid_file_name.csv"],
  ["enavi202401(1234)"],
  [""],
])(
  "CsvFileName.parse() should fail for invalid CSV file name '%s'",
  (invalidFileName) => {
    const result = CsvFileName.parse(invalidFileName);
    withFailure(result, (error) => {
      assertInstanceOf(error, ParseError);
    });
  },
);
