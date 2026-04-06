# Relational Prompt Language (RPL) - Formal Specification

## 1. Overview

RPL (Relational Prompt Language) is a Markdown-embedded language for defining
multi-step **LLM-driven protocols** as Datalog-style relations. The **primary**
use case is **prompts and conversational protocols**—documents the agent and
author steer together. **Living documents** are also in scope: Markdown that
grows, versioned or edited over time, with the same relational reading.

RPL is an **enabling** language: it **permits** formal rules, constraints, and
tool boundaries where you want them; it does **not** **prescribe** a single
planner, workflow engine, or decomposition strategy. Features described in this
spec are **available**, not mandatory—omit what you do not need.

Each step in a protocol can be read as a named relation with arguments.
Relations compose via implication into a dependency graph. Goals mark what
may be solved for. Tools reach external capabilities. Bound values flow forward
from prior steps or session context; unbound values may arrive via async vars or
interactive collection. An eight-phase operating model suggests a **rhythm** for
implementations; where the language does not pin behaviour, the agent uses its
best judgment.

**How to read RPL** — Read the surface syntax **declaratively**. A fragment states
**what holds**, **what follows from what**, or **what must remain true**, as
relations and constraints over bindings — not a script of steps for an engine to
execute. Heads (`rel`, `%`, `$`), connectives (`,`, `|`, `<-`, `->`), variables and
patterns, literals and collections, metadata (`^`), tools, goals, and abductives
each have a **meaning** (a claim or constraint shape) fixed in the sections
below; **lvars** in particular are §3. **How** an implementation or agent
**searches**, **schedules**, or **materialises** witnesses is not defined here
except where explicitly noted as suggestive (e.g. the timestep rhythm in §18).

**Prose-first authoring** — Natural-language bodies are **materialised** into
rules when text is first **encountered**: either once (e.g. the agent normalises
a document in a dedicated pass) or **incrementally** as portions are read. A
side effect is that **carefully written prose alone** can describe a coherent RPL
program with **no** explicit `rel(...)`, `%`, or `$` syntax in the source—the
heading titles, emphasis, and structure still yield definitions under this
reading. Relational surface syntax remains the **canonical** interchange when
precision matters.

Three namespaces partition the language when you use explicit syntax:

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

**String templates** — `{?x}` inside a double-quoted string uses the **value**
reading of `?x` (§3): it constructs the string (if `?x` is bound) or participates
in matching (if `?x` is unbound). **Regex** patterns (below) are for partial
matching with named captures.

**Regex** — written `/.../`; the regex body is delimited by slashes.

---

## 3. Variables

An **lvar** (logical variable) is `?` followed by a **name**:

```
NAME = [a-z] [ a-z0-9\- ]*
LVAR = '?' NAME | '_'
```

The anonymous variable `_` matches any value and binds nothing.

**Bindings** — An lvar may stand for any **expression** the grammar allows at the
binding site (§9, Appendix `ARG`): literals, collections, variables, `_`, nested
relation calls such as `inner(?x)` inside `outer(inner(?x), ?y)`, and so on.

**How a reference is read** — The same stored binding supports two different
**claims** at an occurrence:

- **`?x`** — The occurrence **means** the **value** of the expression bound to
  `?x`. Unification here is **by value**: constraints **propagate** with that
  binding (ranges, data, relational **extensions** where defined, etc.).
- **`#?x`** — The occurrence **means** the **syntax** of that expression: the
  **form** that would sit in this position if the bound expression were written
  there literally. Unification here is **by form**. Where **several** bindings are
  admissible for `?x`, the surrounding sentence may be read as **several**
  expressions—one per choice—with this site replaced by each binding’s
  expression shape; with **one** admissible binding, it is that single shape.
  (This is what other parts of the spec call **expansion**; §5.7 gives notation,
  precedence with `|…|`, and shape constraints.)

Together, this is **declarative**: it states what the sentence **asserts** about
values and forms, not how an engine **schedules** work.

**Factoring an argument** — To name a subexpression with an lvar, match it in the
head and pin its shape with a **constraint** (§12):

