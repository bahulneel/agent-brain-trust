# Brain Trust Editorial Room in RPL

This file reimplements the shared editorial Brain Trust protocol in RPL. It is
the protocol shape used by the editorial and critique skills: guest drafting,
grounding on the piece, trajectory setting, cohort construction, discovery, and
editorial debate.

Like the technical variant, the formal layer captures milestone ordering,
mandatory guests, validated option sets, and several structural invariants. The
runtime checkpoint discipline still lives in prose because current RPL does not
yet have a first-class way to say "publish this milestone, then stop."

# Brain Trust Editorial Room - % <= %pre-readings-guest-drafting ; @when(not pre-readings-ready)

Complete the mandatory pre-readings guest drafting milestone first. Publish a
Guest List block plus full personas for exactly one Expert Witness and exactly
one Designated Challenger before any Readings appear.

# Brain Trust Editorial Room - % <= %readings ; @when(pre-readings-ready, not inquiry-needed, not readings-ready)

Publish one-sentence parallel readings from every permanent roster member plus
both pre-readings guests. Each reading should cover the piece's purpose,
audience, apparent stage, and likely struggle.

# Brain Trust Editorial Room - % <= %inquiry ; @when(pre-readings-ready, inquiry-needed, not inquiry-answered, not readings-ready)

Ask only the questions needed to reconcile disputed or ambiguous readings before
moving to value constraints.

# Brain Trust Editorial Room - % <= %revised-readings ; @when(inquiry-needed, inquiry-answered, not readings-ready)

Return to one-sentence revised readings for every affected voice after Inquiry.

# Brain Trust Editorial Room - % <= %value-constraints ; @when(readings-ready, not value-constraints-ready)

Propose one primary and optional secondary value constraint, then wait for the
writer to confirm or adjust them.

# Brain Trust Editorial Room - % <= %grounding-statement ; @when(value-constraints-ready, not grounding-statement-ready)

Synthesize the confirmed readings into a compact Grounding Statement that fixes
purpose, audience, current stage, stop point, and value constraints.

# Brain Trust Editorial Room - % <= %trajectory ; @when(grounding-statement-ready, not trajectory-ready)

State one primary and optional secondary editorial trajectory plus one or two
output biases. The writer confirms these before debate begins.

# Brain Trust Editorial Room - % <= %cohort-construction ; @when(trajectory-ready, not cohorts-ready)

Identify the tension axes, partition the room into two or three cohorts, and
draft one distinct cohort guest per cohort before debate opens.

# Brain Trust Editorial Room - % <= %discovery ; @when(cohorts-ready, discovery-required, not discovery-ready)

Run witness Q and A before positions. Discovery here is about facts, audience
realities, conventions, and constraints, not about staking editorial positions.

# Brain Trust Editorial Room - % <= %debate ; @when(cohorts-ready, discovery-ready, not debate-complete)

Run the debate as Position, Rebuttal, and Refine/Synthesis. The session should
stop at the chosen target stage rather than silently escalating the scope.

## Writer request - request($request)

Capture the writer's task or draft problem in their own words.

## Fast-track mode - fast-track-mode($mode)

Record whether the writer explicitly opted into bundling milestones. Use
`"strict"` by default and `"fast-track"` only on explicit writer request.

```rpl
valid-fast-track-mode("strict")
valid-fast-track-mode("fast-track")

fast-track-mode(?mode) => valid-fast-track-mode(?mode)
```

## Permanent roster member - roster-member(?member)

Treat the fixed panel membership as input from the surrounding skill. This file
models the shared editorial protocol rather than any one built room.

## Mandatory pre-readings role catalog - mandatory-pre-readings-role(?role)

```rpl
mandatory-pre-readings-role("expert-witness")
mandatory-pre-readings-role("designated-challenger")
```

## Expert witness gap - expert-witness-gap(?gap)

Name the load-bearing subject, genre, audience, or documentation gap the room
needs the witness to cover before Readings.

## Designated challenger gap - designated-challenger-gap(?gap)

Name the criticism or adversarial pressure the challenger should bring to the
opening round.

## Draft Expert Witness - pre-readings-guest("expert-witness", ?expert-id) <= expert-witness-gap(?gap), $draft-experts(?gap) ^ ~ {:result ?expert-id}

Resolve the witness through the expert resolver and immediately publish a full
guest persona grounded in that expert.

## Draft Designated Challenger - pre-readings-guest("designated-challenger", ?expert-id) <= designated-challenger-gap(?gap), $draft-experts(?gap) ^ ~ {:result ?expert-id}

Resolve the challenger through the expert resolver and immediately publish a
full guest persona grounded in that expert.

