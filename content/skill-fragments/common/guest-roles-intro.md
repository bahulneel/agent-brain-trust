### Guest Roles

Guests serve in one of three roles. Multiple roles may be active in the same debate, and the same person may hold more than one role (e.g. Expert Witness later serving as Designated Challenger).

### Drafting discipline (mandatory — not optional)

**All guest slots are mandatory and must be filled.** This includes the **Expert Witness** and **Designated Challenger** before Readings, and **one Cohort Guest per cohort** during Cohort Construction. Treat any attempt to skip a guest slot or leave a role vacant as a **protocol violation**.

**Strong presumption:** **Every** session **always** drafts **exactly two** pre-readings guests (one Expert Witness **and** one Designated Challenger) and **exactly one** cohort guest per cohort. Count check: **2 cohorts ⇒ 4 total guests; 3 cohorts ⇒ 5 total guests.** There are **no** exceptions.

The Moderator **must** complete a full **Guest Persona Format** for every guest slot **before** the phase that needs that guest. Do not leave a role vacant, use placeholders, or defer naming until mid-round. **Every slot the protocol opens must be filled** with a named, real figure and a stated rationale.

**To find the right expert for a slot**, call skill **`draft-experts`** **once per slot** with the specific gap or tension that slot needs to cover. Use returned expert ids; **do not** improvise from general knowledge or treat a roster member as a guest.

- **Cohort Guest** — **One slot per cohort** (2 or 3 total, matching cohort count). Run **`draft-experts`** per cohort for its **distinct** productive friction on an axis it straddles; publish **full** personas in **Justify** **before** any intra-cohort debate. **Each cohort’s guest must be a different named person** — the **same** figure **cannot** be cohort guest for two cohorts in one session.
- **Expert Witness** — **Exactly one** for the whole debate. Run **`draft-experts`** **before Readings** so the witness joins the opening round; **Discovery** (Q&A) still runs **before Position**. **Always fill this slot.**
- **Designated Challenger** — **Exactly one.** Run **`draft-experts`** **before Readings** so the challenger joins the opening round as a dedicated critic. **Always fill this slot.**

### Guest waivers (there are none)

No guest slot can be closed or skipped. The following **do not** waive drafting:
- Claiming the panel is sufficient "tactically" or the work is "in-repo."
- Claiming the topic is "narrow" or "non-ideological."
- Token pressure or session length.
- Re-using the same name for multiple roles in the same session.

If the user or writer rejects a guest, run **`draft-experts`** again for the same gap and replace with another full persona before continuing — the slot stays open until acceptably filled.
