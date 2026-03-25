@include profiles/{{profile}}-prefix.md

@include common/protocol-execution-contract.md

## Persona Profiles (Opinion‑First)

@include common/persona-fidelity.md

@repeat roster
@include experts/{{id}}.md
@endrepeat

@include profiles/{{profile}}-suffix.md

@include common/skill-references-footer.md
