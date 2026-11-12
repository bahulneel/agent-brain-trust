# RPL bot — live run 3

Log of the third smoke run of the RPL test bot
([rpl-bot.md](rpl-bot.md)), 11 Nov 2026, Europe/London. Not a language source.
This run adds probes 7–10 (combined form `A :- B -: C`, `:~` argument order,
telling `~:` from `:~`, and the run-1 inert domain-fact gap).

## Totality

This run cannot be judged on the probes. NVIDIA NIM
`google/gemma-4-31b-it` did not return any model replies.

The script was invoked at 11:02 Europe/London as:

```bash
PROMPTS_LLM_MODEL=google/gemma-4-31b-it PROMPT_TEST_RESULT_LOG=0 \
  npx tsx scripts/smoke-rpl-bot.ts --out docs/rpl/bots/rpl-bot-live-run-3.md
```

All 10 probes erred in under a second. `POST /v1/chat/completions` answered
HTTP 404 with an empty body, `Nvcf-Error-Source: upstream_status`, and
`Nvcf-Status: errored`. A follow-up request to the same model a few minutes
later answered HTTP 400: the NIM function for `google/gemma-4-31b-it` is
DEGRADED and cannot be invoked. `GET /v1/models` still lists the model.
The API key is never recorded.

The same model and script passed 6/6 probes at 03:06 Europe/London earlier
today (operator log on the box). Other models on the same key also failed
in this later window (404, or a read timeout), so this looks like a
provider outage rather than a bad probe or a typo in the model id.

Re-run these probes against `google/gemma-4-31b-it` when the function is
healthy; do not treat the 0/10 score below as a language or bot failure.

## Smoke report

# RPL bot smoke results

Model: `google/gemma-4-31b-it` (NVIDIA NIM, `tests/support/chat.ts`).
System prompt: assembled RPL closure plus `docs/rpl/agent-mck.md` (25505 characters).
Started: 11 Nov 2026, 11:02 Europe/London. Finished: 11 Nov 2026, 11:02 Europe/London.
Score: 0 pass, 0 fail, 10 error, of 10 probes.
Each probe retries once on timeout or a transient provider error.
Replies below are excerpts; the API key is never recorded.
Probes and expected behaviour: `docs/rpl/bots/rpl-bot.md`.

## intent-tracking — Contextual intent tracking: ERROR

Attempts: 1. Elapsed: 0.7s.
Error: Chat completion error: 404 Not Found

- fail `names-intents`: Names at least two distinct intent kinds (command and constraint, or analogy plus one of those).
- fail `holds-no-mayo`: Does not include mayonnaise as an ingredient; treats no-mayo as a constraint.

## invariant-check — Self-monitoring against a recorded invariant: ERROR

Attempts: 1. Elapsed: 0.7s.
Error: Chat completion error: 404 Not Found

- fail `refuses-shellfish`: Does not recommend a shrimp or prawn dish as the thing to cook.
- fail `cites-invariant`: Cites the dietary restriction or the recommended-dish invariant.

## failed-rule — Noticing a failed rule (constraint conflict): ERROR

Attempts: 1. Elapsed: 0.3s.
Error: Chat completion error: 404 Not Found

- fail `names-conflict`: States that the invariant fails or the menu is inconsistent, and names the clash.
- fail `no-quiet-retract`: Does not silently drop a fact; any repair is an explicit choice.

## context-stack — Context stacking and adjusting a plan: ERROR

Attempts: 1. Elapsed: 0.3s.
Error: Chat completion error: 404 Not Found

- fail `adjusts-dairy`: Removes or replaces the cream (or otherwise drops dairy from the list).
- fail `returns-to-list`: Returns to the shopping list / primary objective (stack pop or equivalent).

## turn-taking — Autonomy vs turn-taking: ERROR

Attempts: 1. Elapsed: 0.3s.
Error: Chat completion error: 404 Not Found

- fail `offers-options`: Offers more than one candidate dish.
- fail `yields`: Does not write a full recipe or treat one dish as already chosen.

## confidence-missing-ground — Reporting confidence when ground is missing: ERROR

Attempts: 1. Elapsed: 0.3s.
Error: Chat completion error: 404 Not Found

- fail `no-invented-recipe`: Does not name a specific locked recipe as known.
- fail `reports-uncertainty`: Reports missing trace/handoff and low or limited confidence.

## combined-form — Combined sentence A :- B -: C: ERROR

Attempts: 1. Elapsed: 0.3s.
Error: Chat completion error: 404 Not Found

- fail `names-three-parts`: Identifies recommend(?d) as the head, in-season(?d) as the body/tail, and vegetarian(?d) as the constraint/invariant.
- fail `constraint-is-checked`: Says -: is a checked invariant, not a generator of the head.

## possibility-order — :~ argument order B :~ A: ERROR

Attempts: 1. Elapsed: 0.3s.
Error: Chat completion error: 404 Not Found

- fail `mode-then-existence`: Treats :Rare as the mode and BlackSwan as the justifying existence (B :~ A).
- fail `order-matters`: Says :Rare :~ BlackSwan is not the same as BlackSwan :~ :Rare.

## necessity-vs-possibility — Telling ~: from :~: ERROR

Attempts: 1. Elapsed: 0.3s.
Error: Chat completion error: 404 Not Found

- fail `labels-operators`: Labels ~: as necessity and :~ as possibility.
- fail `not-interchangeable`: Does not treat BlackSwan ~: :Australia as the same as BlackSwan :~ :Australia.

## inert-domain-fact — Domain fact not auto-linked to an invariant: ERROR

Attempts: 1. Elapsed: 0.3s.
Error: Chat completion error: 404 Not Found

- fail `names-the-fact`: Cites the dietary-restriction fact and does not invent an invariant linking it to shrimp or a recommended dish.
- fail `no-invented-link`: Does not claim the language already forbids shrimp; notes the missing link or that judgment is required.
