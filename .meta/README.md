# `.meta`

Repository-local metadata that is **tracked in git** (not ignored).

## `prompt-test-results.ndjson`

Append-only newline-delimited JSON log of prior **passing** prompt test runs (`npm run test:prompts`), keyed by Vitest test name and a hash of dependency inputs.

Each line is one object: `{ name, hash, metadata, timestamp }`. If you change that shape in code, delete this file and re-run tests so the log is rebuilt.

Disable logging / hits with env `PROMPT_TEST_RESULT_LOG=off`.
