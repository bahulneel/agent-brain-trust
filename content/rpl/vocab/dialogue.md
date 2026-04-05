# RPL Vocab — Dialogue

Relations, constraints, and goals for multi-party, phased dialogue. Speakers,
turns, rounds, and phases composed from core RPL primitives. Requires
distinctness.md for structural honesty constraints.

---

## Speakers as Entities

A speaker is a ground value — an entity that participates in relations:

```rpl
speaker(?id)                  -- declares a speaker entity
speaker-name(?id, ?name)      -- human-readable name
speaker-perspective(?id, ?p)  -- declared perspective or orientation
```

Speakers are not relations. Their identity is carried as an argument.

---

## Positions and Claims

```rpl
position(?speaker, ?round, ?claim)    -- ?speaker asserts ?claim in ?round
supports(?speaker, ?claim)            -- ?speaker supports a claim
opposes(?speaker, ?claim)             -- ?speaker opposes a claim
```

---

## Distinctness Constraint

No two speakers may hold identical claims. Premature convergence is a constraint
violation:

```rpl
position(?s1, ?n, ?claim),
position(?s2, ?n, ?claim),
?s1 != ?s2 => false
```

---

## Turns and Rounds via Goal Composition

Iteration over speakers within a round, and over rounds within a session,
composes parameterised goals with abductive clauses:

```rpl
%session() <= %round(?n)
  ; @for(?n, round-eligible(?n), next-round(?n))

%round(?n) <= %turn(?n, ?speaker)
  ; @each(?speaker)

%turn(?n, ?speaker) <= position(?speaker, ?n, ?claim)
```

`%session` iterates rounds. `%round` iterates speakers. `%turn` is atomic:
one speaker, one round, one position. Each level owns exactly one dimension.

---

## Phase Structure

Phases compose above sessions:

```rpl
%workshop() <= %grounding(), %session(), %synthesis()
```

Each phase is a goal. The full architecture — phases, rounds, turns, positions,
convergence — falls out of goal composition with no special primitives.

---

## Convergence

`next-round` inspects the trace of the completed round. If no new ground facts
were established, it does not hold and iteration terminates. Convergence is a
structural fact derived from the trace:

```rpl
next-round(?n) <=
  ?m = ?n + 1,
  novel-facts-in-round(?n)

novel-facts-in-round(?n) <=
  position(_, ?n, ?claim),
  not position(_, ?prev, ?claim), ?prev = ?n - 1
```

---

## Synthesis Gate

Synthesis is only eligible when genuinely distinct positions exist:

```rpl
synthesis-eligible() <=
  |position(?s, _, _)| >= 2,
  %no-shared-claims(?speakers)

%synthesis() <= synthesis-eligible(), ...
```

Without `synthesis-eligible`, the synthesis goal cannot be satisfied regardless
of how much text the agent produces.
