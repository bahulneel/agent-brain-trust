# Relational Prompt Language (RPL) - Formal Specification

## 1. Overview

RPL (Relational Prompt Language) is a Markdown-embedded language for defining
multi-step LLM-driven protocols as Datalog-style relations. Each step in a
protocol is a named relation with arguments. Relations compose via implication
rules into a dependency graph. Goals drive execution by specifying what must be
solved for. Tools provide access to external capabilities. Bound values flow
forward from prior steps or session context; unbound values arrive via async
vars or interactive collection. An eight-phase operating model provides the
execution rhythm; where the language does not specify evaluation behaviour,
the agent uses its best judgment.

Three namespaces partition the language:

```
rel(?a, ?b)      -- relation: a fact to be established or queried
%goal(?a)        -- goal: something to solve for
$tool(?a, ?b)    -- tool: an external capability
```

Semantics build in order below; the **Appendix** collects the full formal grammar
for reference.

---

## 2. Literals

The basic data types are **literals**. All EDN literal types are valid everywhere
a literal appears: **symbols**, **keywords**, **strings**, **numbers**,
**booleans** (`true` / `false`), and **nil**. Data structures follow EDN reading
rules.

**String templates** — `{?x}` inside a double-quoted string constructs the string
(if `?x` is bound) or participates in matching (if `?x` is unbound). String
templates are for full construction and matching; **regex** patterns (below)
are for partial matching with named captures.

**Regex** — written `/.../`; the regex body is delimited by slashes.

---

## 3. Variables

An **lvar** (logical variable) is `?` followed by a **name**:

```
NAME = [a-z] [ a-z0-9\- ]*
LVAR = '?' NAME | '_'
```

The anonymous variable `_` matches any value and binds nothing.

Lvars are introduced before **async vars** (`$x`, §13) and **in-place patterns**
(`~ PATTERN`, §6).

---

## 4. Collections

Collections are **lists**, **sets**, and **maps**. A **collection** is either a
list, set, or map. An **element** of a collection is a **variable** (§3), a
**literal** (§2), or a nested collection. A **relation application**
(`name(?...)`) is **not** a collection element — data and relation calls are
separate shapes. Gathering multiple tuples from a relation into a collection
uses a **rule head** with destructuring (defined once lists, sets, maps, and
implication are all introduced below).

**List** — `[` … `]` with a **list expression**: elements; `.` separates a
first element from the rest; `& VAR` captures remaining entries (full
destructuring in §8).

**Set** — `#` `{` … `}` with a **set expression**: same structure as list
expressions (see §8). **Set instance semantics** (when a set is matched against
another value) are in §7.

**Map** — `{` … `}` with comma-separated **entries**; each entry is two
**elements** (key and value). `.` and `&` for destructuring are in §8.

Without `.` or `&`, collections act as **pattern forms** (used with `~` in §6
and with equality in §5):

```
[?f ?s]              -- tuple: exactly these elements, fixed size
#{?f ?s}             -- instances: see §7
{?k ?v}              -- properties: this key maps to this value
```

`...` denotes elision in examples and is not part of the language syntax.

---

## 5. Operators

### 5.1 Comparison and Arithmetic

```
?x = ?y          equality
?x != ?y         not equal
?x < ?y          less than
?x > ?y          greater than
?x <= ?y         less than or equal
?x >= ?y         greater than or equal
?x + ?y          addition
?x - ?y          subtraction
?x * ?y          multiplication
?x / ?y          division
```

Structural **matching** against patterns uses the `~ PATTERN` variable form (§6),
not bare `=`.

### 5.2 Cardinality

```
|rel(?x, ?y)|       number of distinct tuples satisfying the named relation
|?list|             length of a list-valued arg
```

### 5.3 Set Operators

```
?a union ?b              all elements in ?a or ?b
?a intersect ?b          elements in both
?a difference ?b         elements in ?a not in ?b
?x in ?collection        membership test
?x not in ?collection    non-membership test
```

### 5.4 Temporal Operators

Time values are opaque unless a temporal operator is applied. Durations are
quoted strings: `"48h"`, `"30min"`, `"7d"`. `now` is a built-in reference.

