# (L)RPL Additional Logics: Existential, Modal, and Interpretive Frameworks

## 1. Motivation and Base Logic

The core of **(L)RPL** operates on a series of nested assumptions that simplify expressing relations. To understand why additional logics are necessary, we first deconstruct the language's canonical forms.

### 1.1 The Canonical Form

Every expression in (L)RPL is shorthand for a deeper structural commitment. For example, a standalone relation like `expr` is interpreted through multistage expansion:

- **Assertion**:  
  `true <- expr`  
  Declares that the expression exists—an existence statement within the logic.

- **Invariant**:  
  `expr -> true`  
  Asserts that the claim must hold—i.e., the expression's truth.

The composition `true <- expr -> true` anchors the expression at both ends: as a positive existence ("head") and as a necessary validity ("tail").

### 1.2 Fact vs. Proof

There is a key distinction between a **fact** and a **proof** (truth). A statement like "There is a black swan" claims existence (fact), but does not constitute a proof. In canonical form:

- The head (**`true <- expr`**) asserts the existence.
- The tail (**`expr -> true`**) asserts the proof.

> - Without the tail (invariant), a fact is a floating possibility.  
> - Without the head (assertion), a proof has no subject.

The base logic ensures that fact and proof are inseparable for any standard expression.

### 1.3 Relations vs. Goals

A critical distinction is made between a **Relation** and a **Goal**:

- **Relations (`<-`)**:  
  *Backward looking*. Describe the provenance or "Head" of logic (what must be present for an assertion).

- **Goals (`->`)**:  
  *Forward looking*. Define the "Tail"—the invariant (what must be true for the assertion to hold).

In the base logic, these two are balanced. But at scale, managing these independently provides power. Three composable additional logics support this: **existential**, **modal**, and **interpretive** (below).

---

## 2. Additional Logic A: Existential

This logic governs **materialization and synchronization** of expressions. It introduces explicit lifecycle operators: **`<%`** (Head) and **`%>`** (Tail).

### 2.1 The Four Operational Modes

By decomposing canonical forms into existential components, we find four core states:

| Mode         | Syntax         | Concept             | Description                                               |
|--------------|---------------|---------------------|-----------------------------------------------------------|
| The Log      | `true <% A`   | A Posteriori        | Permanent history—record of what has occurred             |
| The Impulse  | `A <% true`   | Transient Trigger   | Immediate—lasts until the next quiescence                 |
| Consistency  | `true %> A`   | Structural Invariant| Hard constraint—logic is invalid if it contradicts A      |
| Eventually   | `A %> true`   | Liveness Promise    | Pending—obligation until A is met                         |

### 2.2 Analogy: The Lifecycle of the Swan

- **The Log** (`true <% BlackSwan`):  
  Grounded observation. We found a black swan—it’s part of permanent history.

- **The Impulse** (`BlackSwan <% true`):  
  Momentary sighting. Immediate effect; not necessarily a permanent law.

- **Consistency** (`true %> BlackSwan`):  
  Invariant. It's a law that black swans must exist; absence is an error.

- **Eventually** (`BlackSwan %> true`):  
  Search. Pending until a black swan is found.

### 2.3 Reasoning: The Self-Cleaning Trace

The **Impulse** is the key innovation. Using `A <% true` for intermediates (flags, steps) allows high-intensity reasoning without polluting the permanent log. When the system reaches "Satisfactory Quiescence," impulses evaporate, keeping history a clear record of results rather than process clutter.

---

## 3. Additional Logic B: Modal

This logic governs **perspective** ("Mode") in which statements are evaluated. It introduces:

- **`~>`**  (Necessity)
- **`<~`**  (Possibility)

to handle necessity, possibility, and context.

### 3.1 Syntax and Semantics

- **Necessity**:  
  `A ~> B` — Projects `A` into the mode of `B`. Asserts `A` is true within the world-view of `B`.

- **Possibility**:  
  `B <~ A` — Maps `B` back to the base context, allowing for the existence defined by `A`.

### 3.2 Analogy: The Perspective of the Swan

- **Necessity** (`BlackSwan ~> :Australia`):  
  Asserts black swan exists specifically within the Australia mode.

- **Possibility** (`:Rare <~ BlackSwan`):  
  The swan's existence makes the "Rare" mode possible in the broader logic.

### 3.3 Reasoning: Contextual Integrity

Modal logic prevents "Flat Logic" errors (e.g., confusing a **User Goal** with a **Safety Requirement**) by using modes to explicitly define evaluation context. The model can now distinguish simulation truths from ground reality.

---

## 4. Additional Logic C: Interpretive

This logic governs **how an expression is read under a named lens**—a specification, language, or model the agent treats as interpretable. It introduces:

- **`<@`** — **Definition / specification** (head-side commitment: “this lens is specified thus”).
- **`@>`** — **Interpretation** (tail-side reading: “this subexpression under that lens”).

Interpretive operators are **orthogonal** to existential (`<%`, `%>`) and modal (`~>`, `<~`): they do not assert that the inner program is **true** in the knowledge base, only that a **well-formed reading** under the lens holds when the surrounding constraints say so.

### 4.1 Syntax and roles

Use **fixed unary forms** so roles stay unambiguous (avoid ad-hoc `lens(expr) <@` tails that blur definition vs use):

- **Specification on the assertion side** — bind or introduce what a **lens name** means, using **`<@`** in head-compatible positions (for example materializing a lens body from a source term or relation).
- **Interpretation on the invariant / goal side** — read an **RPL expression** under a lens using **`expr @> LENS`**, where **`LENS`** is a **label** (see §4.2).

