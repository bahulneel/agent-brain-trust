# Expert Opinion in RPL

This file reimplements the shipped `expert-opinion` skill as a standalone RPL
protocol. It keeps the runtime intent of the original skill:

- prefer an explicit expert id when the user supplied one;
- otherwise resolve candidates from the task's subject matter;
- choose exactly one expert;
- load only that persona; and
- answer in that single voice rather than opening a Brain Trust panel.

Where RPL cannot yet express a runtime concern directly, the missing behaviour
is carried in prose and called out again in the accompanying experience report.

# Expert Opinion - % <= deliver-expert-opinion(?request, ?expert-id, ?persona)

Choose one expert, announce the choice, load only that persona, and answer in
that voice for the rest of the turn.

If the request really wants a multi-voice workshop, critique, editorial room,
or trust, do not force it through this protocol. Hand off to a Brain Trust
protocol instead.

## User request - request($request)

Capture the user's task in their own words.

## Explicit expert id - explicit-expert-id($expert-id)

If the user already names a Brain Trust expert id, prefer it over discovery.

## Available expert id - available-expert(?expert-id) <= $list-experts() ^ ~ {:result #{& ?expert-ids}}, ?expert-id in ?expert-ids

Treat `$list-experts` as the authoritative roster of valid ids for this run.
If the host implements discovery by file access instead of an MCP surface, this
relation stands for that equivalent lookup.

## Discovery phrases - discovery-phrases($phrases)

When no explicit expert id is present, restate the task as two to five short
topic phrases that are suitable for expert resolution.

## Draft candidate expert - candidate-expert(?expert-id) <= discovery-phrases(?phrases), $draft-experts(?phrases) ^ ~ {:result ?expert-id}

Treat `$draft-experts` as the expert-resolution surface. A host may implement it
by another skill, by MCP tools such as `resolve_topics`, or by an internal
resolver. The protocol only needs the resulting expert id candidates.

## Use the explicit expert - chosen-expert(?expert-id) <= explicit-expert-id(?expert-id)

If the user already named an id, use it directly.

## Choose a discovered expert - chosen-expert(?expert-id) <= candidate-expert(?expert-id) ; @choose(?expert-id, candidate-expert(?expert-id))

Choose the one best-fit expert for the request. The choice should optimize for
subject fit, not variety, because this protocol is intentionally single-voice.

## Chosen expert must exist - chosen-expert(?expert-id) => available-expert(?expert-id)

Do not continue with an invented or stale expert id.

## Load expert persona - expert-persona(?expert-id, ?persona) <= chosen-expert(?expert-id), $get-expert(?expert-id) ^ ~ {:result ?persona}

Load only the chosen persona card. Do not load the entire roster when one card
is sufficient.

## Deliver the answer - deliver-expert-opinion(?request, ?expert-id, ?persona) <= request(?request), chosen-expert(?expert-id), expert-persona(?expert-id, ?persona)

Before the substantive answer, briefly announce:

- the chosen `__expert-id__`;
- the topic or angle it best matches; and
- one sentence on why this expert fits.

Then answer the user's request in that expert's voice. Stay in one voice for the
rest of the turn; do not simulate a panel, a moderator, or internal debate.
