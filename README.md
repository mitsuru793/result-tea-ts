# Result Tea TS

**Result Tea TS** is a Deno/TypeScript monorepo that provides a family of small, focused utility packages built around the [`@praha/byethrow`](https://www.npmjs.com/package/@praha/byethrow) `Result` type — i.e., it wraps common fallible operations (JSON/CSV parsing, file I/O, Google Drive API calls, schema validation) so that errors are returned as typed `Result` values instead of being thrown, enabling explicit, type-safe error handling throughout.

- **Workspace management**: It's a Deno workspace (configured via [deno.json](./deno.json)) with all packages living under [packages/](./packages), each published under the `@result-tea/*` npm/jsr scope with its own `deno.json`, `src/`, and tests.
- **Shared conventions**: Every package exposes a `mod.ts` entry point, defines a dedicated `*Error` class (via `@praha/error-factory`) to wrap underlying causes, and returns `R.Result<T, E>` (success/failure) rather than throwing exceptions.

## Packages

| Package | Purpose |
|---|---|
| [json](./packages/json) | `Result`-based wrappers around `JSON.parse`/`JSON.stringify`, with a branded `JsonText` type for validated JSON strings |
| [csv](./packages/csv) | `Result`-based CSV parse/stringify built on `@std/csv`, with a branded `CsvText` type |
| [file-system](./packages/file-system) | Safe file/directory operations (read/write/ensure text files, path handling) backed by `@std/fs`/`@std/path`, validated with Valibot |
| [google-drive](./packages/google-drive) | A `Result`-based client around `@googleapis/drive` for reading files/folders from Google Drive |
| [valibot](./packages/valibot) | A thin adapter that turns [Valibot](https://valibot.dev/) schema parsing into `Result` values, plus a `Model.define` helper for typed model creation/parsing |
| [bythrow-assert](./packages/bythrow-assert) | Test helpers (`assertSuccess`/`assertFailure`, `withSuccess`/`withFailure`) for asserting on and unwrapping `byethrow` `Result` values in Deno tests |

In short, it's a cohesive toolkit of "Result-ified" wrappers around common Node/Deno/Google APIs, designed to make error handling explicit and composable across a TypeScript project.