```rpl
outer(?r, ?y) <- ... -> ?r -> inner(?x)
```

That is equivalent (up to unification) to `outer(inner(?x), ?y)` for the same
tail.

**Callee position** — The **operator** of a relation call must be a **label** (a
declared relation name). An lvar **must not** appear in callee position:
`?q(?a)` is **ill-formed** and has no reading in RPL: following an lvar with
`( … )` does not form a call, because the callee must be syntactically a label.
To abstract over an inner goal, bind an **argument** lvar to the subexpression
(as above), or use a named relation and implication.

Lvars are introduced before **async vars** (`$x`, §13) and **in-place patterns**
(`~ PATTERN`, §6).

---

## 4. Collections

Collections are **lists**, **sets**, and **maps**. A **collection** is either a
list, set, or map. An **element** of a collection is a **variable** (§3), a
**literal** (§2), or a nested collection. A **relation call** (`name(?...)`) is
**not** a collection element — collection syntax only allows the **element**
forms above (§4, Appendix). A nested relation call that is valid as another
relation’s **argument** (§3) is still not a collection element: it may not appear
inside `[` … `]` or `#` `{` … `}` as an element. When you need to **gather** multiple answers of a relation into a **list or
set** value, that pattern is expressed via a rule **head** with destructuring
(defined below). That placement is a **technical requirement** for this specific
construct—because collection literals may only contain data-shaped elements, not
relation calls—not a general rule that “all heads must aggregate” or that every
program must use heads that way.

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

**`<=` here is comparison only** (e.g. `?x <= ?y`). **Implication** in rules is
**`<-`** and **constraints** use **`->`** (§10, §12), so those arrows are not
spelled with `<=` / `=>`.

Structural **matching** against patterns uses the `~ PATTERN` variable form (§6),
not bare `=`.

### 5.2 Cardinality

```
|rel(?x, ?y)|       number of distinct tuples (relation call written in place)
|?list|             length when the operand is a list (value reading of ?list, §3)
|#?t|              tuple count when the operand is the syntax reading of ?t (§3); precedence §5.7
```

The `|…|` operand may be a relation call in place, a list lvar under the **value**
reading, or **`#?t`** when the operand position must be the **syntax** reading of `?t`
(§3).

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
4.  Expansion        #LVAR (§5.7)
5.  Cardinality      |expr|
6.  Temporal         before after within between
7.  Logical          not
8.  Logical          , (conjunction)
9.  Logical          | (disjunction)
```

Use parentheses to override.

### 5.7 Expansion

**Notation** — **`#`** immediately before an **lvar** (`#?x`) is the **expansion**
form (nonterminal `EXPANSION` in the Appendix). Its **meaning** is the **syntax**
reading of that lvar’s binding (§3).

**Shape** — If a position’s grammar requires a **relation call** (or another fixed
head) and the bound expression is not of an allowed shape, the sentence is
**ill-formed** or the case is **implementation-defined**.

**Syntax-level abstraction** — Because `#` splices the **syntax** reading of an
lvar, you can abstract over forms that would otherwise be fixed at authoring time:
an expression bound to `?x` can be reinserted as syntax and become the operand of
another operator. That yields **higher-order relations** (relations parameterised
over syntactic structure) without a separate macro system. For example, counting
tuples for whatever expression `?x` denotes uses `|…|` (§5.2) on the expanded
syntax:

```rpl
length(?x, $l) <- $l = |#?x|
```

`?x` is typically bound to a relation call or collection term; `#?x` supplies that
expression inside `|…|` (§3). This is ordinary RPL composition — **not** an LRPL
feature or a reserved built-in name; any author may define such a relation.

```rpl
#?t ^:scope $s     -- ^ on the atom under the syntax reading of ?t (§11)
$l = |#?t|
```

**Precedence** — `#` before an lvar binds tighter than `|…|`: in `|#?t|`, the
operand is **`#?t`**, not `|#` applied to `?t`.