## Load pre-readings guest persona - pre-readings-guest-persona(?role, ?expert-id, ?persona) <= pre-readings-guest(?role, ?expert-id), $get-expert(?expert-id) ^ ~ {:result ?persona}

The Guest Persona Format still lives in prose: name and epithet, why drafted,
approach, core move, and signature question.

## Pre-readings guests must differ - pre-readings-guest("expert-witness", ?w), pre-readings-guest("designated-challenger", ?c) => ?w != ?c

Do not reuse one figure for both mandatory pre-readings roles.

## Pre-readings ready - pre-readings-ready <= |pre-readings-guest-persona("expert-witness", ?witness-id, ?witness-persona)| = 1, |pre-readings-guest-persona("designated-challenger", ?challenger-id, ?challenger-persona)| = 1

Once both personas exist, the opening guest milestone is structurally complete.
The runtime pause after publishing them remains a prose obligation.

## First readings disposition - readings-disposition($status)

Capture the writer's first reply after Readings.

```rpl
valid-readings-disposition("confirm")
valid-readings-disposition("correct")
valid-readings-disposition("dispute")
valid-readings-disposition("recorded-disagreement")

readings-disposition(?status) => valid-readings-disposition(?status)

readings-ready <= readings-disposition("confirm")
readings-ready <= readings-disposition("recorded-disagreement")

inquiry-needed <= readings-disposition("correct")
inquiry-needed <= readings-disposition("dispute")
```

## Moderator-triggered inquiry - optional-inquiry-trigger(?reason)

The moderator may also open Inquiry when the request is under-specified, the
readings diverge sharply, or the writer's first reply leaves key uncertainty in
audience, genre, or purpose.

```rpl
inquiry-needed <= optional-inquiry-trigger(?reason)
```

## Inquiry answer - inquiry-answer($answer)

Collect the writer's answer to the Inquiry round.

```rpl
inquiry-answered <= inquiry-answer(?answer)
```

## Revised readings disposition - revised-readings-disposition($status)

Capture the writer's reply after the revised readings round.

```rpl
revised-readings-disposition(?status) => valid-readings-disposition(?status)

readings-ready <= revised-readings-disposition("confirm")
readings-ready <= revised-readings-disposition("recorded-disagreement")
```

## Confirmed value constraints - confirmed-value-constraints($primary, $secondary)

Record the final confirmed value-constraint pair. Use `nil` when there is no
secondary constraint.

```rpl
valid-value-constraint("minimal-effort")
valid-value-constraint("minimal-change")
valid-value-constraint("follow-the-rabbit-hole")
valid-value-constraint("most-publishable-version")
valid-value-constraint("most-elegant-version")
valid-value-constraint("shortest-path-to-draft")
valid-value-constraint("voice-fidelity")
valid-value-constraint("surface-the-pattern")
valid-value-constraint("challenge-the-premise")
valid-value-constraint("documentation-utility")
valid-secondary-value-constraint(nil)
valid-secondary-value-constraint(?constraint) <= valid-value-constraint(?constraint)

confirmed-value-constraints(?primary, ?secondary) => valid-value-constraint(?primary), valid-secondary-value-constraint(?secondary)
value-constraints-ready <= confirmed-value-constraints(?primary, ?secondary)
```

## Confirmed grounding statement - confirmed-grounding-statement($statement)

Publish a two-to-four sentence Grounding Statement containing the agreed purpose
of the piece, intended audience, current stage, session stop point, confirmed
value constraints, and any domain gaps that matter for Discovery. Establish this
relation only after the writer confirms that statement.

```rpl
grounding-statement-ready <= confirmed-grounding-statement(?statement)
```

## Confirmed trajectory - confirmed-trajectory($primary, $secondary)

Record the final confirmed trajectory pair. Use `nil` when there is no
secondary trajectory.

```rpl
valid-trajectory("discovery")
valid-trajectory("framing")
valid-trajectory("outlining")
valid-trajectory("drafting")
valid-trajectory("structural-editing")
valid-trajectory("explanatory-editing")
valid-trajectory("argument-testing")
valid-trajectory("documentation-shaping")
valid-trajectory("voice-calibration")
valid-trajectory("compression")
valid-trajectory("expansion")
valid-trajectory("finishing")
valid-trajectory("boundary-setting")
valid-secondary-trajectory(nil)
valid-secondary-trajectory(?trajectory) <= valid-trajectory(?trajectory)

confirmed-trajectory(?primary, ?secondary) => valid-trajectory(?primary), valid-secondary-trajectory(?secondary)
```

## Confirmed output biases - confirmed-output-biases($primary, $secondary)

