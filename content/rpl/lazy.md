# Lazy Relational Prompt Language (LRPL)

LRPL extends RPL with lazy evaluation, constraint memos, and goal-relative quiescence. It defers evaluation until forward progress requires it.

## 1. Lazy Expressions
`LAZY-EXPR = '<' EXPR '>'`

- **Deferral**: The interior of `<expr>` is not asserted until progress stalls or `#<expr>` expands it.
- **Expansion**: `#<expr>` supplies the syntax reading of the lazy wrapper at that site.
- **Free Variables**: Variables appearing both inside and outside `<expr>` are shared. Variables appearing only inside are scoped to the expression.
- **Async Interaction**: An avar inside `<expr>` is not dispatched until the expression is entered.

## 2. Constraint Memos
Before an lvar is bound, the agent records candidate worlds as a constraint memo in disjunctive normal form (DNF), stored under `:memo` in the lvar's metadata.

- `?x ^ {:memo DNF-EXPR}`
- `?x ^:memo ?dnf`
- `DNF-EXPR = DNF-CONJ | DNF-CONJ '|' DNF-EXPR`
- `DNF-CONJ = '(' TAIL ')'`

**Purpose**:
- Defer binding while the constraint space is large.
- Detect early conflicts between incompatible constraints.
- Retract unsatisfiable disjuncts non-monotonically.

**Realisation**:
An lvar is realised (bound to a ground value) when:
1. Exactly one fully-ground disjunct remains.
2. A downstream goal requires a ground value and no further progress is possible.

## 3. Satisfactory Quiescence
LRPL replaces full fixpoint quiescence with goal-relative quiescence.

- **Required Binding Set**: The transitive closure of a goal's argument lvars and the lvars of every relation in its dependency graph (excluding lazy expressions until entered).
- **Quiescence**: Quiescence of the required binding set is sufficient to select the goal.
- **Exploration Heuristics**:
  - **Shared-first**: Prefer bindings in the required binding sets of the most goals simultaneously.
  - **Adversarial early stopping**: Seek the constraint or input that invalidates the most goals.

## 4. Standard Library Additions
- **`$index(LOCATION, "projection hint"?)`**: Maps an external source to a relation's argument positions.
  - `LOCATION` can be a string path, URL, or relation call with a `$`-marked argument identifying the collection.
- **`$generate(?prompt, ?options)`**: Generates content. Carries `:generated true` provenance in the trace.
- **`$write(?content, ?location, ?options)`**: Writes content. A trace stratum written via `$write` is a valid `$index` source.
- **`$json(?x)`** (built-in, RPL core): Appends to the **chat** one NDJSON line per possible binding instance of `?x` at that point in evaluation (line payload is the bound value encoded as JSON). No external API—lazy dispatch still applies until the emission is needed for progress.

Further LRPL-related **language extensions** are specified only in separate docs under `docs/rpl/specification/` (for example [meta-programming.md](../../docs/rpl/specification/meta-programming.md)). This summary does not track extension syntax; read the extension spec for the current surface.

## 5. Extended Timestep
Phases 3, 7, and 8 of the eager timestep are modified:
- **Phase 3 & 7 (Quiesce + propagate memos)**: Apply constraints to memos, retract unsatisfiable disjuncts, realise lvars with one disjunct, surface conflicts.
- **Phase 8 (Dispatch asyncs)**: Lazy expressions are excluded from dispatch unless entered.