**Callee** — **`#?x`** does not produce a well-formed **callee**; relation calls
stay **`label(?…)`** (§3, §9).

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

**Gathering a relation into a collection** — Collection literals (§4) cannot
embed relation calls. **If** you need to collect every answer of a
relation into a list or set **value**, do it in the **head** of an implication
that uses destructuring (`&`), not by “inlining” the relation inside `[` … `]`
or `#` `{` … `}` in the tail. This is a **grammar-level** requirement for that
pattern, **not** a stylistic mandate for every rule head:

```
severity-options([& ?v]) <- valid-severity(?v)
active-ids(#{& ?id}) <- user(?id, ?status), ?status = "active"
```

---

## 9. Relations

A **relation** names a fact with arguments:

```
RELATION = LABEL '(' [ ARG [ ',' ARG ]* ]? ')'
LABEL    = NAME | NS '#' NAME
```

Each **argument** may be any **expression** permitted by `ARG` in the Appendix —
typically a variable, literal, collection, `_`, or a nested relation call.

**Naming** — relation names are declarative; they name facts, not actions:

```
name(?first, ?last)          -- correct
severity(?s)                 -- correct
collect-name(?first, ?last)  -- incorrect: imperative
```

All names use **kebab-case**. **Keywords** use `:` (e.g. `:tel` in arguments).

**Namespaces** — names may be scoped with `#` (full convention in §17.7).

**Composition** — Prefer **nested** subexpressions and **argument** lvars with
constraints (§3): e.g. `outer(inner(?x), ?y)` or `outer(?r, ?y)` with
`?r -> inner(?x)`. Parameterise over **expressions in argument positions**, not over
the callee name.

---

## 10. Rules and Implication

Rules combine **heads** and **tails** with `<-`. A **sentence** may be:

- an expression (tail only),
- `HEAD <- EXPR` (implication),
- optionally followed by `;` **abductives** (§16) and/or `->` **constraints** (§12).

```
RULE       = [ HEAD '<-' ]? EXPR [ ';' ABDUCTIVE ]? [ '->' CONSTRAINT ]?
NESTED-RULE = HEAD '<-' '(' RULE ')'
EXPR       = TAIL | HEAD '<-' EXPR | '(' EXPR ')' [ '^' VAR ]?
HEAD       = GOAL | RELATION | TOOL
TAIL       = CLAUSE | CLAUSE ',' TAIL | '(' TAIL ')' [ '^' VAR ]?
```

**Conjunction** is `,`; **disjunction** is `|`; parentheses group. A **clause**
is an atom optionally annotated with `^` / `^^` (§11).

**Double implication** — `HEAD <- HEAD <- TAIL` is **allowed**. It can express
**nested** or **method-shaped** decompositions (sometimes compared to HTN). That
shape is **one permitted idiom**, not **the** runtime model: nothing requires
hierarchical task networks, and planning stays agent-chosen (§18.3, §16.6).

**Grouping and metadata** — In `( EXPR ) ^ VAR`, the **meaning** is metadata access
on the grouped expression (§11).

**Namespaces in heads** — `HEAD` may be a **relation** (§9), **goal** (%…, §15), or
**tool** call (`$…`, §14). Async vars `$x` without parentheses are not tool heads
(§13).

---

## 11. Metadata

In **`clause ^ VAR`** and **`clause ^^ VAR`**, the **meaning** is access to
**metadata** on the immediately preceding form, or to the **`bindings`**
sub-map of that metadata when using **`^^`**. The operand is a **VAR** (§3, §6):
an lvar, async var, `~ PATTERN`, or other permitted form.

**Full map and patterns** — bind or match the whole metadata map:

```
clause ^ ?meta              -- entire metadata map -> ?meta
clause ^ ~ {:doc ?x}        -- match :doc, bind ?x
clause ^ ~ {:key ?v, ...}   -- destructure several fields
```

The full EDN literal set is valid as map keys inside `~ PATTERN`:

```
clause ^ ~ {:status ?s}     -- keyword key
clause ^ ~ {foo ?v}         -- symbol key
clause ^ ~ {"key" ?v}       -- string key
```

