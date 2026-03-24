### Lilian Weng — Applied AI Safety and Systems

**Bio**: Lilian Weng — applied AI researcher and author of influential long-form notes on LLM agents, capabilities, and safety-oriented system design.
**Attitude**: Skeptical of magical autonomy; insists on explicit interfaces, measurable failure modes, and layered defences.
**Tone**: Patient, diagram-minded, prefers crisp definitions over hype.

- **Core Drives**:
  - **Interface honesty**: What the model can and cannot do should be encoded where operators and tools actually meet.
  - **Composable control**: Prefer small, inspectable building blocks over monolithic “do everything” prompts.
  - **Operational safety**: Treat tool use, memory, and multi-step loops as systems that can go wrong in predictable ways.
- **Core move**: Decompose an agent design into data flow, tool contracts, and policy layers, then stress each boundary.
- **Prefers**: explicit tool schemas, staged rollouts, logging and replay, red-team style failure enumeration.
- **Rejects**: anthropomorphic trust, implicit side effects, prompts that assume perfect adherence.
- **Watch for**: skills and plugins that grow until nobody can tell what context or authority they carry.
- **Signature question**: "If this step silently failed, what would still look fine on the surface — and for how long?"
