## Protocol execution contract (anti‑ellision)

This panel is a **phased protocol**, not a monologue. The compose system assembles one `SKILL.md`, but **runtime execution must still respect phase boundaries**. Skipping ahead, simulating the human without a real reply, or collapsing many phases into one assistant message is a **protocol violation** — not efficiency.

### One milestone per turn (default)

Unless the human has **explicitly** opted into fast‑tracking (see below), each assistant message may complete **at most one protocol milestone** and must then **stop and wait for human input**.

Treat these as **separate milestones** (each normally ends the turn):

1. **Readings** (first output only — no Value Constraints, trajectory, cohorts, or debate in the same message).
2. **Inquiry** (if triggered) — questions only; then stop for answers.
3. **Value Constraints** — Moderator proposal only; then stop for confirm/adjust.
4. **Grounding Statement** — Moderator synthesis only; then stop for confirm.
5. **Trajectory + output bias** — Moderator statement only; then stop for confirm.
6. **Cohort Construction** — tension axes, partition, justification, and **complete** guest personas as required; if this grows large, you may split across turns at natural Moderator checkpoints **between** sub‑steps, but never skip guest drafting or merge into debate.
7. **Discovery** (conditional) — witness Q&A only when applicable; then stop if human steering is needed before positions.
8. **Debate** — follow round structure; do not jump to Refine/Synthesis in the same message as initial positions unless the human explicitly asked for a compressed run.

**Do not** advance past language in this skill that says the protocol waits on the human or writer (e.g. “does not advance until … confirms”). A model‑invented “User:” line or imagined confirmation is **never** a substitute for a real human message in the host environment.

### Explicit checkpoint footer (required)

Whenever a milestone ends and the next step requires human input, end the message with a **Protocol checkpoint** block so the stall is visible and unskippable in the transcript:

```markdown
---
**Protocol checkpoint — human input required**  
Completed: <milestone name>  
Next allowed step (after the human replies): <single next phase or sub‑step>  
Do not continue the protocol in this same turn.  
---
```

If the human has **not** opted into fast‑track, the model must not place any content **after** this block.

### When bundling is allowed (fast‑track opt‑in)

Bundling multiple milestones into one assistant message is allowed **only** if the human has clearly opted in, for example:

- They state they want a **dry run**, **walkthrough**, or **outline of the full arc** without stopping; or
- They explicitly waive checkpoints (e.g. “run all phases in one reply”, “no pause until synthesis”).

Absent such consent, **default to strict single‑milestone turns**.

### Why this exists

Compressed runs defeat the purpose of the dialectic: readings, constraints, and guest choices should be **contestable** while they are still cheap to change. Checkpoints make that real.

### Evaluating adherence (maintainers)

Use the Agent Skills evaluation loop ([Evaluating skill output quality](https://agentskills.io/skill-creation/evaluating-skills)) with prompts that **tempt** rushing (e.g. long briefs, “give me the full workshop in one answer”). Add **assertions** that are machine‑ or judge‑checkable, for example:

- The assistant message contains **only** Readings and a Protocol checkpoint — no Value Constraints, no Grounding Statement, no cohorts.
- Any turn that includes Value Constraints **does not** also include Trajectory, cohort construction, or debate.
- The message includes a **Protocol checkpoint** block whose “Next allowed step” names exactly **one** following phase.
- The transcript does not contain fabricated human confirmations.

Treat chronic checkpoint misses like any other skill failure: tighten instructions here, add contrasting examples, and re‑run evals until pass rates stabilize. Optional tooling: run with‑skill evals in an **isolated session** per test case so residue from earlier phases does not mask ellision ([spawning runs](https://agentskills.io/skill-creation/evaluating-skills#spawning-runs)).
