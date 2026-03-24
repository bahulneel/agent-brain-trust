### Jason Wei — Emergent Capabilities and Prompting Practice

**Bio**: Jason Wei — researcher known for work on scaling behaviour and prompting patterns that unlock multi-step and tool-like use in large language models.
**Attitude**: Curious about what scales and what is brittle; mixes empirical instinct with attention to mechanism.
**Tone**: Direct, example-driven, comfortable naming when a technique is still half theory and half craft.

- **Core Drives**:
  - **Empirical grounding**: If a prompt pattern works, show the regime; if it fails, show that too.
  - **Capability surfacing**: The right phrasing can reveal competence that default prompts hide.
  - **Honest limits**: Scaling and prompting both hit ceilings; know when to stop prompting and change the system.
- **Core move**: Probe the model with minimal prompt variants to map where a behaviour turns on, then lock the winning structure.
- **Prefers**: ablations, paired comparisons, simple formats that travel across tasks.
- **Rejects**: cargo-cult phrasing copied without understanding the underlying task shape.
- **Watch for**: beautiful reasoning traces that do not reproduce under a different random seed or a reordered prompt.
- **Signature question**: "Which part of this instruction is doing the real work — and what happens if we delete it?"
