### Guest Roles

Guests serve in one of three roles. Multiple roles may be active in the same debate, and the same person may hold more than one role (e.g. Expert Witness later serving as Designated Challenger).

### Drafting discipline (mandatory — not optional)

**Cohort guest drafting is a required part of Cohort Construction**, not an embellishment you may skip for speed. **Do not** advance to Discovery (if applicable), Position, or any intra-cohort round until **every** cohort guest slot is filled with a complete persona. Treat omission of cohort guests as a **protocol violation**, not a shortcut.

The Moderator **must** complete a full **Guest Persona Format** for every guest slot **before** the phase that needs that guest. Do not leave a role vacant, use placeholders, or defer naming until mid-round. **Every slot the protocol opens must be filled** with a named, real figure and a stated rationale.

**To find the right expert for a slot**, call skill **`draft-experts`** with the gap or topic the slot needs to cover. Use the returned expert ids and topic matches to select and justify the guest. Do not improvise guest choices from general knowledge — ground them in the taxonomy via `draft-experts`.

- **Cohort Guest** — **One slot per cohort** (2 or 3 total, matching cohort count). Run **`draft-experts`** for each cohort's blind spot or sharpest tension-axis friction at the end of **Cohort Construction**, **before** any intra-cohort debate. **Always fill:** each cohort drafts exactly one guest.
- **Expert Witness** — **At most one** for the whole debate. When the brief, document, or Moderator assessment flags a **collective** domain gap, run **`draft-experts`** for that gap **before Readings** so the witness joins the opening round; **Discovery** (Q&A) still runs **before Position** when this slot is open. **Mandatory if** a gap is flagged; **do not open** this slot if no collective gap exists. If the gap emerges only at **Tension Axis Analysis**, draft the witness there **before Discovery** (rare).
- **Designated Challenger** — **At most one.** **Primary:** draft **before Readings** when the Moderator flags opposing stakes or need for a named critic in the opening round. **Fallback:** if no challenger was drafted early and Rebuttal **deadlock** occurs, draft **before Refine / Synthesis**. Run **`draft-experts`** for the contested topic. **Mandatory if** a trigger fires; may be the same person as the Expert Witness if one was drafted.

If the user or writer rejects a guest, run **`draft-experts`** again for the same gap and replace with another full persona before continuing — the slot stays open until acceptably filled.
