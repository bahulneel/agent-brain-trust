/**
 * Assemble the RPL bot system prompt from the language closure
 * (instantiation RPL) plus the metacognitive kernel essay.
 *
 * Usage:
 *   npx tsx scripts/assemble-rpl-bot-prompt.ts
 *   npx tsx scripts/assemble-rpl-bot-prompt.ts --out path.md
 *
 * The generated file is a prompt, not a language source. Authority stays
 * under docs/. See docs/rpl/bots/rpl-bot.md.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { load } from "../tests/support/content.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const HEADER = `# RPL bot system prompt

This file is assembled from the **RPL** language closure
(\`fol\`, \`rpl\`, \`rpl-source\`, \`rpl-runtime\`, \`agent\`) and the
metacognitive kernel essay. It is a generated prompt, not a language
source. If a layer and a normative section disagree, the specification
wins. See docs/rpl/bots/rpl-bot.md and docs/rpl/language-bootstrap.md.
`;

const ROLE = `## Role (test bot)

You are the RPL bot, a test agent used to exercise the metacognitive
kernel and to observe its habits.

The intended production posture keeps RPL invisible to the end user.
This test posture is different: when a metacognitive habit fires, make
it visible in the reply. Name distinct intents. Name the invariant you
checked. Name a context-stack push or pop (or an equivalent return to
the primary objective). Say when you yield for the user. Say when
confidence is limited because ground is missing.

Do not contradict a law in a taken layer. Do not invent trace facts
you were not given. Where the language does not pin a unique answer,
treat the choice as judgment and say so.
`;

export function assembleRplBotSystemPrompt(): string {
  const closure = load("rplEager");
  const mck = readFileSync(join(ROOT, "docs/rpl/agent-mck.md"), "utf8");
  const layers = Object.keys(closure.files).sort((a, b) => {
    const order = [
      "docs/rpl/bootstrap/fol.md",
      "docs/rpl/bootstrap/rpl.md",
      "docs/rpl/bootstrap/rpl-source.md",
      "docs/rpl/bootstrap/rpl-runtime.md",
      "docs/rpl/bootstrap/agent.md",
    ];
    return order.indexOf(a) - order.indexOf(b);
  });

  const parts = [
    HEADER.trimEnd(),
    "",
    ROLE.trimEnd(),
    "",
    "## Language closure (instantiation RPL)",
    "",
    `Loaded in order: ${layers.join(", ")}.`,
    "",
    closure.text.trimEnd(),
    "",
    "---",
    "",
    "## Metacognitive kernel (not a layer)",
    "",
    "The following essay is not a language layer. It describes the habits under test.",
    "",
    mck.trimEnd(),
    "",
  ];
  return parts.join("\n");
}

function main(): void {
  const argv = process.argv.slice(2);
  const outIdx = argv.indexOf("--out");
  const text = assembleRplBotSystemPrompt();
  if (outIdx === -1) {
    process.stdout.write(text);
    if (!text.endsWith("\n")) process.stdout.write("\n");
    return;
  }
  const dest = argv[outIdx + 1];
  if (!dest) {
    console.error("usage: npx tsx scripts/assemble-rpl-bot-prompt.ts [--out path.md]");
    process.exit(2);
  }
  const path = resolve(dest);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text.endsWith("\n") ? text : `${text}\n`, "utf8");
}

const entry = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : "";
if (import.meta.url === entry) {
  main();
}
