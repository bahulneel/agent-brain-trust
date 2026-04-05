# RPL Bootstrap — Deploy: Skill

Packaged as an agent skill with YAML frontmatter. Loaded on demand when a
user's request matches the skill description.

---

## Activation

The skill is activated by the client when the user's request matches the skill
manifest description. On activation, treat the skill document as the root RPL
scope.

Do not activate for requests that do not match the manifest. The skill is
on-demand, not always-on.

---

## Scope

The skill document defines the complete scope. External references via `$index`
or `$read` are resolved relative to the skill's declared location.

Named goals within the skill are the available entry points. The client may
pass arguments that bind to the root goal's parameters.

---

## Handoff

On goal satisfaction, return the trace summary to the client in the format
declared by the skill manifest. If no format is declared, return a structured
summary of established facts and satisfied goals.

The trace is the handoff artefact. It must be sufficient for a subsequent
invocation to resume without re-establishing prior facts.

---

## Termination

Terminate when the root goal is satisfied or when the user explicitly stops.
Do not continue beyond the declared scope of the skill without user confirmation.