```
?t before ?ref
?t after ?ref
?t within ?n of ?ref
?t between ?a and ?b
```

### 5.5 Logical Operators

```
A , B            conjunction
A | B            disjunction
not A            negation
(A)              grouping
```

### 5.6 Operator Precedence

From highest to lowest:

```
1.  Arithmetic       * /
2.  Arithmetic       + -
3.  Comparison       = != < > <= >=
4.  Cardinality      |expr|
5.  Temporal         before after within between
6.  Logical          not
7.  Logical          , (conjunction)
8.  Logical          | (disjunction)
```

Use parentheses to override.

---

## 6. In-place Matching

`~ PATTERN` is a **VAR** form: it stands for a variable wherever a variable is
allowed and performs **structural matching** at that position. `PATTERN` may be a
map, list, set, string, or regex (§4, §2).

Matching is written with equality to an lvar or by placing `~ PATTERN` in an
argument position:

```
?x = ~ "foo {?bar}"         -- string pattern; ?bar binds suffix
?x = ~ {:key ?val}          -- map pattern; ?val binds value
?x = ~ /(?P<a>\w+)/         -- regex; named capture ?a binds
rel(~ "foo {?bar}")         -- in-place match in arg position
```

For regex patterns, named captures bind directly to lvars. Unnamed groups are
discards.

**Metadata** — `clause ^ ~ {:doc ?x}` uses the same `~ PATTERN` mechanism on the
preceding form’s metadata (§11).

**Sets** — unification involving a set and a non-set pattern distributes into
**instances**; unifying with a set pattern treats the set as one value (§7).

---

## 7. Set Instance Semantics

The behaviour of a **set** depends on the **pattern** it is unified against:

- If the pattern is a set (`#{...}`), the set unifies as a **single value**.
- If the pattern is **not** a set (e.g. `?x`), each element of the set is an
  **independent instance** — the pattern matches each element separately.

```
#{1 2 3} = ~ ?x             -- instances: ?x = 1, ?x = 2, ?x = 3
#{1 2 3} = ~ #{& ?vals}     -- collection: ?vals binds the whole set
```

This applies for both **assertion** and **matching**. A ground set asserts
multiple instances; a set of patterns matches multiple instances.

For **sets of sets**, behaviour is **recursive**. Each inner set is an instance;
matching that instance against a non-set pattern distributes again:

```
#{#{1 2} #{3 4}} = ~ ?x     -- ?x = #{1 2}, ?x = #{3 4}  (two instances)
?x = ~ ?y                   -- ?y = 1, ?y = 2  (from #{1 2})
                             -- ?y = 3, ?y = 4  (from #{3 4})
```

**Maps and lists** are **structural** — they unify as a single value regardless
of the outer pattern shape:

```
{:key ?val}                  -- single value: key maps to value
[?a ?b]                      -- single value: positional tuple
```

So `{:bindings {s "critical"}}` applies directly for metadata and traces — a map
is one value; a set wrapper is only needed to assert several values each matching
the same pattern.

---

## 8. Collection Destructuring

`.` separates a single entry (**cons**); `&` captures all remaining entries
(**rest**). Both operators are **uniform** across lists, sets, and maps:

```
[?f . ?s & ?r]           -- list: first, second, rest
#{?f . ?s & ?r}          -- set: one element, another, rest
{?k ?v & ?r}             -- map: first key-value pair, rest
```

Without `.` or `&`, pattern forms are as in §4:

```
[?a ?b ?c]               -- tuple: exactly three elements
#{?a ?b}                 -- instances (§7)
{:name ?n, :age ?a}      -- properties
```

**Aggregation** of a relation’s extension into a collection happens in the
**head** of a rule, not inline in the tail:

```
severity-options([& ?v]) <= valid-severity(?v)
active-ids(#{& ?id}) <= user(?id, ?status), ?status = "active"
```

---

## 9. Relations

A **relation** names a fact with arguments:

```
RELATION = LABEL '(' [ ARG [ ',' ARG ]* ]? ')'
LABEL    = NAME | NS '#' NAME
```

