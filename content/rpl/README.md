# RPL Bootstrap

A composable collection of files that together constitute a system prompt for
an RPL or LRPL interpreter agent. Concatenate the relevant files in the order
below to produce the prompt for a given deployment.

---

## Composition

```
REQUIRED (always include, in order):
  core.md           Markdown embedding, namespaces, two layers, conventions
  rpl.md            Relations, rules, goals, tools, async, trace, timestep

OPTIONAL EXTENSIONS (include when needed):
  lrpl.md           Lazy expressions, constraint memos, satisfactory quiescence
                    Include only when the document uses LRPL constructs.
                    Mutually exclusive with plain RPL execution — do not load
                    both and expect the agent to choose.

VOCABULARY (include selectively):
  vocab/io.md       $index, $generate, $write, tool algebra
  vocab/ordering.md Partial orders, precedence, sequencing
  vocab/roles.md    Entity roles, permissions, capabilities
  vocab/versioning.md Succession, history, temporal facts
  vocab/aggregation.md Quorum, unanimous, threshold conditions
  vocab/provenance.md Source, time, lineage, audit vocabulary
  vocab/distinctness.md Mutual exclusion, conflict, uniqueness
  vocab/dialogue.md Speakers, turns, rounds, phases, convergence

DEPLOYMENT ADAPTER (include exactly one):
  deploy/adhoc.md       Single conversation, inline document
  deploy/skill.md       Agent skill, on-demand activation
  deploy/pipeline.md    Automated, no human in loop
  deploy/handoff.md     Multi-agent or cross-session resumption
```

---

## Composition Examples

**Minimal RPL interpreter, ad-hoc:**
```
core.md + rpl.md + deploy/adhoc.md
```

**LRPL interpreter with IO and dialogue, skill deployment:**
```
core.md + rpl.md + lrpl.md + vocab/io.md + vocab/dialogue.md
+ vocab/distinctness.md + deploy/skill.md
```

**Automated pipeline with provenance tracking:**
```
core.md + rpl.md + lrpl.md + vocab/io.md + vocab/provenance.md
+ deploy/pipeline.md
```

**Cross-session handoff with full vocabulary:**
```
core.md + rpl.md + lrpl.md + vocab/io.md + vocab/ordering.md
+ vocab/provenance.md + vocab/versioning.md + deploy/handoff.md
```

---

## Design Principles

**Push differences to the edges.** The core and rpl layers are invariant.
Deployment-specific behaviour lives only in the adapter. Domain-specific
vocabulary lives only in vocab files.

**Mutual exclusion at the extension boundary.** rpl.md and lrpl.md are
mutually exclusive execution models. A prompt includes one or the other,
never both.

**Vocabulary files compose without conflict.** Each vocab file defines
relations in its own conceptual namespace. Including multiple vocab files
does not produce ambiguity.

**One deployment adapter.** A prompt includes exactly one deploy file.
Deployment contexts do not compose — a pipeline is not also a skill.

---

## Prior Knowledge Anchors

The bootstrap files assume a capable frontier model and lean on prior knowledge
to stay compact:

```
core.md / rpl.md    Datalog, Bloom/CALM theorem, Dedalus async model
lrpl.md             miniKanren constraint stores, CLP, CALM non-monotonic points
vocab/dialogue.md   Structured debate, turn-taking, dialectic protocols
```

Where prior knowledge covers the concept, the file specifies only the RPL delta.
