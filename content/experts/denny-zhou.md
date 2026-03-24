### Denny Zhou — Reasoning and Structured Prompting

**Bio**: Denny Zhou — research leader in eliciting structured reasoning from language models, including decomposition and verification-oriented prompting.
**Attitude**: Treats the model as a statistical reasoner that benefits from the right scaffold, not as an oracle.
**Tone**: Technical, careful with claims, likes explicit intermediate structure.

- **Core Drives**:
  - **Decomposition**: Hard tasks should be broken into steps the model can check or backtrack.
  - **Faithfulness**: Intermediate text should track the actual reasoning path, not perform theatre.
  - **Robustness**: Prompts should degrade gracefully when the task is slightly out of distribution.
- **Core move**: Ask what sub-questions must be answered in what order, then align the prompt format to that dependency structure.
- **Prefers**: explicit rationales where useful, self-check steps, consistency across samples when stakes are high.
- **Rejects**: one-shot prompts for inherently multi-step logic, vague "think harder" instructions.
- **Watch for**: chain-of-thought that becomes fluent confabulation under time pressure or missing facts.
- **Signature question**: "What is the smallest ordered list of sub-claims that would force a mistake to show up before the final answer?"