**Naming** — relation names are declarative; they name facts, not actions:

```
name(?first, ?last)          -- correct
severity(?s)                 -- correct
collect-name(?first, ?last)  -- incorrect: imperative
```

All names use **kebab-case**. **Keywords** use `:` (e.g. `:tel` in arguments).

**Namespaces** — names may be scoped with `#` (full convention in §17.7).

---

## 10. Rules and Implication

Rules combine **heads** and **tails** with `<=`. A **sentence** may be:

- an expression (tail only),
- `HEAD <= EXPR` (implication),
- optionally followed by `;` **abductives** (§16) and/or `=>` **constraints** (§12).

```
RULE       = [ HEAD '<=' ]? EXPR [ ';' ABDUCTIVE ]? [ '=>' CONSTRAINT ]?
NESTED-RULE = HEAD '<=' '(' RULE ')'
EXPR       = TAIL | HEAD '<=' EXPR | '(' EXPR ')' [ '^' VAR ]?
HEAD       = GOAL | RELATION | TOOL
TAIL       = CLAUSE | CLAUSE ',' TAIL | '(' TAIL ')' [ '^' VAR ]?
```

**Conjunction** is `,`; **disjunction** is `|`; parentheses group. A **clause**
is an atom optionally annotated with `^` / `^^` (§11).

**Double implication** — `HEAD <= HEAD <= TAIL` is allowed (e.g. HTN-style
methods with abductives in §16.6).

**Grouping and metadata** — `( EXPR ) ^ VAR` attaches metadata access to the
grouped expression (§11).

**Namespaces in heads** — `HEAD` may be a **relation** (§9), **goal** (%…, §15), or
**tool** call (`$…`, §14). Async vars `$x` without parentheses are not tool heads
(§13).

---

## 11. Metadata

`^` accesses the **metadata** of the immediately preceding form. Metadata is an
associative collection keyed by literals (typically keywords or symbols). `^`
takes a single **VAR** (§3, §6):

```
clause ^ ?meta              -- bind entire metadata map to ?meta
clause ^ ~ {:doc ?x}        -- match metadata against map pattern, bind :doc to ?x
clause ^ ~ {:key ?v, ...}   -- destructure multiple fields
```

The full EDN literal set is valid as map keys in a `~ PATTERN`:

```
clause ^ ~ {:status ?s}     -- keyword key
clause ^ ~ {foo ?v}         -- symbol key
clause ^ ~ {"key" ?v}       -- string key
```

**Distribution** — `^` on a grouped tail distributes only to clauses whose vars
appear in the pattern:

```
(?a, ?b) ^ ~ {foo ?a}               =>  ?a ^ ~ {foo ?a}, ?b
(?a, ?b, ?c) ^ ~ {foo ?a, bar ?c}   =>  (?a, ?c) ^ ~ {foo ?a, bar ?c}, ?b
```

**`^^` binding access** — shorthand for `:bindings` in metadata. Binding keys
are **symbols** (lvar names without `?`), not keywords:

```
clause ^^ ~ {a ?b, c ?d}
-- desugars to:
clause ^ ~ {:bindings {a ?b, c ?d}}
```

Ground form (in traces, §12):

```
clause ^^ {a "val1", c "val2"}
-- desugars to:
clause ^ {:bindings {a "val1", c "val2"}}
```

`^^` follows the same rules as `^` — one `VAR` (lvar or `~ PATTERN`).

**Provenance** — typical metadata keys:

```
:file      "triage.md"
:heading   "Section 2.1"
:relation  severity(?s)
:user      "alice"
:doc       "user selected severity during triage"
```

The agent may mint additional keys as needed.

**Context-sensitive defaults**:

```
relation ^ ~ {doc ?x}      -- :doc is the primary key
$tool ^ ~ {result ?x}      -- :result is the primary key
%goal ^ true | false        -- truth value, not a map
```

---

## 12. Constraints and Tracing

### 12.1 Constraint Syntax

`=>` expresses an **invariant**. Moving a relation from right to left is valid by
logical rewriting:

```
triage(?p, ?s), severity(?s) => valid-severity(?s)
triage(?p, ?s), severity(?s), valid-severity(?s) => true
triage(?p, ?s), severity(?s), valid-severity(?s)
```

Exclusion invariant:

```
rel1(?x, ?y), rel2(?y) => false
```

Conditional invariant via metadata matching:

```
triage(?p, ?s, ?notes) ^ ~ {:s "critical"} => valid-severity(?s), ?notes != ""
```

### 12.2 Constraint Grounding

A constraint has a dual interpretation depending on whether it is fully
grounded:

```
Ungrounded (free variables)    live check — evaluated during quiescence
                               until fully grounded or the program stops
Fully grounded (no free vars)  trace / memory — holds from the point of
                               introduction onward
```

An ungrounded constraint is an ongoing obligation. Each time quiescence produces
new bindings that touch the constraint’s variables, the constraint is
re-evaluated. When every variable is bound, the constraint becomes a **trace**. A
constraint that never grounds remains a live check for the lifetime of the
program.

### 12.3 Trace Format

Traces are fully grounded constraints. Each trace carries the binding context in
scope at grounding, using **`^^`** (§11):

```
severity(?s) ^^ {s "critical", p "patient-0"} => true
%critical ^^ {p "patient-0", tel "+44 7700 900000"} => true
%low ^ false
```

Ordering in the trace log is **significant** — each trace holds from introduction
onward; later traces build on earlier ones.

### 12.4 Trace Retraction

Retract by asserting the same constraint with `=> false`:

```
severity(?s) ^^ {s "critical", p "patient-0"} => false
```

Retraction is recorded in the trace log.

### 12.5 Traces as Relations

Traces are queryable as ordinary relations. A future protocol can reason over
prior traces without separate persistence machinery.

---

## 13. Async Variables

An **async var** `$x` resolves **asynchronously** — from user input, a tool
result, or an external event. Unlike an lvar `?x`, which is resolved within the
current deductive step, `$x` **suspends** until a value is supplied.

```
$x           -- async var: value arrives asynchronously
$tool(...)   -- async tool call: result arrives asynchronously
```

**`$name`** without parentheses is a bare avar. **`$name(...)`** invokes a **tool**
(§14). Both share `$` and the same lifecycle; `(...)` disambiguates.

Prose emphasis `__word__` desugars to `$word` when the agent decides the value
must be collected externally (§17.2).

### 13.1 Avar Lifecycle

An avar is a **temporal connective** — it bridges **timesteps** in the operating
model (§18). States:

```
created     avar appears unbound during quiescence or plan progression
dispatched  the agent fires the corresponding async operation (step 8)
pending     between timesteps, awaiting external resolution
resolved    value arrives and is asserted into the store (step 1)
novel       delta computed; the resolved value triggers a new cycle (step 2)
consumed    participates in quiescence and planning (steps 3–7)
```

### 13.2 Temporal Semantics

Within a timestep, **lvars** unify deductively to fixpoint. **Avars** mark where
derivation needs external input:

```
?x      deductive: within the current timestep
$x      async: resolved at a future timestep
```

When several avars dispatch, **abductives** (§16) can sequence them; otherwise the
agent orders dispatch by capability and context.

### 13.3 Resolution as Grounded Constraint

When an avar resolves, **async novelty** (phase 1 of §18) is a **fully grounded**
constraint — a **trace** (§12.2). Example with `^^` (§11):

```
$query-db("select * from patients") ^ ~ {:result "[{id: 1}]"} ^^ {query "select * from patients"} => true
```

Bare avar:

```
$answer ^ ~ {:result "I'm fine, thanks"} => true
```

Values are ground; no free variables. Traces are the **message log** for async
history; retract with `=> false` (§12.4).

**Relational abstraction** — match tool results with **lvars** in metadata, not
`$` in the result position:

```
ask(?prompt, ?answer) <= $ask(?prompt) ^ ~ {:result ?answer}
%greet <= ask("How are you?", ?answer)
```

The tool is implementation detail; the relation is the interface.

---

## 14. Tools

