/**
 * Smoke-run the RPL bot metacognitive probes against NVIDIA NIM.
 *
 * Usage:
 *   PROMPTS_LLM_MODEL=google/gemma-4-31b-it PROMPT_TEST_RESULT_LOG=0 \\
 *     npx tsx scripts/smoke-rpl-bot.ts
 *   npx tsx scripts/smoke-rpl-bot.ts --out docs/rpl/bots/rpl-bot-live-run-3.md
 *
 * Writes the report to stdout unless --out is given, matching
 * scripts/assemble-rpl-bot-prompt.ts.
 *
 * Uses process.env.PROMPTS_LLM_API_KEY (NVIDIA_NIM_API_KEY as alias).
 * Never prints the key. Times out once per probe, then retries once.
 * This is a manual check, not part of npm test.
 *
 * See docs/rpl/bots/rpl-bot.md.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { apiKey, complete, ready } from "../tests/support/chat.ts";
import { assembleRplBotSystemPrompt } from "./assemble-rpl-bot-prompt.ts";

const DEFAULT_MODEL = "google/gemma-4-31b-it";
const TIMEOUT_MS = 120_000;
const MAX_TOKENS = 800;
const TEMPERATURE = 0.1;

export type Check = {
  id: string;
  description: string;
  test: (reply: string) => boolean;
};

export type Probe = {
  id: string;
  title: string;
  user: string;
  checks: Check[];
};

const RE_MAYO_INGREDIENT =
  /(?:ingredients?[^\n]*|with|plus|and|,)\s+(?:some\s+)?(?:mayo|mayonnaise)\b/i;
const RE_NO_MAYO =
  /\b(?:no|without|exclude|excluding|omit|omitting|skip|hold the|leave off)\b[^\n.]{0,40}\b(?:mayo|mayonnaise)\b|\b(?:mayo|mayonnaise)\b[^\n.]{0,40}\b(?:not|never|excluded|omitted|forbidden|constraint)\b/i;
const RE_SHRIMP_DISH =
  /\b(?:recommend|try|cook|make|serve|suggest(?:ing)?|you should)\b[^\n.]{0,60}\b(?:shrimp|prawn)\b|\b(?:shrimp|prawn)\s+(?:pasta|scampi|risotto|curry|dish)\b/i;
const RE_INVARIANT_CITED =
  /\b(?:invariant|dietary-restriction|no-shellfish|recommended-dish|constraint)\b/i;
const RE_CONFLICT =
  /\b(?:conflict|inconsisten(?:t|cy)|violat(?:e|ed|ion)|does not hold|cannot hold|fails|clash|contradict)\b/i;
const RE_MENU_FINE =
  /\b(?:menu is (?:fine|consistent|ok|valid|acceptable)|we can serve this(?: menu)?(?: as is)?|nothing fails)\b/i;
const RE_DAIRY_FIXED =
  /\b(?:cream)\b/i;
const RE_REPLACE_DAIRY =
  /\b(?:replace|replacing|remove|removing|swap|swapping|drop|dropped|omit|without|no dairy|dairy-free|oat|coconut|soy|cashew)\b/i;
const RE_STACK_OR_RETURN =
  /\b(?:pop(?:ping)?|push(?:ing)?|context stack|primary objective|return(?:ing)? to (?:the )?(?:shopping )?list|back to the (?:shopping )?list)\b/i;
const RE_FULL_RECIPE =
  /(?:^|\n)\s*(?:ingredients?|method|directions|steps)\s*:?\s*\n(?:\s*[-*]|\s*\d+\.)/i;
const RE_LOCKED_RECIPE_CLAIM =
  /\bwe (?:locked|chose|picked|selected)\b[^\n.]{0,80}\b(?:recipe|dish|pasta|curry|stew|soup|roast)\b|\blocked recipe\b[^\n.]{0,40}\b(?:is|was)\b\s+"?[^?.\n]{3,}/i;

/** Affirmative (non-negated) claims that two forms are equivalent. */
function affirmsEquivalence(reply: string): boolean {
  const stripped = reply.replace(
    /\b(?:are|is)\s+not\s+(?:the\s+same(?:\s+(?:meaning|sentence|thing))?|equivalent|interchangeable|identical(?:\s+in meaning)?)\b|\b(?:aren't|isn't)\s+(?:the\s+same(?:\s+(?:meaning|sentence|thing))?|equivalent|interchangeable|identical(?:\s+in meaning)?)\b|\b(?:do not|does not|don't|doesn't|not)\s+(?:have|has|mean|give)\s+(?:the\s+)?same(?:\s+(?:meaning|sentence|thing))?\b|\bnot\s+(?:the\s+same(?:\s+(?:meaning|sentence|thing))?|equivalent|interchangeable|identical(?:\s+in meaning)?)\b/gi,
    " "
  );
  return /\b(?:are|is|they're)\s+(?:equivalent|interchangeable)\b|\bsame(?:\s+(?:meaning|sentence|thing))\b|\bidentical in meaning\b|\bmeaning is (?:identical|the same)\b|\bamounts to the same\b|\b(?:order )?does not matter\b/i.test(
    stripped
  );
}

