# RPL in Enterprise Contexts

This document clarifies where RPL fits in enterprise environments, and where it
does not.

---

## What RPL Is Not For

RPL is not a long-running runtime substrate for enterprise systems.

Do not use RPL as:

- a replacement for production workflow engines,
- a mission-critical control loop executor,
- an always-on orchestration fabric for business services.

RPL does not provide enterprise runtime guarantees such as durability,
scheduling, transactional isolation, high-availability failover, or operational
SLO enforcement.

---

## What RPL Is For

RPL is useful as HCI (human-computer interaction) between colleagues and
business systems.

Use it to give conversational work a shared semantic layer so agents can explain
state, connect related artifacts, and answer "why did you do that?" with
inspectable structure.

Typical fit:

- business process descriptions,
- data silos and internal taxonomies,
- training material and policy docs,
- org charts and role boundaries,
- API descriptions and integration playbooks,
- HR process documentation.

In these settings, RPL helps the model stitch information together and query
across domains in ways plain prompt prose often cannot sustain reliably.

---

## Practical Mental Model

RPL is like semantic markup for conversational systems.

A casual reader may only see normal Markdown instructions. But when an
RPL-capable agent reads the same document, relations, constraints, and goals
become explicit structure that the model can reason over, inspect, and discuss.

---

## Authoring Approach

Authoring should be iterative:

1. Add a short RPL interpreter note to system or project instructions, then
   attach relation heads on the task prompt only where ambiguity or drift appears.
2. Run the conversation and observe behavior.
3. Ask the agent to explain current state and reasoning path.
4. Repair or harden prose and constraints.
5. Repeat until behavior is robust enough for the use case.

This is collaborative prompt engineering, not one-shot specification design.
