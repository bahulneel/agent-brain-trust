# Experience Report: Reimplementing Brain Trust and Expert Protocols in RPL

This report records the gaps, ambiguities, and frictions I hit while
reimplementing the Brain Trust and Expert protocols in RPL. Where a gap blocked
direct formalization, I used prose in the protocol body and noted the workaround
below.

## Scope

Reimplemented artifacts:

- `expert-opinion.md`
- `brain-trust-technical-dialectic.md`
- `brain-trust-editorial-room.md`

All three live under `docs/rpl/protocols/`.

## What translated cleanly

Several parts of the protocols fit RPL well:

- milestone ordering via multiple `%` rules with `@when(...)`
- mandatory guest slots as explicit relations and constraints
- closed option sets for value constraints, trajectories, and output biases
- cardinality checks for "two or three cohorts"
- simple distinctness constraints for guest reuse
- abstract tool surfaces such as `$draft-experts`, `$get-expert`, and
  `$list-experts`

Those pieces now read like protocol structure rather than prose convention.

## Expressivity gaps

### 1. No first-class pause or checkpoint primitive

This was the biggest gap.

The shipped Brain Trust protocol depends heavily on rules like:

- complete one milestone;
- stop immediately;
- wait for a real human reply; and
- do not emit any later milestone in the same assistant turn.

RPL can model milestone eligibility, but it cannot directly say "publish this
milestone and then stop the turn now." I therefore kept all hard stop/wait
behaviour in prose.

**Workaround used:** every protocol file explains in prose that milestone
boundaries still require a runtime checkpoint even though the formal layer only
models dependency order.

### 2. No crisp distinction between agent-authored output and user-confirmed state

Several Brain Trust milestones produce text that the user then confirms:

- Readings
- Grounding Statement
- Trajectory + output bias
- Debate synthesis

RPL relations can store that these artifacts exist, but there is no dedicated
syntax for "the agent generated this candidate, and a later human message
ratified it." I had to choose between:

- representing the artifact itself as a relation, or
- representing only the final confirmed state.

Both are useful, but the language offers no first-class pairing between them.

**Workaround used:** I mostly modeled final confirmed facts (`confirmed-*`) and
kept the candidate text generation requirements in prose.

### 3. Cross-skill invocation is not a first-class concept

The existing protocols call `draft-experts` as a skill. RPL has relations,
goals, and tools, but no first-class "invoke another skill" primitive.

**Workaround used:** I modeled expert resolution as abstract tools such as
`$draft-experts`, `$get-expert`, and `$list-experts`. That captures the protocol
shape, but it blurs the distinction between:

- a skill call,
- an MCP tool call,
- a local helper, and
- any other resolver implementation.

### 4. Universal requirements are awkward

Statements like these are common in Brain Trust:

- every cohort must have exactly one guest
- every roster member belongs to exactly one cohort
- every guest persona must be published before that guest speaks

RPL can approximate some of this with cardinality and count equality, but there
is no direct "for all current cohorts" or "for all current roster members"
surface that reads naturally for these protocol obligations.

**Workaround used:** I combined counts and per-member/per-cohort constraints
where possible, and left stronger sequencing rules in prose.

### 5. Repeated inquiry/readings loops are possible but clumsy

The prose Brain Trust protocol allows Inquiry -> revised Readings -> possibly a
second Inquiry -> revised Readings again.

RPL has `@for`, but using it here would have introduced substantially more
machinery than the surrounding protocols currently need, and it still would not
solve the pause-between-turns problem cleanly.

**Workaround used:** I modeled one explicit Inquiry -> revised Readings cycle and
left further repetitions to prose.

### 6. Output-shape constraints remain prose-only

The shipped skills require very specific presentation contracts:

- a visible Guest List block
- full Guest Persona Format fields
- a visible Protocol checkpoint block
- "one sentence per voice" in Readings
- "name what was traded away" in synthesis

RPL can name the data that should exist, but not the exact rendered structure of
the assistant's message.

**Workaround used:** all formatting and rhetorical-shape requirements remain in
body prose.

## Ambiguities in the current RPL spec

### 1. Metadata key style is inconsistent in the spec text

The spec says things like:

- `:result` is the primary key
- `:doc` is the primary key

but it also shows examples such as:

- `relation ^ ~ {doc ?x}`
- `$tool ^ ~ {result ?x}`

That leaves open whether unqualified symbol keys and keyword keys are equally
canonical for tool metadata.

**Effect on this reimplementation:** I standardized on keyword keys such as
`{:result ?x}` to stay close to the more explicit examples.

### 2. Mutual exclusion examples use `!%`

Section 15.4 shows:

```text
% <= %low => !%
```

but section 15.5 only defines `!%goal` as sugar for `%goal ^ false`. It is not
clear whether bare `!%` is truly defined or just suggestive shorthand.

**Effect on this reimplementation:** I avoided `!%` entirely and used `not ...`
or positive readiness relations instead.

### 3. The boundary between lvars and avars in authored headings is underspecified

For user-supplied values, `$x` is clear. For agent-authored artifacts later
ratified by the user, the right choice is less clear:

- should the artifact be `?statement` because the agent authored it?
- or `$statement` because it only becomes authoritative after user input?

**Effect on this reimplementation:** I used `?` for clearly agent-authored
internal artifacts and `$` for clearly human-confirmed selections, but the rule
is still more convention than specification.

### 4. Tool result schemas are opaque

The RPL spec explains how to match metadata, but not how protocol authors should
document or constrain the schema of a tool result beyond prose.

**Effect on this reimplementation:** the `$draft-experts` and `$get-expert`
results are modeled minimally, without trying to pin down a richer return shape.

## Authoring frictions

### 1. Optional values are verbose

Many Brain Trust selections are "one primary, one optional secondary":

- value constraints
- trajectories
- output biases

Representing that cleanly required helper relations like
`valid-secondary-value-constraint(nil)` and similar patterns. It works, but it
is noisy.

### 2. Sequencing requirements split across logic and prose

The resulting files are readable, but the logic alone is not enough to recover
the intended runtime behaviour. A reader must combine:

- goal ordering,
- readiness relations,
- constraints, and
- prose checkpoint rules

to understand the real protocol.

### 3. Relation naming gets long quickly

Because RPL favors declarative names and these protocols already have many
milestones, some relations become mechanically verbose:

- `pre-readings-guest-persona`
- `confirmed-output-biases`
- `revised-readings-disposition`

The names are accurate, but the density adds friction in large protocols.

## Changes I would want in RPL next

If RPL is meant to carry protocols of this shape directly, the most useful next
features would be:

1. **A pause/checkpoint primitive** for "emit this milestone, then await human
   reply before any later goal becomes eligible."
2. **First-class confirmation syntax** for "candidate artifact" vs "confirmed
   artifact."
3. **A cleaner universal/coverage surface** for requirements over dynamic sets
   such as cohorts, guests, and roster members.
4. **A first-class skill invocation surface** distinct from generic tools.
5. **A lightweight output contract surface** for required blocks, lists, or
   per-voice constraints.

## Bottom line

RPL is already good at making these protocols' hidden structure visible:
milestone order, option catalogs, mandatory slots, and some structural
invariants all became materially clearer.

The language becomes much less comfortable exactly where Brain Trust is most
interesting: human-gated phase transitions, confirmation loops, rich output
shape, and cross-skill orchestration. Those parts are still best expressed in
prose today, which is why the new protocol files intentionally mix formal RPL
with explicit prose workarounds instead of pretending the formal layer can do
more than it currently can.