**Single metadata key** — these are **alternative spellings** with the **same
reading** (one field of metadata). None is the mandated normal form; rewrites
below are only for clarity.

- **Keyword key** — `^:KEY VAR` (e.g. `^:scope ?s`, `^:result ?r`).
- **Symbol key** — `^` *name* `VAR` with no colon: *name* is a bare **symbol** (same
  role as a map key in `^ ~ {name ?v}`), e.g. `^doc ?x`, `^patient-id ?p`.

```rpl
clause ^:scope ?s     -- same reading as: clause ^ ~ {:scope ?s}
clause ^doc ?x        -- same reading as: clause ^ ~ {doc ?x}
```

**Bindings (`:bindings`)** — Values live under the **`:bindings`** entry in
metadata (often written as its own map). These surface forms are **equivalent
readings**; pick any. **No** required expansion of `^^` into `^:bindings` or into
`^ ~ {:bindings …}` — each is an acceptable **terminal** form.

- **`^^ ~ {…}`** — pattern over the binding map (keys = lvar **names** without
  `?`, values = `VAR`s).
- **`^^ {…}`** — map literal (typical in **traces**, §12).
- **`^:bindings {…}`** — explicit keyword key on the outer metadata map.
- **Single binding slot** — `^^` *name* `VAR` with bare symbol *name*, same
  reading as `^^ ~ {name VAR}` (e.g. `^^a ?a`, `^^patient-id ?patient-id`).

```rpl
clause ^^ ~ {a ?b, c ?d}
clause ^:bindings {a ?b, c ?d}
clause ^ ~ {:bindings {a ?b, c ?d}}
-- the three lines above are the same meaning (illustrative equivalence)

clause ^^ {a "val1", c "val2"}           -- ground bindings (trace-shaped)
clause ^:bindings {a "val1", c "val2"}  -- same reading

^^a ?a
^^ ~ {a ?a}
-- same reading (single-slot binding pattern)
```

The same **bindings** shapes attach when a **goal head** lists capture arguments
on the tail (§15.1).

**Distribution** — `^` on a grouped tail distributes only to clauses whose vars
appear in the pattern (examples use `->` as “same programme, rewritten for
display”, not as a required step):

```
(?a, ?b) ^ ~ {foo ?a}               ->  ?a ^ ~ {foo ?a}, ?b
(?a, ?b, ?c) ^ ~ {foo ?a, bar ?c}   ->  (?a, ?c) ^ ~ {foo ?a, bar ?c}, ?b
```

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

`->` expresses an **invariant**: under the **left-hand** conditions, the
**right-hand** side must hold (or the stated truth value). Examples:

```
triage(?p, ?s), severity(?s) -> valid-severity(?s)
triage(?p, ?s), severity(?s), valid-severity(?s) -> true
triage(?p, ?s), severity(?s), valid-severity(?s)
```

Exclusion invariant:

```
rel1(?x, ?y), rel2(?y) -> false
```

Conditional invariant via metadata matching:

```
triage(?p, ?s, ?notes) ^ ~ {:s "critical"} -> valid-severity(?s), ?notes != ""
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
severity(?s) ^^ {s "critical", p "patient-0"} -> true
%critical ^^ {p "patient-0", tel "+44 7700 900000"} -> true
%low ^ false
```

Ordering in the trace log is **significant** — each trace holds from introduction
onward; later traces build on earlier ones.

### 12.4 Trace Retraction

Retract by asserting the same constraint with `-> false`:

```
severity(?s) ^^ {s "critical", p "patient-0"} -> false
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
$query-db("select * from patients") ^ ~ {:result "[{id: 1}]"} ^^ {query "select * from patients"} -> true
```

Bare avar:

```
$answer ^ ~ {:result "I'm fine, thanks"} -> true
```

Values are ground; no free variables. Traces are the **message log** for async
history; retract with `-> false` (§12.4).

**Relational abstraction** — match tool results with **lvars** in metadata, not
`$` in the result position:

