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
| `agent-brain-trust-mcp.zip` | Standalone MCP only |
| `expert-opinion.zip`, `bt-*.zip`, … | One skill at a time |

Step-by-step install (symlinks, `installed_plugins.json`, `--plugin-dir`, etc.): **[docs/install-prebuilt.md](docs/install-prebuilt.md)**.

### GitHub Actions (CI or manual runs)

From **[Actions → Release](https://github.com/bahulneel/agent-brain-trust/actions/workflows/release.yml)**, open a run and download the artifact you want:

| Artifact | What you get |
| -------- | ------------- |
| `agent-brain-trust-cursor-plugin` | Cursor plugin as one zip |
| `agent-brain-trust-claude-plugin` | Claude plugin as one zip |
| `agent-brain-trust-mcp` | MCP package as one zip |
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

[Agent Skills](https://agentskills.io/specification) clients use each skill’s **name** and **description** in the manifest to decide when to attach it. You can **state your problem in ordinary language**—no skill id, no slash—and a good match on task and domain is often enough for the right skill to be selected. When you want a **specific** skill regardless of matching, use a **slash command** (where your client supports it): start the message with `/` plus the skill id.

### Skills catalog

**Natural language** — examples written as real tasks. They deliberately **do not** name a skill or ask for a “workshop” or “panel”; they describe the situation so description-based selection can attach the right skill.

**Direct** — explicit direction: you name the skill with `/skill-id` so the client does not have to infer it.

#### expert-opinion

One drafted expert answers in a single voice—computing, design, writing, product, organisation, and related domains—when a full panel is more than you need.

Natural language:

> The team can’t agree whether to carve this bounded context into its own service—I want one sharp read on the tradeoff, not a roundtable.

or

> I’ve rewritten the install section three times; it still doesn’t read right for someone who’s never touched our stack.

Direct (/expert-opinion):

> /expert-opinion Give me one expert’s judgment on this caching strategy—not a debate.

#### bt-software-systems-workshop

Multi-voice workshop on architecture, paradigms, abstractions, DSLs, correctness, and distributed-systems tradeoffs (Byrd, Alvaro, Sussman, Hickey, Steele, Escher).

Natural language:

> We’re deadlocked on CRDTs versus last-write-wins for this collaborative doc feature—assumptions about correctness and ops keep talking past each other.

or

> I need to sketch a small DSL for policy rules; I’m worried we’ll bake in a paradigm we’ll regret once the edge cases show up.

Direct (/bt-software-systems-workshop):

> /bt-software-systems-workshop We’re choosing between event sourcing and a simple Postgres model—surface the real tradeoffs.

#### bt-design-patterns-workshop

Multi-voice debate on patterns, GoF-style forces, naming, and when simpler data-first designs beat pattern-heavy structure (Gamma, Helm, Johnson, Vlissides, Fowler, Hickey).

Natural language:

> Every new feature gets another repository interface and a factory; I’m not sure that layering is still buying us clarity.

or

> This domain is turning into a forest of small objects and visitors—maybe that’s right, maybe we’re pattern-chasing.

Direct (/bt-design-patterns-workshop):

> /bt-design-patterns-workshop This domain model is getting gnarly—do we need more patterns or fewer?

#### bt-product-strategy-workshop

Multi-voice pressure-test on what to build next, backlog priorities, problem framing, roadmaps, and bets (Cagan, Torres, Perri, Christensen, Porter, Hansson).

Natural language:

> Leadership wants growth work and reliability work in the same quarter; the roadmap slide doesn’t show what we’re *not* doing.
>
> We’ve already sketched three solutions—I’m not convinced we’ve nailed the problem we’re actually solving for customers.

Direct (/bt-product-strategy-workshop):

> /bt-product-strategy-workshop We’re picking between two big bets for Q3—stress-test the framing and evidence.

#### bt-organisation-design-workshop

Multi-voice session on teams, authority, coordination, incentives, and whether the org shape fits the goal (Drucker, Mintzberg, Kim Scott, Lencioni, McConnell, Lanier).

Natural language:

> PM and engineering lead both think they own prioritisation; commitments slip and nobody will write the rule down.

or

> We’re merging two squads next month; staffing, roadmap, and escalations still have two competing stories.

Direct (/bt-organisation-design-workshop):

> /bt-organisation-design-workshop We’re merging two teams—surface tradeoffs in authority and feedback loops.

#### bt-frontend-ux-critique

Multi-voice UX critique: flows, wireframes, prototypes, layout, navigation, usability evidence (Zhuo, Norman, Nielsen, Cooper, Sierra, Spiekermann).

Natural language:

> Signup completes but half of new users never reach the first “aha” screen—the screens look polished, so I’m not sure what’s wrong.

or

> Here’s our settings IA with eight sections; I’m worried we’re hiding the two tasks people actually came for.

Direct (/bt-frontend-ux-critique):

> /bt-frontend-ux-critique Critique this prototype—interaction quality and usability, not just aesthetics.

#### bt-visual-communication-critique

Multi-voice critique of charts, diagrams, slides, typography, and information design—integrity of the graphic, not just taste (Tufte, Escher, Spiekermann, Gleick, Sierra, Feynman).

Natural language:

> This funnel is what we show the board; the steps aren’t causal but the visual implies a pipeline story.

or

> We have twelve metrics on one slide—legibility is suffering and I’m not sure the comparison is honest.

Direct (/bt-visual-communication-critique):

> /bt-visual-communication-critique Does this infographic honestly support the claim we’re making?

#### bt-technical-writing-editorial

Multi-voice editorial on technical prose—docs, posts, READMEs, RFCs—clarity, structure, audience (Knuth, Kernighan, Kidder, Gleick, Sierra, Adams, Fowler, Feynman).

Natural language:

> This RFC buries the actual decision under three pages of background; reviewers are asking questions the doc was supposed to answer upfront.

or

> Our public API reference lists every field but reads like compliance copy—developers still Slack us for “how do I actually…?”

Direct (/bt-technical-writing-editorial):

> /bt-technical-writing-editorial Review this README section for clarity and structure—treat it like a serious technical publication.

#### bt-science-explanation-editorial

Multi-voice editorial on explaining science or technical concepts: analogies, intuition, honest levelling (Feynman, Gleick, Pinker, Kernighan, Knuth, Adams).

Natural language:

> I’m explaining eventual consistency to PMs who keep picturing a single database that “eventually catches up.”

or

> This tutorial promises “async Rust in twenty minutes”; I’m worried we’re skipping the mental model readers actually need.

Direct (/bt-science-explanation-editorial):

> /bt-science-explanation-editorial This draft explains CRDTs to engineers—sharpen analogies without dumbing down.

## MCP

Full plugins ship **`.mcp.json`** and **`scripts/mcp-server.js`**. Configure the server in your client’s MCP settings.

For MCP **without** a plugin, use **`agent-brain-trust-mcp.zip`** from Releases or **`dist/agent-brain-trust-mcp/`** after a local build ([docs/install-prebuilt.md](docs/install-prebuilt.md), [docs/build.md](docs/build.md)).

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
