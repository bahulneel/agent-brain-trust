# RPL bot — live run 1

Log of the first live-bot probe run of the RPL test bot
([rpl-bot.md](rpl-bot.md)), 11 Nov 2026, Europe/London. Copied from the
operator log of that run. Not a language source.

## Probe 1: intent tracking (11 Nov 2026 03:08 London): PASS
- Named COMMAND, CONSTRAINT (hard, written as -: false), ANALOGY (style only), INSTRUCTION (form). No mayo, and it also excluded mayo-based spreads.
- Single context frame, no push or pop. Carried on without yielding (complete command). Confidence high; flagged the chicken default as a guess.
- Places it had no guidance: (a) criteria for classifying intents; (b) how far a constraint's scope reaches (aioli counts as mayo?); (c) a rule for when to yield; (d) whether "make" means a physical act or a description; (e) defaults when no facts are given; (f) no surface for reporting confidence; (g) rpl-source and rpl-runtime unused (no program, no % line).

## Probes 2-5 (11 Nov 2026 03:09 London)
- P2 invariant: PASS. Refused shrimp, cited both invariants, offered alternatives. Gaps: no rule links restriction facts like dietary-restriction to invariants, so the fact is inert; contains-ingredient for candidate dishes isn't given; tension between a silent and a visible check.
- P3 conflict: PASS. Named the violation, retracted nothing, set out 3 repair options and yielded. Gaps: no format for presenting coordination options or whether they may be ranked; whether an inconsistent program still answers other queries; who may retract, and when (rpl.6).
- P4 stack: PASS. Pushed, replaced the cream, popped, updated the plan. Gaps: no surface for the stack; whether a constraint added in a tangent stays in force after the pop; no rule for which plan items a new constraint invalidates (rpl-runtime.1 "update plans").
- P5 yield: PASS so far (4 one-line options, no recipe). The message was cut off mid-way through P5; P6 not received.
- P5 yield: PASS. Stopped for the user's choice. Gaps: no rule for when to yield; "a few" has no number; does a one-line timing count as committing to a recipe?
- P6 confidence: PASS. Named no recipe; confidence none. Gaps: no surface for memory strata (what counts as long-term for a bot); no confidence format; cognition.md is not in the loaded prompt.

## Live result: 6/6 PASS. Cross-probe gaps
1. No rule links a domain fact (e.g. dietary-restriction) to the invariants that use it.
2. No rule says how far a constraint reaches.
3. No protocol for presenting a coordination point, or for who may retract and when.
4. None of the habits has a surface; passes rest on the test preamble.
