# Agent Brain Trust

Composable [Agent Skills](https://agentskills.io/specification)—`expert-opinion` (single expert) and `bt-*` workshops and editorials—for **Cursor** and **[Claude Code](https://code.claude.com/docs/en/plugins)**, plus a **Brain Trust MCP** server (taxonomy, experts, references).

## Install without building

You do **not** need to clone the repo or use Node/npm to **download** artifacts.

### GitHub Releases (preferred)

Open **[Releases](https://github.com/bahulneel/agent-brain-trust/releases)** and download **only** the zip you need. Files are uploaded when a release is **published**; creating or pushing a tag alone does not attach them.

| Download | For |
| -------- | --- |
| `agent-brain-trust-cursor-plugin.zip` | Cursor (skills, resources, MCP wiring) |
| `agent-brain-trust-claude-plugin.zip` | Claude Code as a plugin |
| `expert-opinion.zip`, `bt-*.zip`, … | One skill at a time |

**Standalone MCP** is only on npm as [`@bahulneel/brain-trust-mcp`](https://www.npmjs.com/package/@bahulneel/brain-trust-mcp) — `npx -y @bahulneel/brain-trust-mcp` or `npm install -g` (see [docs/install-prebuilt.md](docs/install-prebuilt.md)).

Step-by-step install (copy or `npm run install:*`, `installed_plugins.json`, `--plugin-dir`, etc.): **[docs/install-prebuilt.md](docs/install-prebuilt.md)**.

### GitHub Actions (CI or manual runs)

From **[Actions → Release](https://github.com/bahulneel/agent-brain-trust/actions/workflows/release.yml)**, open a run and download the artifact you want:

| Artifact | What you get |
| -------- | ------------- |
| `agent-brain-trust-cursor-plugin` | Cursor plugin as one zip |
| `agent-brain-trust-claude-plugin` | Claude plugin as one zip |
| `brain-trust-skill-zips` | All skill zips from that run (inside the artifact) |

**Manual “Run workflow”** builds these artifacts only—it does **not** add files to the Releases page. Prefer **Releases** for a single skill zip or a stable download. Workflow artifacts can expire; see GitHub’s retention settings.

### Skill CLI

If you run the bundled CLI (`node scripts/brain-trust-cli.js` inside a plugin or skill zip), you need **Node 20+**.

## Install from source

For contributors: **Node 20+**, npm, git.

```bash
npm install
npm run build
```

- **Cursor:** `npm run install:cursor-plugin`
- **Claude Code:** `npm run install:claude-plugin` or `claude --plugin-dir ./dist/agent-brain-trust-claude-plugin`

Then enable the plugin (and MCP if you use it) in your client.

## Using the skills

With [Agent Skills](https://agentskills.io/specification), the client usually loads only each skill’s **name** and **description** at first ([progressive disclosure](https://agentskills.io/what-are-skills#how-skills-work)); it pulls in the full `SKILL.md` when that pair looks relevant to your task. So natural-language prompts work best when they **read like the situation the description is written for**—messy tradeoffs, competing frames, specialist editorial judgement—not thin one-liners the base agent could handle without a skill protocol. Skill authors can tune triggering with the ideas in [Optimizing skill descriptions](https://agentskills.io/skill-creation/optimizing-descriptions).

You can **state your problem in ordinary language** (no skill id, no slash) and rely on description matching, or use a **slash command** where your client supports it: `/` plus the skill id when you want to **force** a specific skill.

### Skills catalog

**Natural language** — realistic, context-rich prompts (paths, stakes, disagreement). They **do not** name a skill or ask for a “workshop”; they are the sort of task where the manifest **description** should argue for attachment.

**Direct** — you name the skill with `/skill-id` so the client does not infer it.

#### expert-opinion

One drafted expert answers in a single voice—computing, design, writing, product, organisation, and related domains—when a full panel is more than you need.

Natural language:

> VP of Eng wants a one-page memo she can forward: should we split `billing-core` into its own deployable given coordination cost and blast radius—we’re not running another architecture forum this month, I need **one** strong read.

or

> Third rewrite of our public SDK README (`docs/quickstart.md`); beta integrators still DM “where does auth go?” I need a serious editorial lens on whether the structure matches how a newcomer actually reads, not another pass of bullet tweaks.

Direct (/expert-opinion):

> /expert-opinion Give me one expert’s judgment on this caching strategy—not a debate.

#### bt-software-systems-workshop

Multi-voice workshop on architecture, paradigms, abstractions, DSLs, correctness, and distributed-systems tradeoffs (Byrd, Alvaro, Sussman, Hickey, Steele, Escher).

Natural language:

> Real-time whiteboard (~50 concurrent editors): half the team is designing around CRDT merges, half wants OT + Postgres row locks—we keep recycling the same deck and nobody will pin down partition behavior or who repairs conflicts after a split brain.

or

> Compliance wants entitlements as data; I’m about to ship a YAML predicate mini-language for policy. SOC2 auditor will ask how we prove termination and auditability—I’m scared we’re embedding a little language we can’t reason about once legal adds “except when…” clauses.

Direct (/bt-software-systems-workshop):

> /bt-software-systems-workshop We’re choosing between event sourcing and a simple Postgres model—surface the real tradeoffs.

#### bt-prompt-engineering-trust

Multi-voice workshop on prompt design, agent skills, tool boundaries, and trustworthy human–machine collaboration in production (Weng, Zhou, Karpathy, Ng, Mollick).

Natural language:

> We’re rolling out a company-wide “AI playbook” but every team ships different system prompts and nobody owns eval when a bad completion reaches a customer—I need a structured debate on instruction design, guardrails, and who carries the risk.

or

> Drafting a `SKILL.md` for our deployment agent: reviewers want maximal freedom, security wants a tiny allow-listed tool surface—I’m stuck between brittle prompts and a package nobody will maintain.

Direct (/bt-prompt-engineering-trust):

> /bt-prompt-engineering-trust Stress-test this agent skill boundary—interfaces, failure modes, and org trust, not clever wording alone.

#### bt-design-patterns-workshop

Multi-voice debate on patterns, GoF-style forces, naming, and when simpler data-first designs beat pattern-heavy structure (Gamma, Helm, Johnson, Vlissides, Fowler, Hickey).

Natural language:

> `orders/` service: every story adds `IOrderRepositoryFactory`; juniors call it “clean architecture” but I can’t trace a checkout without a dozen indirections—is this still justified DDD or layered cargo-cult?

or

> Pricing engine greenfield started as plain functions; now there’s a Visitor per discount type and our domain expert can’t read the graph—I need a hard conversation on whether the shape matches the problem or we’re pattern-stacking.

Direct (/bt-design-patterns-workshop):

> /bt-design-patterns-workshop This domain model is getting gnarly—do we need more patterns or fewer?

#### bt-product-strategy-workshop

Multi-voice pressure-test on what to build next, backlog priorities, problem framing, roadmaps, and bets (Cagan, Torres, Perri, Christensen, Porter, Hansson).

Natural language:

> Board wants “Q3: growth **and** stability” on one slide with the same fourteen epics; nobody’s written what we’re explicitly **not** funding and on-call is already at two pages a week.

or

> CS keeps filing “workflow too rigid”; product has three PRDs titled “flexible workflows” with different actors—I don’t think we’ve agreed whether the pain is ops, end users, or integrations, and we’re sizing solutions anyway.

Direct (/bt-product-strategy-workshop):

> /bt-product-strategy-workshop We’re picking between two big bets for Q3—stress-test the framing and evidence.

#### bt-organisation-design-workshop

Multi-voice session on teams, authority, coordination, incentives, and whether the org shape fits the goal (Drucker, Mintzberg, Kim Scott, Lencioni, McConnell, Lanier).

Natural language:

> Org chart says PM “owns” roadmap; eng manager’s goals say “engineering-led discovery”—sprint planning turns into quiet turf wars, dates slip, and there’s still no written rule for who breaks ties on scope.

or

> Merging Team B into our platform squad Jan 1; HR drew one manager box but we still run two backlogs, two standups, and zero doc on who owns staffing tradeoffs vs. roadmap commitments vs. customer escalations.

Direct (/bt-organisation-design-workshop):

> /bt-organisation-design-workshop We’re merging two teams—surface tradeoffs in authority and feedback loops.

#### bt-frontend-ux-critique

Multi-voice UX critique: flows, wireframes, prototypes, layout, navigation, usability evidence (Zhuo, Norman, Nielsen, Cooper, Sierra, Spiekermann).

Natural language:

> Analytics: signup completes but <40% reach “create first project”; screens look polished and heatmaps aren’t obviously broken—I need a disciplined read on whether the **sequence** and affordances match a first-time job, not “try shorter copy.”

or

> Settings redesign (Figma link in ticket): eight top-level tabs; support data says 80% of tickets are API keys + billing only—I’m worried we designed for nav parity instead of the two jobs people actually hired this screen for.

Direct (/bt-frontend-ux-critique):

> /bt-frontend-ux-critique Critique this prototype—interaction quality and usability, not just aesthetics.

#### bt-visual-communication-critique

Multi-voice critique of charts, diagrams, slides, typography, and information design—integrity of the graphic, not just taste (Tufte, Escher, Spiekermann, Gleick, Sierra, Feynman).

Natural language:

> Board pack: funnel graphic trial→paid with no time axis; CFO narrates it as causal “levers” but marketing says awareness isn’t represented—I need a blunt take on whether the **graphic** implies a story the data doesn’t support.

or

> Quarterly review slide: twelve KPI sparklines, 8pt type, rainbow palette—leadership loves “one screen” density but I can’t tell if cross-quarter comparisons are even legible or statistically fair.

Direct (/bt-visual-communication-critique):

> /bt-visual-communication-critique Does this infographic honestly support the claim we’re making?

#### bt-technical-writing-editorial

Multi-voice editorial on technical prose—docs, posts, READMEs, RFCs—clarity, structure, audience (Knuth, Kernighan, Kidder, Gleick, Sierra, Adams, Fowler, Feynman).

Natural language:

> RFC-042 (internal): three pages of history before the decision; security review opened five threads the “Background” section was supposed to preempt—I need an editorial pass on **structure** (decision and asks up front), not wording polish, before rev 6.

or

> Public OpenAPI-derived reference: every field is “string, optional”; OAuth2+PKCE flow has no single worked example—support volume is all variants of “what’s the first POST?” and I suspect the doc is “complete” but unusable.

Direct (/bt-technical-writing-editorial):

> /bt-technical-writing-editorial Review this README section for clarity and structure—treat it like a serious technical publication.

#### bt-science-explanation-editorial

Multi-voice editorial on explaining science or technical concepts: analogies, intuition, honest levelling (Feynman, Gleick, Pinker, Kernighan, Knuth, Adams).

Natural language:

> All-hands Monday: explain why “read your writes” isn’t guaranteed across our multi-region Postgres topology to a mostly non-DB audience who keep asking when the “single copy” finishes syncing.

or

> Draft chapter “Async Rust for experienced Go devs”; beta readers lost at `Pin` and cancellation—title promises one sitting but I think we skipped the mental model rungs; need a cold read on whether the draft **teaches** what it claims.

Direct (/bt-science-explanation-editorial):

> /bt-science-explanation-editorial This draft explains CRDTs to engineers—sharpen analogies without dumbing down.

## MCP

**Published plugin zips** ship **`.mcp.json`** that runs the server via **`npx -y`** and a pinned package spec such as **`@bahulneel/brain-trust-mcp@x.y.z`** (see the generated `.mcp.json` in the zip). The process resolves **`resources/`** via **`BRAIN_TRUST_RESOURCES`** when set, or next to the npm-installed entry (see package README). Put the unpacked plugin at **`~/.cursor/plugins/local/agent-brain-trust`** as usual.

There is **no** checked-in Cursor project MCP config—use the **plugin’s** `.mcp.json` (after install or from the built zip), **`npx -y @bahulneel/brain-trust-mcp`**, or your own **user-level** MCP entry if you need a custom command ([docs/build.md](docs/build.md)).

For MCP **without** a plugin, install from npm: **`@bahulneel/brain-trust-mcp`**, or run **`npm run build`** and run **`packages/brain-trust-mcp/dist/brain-trust-mcp.js`** locally ([docs/install-prebuilt.md](docs/install-prebuilt.md), [docs/build.md](docs/build.md)).

## Documentation

| Doc | Purpose |
| --- | ------- |
| [docs/install-prebuilt.md](docs/install-prebuilt.md) | Prebuilt install details |
| [docs/README.md](docs/README.md) | Index of technical docs |
| [docs/build.md](docs/build.md) | Build, validation, release workflow |
| [docs/repository-layout.md](docs/repository-layout.md) | Repo layout |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Authoring experts, topics, and panel skills |

## Licence

MIT (unless you specify otherwise).
