# Technical documentation

This folder holds workspace-oriented guides: how the repository is laid out, how to build and validate, and how to install **without** building. For a short usage overview, see the root [README.md](https://github.com/bahulneel/agent-brain-trust/blob/main/README.md). For **authoring** experts, topics, and panel skills, see [CONTRIBUTING.md](https://github.com/bahulneel/agent-brain-trust/blob/main/CONTRIBUTING.md).

- [Documentation site home](index.md) — Jekyll `layout: page` entry and browse links for the published docs site
- [Install prebuilt (no local build)](install-prebuilt.md) — download release zip, Cursor / Claude Code / MCP / skill zips
- [Repository layout](repository-layout.md) — `content/`, `packages/`, and build entrypoints
- [Build and validation](build.md) — commands, `dist/` outputs, `skills-ref`, local Claude Code
- [RPL language overview](rpl/README.md) — entry point, worked example, and document map
- [RPL language bootstrap](rpl/language-bootstrap.md) — named layers (`fol`, `rpl`, `lrpl`, …); living language definition is under `docs/rpl/`
- [RPL release prompt artifact](https://github.com/bahulneel/agent-brain-trust/blob/main/content/RPL.md) — shipped eager prompt source; may lag the specs
- [LRPL release prompt artifact](https://github.com/bahulneel/agent-brain-trust/blob/main/content/LRPL.md) — shipped lazy prompt source; may lag the specs
- [RPL base specification](rpl/specification/rpl.md) — syntax, semantics, execution model, and grammar
- [LRPL specification](rpl/specification/lrpl.md) — lazy extension delta