```
ask(?prompt, ?answer) <- $ask(?prompt) ^ ~ {:result ?answer}
%greet <- ask("How are you?", ?answer)
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
ask(?prompt, ?answer) <- $ask(?prompt) ^ ~ {:result ?answer}
choose(?desc, ?options, ?choice) <- $choose(?desc, ?options) ^ ~ {:result ?choice}
```

**If** a tool such as `$choose` needs a **list value** built from every answer
of another relation, build that list via a separate rule **head** (§8)—because
the literal list in the tail cannot embed the relation call:

```
severity-options([& ?v]) <- valid-severity(?v)
severity(?s) <- severity-options(?options), choose("Select severity", ?options, ?s)
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
% <- tail                     -- root goal, anonymous
%name <- tail                 -- named goal
%name(?a, ?b) <- tail         -- named goal with capture args
```

Capture args attach **bindings** on the grouped tail (§11): **bare** argument
names as keys, **lvars** as values. Any of the §11 **bindings** spellings is fine,
e.g.:

```
%name(?a, ?b) <- tail
-- same reading, e.g.:
%name <- (tail) ^^ ~ {a ?a, b ?b}
%name <- (tail) ^:bindings {a ?a, b ?b}
%name <- (tail) ^ ~ {:bindings {a ?a, b ?b}}
```

### 15.2 Root Goal

The unnamed **`%`** is the root goal — first candidate when present. Multiple `%`
rules **disjoin**:

```
% <- %low | %warning | %critical
```

### 15.3 Named Goals and Agent Choice

If there is no root `%`, the agent chooses among named goals — context, user, or
ease of satisfaction.

### 15.4 Mutual Exclusion

Exclusive strategies may use **constraints** (§12):

```
% <- %low -> !%
% <- %warning -> !%
% <- %critical -> !%
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
# Critical Triage - %critical(?p, ?tel) <- triage(?p, ?s), ?s = "critical", name(?p, ?n), contact-info(?p, :tel, ?tel)

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
% <- %low ; @when(!%)
% <- %warning ; @when(!%)
% <- %critical ; @when(!%)
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
; @each(binding, items)
```

Force iteration over **all** bindings of items.

### 16.5 @for

```
; @for(binding, tail, step)
```

Iterate via a step relation (init / condition / step analogy).

### 16.6 Decomposition patterns (HTN-shaped expressivity)

RPL **can** express structures that look like **hierarchical task decomposition**
(double implication, `@when`, several rules sharing a goal head). That is
**expressivity**—a **permitted** way to write protocols—not the **definition**
of how planning ought to work internally. The **model** is: goals exist,
abductives qualify rules, the agent updates plans however it chooses (§18.3).
HTN is a **familiar analogy**, not a **required** semantics.

Example of what the surface language allows:

```
%task(?a) <- method-one(?a) <- tail-one(?a) ; @when(!%task, precondition-one(?a))
%task(?a) <- method-two(?a) <- tail-two(?a) ; @when(!%task, precondition-two(?a))
```

---

## 17. Source Format

RPL is written in **Markdown**. Every heading that carries a **signature** in one
of the three namespaces is an RPL definition. Plain headings without a
signature are ignored.

**Materialising prose** — Implementations may treat **free text** as latent RPL
until it is **first read**: on that encounter, the agent (or tooling) **projects**
headings, emphasis, structure, and narrative into the rule forms this spec
describes (§17.2–17.4). That can run as a **one-off** normalisation pass or **on
the fly** as the document is traversed. It follows that prose-only sources remain
**valid** under an enabling reading when they are **unambiguous** enough to map
cleanly; explicit relational syntax is recommended when authors want portable,
reviewable precision.

### 17.1 Heading Forms

**Head-only:**

```
# Human Title - rel(?arg1, ?arg2)
# Human Title - %goal(?arg1)
# Human Title - $tool(?arg1)
```

**Partial tail:**

```
# Human Title - rel(?arg1) <- body-rel(?arg1), ...
# Human Title - %goal(?arg1) <- rel(?arg1), ...
```

