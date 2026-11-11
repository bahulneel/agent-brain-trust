# RPL live run 2 (11 Nov 2026 04:23 London): edge cases

All four handled sensibly (inferred pass; these are judgement probes with no fixed expected output).

- A, constraint scope: the narrow invariant (peanut) and the broad fact (allergy to nuts) disagreed. RPL refused the almond sauce, proposed a sunflower-seed sauce and yielded. Gap: nothing turns a fact like allergy(...) into an invariant, and nothing says whether scope is read literally or by what it means.
- B, a later correction: "comfort matters more" clearly replaces "cheapest" but leaves unclear whether the £100 cap still holds. RPL raised that as a coordination point and yielded (it's also a purchase, and no route or dates were given). Gap: no rule for how far a correction retracts, or which wins when a constraint and a preference clash.
- C, user retraction: RPL applied it (the user settled the coordination point), recorded likes -: false plus dislikes asserted, and kept the history. Gap: rpl.6 doesn't say who may retract, or whether "forget" means erasing or recording that the fact no longer holds.
- D, autonomy without ground: RPL picked the recipe first (an ordering call), then reported the diet check as UNCHECKED under fol.5 rather than passed. Gap: no rule for when granted autonomy meets missing ground, and no form for a check with nothing to check against.

New for the mck proposal (#31): correction scope; constraint-versus-preference priority; erase-versus-record semantics for "forget"; a third verdict, "unchecked", for invariant-check alongside holds and fails.