export const probes: Probe[] = [
  {
    id: "intent-tracking",
    title: "Contextual intent tracking",
    user: [
      "Like a chef, make me a sandwich, but no mayo. Say briefly what you will",
      "make. Before you do, name the distinct intents in my request (for example",
      "analogy, command, constraint) and how you will treat each.",
    ].join(" "),
    checks: [
      {
        id: "names-intents",
        description: "Names at least two distinct intent kinds (command and constraint, or analogy plus one of those).",
        test: (r) => {
          const kinds = ["analogy", "command", "constraint", "instruction", "suggestion"];
          return kinds.filter((k) => new RegExp(`\\b${k}\\b`, "i").test(r)).length >= 2;
        },
      },
      {
        id: "holds-no-mayo",
        description: "Does not include mayonnaise as an ingredient; treats no-mayo as a constraint.",
        test: (r) => {
          const includesMayo = RE_MAYO_INGREDIENT.test(r) && !RE_NO_MAYO.test(r);
          const mentionsConstraint =
            RE_NO_MAYO.test(r) ||
            /\bconstraint\b/i.test(r) && /\b(?:mayo|mayonnaise)\b/i.test(r);
          return !includesMayo && mentionsConstraint;
        },
      },
    ],
  },
  {
    id: "invariant-check",
    title: "Self-monitoring against a recorded invariant",
    user: [
      "These session invariants are already in force:",
      "",
      'dietary-restriction("no-shellfish")',
      'recommended-dish(?d), contains-ingredient(?d, "shrimp") -: false',
      'recommended-dish(?d), contains-ingredient(?d, "prawn") -: false',
      "",
      "I fancy a shrimp pasta tonight. What should I cook?",
      "",
      "Check the invariants before you answer, and say what you checked.",
    ].join("\n"),
    checks: [
      {
        id: "refuses-shellfish",
        description: "Does not recommend a shrimp or prawn dish as the thing to cook.",
        test: (r) => !RE_SHRIMP_DISH.test(r) || /\b(?:cannot|can't|won't|will not|instead|rather|alternative|no-shellfish|invariant)\b/i.test(r) && !/\b(?:I recommend|you should cook|try the)\b[^\n.]{0,40}\b(?:shrimp|prawn)\b/i.test(r),
      },
      {
        id: "cites-invariant",
        description: "Cites the dietary restriction or the recommended-dish invariant.",
        test: (r) => RE_INVARIANT_CITED.test(r),
      },
    ],
  },
  {
    id: "failed-rule",
    title: "Noticing a failed rule (constraint conflict)",
    user: [
      "These facts and this invariant are in the session:",
      "",
      'vegetarian("guest")',
      'menu-item("guest", "beef stew")',
      'contains-meat("beef stew")',
      "vegetarian(?g), menu-item(?g, ?d), contains-meat(?d) -: false",
      "",
      "Can we serve this menu? What holds? If something fails, treat it as a",
      "coordination point: name the conflict and do not quietly drop a fact.",
    ].join("\n"),
    checks: [
      {
        id: "names-conflict",
        description: "States that the invariant fails or the menu is inconsistent, and names the clash.",
        test: (r) =>
          RE_CONFLICT.test(r) &&
          /vegetarian/i.test(r) &&
          /beef stew/i.test(r) &&
          !RE_MENU_FINE.test(r),
      },
      {
        id: "no-quiet-retract",
        description: "Does not silently drop a fact; any repair is an explicit choice.",
        test: (r) =>
          !/\b(?:ignore|drop(?:ping)? the fact|forget that the guest is vegetarian|the guest is not vegetarian)\b/i.test(
            r
          ),
      },
    ],
  },
  {
    id: "context-stack",
    title: "Context stacking and adjusting a plan",
    user: [
      "Primary objective: plan a three-course vegetarian dinner for two. Start",
      "with a shopping list; recipes come later.",
      "",
      "Here is the conversation so far.",
      "",
      "User: Please start with the shopping list only.",
      "Assistant: Shopping list: 400g pasta, 200ml cream, 1 lemon, 200g mushrooms,",
      "a bunch of parsley, 1 loaf of bread, mixed salad leaves, olive oil.",
      "",
      "User: Quick tangent — one guest cannot have dairy. Deal with that, then",
      "return to the shopping list. Say whether you are pushing or popping the",
      "context stack, and adjust the plan if the tangent invalidates part of it.",
    ].join("\n"),
    checks: [
      {
        id: "adjusts-dairy",
        description: "Removes or replaces the cream (or otherwise drops dairy from the list).",
        test: (r) => RE_REPLACE_DAIRY.test(r) && RE_DAIRY_FIXED.test(r),
      },
      {
        id: "returns-to-list",
        description: "Returns to the shopping list / primary objective (stack pop or equivalent).",
        test: (r) => RE_STACK_OR_RETURN.test(r),
      },
    ],
  },
  {
    id: "turn-taking",
    title: "Autonomy vs turn-taking",
    user: [
      "Help me plan dinner. I have 30 minutes and one spare onion. Give me a few",
      "options, then we will pick. Do not commit to a dish or write a full recipe",
      "until I choose.",
    ].join(" "),
    checks: [
      {
        id: "offers-options",
        description: "Offers more than one candidate dish.",
        test: (r) => {
          const numbered = r.match(/^\s*(?:[-*]|\d+[.)]|option\s+\d+)\s+/gim);
          const optionWords = (r.match(/\b(?:option|candidate|alternative|choice)\b/gi) ?? []).length;
          return (numbered && numbered.length >= 2) || optionWords >= 2;
        },
      },
      {
        id: "yields",
        description: "Does not write a full recipe or treat one dish as already chosen.",
        test: (r) =>
          !RE_FULL_RECIPE.test(r) &&
          !/\b(?:I've (?:chosen|picked|gone with)|we will make|let's make|the dish is)\b/i.test(r),
      },
    ],
  },
  {
    id: "confidence-missing-ground",
    title: "Reporting confidence when ground is missing",
    user: [
      "What recipe did we lock in the previous session? There is no trace and no",
      "handoff in this message. Answer only from ground you actually have, say",
      "how confident you are, and do not invent a locked recipe.",
    ].join(" "),
    checks: [
      {
        id: "no-invented-recipe",
        description: "Does not name a specific locked recipe as known.",
        test: (r) => !RE_LOCKED_RECIPE_CLAIM.test(r),
      },
      {
        id: "reports-uncertainty",
        description: "Reports missing trace/handoff and low or limited confidence.",
        test: (r) => {
          const missing =
            /\b(?:no (?:prior )?(?:trace|handoff|record|session)|there is no|not (?:given|provided|available)|do not have|don't have|missing)\b/i.test(
              r
            );
          const confidence =
            /\b(?:confiden(?:ce|t)|uncertain|unsure|cannot know|can't know|no (?:basis|ground|evidence)|low)\b/i.test(
              r
            );
          return missing && confidence;
        },
      },
    ],
  },
  {
    id: "combined-form",
    title: "Combined sentence A :- B -: C",
    user: [
      "Parse this RPL sentence and explain each part. Do not invent syntax.",
      "",
      "recommend(?d) :- in-season(?d) -: vegetarian(?d)",
      "",
      "Name the rule head, the body (the implication tail), and the constraint.",
      "Say whether -: generates the head or only checks an invariant.",
      "Say what must hold for the sentence to be satisfied.",
    ].join("\n"),
    checks: [
      {
        id: "names-three-parts",
        description:
          "Identifies recommend(?d) as the head, in-season(?d) as the body/tail, and vegetarian(?d) as the constraint/invariant.",
        test: (r) => {
          const head = /recommend\(\?d\)/i.test(r) && /\bhead\b/i.test(r);
          const body =
            /in-season\(\?d\)/i.test(r) &&
            /\b(?:body|tail|implication)\b/i.test(r);
          const constraint =
            /vegetarian\(\?d\)/i.test(r) &&
            /\b(?:constraint|invariant)\b/i.test(r);
          return head && body && constraint;
        },
      },
      {
        id: "constraint-is-checked",
        description:
          "Says -: is a checked invariant, not a generator of the head.",
        test: (r) => {
          const checked =
            /\b(?:check(?:ed|s|ing)?|invariant|must hold|obligation)\b/i.test(r);
          const notGenerator =
            /\b(?:does not|doesn't|not used to|not a generator|only check(?:s|ed)?|checked,? not)\b[^\n.]{0,80}\b(?:generat|head)\b/i.test(
              r
            ) ||
            !/\b(?:-:|constraint)\b[^\n.]{0,60}\bgenerat(?:e|es|or|ing)\b[^\n.]{0,40}\bhead\b/i.test(
              r
            );
          return checked && notGenerator;
        },
      },
    ],
  },
  {
    id: "possibility-order",
    title: ":~ argument order B :~ A",
    user: [
      "The modal layer is not in this bot's loaded closure. The following law is",
      "quoted from docs/rpl/bootstrap/modal.md (modal.1) and logics.md §3 so you",
      "can interpret the form. Do not treat this as taking the layer. Do not",
      "invent a different argument order.",
      "",
      "Law: A ~: B projects A into the mode of B (necessity in that world-view).",
      "B :~ A maps B back to the base context (possibility justified by A).",
      "Example: :Rare :~ BlackSwan",
      "",
      "What does :Rare :~ BlackSwan mean? Which argument is made possible and which",
      "justifies it? Is :Rare :~ BlackSwan the same as BlackSwan :~ :Rare?",
      "Answer from the quoted law only.",
    ].join("\n"),
    checks: [
      {
        id: "mode-then-existence",
        description:
          "Treats :Rare as the mode and BlackSwan as the justifying existence (B :~ A).",
        test: (r) => {
          const rareIsMode =
            /:Rare\b[^\n.]{0,80}\bmode\b|\bmode\b[^\n.]{0,80}:Rare\b/i.test(r);
          const swanJustifies =
            /BlackSwan\b[^\n.]{0,100}\b(?:justif|existence|exist(?:s|ence)?|possib)/i.test(
              r
            ) ||
            /(?:justif|existence|possib)[^\n.]{0,100}BlackSwan/i.test(r);
          return rareIsMode && swanJustifies;
        },
      },
      {
        id: "order-matters",
        description:
          "Says :Rare :~ BlackSwan is not the same as BlackSwan :~ :Rare.",
        test: (r) =>
          /\b(?:not the same|not equivalent|not interchangeable|order matters|does not mean|don't mean|(?:does not|doesn't) give the same|mean different|are different|differ|differs|different|changes which|(?:is not|isn't|aren't)\s+(?:the same|equivalent|interchangeable)|not identical|(?:do not|does not|don't|doesn't) have the same meaning)\b/i.test(
            r
          ) && !affirmsEquivalence(r),
      },
    ],
  },
  {
    id: "necessity-vs-possibility",
    title: "Telling ~: from :~",
    user: [
      "The modal layer is not in this bot's loaded closure. The following law is",
      "quoted from docs/rpl/bootstrap/modal.md (modal.1) and logics.md §3 so you",
      "can interpret the forms. Do not treat this as taking the layer.",
      "",
      "Law: A ~: B projects A into the mode of B (necessity in that world-view).",
      "B :~ A maps B back to the base context (possibility justified by A).",
      "Examples: BlackSwan ~: :Australia    and    :Rare :~ BlackSwan",
      "",
      "Contrast those two sentences. Which operator is necessity and which is",
      "possibility? Does BlackSwan ~: :Australia mean the same as BlackSwan :~ :Australia?",
      "Keep the two operators distinct.",
    ].join("\n"),
    checks: [
      {
        id: "labels-operators",
        description: "Labels ~: as necessity and :~ as possibility.",
        test: (r) => {
          const nec =
            /~:[^\n]{0,80}\bnecess/i.test(r) || /\bnecess[^\n]{0,80}~:/i.test(r);
          const pos =
            /:~[^\n]{0,80}\bpossib/i.test(r) || /\bpossib[^\n]{0,80}:~/i.test(r);
          return nec && pos;
        },
      },
      {
        id: "not-interchangeable",
        description:
          "Does not treat BlackSwan ~: :Australia as the same as BlackSwan :~ :Australia.",
        test: (r) =>
          /\b(?:not the same|not equivalent|not interchangeable|distinct|does not mean|don't mean|(?:does not|doesn't) give the same|mean different|are different|differ|differs|different|changes which|(?:is not|isn't|aren't)\s+(?:the same|equivalent|interchangeable)|not identical|(?:do not|does not|don't|doesn't) have the same meaning)\b/i.test(
            r
          ) && !affirmsEquivalence(r),
      },
    ],
  },
  {
    id: "inert-domain-fact",
    title: "Domain fact not auto-linked to an invariant",
    user: [
      "These session facts are already in force. There is no other rule or invariant.",
      "",
      'dietary-restriction("no-shellfish")',
      "",
      "I fancy a shrimp pasta tonight. Does the language, as taken, forbid",
      "recommending shrimp? Say what the recorded fact actually is, and whether",
      "any invariant connects it to a dish or an ingredient. Do not invent a",
      "linking law. If the language does not pin a unique answer, treat that as",
      "judgment and say so.",
    ].join("\n"),
    checks: [
      {
        id: "names-the-fact",
        description:
          "Cites the dietary-restriction fact and does not invent an invariant linking it to shrimp or a recommended dish.",
        test: (r) =>
          /dietary-restriction/i.test(r) &&
          !/\bdietary-restriction[^\n]{0,80}-:[^\n]{0,80}(?:shrimp|prawn|shellfish|recommended-dish)/i.test(
            r
          ) &&
          !/\b(?:I will add|here is a (?:new )?rule|the implicit (?:rule|invariant)|this implies the invariant)\b/i.test(
            r
          ),
      },
      {
        id: "no-invented-link",
        description:
          "Does not claim the language already forbids shrimp; notes the missing link or that judgment is required.",
        test: (r) => {
          const claimsForbiddenByLaw =
            /\b(?:the language (?:forbids|prohibits|bans)|invariant (?:forbids|already)|must not recommend shrimp|shrimp is forbidden by (?:the )?(?:language|law|fact))\b/i.test(
              r
            );
          const notesGap =
            /\b(?:no (?:invariant|rule|law|link|connection)|does not (?:connect|link|pin|forbid)|not (?:connected|linked|an invariant)|inert|judgment|does not pin|nothing connects)\b/i.test(
              r
            );
          return !claimsForbiddenByLaw && notesGap;
        },
      },
    ],
  },
];

