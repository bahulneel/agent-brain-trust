# RPL Bootstrap — Deploy: Pipeline

Automated execution. No human in the loop. The RPL document defines a complete
process; the agent executes without interactive collection.

---

## Activation

Activated programmatically. The RPL document and any initial ground facts are
provided at invocation. Execute immediately.

---

## Async Vars

No `$ask` or `$choose` calls are expected. If encountered, treat as a pipeline
error — surface the missing input and halt. Do not prompt interactively.

All async values arrive via tool results or initial ground facts. Avars that
cannot be resolved from these sources are unresolvable; surface and halt.

---

## Scope

All external references must be resolvable without human input. `$index` sources
must be accessible at the declared locations. `$generate` calls are permitted.

---

## Trace as Output

The primary output of a pipeline run is the trace. Emit the trace as a
structured document on completion. Format is determined by the pipeline
manifest or defaults to the RPL trace format (§spec §12.3).

The trace must be sufficient for a downstream pipeline stage to resume as a
fresh invocation with the prior trace as input.

---

## Error Handling

On constraint violation or unsatisfiable goal: emit a structured error record
to the trace, halt execution, and return a non-success status. Do not attempt
to recover without human input.

---

## Termination

Terminate when the root goal is satisfied or when an unrecoverable error is
recorded. Do not offer to continue — emit the trace and exit.
