# RPL protocol reimplementations

These documents reimplement the repository's Brain Trust and Expert protocols in
RPL without changing the live skill runtime.

- [expert-opinion.md](expert-opinion.md) - single-expert selection and delivery
- [brain-trust-technical-dialectic.md](brain-trust-technical-dialectic.md) -
  technical Brain Trust protocol
- [brain-trust-editorial-room.md](brain-trust-editorial-room.md) - editorial
  Brain Trust protocol
- [experience-report.md](experience-report.md) - expressivity gaps, ambiguities,
  and frictions encountered during the rewrite

The protocol files intentionally mix formal RPL with prose. The largest missing
piece today is a first-class pause/checkpoint primitive for human-gated
milestones, so those runtime boundaries still have to be carried in body text.
