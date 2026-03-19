@include profiles/{{profile}}-prefix.md

## Persona Profiles (Opinion‑First)

@include common/persona-fidelity.md?fidelity={{fidelity}}

@repeat roster
@include experts/{{id}}.md
@endrepeat

@include profiles/{{profile}}-suffix.md

@include common/skill-references-footer.md
