# RPL glyph mapping

Presentation glyphs for the logic-pair connectives. They are typographic only. ASCII remains the canonical spelling in source and in these docs, unless a later document says otherwise.

**Sources.** Operator meanings are taken from the documents under `docs/rpl/`. Bahul's glyph rule, from the 10–11 Nov 2026 (Europe/London) conversation: only the logic pairs get glyphs, and each uses the nearest equivalent standard logic operator; the pattern operator `~` and the comparisons `<=` / `>=` stay as they are.

**Claim labels.** `(doc)` is from those files. `(Bahul)` is that rule. `(inference)` is a proposed correspondence or a judgement that no close standard operator exists.

An RPL sentence may combine head, body, and constraint in one form, for example `A :- B -: C` (`doc`: `docs/rpl/specification/rpl.md` §10 grammar; the canonical standalone form is `true :- expr -: true` in `docs/rpl/bootstrap/rpl.md` rpl.5). With these glyphs that reads `A ← B ⊨ C`.

Surface forms for the modal pair follow `docs/rpl/bootstrap/modal.md` modal.1 and `docs/rpl/specification/logics.md` §3.1: `A ~: B` and `B :~ A`.

## Table

| ASCII | Logic pair? | Meaning | Glyph | Standard operator | Reason |
| --- | --- | --- | --- | --- | --- |
| `:-` | yes, with `-:` | Horn implication: the head holds when the body holds (`doc`: `docs/rpl/bootstrap/fol.md` fol.6; `docs/rpl/specification/rpl.md` §5.1, §10) | ← U+2190 LEFTWARDS ARROW | converse implication, `BODY → HEAD` written head-first | `(doc)` fol.6 FOL reading is ∀x⃗ (BODY(x⃗) → HEAD(x⃗)). `(inference)` the operator that sits in the surface order `HEAD :- BODY` is ←, which is also the usual typographic form of Prolog `:-`. |
| `-:` | yes, with `:-` | Invariant / constraint: under the left-hand conditions, the right-hand side must hold; checked, not used to generate heads (`doc`: `docs/rpl/bootstrap/rpl.md` rpl.4; `docs/rpl/specification/rpl.md` §5.1, §12) | ⊨ U+22A8 TRUE (double turnstile) | semantic entailment | `(doc)` rpl.4 already writes the FOL reading as an obligation `LEFT ⊨ RIGHT`. `(inference)` that is a closer standard operator than →, which would look like generative implication and blur the distinction rpl.4 draws. |
| `:%` | yes, with `%:` | Existential head: log (`true :% A`, permanent record) or impulse (`A :% true`, transient until next quiescence) (`doc`: `docs/rpl/bootstrap/existential.md` existential.1; `docs/rpl/specification/logics.md` §2) | none | — | `(doc)` the FOL reading is "Not Horn. An additional logic over `rpl` sentences," not a quantifier. `(inference)` no single standard logic operator covers both log and impulse. ∃ would contradict that reading. |
| `%:` | yes, with `:%` | Existential tail: consistency (`true %: A`, structural invariant) or eventually (`A %: true`, pending until A holds) (`doc`: same as `:%`) | none | — | `(inference)` LTL/modal G/□ and F/◇ only match these two tail modes, and □/◇ are already the natural glyphs for the modal pair. The pair as a whole has no close standard operator, so none is proposed. |
| `~:` | yes, with `:~` | Modal necessity: `A ~: B` projects A into the mode of B (`doc`: `docs/rpl/bootstrap/modal.md` modal.1; `docs/rpl/specification/logics.md` §3; `docs/rpl/specification/rpl.md` §5.1) | □ U+25A1 WHITE SQUARE | necessity | `(doc)` the spec names `~:` necessity. `(inference)` □ is the standard necessity operator. Caveat: textbook □ is unary; RPL's operator is binary (project into a mode). |
| `:~` | yes, with `~:` | Modal possibility: `B :~ A` maps B back to the base context, possibility justified by A (`doc`: same as `~:`; surface form as in logics.md §3.1 and modal.1) | ◇ U+25C7 WHITE DIAMOND | possibility | `(doc)` the spec names `:~` possibility. `(inference)` ◇ is the standard possibility operator, with the same unary-vs-binary caveat as □. |
| `:@` | yes, with `@:` | Interpretive define: on the assertion side, define a language from a specification (`doc`: `docs/rpl/bootstrap/interpretive.md` interpretive.1; `docs/rpl/specification/logics.md` §4; `docs/rpl/specification/rpl.md` §5.1) | none | — | `(doc)` the FOL reading is "A translation into the `rpl` theory, not a FOL quantifier." `(inference)` there is no close standard *logic* connective for "define a language." Denotational brackets ⟦⟧ are not a logic operator and would not map cleanly onto this infix pair, so none is invented. |
| `@:` | yes, with `:@` | Interpretive interpret: on the goal side, request the interpretation of a statement in a named language; it holds when that interpretation unifies with the expected RPL reading (`doc`: same as `:@`) | none | — | same reason as `:@`. |
| `~` | no | In-place structural matching, `~ PATTERN` (`doc`: `docs/rpl/specification/rpl.md` §5.1, §6) | none; stay ASCII | — | `(Bahul)` keep the pattern operator as it is. |
| `<=` / `>=` | no | Numeric comparison only; `<=` is never implication (`doc`: `docs/rpl/specification/rpl.md` §5.1; fol.6) | none; stay ASCII | — | `(Bahul)` keep the comparisons as they are. |

Spaces remain required around the colon-style connectives, because `:name` is a keyword (`doc`: `docs/rpl/specification/rpl.md` §5.1).

## Chosen glyphs

Bahul may override any of these.

- `:-` is ← (U+2190); `-:` is ⊨ (U+22A8, already used in rpl.4). `A :- B -: C` reads `A ← B ⊨ C`.
- `~:` is □ (U+25A1); `:~` is ◇ (U+25C7), used as binary operators. Textbook □ and ◇ are unary; RPL's operators are binary (project into a mode, or map back). That arity difference is noted, not treated as a reason to pick different characters.
- `:%`/`%:` and `:@`/`@:` have no glyph, because no close standard operator exists.
- `~`, `<=`, and `>=` stay ASCII, as instructed.

Reasons for each choice are in the table. Alternatives considered and not taken: ⇐ (U+21D0) for `:-`; → or ⊢ (U+22A2) for `-:`; typographic variants such as ◻ (U+25FB) or ◊ (U+25CA) for the modal pair.