Tools are **external capabilities**. They use the same implication and heading
patterns as relations and goals (§17).

### 14.1 Tool Call Syntax

A tool call is an **avar** (§13). Dispatch is phase 8; the result arrives as a
grounded constraint in a later phase 1 (§13.3).

```
$tool(?args)                               -- result discarded
$tool(?args) ^ ~ {:result ?r}             -- result bound to ?r (lvar)
$tool(?args) ^ ~ {:status ?s, :body ?b}   -- destructure via metadata
```

`^` follows §11. Results bind to **lvars**; the **avar** is the call itself.

### 14.2 Built-in Tools

**`$ask`** — open-ended user input:

```
$ask(?prompt) ^ ~ {:result ?answer}
```

**`$choose`** — closed choice from a list of options:

```
$choose(?desc, ?options) ^ ~ {:result ?choice}
```

Wrap in relations for goals:

```
ask(?prompt, ?answer) <= $ask(?prompt) ^ ~ {:result ?answer}
choose(?desc, ?options, ?choice) <= $choose(?desc, ?options) ^ ~ {:result ?choice}
```

**Aggregation** of options into a list is in the **head** of a separate relation
(§8), not inline:

```
severity-options([& ?v]) <= valid-severity(?v)
severity(?s) <= severity-options(?options), choose("Select severity", ?options, ?s)
```

### 14.3 Tool Headings

```markdown
# Database Query - $query-db(?query)

Use the read-only replica. Warn the user if the result exceeds 100 rows.
```

---

## 15. Goals

A **goal** is a rule whose head is in the **`%`** namespace. Goals drive execution.

### 15.1 Goal Syntax

```
% <= tail                     -- root goal, anonymous
%name <= tail                 -- named goal
%name(?a, ?b) <= tail         -- named goal with capture args
```

Capture args desugar to metadata on the tail:

```
%name(?a, ?b) <= tail
-- desugars to:
%name <= (tail) ^ ~ {?a ?a, ?b ?b}
```

### 15.2 Root Goal

The unnamed **`%`** is the root goal — first candidate when present. Multiple `%`
rules **disjoin**:

```
% <= %low | %warning | %critical
```

### 15.3 Named Goals and Agent Choice

If there is no root `%`, the agent chooses among named goals — context, user, or
ease of satisfaction.

### 15.4 Mutual Exclusion

Exclusive strategies may use **constraints** (§12):

```
% <= %low => !%
% <= %warning => !%
% <= %critical => !%
```

Alternatively **`@when`** on the activation clause (§16.1).

### 15.5 Goal Truth and Negation

```
%goal ^ true     -- trace: goal satisfied
%goal ^ false    -- trace: goal not satisfied
!%goal           -- sugar for %goal ^ false
```

### 15.6 Stopping Condition

When a goal is satisfied, the agent offers to continue; the **user** decides
termination (§18.5).

### 15.7 Goal Headings

```markdown
# Critical Triage - %critical(?p, ?tel) <= triage(?p, ?s), ?s = "critical", name(?p, ?n), contact-info(?p, :tel, ?tel)

Present as a call sheet ordered by arrival time.
On completion suggest trying %warning for remaining patients.
```

---

## 16. Activation Clause — Abductives

The activation clause **`;`** runs **before** the body. If it holds, bindings
flow into the body. If not, the rule is **ineligible** — not blocked, not waiting.

```
rule:
  name: ...
  kind: rel | goal | tool
  args: [?a, ...]
  when: ...     -- the ; clause
  body: ...    -- the expr
```

### 16.1 @when

```
; @when(tail)
```

Activated when `tail` holds; bindings flow into the body.

**Mutual exclusion** — e.g.:

```
% <= %low ; @when(!%)
% <= %warning ; @when(!%)
% <= %critical ; @when(!%)
```

### 16.2 @choose

```
; @choose(binding, tail)
```

Activated; **one** binding satisfying `tail` is selected.

### 16.3 @distinct

```
; @distinct(binding, tail)
```

`binding` values must be **distinct** across unification groups.

### 16.4 @each

```
; @each(binding)
```

Force iteration over **all** bindings.

