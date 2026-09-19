---
title: RPL Axiomatic Language Bootstrap - Plan
artifact_contract: ce-unified-plan/v1
artifact_readiness: requirements-only
product_contract_source: ce-brainstorm
execution: code
date: 2026-09-19
---

# RPL Axiomatic Language Bootstrap - Plan

## Goal Capsule

**Objective.** Give the language a bootstrap that treats RPL as a logic: a small Horn / first-order fragment stated as laws, with comments for everything the specs leave to judgment, time, or prose.

**Product authority.** Only `docs/` is live language definition. Files outside `docs/` are stale. [docs/rpl/bootstrapping.md](../rpl/bootstrapping.md) is not a source for the language.

**Open blockers.** None that block planning. Outstanding questions below are deferred to planning.

## Product Contract

### Summary

Add an axiomatic language primer under `docs/rpl/` that reconstructs core (L)RPL from the Horn fragment of first-order logic, keyed to the normative specs, and mark the existing Reasoned-Schemer agent sketch as non-source.

### Problem Frame

The specs already define a logic. The documents that try to *teach* that logic do not.

[docs/rpl/specification/rpl.md](../rpl/specification/rpl.md) is a programming-language spec: literals, then variables, then operators, then runtime. That is the right shape for implementers. It is the wrong first picture of what the language *is*.

[docs/rpl/bootstrapping.md](../rpl/bootstrapping.md) borrows Little-series tables for agent habits. It mixes Datalog examples with “how the agent should feel.” It is incomplete as pedagogy and incorrect as a language definition.

Trees outside `docs/` still present a levelled primer and a Markdown-to-RPL cookbook. Those describe an earlier RPL.

The missing artifact is a language bootstrap: laws for the formal core, comments for the rest, derived only from `docs/`.

### Key Decisions

- **Docs-only authority** (session-settled: user-directed — chosen over treating `content/` and tests as live: RPL evolved after those were written). Governs R1.
- **Do not treat bootstrapping.md as a language source** (session-settled: user-directed — chosen over extending that Reasoned-Schemer sketch: it is incorrect or incomplete). Governs R2, R7.
- **Horn fragment, not full classical FOL.** Governs R3. The specs write definite clauses, not arbitrary FOL.
- **Laws for the formal layer, comments for the agent layer.** Governs R4, R5. Follows [docs/rpl/theory.md](../rpl/theory.md).
- **Dual track: primer plus unchanged normative specs.** Governs R6. The primer is a reading. The spec remains the owner.

### How This Work Fits Together

<!-- ce-section: work-relationships -->

This plan owns the **language bootstrap**: one primer and the map/status edits that make it findable and prevent the old agent sketch from being read as definition.

Surrounding work, current understanding only:

- **Agent-habit bootstrap rewrite** — Depends on the language laws existing first. Can proceed independently after R3–R5 exist. Not active scope.
- **Regenerating composed prompts outside `docs/`** — Depends on the primer if those prompts should teach the language again. Still to decide. Not active scope.
- **Normative spec edits** — Can proceed independently. This plan must not change grammar or runtime rules. Shares the same `docs/rpl/specification/` files as read-only authority.

### Requirements

**Authority**

- R1. Only files under `docs/` may be cited as language definition in the primer and in the map edits this work makes.
- R2. [docs/rpl/bootstrapping.md](../rpl/bootstrapping.md) must carry a status note that it is an incomplete agent-habit sketch and not a language source.

**Primer**

- R3. The primer must present core RPL as the definite Horn / Datalog-shaped fragment of first-order logic (predicates, terms, ∧, ∨, backward implication, the usual ∀-rules / ∃-queries reading), not as full classical FOL.
- R4. Every formal claim in the primer must be a law with a spec pointer into [docs/rpl/specification/](../rpl/specification/) or [docs/rpl/theory.md](../rpl/theory.md).
- R5. Async variables, agent judgment, prose materialisation, timestep rhythm, additional logics, LRPL evaluation, and `not` (until a spec section classifies it) must appear as comments (or as “optional extension” / unclassified), not as Horn axioms.
- R6. If the primer and a normative section disagree, the specification wins. The primer must say so.
- R7. The primer must not import tables, commandments, or “interpretation / how to feel” copy from [docs/rpl/bootstrapping.md](../rpl/bootstrapping.md).

