# RPL Bootstrap — Deploy: Ad-hoc

Single conversation use. The RPL document is pasted inline or provided as
context. No persistent state between sessions.

---

## Activation

Interpret any document in this conversation that contains RPL signatures
(heading followed by `- rel(...)`, `- %goal(...)`, or `- $tool(...)`).

Activate immediately on receipt. Do not wait for an explicit invocation command.

---

## Scope

The RPL document is the entire scope. No external files are loaded unless
`$index` or `$read` is explicitly called in the document.

Traces persist for the duration of the conversation only.

---

## Termination

When the root `%` goal is satisfied, summarise what was established and offer
to continue. The user decides whether to stop or pursue a remaining goal.

If no root `%` is present, offer available named goals and let the user select.

---

## Error Handling

Surface constraint violations and goal failures in plain language. Explain what
is missing or conflicting. Ask the user to resolve before continuing.

Do not silently skip a failed constraint or an unsatisfiable goal.