**Precedence:** among the additional logics, **`@>` binds tightest** by default: only **RPL subexpressions** are in the scope of the lens unless **parentheses** widen the operand (for example `(A & B) @> rpl` vs `A & (B @> rpl)`).

### 4.2 Lens labels (agent-first)

Lens names such as `rpl`, `sql`, or `foaf` are **assumed interpretable** from this specification plus ordinary agent background. Authors **pin** a label (give an explicit **`<@`** specification) only when they need a **non-default** reading of a common name or a **custom** lens not shared by default.

### 4.3 Witness programs (`?i`)

For cross-lens alignment, an lvar may hold an **ordered list of RPL statements** `[ … ]`—**any valid RPL program** of any size—serving as a canonical interchange witness. Write **`?i`** when the same witness program is shared across lenses (for example two surfaces agreeing on the same underlying program).

### 4.4 Examples

- **Reflexive RPL reading (expression-level identity):**  
  `A @> rpl(~ A)` — the RPL reading of `A` is `A` itself (under the default `rpl` lens), expressed without forcing extra KB truth beyond the interpretive claim.

- **Cross-lens agreement with a shared witness:**  
  `equivalent(?rpl, ?sql) <- #?rpl @> rpl(?i), #?sql @> sql(?i)` — two labeled surfaces refer to the **same** RPL program witness `?i`.

Interpretive claims compose with existential and modal operators; see **§5** and **§6**.

---

## 5. Composition and Dual Meaning

These logics can be used separately or combined—yielding a "physics of information." The "Fact vs. Proof" duality is made explicit.

### 5.1 Composing the Impulse and the Mode

- **Filtered Impulse**:  
  `(A ~> B) <% true`  
  *Analogy*: Impulse to see a black swan under "Scientific Discovery" mode—triggers only if fact matches modal proof.

- **Modal Log**:  
  `true <% (A ~> B)`  
  *Analogy*: Grounds the fact that the black swan exists within a region—proof is now permanent.

### 5.2 The Meaning of the Dual

- **Forward Projection** (`A ~> B`):  
  "Given A, the mode of B must be satisfied." (fact requirement)

- **Backward Mapping** (`A <~ B`):  
  "The presence of mode B justifies A." (provenance for proof)

With existential anchors, precise assertions arise:

- `true %> (BlackSwan ~> :Protected)` — Any found swan must be viewed as protected.
- `(BlackSwan <~ :Mutation) <% true` — Immediate impulse: black swan is identified since the "Mutation" mode is seen.

### 5.3 Interpretive with existential and modal

- **Interpretive invariant under a mode:**  
  `(expr @> rpl(?i)) ~> (expr2 @> rpl(?i)) ~> true` — shared `?i` ties the same witness program across nested modal goals; hosts may treat `~> true` as an elidable default tail where the spec allows.

- **Pending an interpretive reading:**  
  `(A @> sql) %> true` — liveness until the SQL-lens reading of `A` is satisfiable alongside existential quiescence.

- **Impulse with a lens:**  
  `(fact @> foaf) <% true` — transient commitment to a FOAF-shaped reading of `fact`, without forcing the inner graph to be asserted as base RPL truth.

---

## 6. Composition of Core with Additional Logics

The true power of (L)RPL emerges by synthesizing:

- **Core Form**
- **Existential Logic**
- **Modal Logic**
- **Interpretive Logic**

This enables "reasoning machinery" that manages truth, temporal presence, modes, and **cross-lens** readings.

### 6.1 The Teleological Modal Impulse

**Form:**  
`(A ~> B) <% true -> C`

Combine existential impulse, modal projection, and base relation.

*Analogy*: Impulse to see black swan under "Discovery" mode `(BlackSwan ~> :Discovery <% true)`. If so, triggers `-> :UpdateLog`.

*Meaning*: The log is updated only for transient sightings matching an interpretative lens; the sighting fades, but the consequence remains.

### 6.2 The Invariant Proof of Possibility

**Form:**  
`true %> (A <~ B) <- C`

Anchors modal possibility as structural invariant.

*Analogy*: Law (`true %>`) that mode "Biological Diversity" is possible because black swan exists (`:Diversity <~ BlackSwan`). Maintained by `<- :EnvironmentScan`.

*Meaning*: System is invalid if the environment scan can’t justify diversity through presence of the swan. Proof is tied to fact existence.

### 6.3 The Eventually Nested Necessity

**Form:**  
`(A ~> B) %> true`

Uses liveness promise to wait for a modal necessity.

*Analogy*: The system is "pending" (`%> true`) until it can necessarily project a swan into the "Secure" mode (`BlackSwan ~> :Secure`).

*Meaning*: Not satisfied by any swan; must prove it holds within the modal constraint for quiescence.

---

## 7. Summary

By treating existential, modal, and interpretive constructs as **additional logics**, we preserve the performance of the core language while equipping developers to build sophisticated, clean, context-aware agents—including **cross-surface** programs shared via interpretive witnesses. This modular approach ensures logic stability even as the agent's world-view becomes more complex.

---

## 8. Related Documents

- [../README.md](../README.md) — RPL entry point and worked example.
- [rpl.md](rpl.md) — Base normative specification (syntax, semantics, runtime).
- [lrpl.md](lrpl.md) — Lazy extension delta.
- [../theory.md](../theory.md) — Bloom/CALM grounding and formal-vs-agent layer.
- [../vision.md](../vision.md) — Central ideas and design principles.