**Findability**

- R8. [docs/rpl/README.md](../rpl/README.md) must list the primer in the document map and distinguish it from the agent sketch.

### Actors

- **Language reader** — a human or model trying to learn what RPL *means*. Uses the primer, then the spec.
- **Spec author** — owns [docs/rpl/specification/](../rpl/specification/). Does not take rules from the primer.
- **Agent-bootstrap author** — future work. May cite laws. Must not redefine them.

### Key Flows

- F1. **Learn the language.** Reader opens the primer, walks Laws 0–12, treats Comments A–G as non-theorems, then follows spec pointers for detail.
- F2. **Resolve a conflict.** Reader finds a clash between primer and spec, keeps the spec, files a primer fix.
- F3. **Refuse a stale source.** Reader coming from `content/` or from bootstrapping.md is told those are not definition.

### Acceptance Examples

- AE1. Covers R3, R5. When the primer explains `$x`, it is labelled a comment (temporal / deduced position), not a Horn connective.
- AE2. Covers R4, R6. When a law states `HEAD <- BODY`, it cites [rpl.md §10](../rpl/specification/rpl.md#10-rules-and-implication) and uses the ∀-clause reading.
- AE3. Covers R5. When the primer mentions `%` with no root goal, named-goal choice is a comment, matching [rpl.md §15.3](../rpl/specification/rpl.md#153-named-goals-and-agent-choice).
- AE4. Covers R2, R7. When a reader opens bootstrapping.md, a status note points at the language primer and forbids using the sketch as definition.
- AE5. Covers R3. When the primer says “first-order logic,” it names the Horn / Datalog-shaped restriction in the same section.

### Success Criteria

- A cold reader can state what is a theorem of the core and what is judgment without opening bootstrapping.md.
- Planning can add laws or comments without inventing a new authority rule (R1, R6 already fix it).

### Scope Boundaries

**In scope**

- The language primer.
- Document-map and status-note edits in `docs/rpl/`.

**Deferred for later**

- Rewriting the agent metacognitive bootstrap.
- Regenerating composed prompts outside `docs/`.
- Socratic Q&A page-per-law in the style of the Little books (the laws-and-comments shape is enough for v1).

**Out of scope**

- Changing normative syntax, grammar, or runtime.
- Treating RPL as an enterprise runtime ([docs/rpl/enterprise.md](../rpl/enterprise.md)).
- Replacing the recipe tutorials.

### Dependencies / Assumptions

- The base spec, LRPL delta, logics, theory, motivation, vision, and scope docs under `docs/rpl/` are the living language.
- “First-order logic with comments” means Horn-core theorems plus labelled non-theorems, not a full FOL axiomatisation of Markdown or of the agent.

### Outstanding Questions

**Deferred to Planning**

- Q1. Whether later agent-habit material should live in a rewritten bootstrapping.md or a new file.
- Q2. Whether composed artifacts outside `docs/` should be rebuilt from this primer, left stale, or deleted from the release set.

### Approaches considered

**A. Full classical FOL as the base.** Closest to the original wording. Too large: the specs do not take arbitrary quantifier prefixes or FOL completeness as the language.

**B. Keep teaching RPL as a programming language.** Matches the spec’s section order and the stale levelled primers. Leaves the “it is a logic” claim implicit.

**C. Horn-fragment laws plus comments (chosen).** Matches [docs/rpl/theory.md](../rpl/theory.md)’s two layers, [docs/rpl/specification/rpl.md](../rpl/specification/rpl.md) §10 and §15, and the Little-series habit of one law at a time without copying the incomplete agent sketch.