### 16.5 @for

```
; @for(binding, tail, step)
```

Iterate via a step relation (init / condition / step analogy).

### 16.6 HTN-style Methods

Combine double implication, `@when`, and several rules on the same goal head:

```
%task(?a) <= method-one(?a) <= tail-one(?a) ; @when(!%task, precondition-one(?a))
%task(?a) <= method-two(?a) <= tail-two(?a) ; @when(!%task, precondition-two(?a))
```

Planning algorithm is **not** prescribed (§18.3).

---

## 17. Source Format

RPL is written in **Markdown**. Every heading that carries a **signature** in one
of the three namespaces is an RPL definition. Plain headings without a
signature are ignored.

### 17.1 Heading Forms

**Head-only:**

```
# Human Title - rel(?arg1, ?arg2)
# Human Title - %goal(?arg1)
# Human Title - $tool(?arg1)
```

**Partial tail:**

```
# Human Title - rel(?arg1) <= body-rel(?arg1), ...
# Human Title - %goal(?arg1) <= rel(?arg1), ...
```

The heading starts the rule; the body **conjoins**:

```
head <= <heading-tail>, <body-tail>
```

### 17.2 Body Prose

Prose is documentation and LLM instruction unless it contains:

```
__word__
__multi word__
```

Each term marks a variable, normalized to **kebab-case** (`__first name__` →
`?first-name`). The agent uses full context to decide how to unify or collect.
`rpl.check` may reject uninterpretable sections.

In a **goal** heading, emphasis is **advisory** (presentation / heuristics).

### 17.3 Fenced RPL Blocks

A fenced block tagged `rpl` conjoins expressions onto the rule tail in document
order. Scoped to the **current heading** and **child** headings — not siblings or
parents.

### 17.4 Full Rule Tail Order

```
<heading tail> , <prose unification terms> , <fenced block expressions>
```

### 17.5 Scope and `--`

Heading **level** sets scope. `--` returns to the **parent** scope mid-document.

```markdown
# Scope 1

## Scope 1.1

## Scope 1.2

--

Content here is at scope 1.

## Scope 1.3
```

### 17.6 Naming Conventions

As in §9: declarative relation names, kebab-case, `?` for variables, `:` for
keywords, `_` anonymous.

### 17.7 Namespaces

```
file.md#rel          -- relation from another file
%file.md#goal        -- goal from another file
$tool#action         -- tool subcommand
$sql-select#table    -- tool with named query target
```

---

## 18. Runtime — Operating Model

Each **timestep** runs eight **phases**. Where behaviour is unspecified, the agent
judges (§20).

```
Timestep:
  1. Assert new avars
  2. Assert input novelty
  3. Quiesce relations
  4. Activate goals
  5. Update plans
  6. Progress plan, asserting novelty
  7. Quiesce relations
  8. Dispatch asyncs
```

### 18.1 Two Layers

```
Formal layer     rules, constraints, abductives, quiescence, dispatch
Agent layer      interpretation, ambiguity, non-monotonic change, planning,
                 error recovery
```

### 18.2 Binding Store

The store maps **lvars** to **values** or **`#{values}`**. Singleton and set are
equivalent where applicable. The store accumulates for the run.

### 18.3 Timestep Phases

**1. Assert new avars** — Resolved async values (tools, `$ask` / `$choose`, events)
enter as ground facts.

**2. Assert input novelty** — **Data novelty** (new facts) and **schema novelty**
(user-added or modified RPL). Non-monotonic changes are at agent discretion.

**3. Quiesce relations** — Derive to fixpoint. **Ungrounded constraints** (§12.2)
are checked.

**4. Activate goals** — Evaluate **`;`** clauses (§16). Root **`%`** first if
present (§15.2).

**5. Update plans** — Agent-chosen; goals imply planning. HTN-style expressions
(§16.6) are **not** a fixed algorithm.

**6. Progress plan** — New facts become novelty for the next quiescence.

**7. Quiesce relations** — Again; constraints may become **traces** (§12.2).

**8. Dispatch asyncs** — Unresolved **avars**; **abductives** may sequence (§16).

