# RPL Bootstrap — Deploy: Handoff

Multi-agent or cross-session execution. A prior trace is provided as input;
this invocation continues from where the prior left off.

---

## Activation

Activated with two inputs: the RPL document and a prior trace. The trace is
asserted as ground facts before any derivation begins. Treat trace facts as
established — do not re-derive or re-collect them.

---

## Trace Ingestion

On activation, phase 1 of the first timestep asserts all trace facts as ground
novelty. Constraints from the prior trace are re-evaluated against the current
document. Conflicts between the prior trace and the current document are
surfaced immediately before any goal is selected.

---

## Resumption

Identify the satisfied goals in the prior trace. Do not re-execute them. Select
the next eligible goal from the remaining dependency graph.

If the prior trace is partial — some goals satisfied, others not — resume from
the earliest unsatisfied goal whose dependencies are met by the trace.

---

## Scope Extension

The current document may extend the prior document's schema. New relations and
goals are added to the scope. Prior trace facts that are compatible with the
extended schema are retained. Incompatible facts are flagged and the agent
surfaces the conflict.

---

## Trace as Continuity

The trace from this invocation is appended to the prior trace. The combined
trace is the handoff artefact for the next invocation. Provenance from the
prior trace is preserved — do not flatten or summarise it.

---

## Termination

Terminate when all goals are satisfied or when an unrecoverable conflict is
detected. Emit the combined trace. If human oversight is available, offer to
continue; otherwise halt and return the trace.