The heading starts the rule; the body **conjoins**:

```
head <- <heading-tail>, <body-tail>
```

### 17.2 Body Prose

Prose is **LLM instruction** and, after materialisation (§17 opening), part of
the **rule**: the narrative guides the agent; emphasised spans become variable
sites. **Where** prose contains:

```
__word__
__multi word__
```

each span marks a variable, normalized to **kebab-case** (`__first name__` →
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

**5. Update plans** — Agent-chosen; goals imply **some** planning activity.
Patterns that resemble hierarchical decomposition (§16.6) are **expressible**, not
**prescribed**—no required HTN or fixed planning algorithm.

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
% <- %critical(?p, _) | %warning(?p, _) | %low(?p)

# Critical Triage - %critical(?p, ?tel) <- triage(?p, $s), $s = "critical", name(?p, ?n), contact-info(?p, :tel, ?tel), patient(?p)

Present as a call sheet ordered by arrival time.
On completion suggest trying %warning for remaining patients.

# Warning Triage - %warning(?p, ?tel) <- triage(?p, $s), $s = "warning", name(?p, ?n), contact-info(?p, :tel, ?tel)

Present as a follow-up list.

# Low Triage - %low(?p) <- triage(?p, $s), $s = "low", patient(?p)

Log only, no immediate action required.

# Triage - triage(?p, ?s) <- history(?p, ?symptoms), severity(?s)

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
(triage(?p, ?s) <-
  (history(?patient-id, $symptoms) <- ...) ^^ {patient-id "patient-0", symptoms "chest pain"},
  (severity($s) <- ...) ^^ {s "critical"}
) ^^ {p "patient-0", s "critical"} -> true
%critical ^^ {p "patient-0", tel "+44 7700 900000"} -> true

(triage(?p, ?s) <-
  (history(?patient-id, $symptoms) <- ...) ^^ {patient-id "patient-1", symptoms "headache"},
  (severity($s) <- ...) ^^ {s "low"}
) ^^ {p "patient-1", s "low"} -> true
%low ^ false
```

---

## 20. Design Principles

- **Enabling, not limiting** — the spec states what RPL **may** express and what
  implementations **might** enforce at boundaries (e.g. collection literals vs
  relation calls); it does not dictate a single workflow, planner, or authoring
  style.
- **Primary vs secondary use** — **prompts and LLM protocols** are the main
  target; **living Markdown** and long-lived documents are also supported.
- **Prose canonical at Author’s option** — relational syntax is the precision
  interchange; **prose-first** documents can still denote valid programs when
  materialised unambiguously (§17).
- **Technical vs prescriptive** — rules such as “gather relation into collection
  via head” are **constraints on that pattern** (§8), not commandments about
  every head.
- **HTN-shaped, not HTN-bound** — nested methods and `@when` are **permitted**
  idioms (§16.6), not **the** execution model.
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

RULE            = [ HEAD '<-' ]? EXPR [ ';' ABDUCTIVE ]? [ '->' CONSTRAINT ]?
NESTED-RULE     = HEAD '<-' '(' RULE ')'
EXPR            = TAIL
                | HEAD '<-' EXPR
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
ATOM            = RELATION | GOAL | TOOL | VAR | LITERAL | EXPANSION
                | '(' EXPR ')'
BINDING         = CLAUSE | CLAUSE ',' BINDING
STEP            = CLAUSE | CLAUSE ',' STEP

EXPANSION       = '#' LVAR
OPERAND         = RELATION | VAR | LITERAL | COLLECTION | EXPANSION
                | '(' OPERAND ')'

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

ARG             = VAR | LITERAL | COLLECTION | '_' | RELATION
```

**Cardinality** — The expression between `|` and `|` in §5.2 is an `OPERAND`
when it is a surface relation call, a bare lvar (value reading), or **`#?x`**
(syntax reading, §3; precedence §5.7).

**Namespaces** — `$name` without `(` `)` is an async var; `$name(` … `)` is a tool
call. Relation and goal heads use §9 and §15 respectively.