Record the final output-bias pair aligned with the chosen trajectory. Use `nil`
when only one output bias is confirmed.

```rpl
valid-output-bias("candidate-theses-tensions-and-evidence-gaps")
valid-output-bias("angles-titles-promise-statements-and-reader-contract")
valid-output-bias("section-map-narrative-spine-and-transition-duties")
valid-output-bias("opening-moves-section-briefs-scaffolds-and-sample-starts")
valid-output-bias("reorder-plan-cuts-joins-and-missing-bridges")
valid-output-bias("jargon-map-simplification-targets-and-teaching-moves")
valid-output-bias("claims-map-objections-evidence-gaps-and-caveat-plan")
valid-output-bias("headings-navigation-examples-step-flow-and-reference-blocks")
valid-output-bias("tonal-notes-cadence-notes-and-sentence-level-guardrails")
valid-output-bias("cuts-merges-and-repetition-map")
valid-output-bias("missing-context-missing-examples-and-missing-stakes")
valid-output-bias("last-pass-priorities-polish-checklist-and-ship-risks")
valid-output-bias("parked-ideas-exclusions-and-sequel-candidates")
valid-secondary-output-bias(nil)
valid-secondary-output-bias(?bias) <= valid-output-bias(?bias)

confirmed-output-biases(?primary, ?secondary) => valid-output-bias(?primary), valid-secondary-output-bias(?secondary)
trajectory-ready <= confirmed-trajectory(?trajectory-primary, ?trajectory-secondary), confirmed-output-biases(?bias-primary, ?bias-secondary)
```

## Tension axis - tension-axis(?axis)

Name one fresh tradeoff axis that genuinely splits the room for this piece.

```rpl
valid-tension-axis-count(2)
valid-tension-axis-count(3)
valid-tension-axis-count(4)
axis-count(?n) <= |tension-axis(?axis)| = ?n
axis-count(?n) => valid-tension-axis-count(?n)
```

## Cohort - cohort(?cohort-id)

Create two or three cohorts.

```rpl
valid-cohort-count(2)
valid-cohort-count(3)
cohort-count(?n) <= |cohort(?cohort-id)| = ?n
cohort-count(?n) => valid-cohort-count(?n)
```

## Cohort assignment - cohort-assignment(?member, ?cohort-id)

Assign every permanent roster member to exactly one cohort before debate.

```rpl
cohort-assignment(?member, ?cohort-id) => roster-member(?member), cohort(?cohort-id)
member-assignment-count(?member, ?n) <= |cohort-assignment(?member, ?cohort-id)| = ?n
member-assignment-count(?member, ?n) => ?n = 1
```

## Cohort guest gap - cohort-guest-gap(?cohort-id, ?gap)

State the productive gap or pressure each cohort-specific guest should cover.

```rpl
cohort-guest-gap(?cohort-id, ?gap) => cohort(?cohort-id)
```

## Draft cohort guest - cohort-guest(?cohort-id, ?expert-id) <= cohort-guest-gap(?cohort-id, ?gap), $draft-experts(?gap) ^ ~ {:result ?expert-id}

Draft one distinct named guest per cohort before debate opens.

## Load cohort guest persona - cohort-guest-persona(?cohort-id, ?expert-id, ?persona) <= cohort-guest(?cohort-id, ?expert-id), $get-expert(?expert-id) ^ ~ {:result ?persona}

Publish the full Guest Persona Format for each cohort guest before that cohort
speaks.

## Cohort guests must be distinct - cohort-guest(?cohort-a, ?expert-id), cohort-guest(?cohort-b, ?expert-id) => ?cohort-a = ?cohort-b

One named figure may not serve as cohort guest for two different cohorts in the
same run.

## Cohorts ready - cohorts-ready <= cohort-count(?n), |cohort-guest-persona(?cohort-id, ?expert-id, ?persona)| = ?n

The cohort milestone is only complete when every cohort has a distinct drafted
guest persona. The prose protocol still carries the stronger requirement that
each cohort should straddle at least one tension axis.

## Discovery required - discovery-required <= pre-readings-guest("expert-witness", ?expert-id)

Because the shipped editorial protocol always fills the Expert Witness slot
before Readings, Discovery is structurally required before Position.

## Discovery record - discovery-record(?summary)

Run witness Q and A before positions and record the resulting shared grounding
about facts, genre expectations, audience realities, or subject constraints.

```rpl
discovery-ready <= discovery-record(?summary)
```

## Final synthesis - final-synthesis(?summary)

Produce the clearest available next version of the piece for this session's stop
point, naming what was traded away and why.

```rpl
debate-complete <= final-synthesis(?summary)
```
