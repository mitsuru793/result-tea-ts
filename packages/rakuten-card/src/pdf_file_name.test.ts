import { withFailure, withSuccess } from "@result-tea/bythrow-assert";
import { ParseError } from "@result-tea/valibot";
import { PdfFileName } from "./mod.ts";
import { assertEquals, assertInstanceOf } from "@std/assert";

Deno.test("PdfFileName.parse() should correctly parse valid PDF file names", () => {
  const validFileName = "statement_202404.pdf";

  const result = PdfFileName.parse(validFileName);
  withSuccess(result, (value) => {
    assertEquals(value, "statement_202404.pdf");
  });
});

Deno.test.each([
  ["invalid_file_name.pdf"],
  ["statement_202404"],
  [""],
])(
  "PdfFileName.parse() should fail for invalid PDF file name '%s'",
  (invalidFileName) => {
    const result = PdfFileName.parse(invalidFileName);
    withFailure(result, (error) => {
      assertInstanceOf(error, ParseError);
    });
  },
);