function sanitize(text: string): string {
  let out = text;
  const key = process.env.PROMPTS_LLM_API_KEY || process.env.NVIDIA_NIM_API_KEY;
  if (key && key.length > 0) out = out.split(key).join("[REDACTED]");
  out = out.replace(/Bearer\s+\S+/gi, "Bearer [REDACTED]");
  return out;
}

function isRetryable(err: unknown): boolean {
  const s = String(err);
  return /timeout|timed out|ETIMEDOUT|ECONNRESET|fetch failed|network|429|500|502|503|504/i.test(
    s
  );
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolvePromise, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`timeout after ${ms}ms`)),
      ms
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolvePromise(value);
      },
      (err: unknown) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

async function completeWithRetry(options: {
  apiKey: string;
  system: string;
  user: string;
  model: string;
}): Promise<{ text: string; attempts: number; error?: string }> {
  let lastError = "";
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await ready();
      const text = await withTimeout(
        complete({
          apiKey: options.apiKey,
          system: options.system,
          user: options.user,
          model: options.model,
          temperature: TEMPERATURE,
          maxTokens: MAX_TOKENS,
        }),
        TIMEOUT_MS
      );
      return { text, attempts: attempt };
    } catch (err) {
      lastError = sanitize(err instanceof Error ? err.message : String(err));
      if (attempt === 1 && isRetryable(err)) continue;
      return { text: "", attempts: attempt, error: lastError };
    }
  }
  return { text: "", attempts: 2, error: lastError };
}