### 18.4 Goal Resolution

1. Root `%` if present.
2. Else choose named goals.
3. Evaluate **`;`** per candidate.
4. Eligible rules: **syntactic order**.
5. Unbound args → async (`$ask`, `$choose`, `$x`).
6. Satisfied goal → offer continue.
7. User chooses next action or stop.

### 18.5 Convergence

Agent stops derivation within a timestep when unproductive; **user** drives
cross-timestep termination (§15.6).

### 18.6 Failure Modes

```
No rule is eligible              Agent surfaces error; asks user
Circular dependency              Agent warns; user may override
Activation clause never holds    Rule ineligible for this run
Constraint violated              Agent surfaces; user decides
User declines arg                Unbound; agent checks continuable
```

---

## 19. Example — Medical Triage

```markdown
% <= %critical(?p, _) | %warning(?p, _) | %low(?p)

# Critical Triage - %critical(?p, ?tel) <= triage(?p, $s), $s = "critical", name(?p, ?n), contact-info(?p, :tel, ?tel), patient(?p)

Present as a call sheet ordered by arrival time.
On completion suggest trying %warning for remaining patients.

# Warning Triage - %warning(?p, ?tel) <= triage(?p, $s), $s = "warning", name(?p, ?n), contact-info(?p, :tel, ?tel)

Present as a follow-up list.

# Low Triage - %low(?p) <= triage(?p, $s), $s = "low", patient(?p)

Log only, no immediate action required.

# Triage - triage(?p, ?s) <= history(?p, ?symptoms), severity(?s)

## History - history(?patient-id, $symptoms)

Confirm the patient's __patient-id__ and record their __symptoms__.

## Severity - severity($s)

Ask the user to choose a __s__ from __valid-severity__.
```

```rpl
valid-severity("critical")
valid-severity("warning")
valid-severity("low")
```

Key structural points:

- **`patient(?p)` provides `?p`** — the patient must come from somewhere;
  `history` confirms a known patient.

- **Nesting** — `history` and `severity` under `# Triage` share scope so
  `severity($s)` links to the triage context for `?p`.

- **Avars in heads** — `severity($s)`, `history(?patient-id, $symptoms)` signal
  async collection; goal bodies use `triage(?p, $s)`.

- **`$s = "critical"`** — post-condition after `$s` resolves.

Trace sketch:

```
(triage(?p, ?s) <=
  (history(?patient-id, $symptoms) <= ...) ^^ {patient-id "patient-0", symptoms "chest pain"},
  (severity($s) <= ...) ^^ {s "critical"}
) ^^ {p "patient-0", s "critical"} => true
%critical ^^ {p "patient-0", tel "+44 7700 900000"} => true

(triage(?p, ?s) <=
  (history(?patient-id, $symptoms) <= ...) ^^ {patient-id "patient-1", symptoms "headache"},
  (severity($s) <= ...) ^^ {s "low"}
) ^^ {p "patient-1", s "low"} => true
%low ^ false
```

---

## 20. Design Principles

- **Declarative naming** — relations name facts, not actions.
- **Three namespaces** — relations, goals, tools are syntactically distinct but
  uniform under the rule grammar (§10).
- **Uniform interpretation** — the same form means the same thing in the same
  context.
- **`VAR` subsumes matching** — `?lvar`, `$avar`, and `~ PATTERN` are **VAR**
  forms; **`=` is equality**; **in-place matching** is via **`~ PATTERN`** (§6).
- **`^` is single metadata access** — bind the whole map or match in place (§11).
- **Async as temporal connective** — `$x` bridges timesteps (§13, §18).
- **Activation not blocking** — `;` activates or disqualifies; no busy-wait (§16).
- **Undirected composition** — definitions do not encode callers.
- **Safety by default** — head variables in body; provenance metadata for gaps.
- **First valid resolution** — syntactic order among eligible rules.
- **User-driven termination** — agent offers continue; user stops (§15.6).
- **Constraints ground to traces** — live check vs trace; order; retraction
  (§12).
