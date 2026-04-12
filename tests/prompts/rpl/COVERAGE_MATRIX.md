# RPL Prompt Coverage Matrix

This matrix maps current prompt fixtures to the `docs/rpl` specification surface and marks missing testable coverage.

## Current Coverage

| Family | Fixture file | Spec areas covered | Status |
| --- | --- | --- | --- |
| Shared core bindings | `fixtures/shared.json` | RPL relations, simple implication, numeric guard, string literals (single/double quotes per spec §2) | Covered |
| RPL derivation | `fixtures/rpl.json` | Multi-step rule chaining | Covered |
| LRPL basic lazy | `fixtures/lrpl.json` | LRPL lazy wrapper (`<...>`) basic derivation | Covered |
| Prose translation (sections 1-5) | `fixtures/prose.json` | Markdown-to-RPL guide `content/rpl/translation.md` sections 1-5 | Covered |

## Missing Testable Coverage (to add)

| Family | Target fixture | Spec areas | Gap type |
| --- | --- | --- | --- |
| Source format semantics | `fixtures/source-format.json` | RPL source format section 17 (heading forms, fenced blocks, scope, `--`, emphasis normalization) | Missing |
| Operators and matching | `fixtures/operators-and-matching.json` | RPL operators and matching sections 5, 6, 8 | Missing |
| Goals + metadata + constraints | `fixtures/goals-metadata-constraints.json` | RPL sections 11, 12, 15, 16 | Missing |
| LRPL advanced semantics | `fixtures/lrpl-advanced.json` | LRPL sections 2, 3, 4, 6 | Missing |
| LRPL `$index` inline data | `fixtures/lrpl-index-inline-data.json` | LRPL section 5.1 (`$index`) with inline data forms | Missing |
| Parser robustness (local) | `fixtures/parser-robustness.json` | `assertGoalBindings` fallback parsing and extraction behavior | Missing |
| Prose quality judgement | `fixtures/prose-quality-judgement.json` | Free/lite markdown quality labels (`all good`, `some good`, `none good`) for relation/program/protocol | Missing |

## Explicit Out Of Scope

These areas are intentionally excluded from strict prompt expectations because the spec leaves runtime latitude:

- Named-goal selection when no root `%` is declared.
- Exploration-order heuristics in satisfactory quiescence.
- Fuzzy prose materialization cases with multiple equally-valid formalizations.
