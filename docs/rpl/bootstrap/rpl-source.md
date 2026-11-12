# Layer `rpl-source`

**Provides.** How a Markdown document denotes an RPL program.

**Depends on.** [`rpl`](rpl.md).

**Not provided.** New connectives. This layer is a source format, not a logic.

---

### rpl-source.1 — Headings start rules

**Law.** A heading may carry a relation, goal, or tool head, optionally with a tail. The heading starts the rule. The body conjoins.

**FOL reading.** *Comment.* Notation for writing the same sentences as `rpl`.

**Surface.**

```
# Human Title - rel(?arg)
# Human Title - %goal(?arg) :- body-rel(?arg)
```

**Spec.** [rpl.md §17.1](../specification/rpl.md#171-heading-forms), [rpl.md §17.4](../specification/rpl.md#174-full-rule-tail-order).

**Example.** Tail order is heading tail, then prose unification terms, then fenced `rpl` blocks ([rpl.md §17.4](../specification/rpl.md#174-full-rule-tail-order)).

A head-only signature: the heading starts the rule; the body materialises further clauses.

Prose:

```markdown
# Calculate Discount - discount(?user, ?amount)
If the user is a premium member, the discount is 20%. Otherwise, it is 5%.
```

Inferred RPL:

```rpl
# Calculate Discount - discount(?user, ?amount)

discount(?user, 20) :- premium-member(?user)
discount(?user, 5) :- not premium-member(?user)
```

A goal heading: the body supplies the tail.

Prose:

```markdown
# Approve Loan - %approve(?application)
The loan is approved if the __credit score__ is above 700 and the __income__ is greater than 50000.
```

Inferred RPL:

```rpl
# Approve Loan - %approve(?application) :- credit-score(?application, ?credit-score), ?credit-score > 700, income(?application, ?income), ?income > 50000
```

In a goal heading, emphasis is advisory ([rpl.md §17.2](../specification/rpl.md#172-body-prose)). This is one eligible reading.

A partial tail on the heading: the body conjoins.

Prose:

```markdown
# Send Notification - notify(?user, ?message) :- email(?user, ?email)
Notification also requires the user to have opted in.
```

Inferred RPL:

```rpl
# Send Notification - notify(?user, ?message) :- email(?user, ?email), opted-in(?user)
```

**Not.** A heading title is not itself a predicate name unless a signature says so.

---

### rpl-source.2 — Prose materialises

**Law.** Body prose is instruction and, after materialisation, part of the rule. `__word__` marks a variable site, normalized to kebab-case.

**FOL reading.** *Comment.* Two eligible materialisations of the same prose are possible. Choice is [`agent`](agent.md).

**Surface.** `__first name__` → `?first-name`. In a goal heading, emphasis is advisory.

**Spec.** [rpl.md §17.2](../specification/rpl.md#172-body-prose), [motivation.md](../motivation.md).

**Example.** A heading plus emphasised spans can denote a rule with no fenced block. Prose-only sources remain valid under an enabling reading when they map cleanly ([rpl.md §17](../specification/rpl.md#17-source-format)).

No RPL and no emphasis: the heading title is not the predicate; a signature is inferred, and a second derived relation is its own signed heading.

Prose:

```markdown
# Triage Patient
Ask the user for the patient's name and their symptoms. When symptoms include chest pain, severity is critical.
```

Inferred RPL:

```rpl
# Triage Patient - triage(?patient) :- name(?patient, $name), symptoms(?patient, $symptoms), severity(?patient, ?severity)

# Critical severity - severity(?patient, "critical") :- symptoms(?patient, ?s), ?s ~ /chest pain/
```

`$name` and `$symptoms` are avars: the prose asks the user, so those values arrive later ([`rpl.9`](rpl.md)). The `severity` clause has a different head, so it cannot be a fenced tail of `triage` ([rpl.md §17.3](../specification/rpl.md#173-fenced-rpl-blocks)); it is a separate signed heading ([rpl.md §17.1](../specification/rpl.md#171-heading-forms)).

No RPL, with emphasis in the body: `__order id__` → `?order-id`, and the other emphasised spans likewise become kebab-case lvars.

Prose:

```markdown
# Order Fulfillment
An order is fulfillable when its __order id__ is valid. A fulfillable order has __customer details__ and a __shipping address__.
```

Inferred RPL:

```rpl
# Order Fulfillment - fulfillable(?order-id) :- valid-order(?order-id)
fulfillable(?order-id) -: customer-details(?order-id, ?customer-details), shipping-address(?order-id, ?shipping-address)
```

The first sentence generates `fulfillable` from `valid-order` (`:-`). The second is a checked constraint on that head (`-:`): a fulfillable order has customer details and a shipping address ([`rpl.4`](rpl.md)). Those details are not conditions in the rule body.

**Not.** Prose does not add a connective. It denotes `rpl` sentences.

---

### rpl-source.3 — Fences and scope

**Law.** A fenced `rpl` block conjoins expressions onto the current heading’s rule, including child headings, not siblings or parents. Heading level sets scope. `--` returns to the parent scope.

**FOL reading.** *Comment.* Scope of which sentences are in the program.

**Surface.** ` ```rpl ` blocks; `--`.

**Spec.** [rpl.md §17.3](../specification/rpl.md#173-fenced-rpl-blocks), [rpl.md §17.5](../specification/rpl.md#175-scope-and---).

**Example.** See [rpl.md §17.5](../specification/rpl.md#175-scope-and---). The worked prose-translation examples above do not use fences or `--`.

**Not.** A fence does not start a new logic.