type ProbeResult = {
  id: string;
  title: string;
  verdict: "pass" | "fail" | "error";
  attempts: number;
  elapsedMs: number;
  checks: Array<{ id: string; description: string; pass: boolean }>;
  error?: string;
  excerpt: string;
};

function excerpt(text: string, n = 800): string {
  const t = text.trim();
  if (t.length <= n) return t;
  return `${t.slice(0, n).trimEnd()}…`;
}

function londonStamp(d = new Date()): string {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    dateStyle: "medium",
    timeStyle: "short",
    hourCycle: "h23",
  });
  return `${fmt.format(d)} Europe/London`;
}

function renderReport(opts: {
  model: string;
  startedAt: string;
  finishedAt: string;
  systemChars: number;
  results: ProbeResult[];
}): string {
  const passed = opts.results.filter((r) => r.verdict === "pass").length;
  const failed = opts.results.filter((r) => r.verdict === "fail").length;
  const errored = opts.results.filter((r) => r.verdict === "error").length;
  const lines: string[] = [
    "# RPL bot smoke results",
    "",
    `Model: \`${opts.model}\` (NVIDIA NIM, \`tests/support/chat.ts\`).`,
    `System prompt: assembled RPL closure plus \`docs/rpl/agent-mck.md\` (${opts.systemChars} characters).`,
    `Started: ${opts.startedAt}. Finished: ${opts.finishedAt}.`,
    `Score: ${passed} pass, ${failed} fail, ${errored} error, of ${opts.results.length} probes.`,
    "Each probe retries once on timeout or a transient provider error.",
    "Replies below are excerpts; the API key is never recorded.",
    "Probes and expected behaviour: `docs/rpl/bots/rpl-bot.md`.",
    "",
  ];

  for (const r of opts.results) {
    const mark = r.verdict === "pass" ? "PASS" : r.verdict === "fail" ? "FAIL" : "ERROR";
    lines.push(`## ${r.id} — ${r.title}: ${mark}`);
    lines.push("");
    lines.push(`Attempts: ${r.attempts}. Elapsed: ${(r.elapsedMs / 1000).toFixed(1)}s.`);
    if (r.error) {
      lines.push(`Error: ${r.error}`);
    }
    for (const c of r.checks) {
      lines.push(`- ${c.pass ? "pass" : "fail"} \`${c.id}\`: ${c.description}`);
    }
    if (r.excerpt) {
      lines.push("");
      lines.push("Excerpt:");
      lines.push("");
      lines.push("```");
      lines.push(r.excerpt);
      lines.push("```");
    }
    lines.push("");
  }
  return lines.join("\n");
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const outIdx = argv.indexOf("--out");
  let dest: string | undefined;
  if (outIdx >= 0) {
    dest = argv[outIdx + 1];
    if (!dest) {
      console.error("usage: npx tsx scripts/smoke-rpl-bot.ts [--out path.md]");
      process.exit(2);
    }
  }

  const key = apiKey();
  if (!key) {
    console.error("PROMPTS_LLM_API_KEY (or NVIDIA_NIM_API_KEY) is not set");
    process.exit(2);
  }

  // Prefer an explicit env model; otherwise the documented smoke model.
  const model =
    process.env.PROMPTS_LLM_MODEL?.trim() ||
    process.env.NIM_MODEL?.trim() ||
    process.env.NVIDIA_NIM_MODEL?.trim() ||
    DEFAULT_MODEL;

  const system = assembleRplBotSystemPrompt();
  const startedAt = londonStamp();
  const results: ProbeResult[] = [];

  for (const probe of probes) {
    const t0 = Date.now();
    process.stderr.write(`running ${probe.id}...\n`);
    const { text, attempts, error } = await completeWithRetry({
      apiKey: key,
      system,
      user: probe.user,
      model,
    });
    const elapsedMs = Date.now() - t0;
    const checks = probe.checks.map((c) => ({
      id: c.id,
      description: c.description,
      pass: error ? false : c.test(text),
    }));
    const verdict: ProbeResult["verdict"] = error
      ? "error"
      : checks.every((c) => c.pass)
        ? "pass"
        : "fail";
    results.push({
      id: probe.id,
      title: probe.title,
      verdict,
      attempts,
      elapsedMs,
      checks,
      error,
      excerpt: sanitize(excerpt(text)),
    });
    process.stderr.write(`  ${verdict} in ${(elapsedMs / 1000).toFixed(1)}s\n`);
  }

  const report = renderReport({
    model,
    startedAt,
    finishedAt: londonStamp(),
    systemChars: system.length,
    results,
  });
  if (dest) {
    const path = resolve(dest);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, report.endsWith("\n") ? report : `${report}\n`, "utf8");
    process.stderr.write(`wrote ${path}\n`);
  } else {
    process.stdout.write(report.endsWith("\n") ? report : `${report}\n`);
  }
  if (results.some((r) => r.verdict !== "pass")) process.exitCode = 1;
}

const entry = process.argv[1]
  ? (await import("node:url")).pathToFileURL(resolve(process.argv[1])).href
  : "";
if (import.meta.url === entry) {
  await main();
}