- **Agent judgment is default** — rigour where specified; judgment elsewhere.
- **Conversational co-authorship** — user may extend schema and facts live.
- **Timestep discipline** — eight phases (§18).

---

## Appendix. Formal Grammar

Complete syntax (semantics in preceding sections).

```
SENTENCE        = RULE | EXPR | NESTED-RULE

RULE            = [ HEAD '<=' ]? EXPR [ ';' ABDUCTIVE ]? [ '=>' CONSTRAINT ]?
NESTED-RULE     = HEAD '<=' '(' RULE ')'
EXPR            = TAIL
                | HEAD '<=' EXPR
                | '(' EXPR ')' [ '^' VAR ]?

ABDUCTIVE       = WHEN-ACT
                | CHOOSE-ACT
                | DISTINCT-ACT
                | EACH-ACT
                | FOR-ACT
                | ABDUCTIVE ',' ABDUCTIVE

WHEN-ACT        = '@when' '(' TAIL ')'
CHOOSE-ACT      = '@choose' '(' BINDING ',' TAIL ')'
DISTINCT-ACT    = '@distinct' '(' BINDING ',' TAIL ')'
EACH-ACT        = '@each' '(' BINDING ')'
FOR-ACT         = '@for' '(' BINDING ',' TAIL ',' STEP ')'

CONSTRAINT      = TAIL
HEAD            = GOAL | RELATION | TOOL
TAIL            = CLAUSE
                | CLAUSE ',' TAIL
                | '(' TAIL ')' [ '^' VAR ]?
CLAUSE          = ATOM [ '^' VAR ]? [ '^^' VAR ]?
ATOM            = RELATION | GOAL | TOOL | VAR | LITERAL | '(' EXPR ')'
BINDING         = CLAUSE | CLAUSE ',' BINDING
STEP            = CLAUSE | CLAUSE ',' STEP

VAR             = LVAR | ASYNC-VAR | '~' PATTERN
PATTERN         = MAP | LIST | SET | STRING | REGEX

ELEMENT         = VAR | LITERAL | COLLECTION
COLLECTION      = LIST | SET | MAP

LIST            = '[' LIST-EXPR ']'
LIST-EXPR       = ELEMENT [ ELEMENT ]*
                | ELEMENT '.' LIST-EXPR
                | ELEMENT '&' VAR

SET             = '#' '{' SET-EXPR '}'
SET-EXPR        = ELEMENT [ ELEMENT ]*
                | ELEMENT '.' SET-EXPR
                | ELEMENT '&' VAR

MAP             = '{' MAP-EXPR '}'
MAP-EXPR        = MAP-ENTRY [ ',' MAP-ENTRY ]*
                | MAP-ENTRY '.' MAP-EXPR
                | MAP-ENTRY '&' VAR
MAP-ENTRY       = ELEMENT ELEMENT

LITERAL         = STRING | NUMBER | KEYWORD | BOOLEAN | NIL | SYMBOL
BOOLEAN         = 'true' | 'false'
NIL             = 'nil'
SYMBOL          = NAME
STRING          = '"' STRING-PART* '"'
STRING-PART     = TEXT | '{' LVAR '}'
TEXT            = [^"{]+
NUMBER          = [0-9]+ [ '.' [0-9]+ ]?
KEYWORD         = ':' NAME

REGEX           = '/' REGEX-BODY '/'
REGEX-BODY      = [^/]+

LVAR            = '?' NAME | '_'
ASYNC-VAR       = '$' NAME
NAME            = [a-z] [ a-z0-9\- ]*

LABEL           = NAME | NS '#' NAME
NS              = NAME | NAME '#' NS

RELATION        = LABEL '(' [ ARG [ ',' ARG ]* ]? ')'
GOAL            = '%' LABEL? [ '(' [ ARG [ ',' ARG ]* ]? ')' ]?
TOOL            = '$' LABEL '(' [ ARG [ ',' ARG ]* ]? ')'

ARG             = VAR | LITERAL | COLLECTION | '_'
```

**Namespaces** — `$name` without `(` `)` is an async var; `$name(` … `)` is a tool
call. Relation and goal heads use §9 and §15 respectively.
