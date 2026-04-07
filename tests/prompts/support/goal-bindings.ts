export type GoalBindingValue = string | number | boolean | null;

export type GoalBindingCase = {
  id: string;
  description: string;
  rpl: string | string[];
  output: string;
  expectation: Record<string, GoalBindingValue>;
};

export function buildGoalBindingsUserPrompt(c: GoalBindingCase): string[] {
  const lines = Array.isArray(c.rpl) ? c.rpl : [c.rpl];
  return [
    ...lines,
    "```",
    `% <- ${c.output}`,
    "Respond with a single JSON object of the lvar bindings at the goal.",
  ];
}

/** Prefer last valid `{...}` in the reply (models often prepend explanation with extra braces). */
function extractJsonObject(raw: string): string {
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const fenced = fenceMatch?.[1];
  if (fenced) {
    const fromFence = tryExtractLastJsonObject(fenced);
    if (fromFence) return fromFence;
  }

  const fromRaw = tryExtractLastJsonObject(raw);
  if (fromRaw) return fromRaw;
  throw new Error(`model did not return a JSON object:\n${raw}`);
}

function tryExtractLastJsonObject(text: string): string | undefined {
  for (let i = text.length - 1; i >= 0; i--) {
    if (text[i] !== "}") continue;
    const end = i + 1;
    const start = text.lastIndexOf("{", i);
    if (start < 0) break;
    const slice = text.slice(start, end);
    try {
      JSON.parse(slice);
      return slice;
    } catch {
      /* try next closing brace */
    }
  }
  return undefined;
}

/** e.g. `{ ?u: 'u-1' }` or `` `{ ?patient: "p-1" }` `` (not valid JSON). */
function parseColonLvarBindings(raw: string): Record<string, unknown> | null {
  const obj: Record<string, unknown> = {};
  const re = /\?\s*([a-z][\w-]*)\s*:\s*['"]([^'"]*)['"]/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    obj[m[1]!] = m[2]!;
  }
  return Object.keys(obj).length > 0 ? obj : null;
}

/** e.g. `?level = 'critical'` when the model ignores JSON instructions. */
function parseLooseBindingLines(raw: string): Record<string, unknown> | null {
  const obj: Record<string, unknown> = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*\?([a-z][\w-]*)\s*=\s*(.+?)\s*$/i);
    if (!m) continue;
    let val = m[2]!.trim();
    if (
      (val.startsWith("'") && val.endsWith("'")) ||
      (val.startsWith('"') && val.endsWith('"'))
    ) {
      val = val.slice(1, -1);
    } else if (/^-?\d+$/.test(val)) {
      obj[m[1]!] = Number.parseInt(val, 10);
      continue;
    } else if (val === "true" || val === "false") {
      obj[m[1]!] = val === "true";
      continue;
    }
    obj[m[1]!] = val;
  }
  return Object.keys(obj).length > 0 ? obj : null;
}

function parseBindings(jsonText: string): Record<string, unknown> {
  try {
    return JSON.parse(jsonText) as Record<string, unknown>;
  } catch (jsonError) {
    const normalizedKeys = jsonText.replace(
      /([{,]\s*)(\??[A-Za-z_][\w-]*)(\s*:)/g,
      '$1"$2"$3'
    );
    const normalizedEquals = normalizedKeys.replace(
      /([{,]\s*)(\??[A-Za-z_][\w-]*)\s*=/g,
      '$1"$2":'
    );
    const normalizedQuotes = normalizedEquals.replace(/'([^']*)'/g, '"$1"');
    try {
      return JSON.parse(normalizedQuotes) as Record<string, unknown>;
    } catch {
      try {
        const evaluated = Function(`"use strict"; return (${jsonText});`)() as unknown;
        if (typeof evaluated === "object" && evaluated !== null && !Array.isArray(evaluated)) {
          return evaluated as Record<string, unknown>;
        }
      } catch {
        const fallbackEntries = [...jsonText.matchAll(/(\??[A-Za-z_][\w-]*)\s*[:=]\s*['"]?([^,'"}\n]+)['"]?/g)];
        if (fallbackEntries.length > 0) {
          const obj: Record<string, unknown> = {};
          for (const m of fallbackEntries) obj[m[1]!] = m[2]!;
          return obj;
        }
        throw jsonError;
      }
      throw jsonError;
    }
  }
}

function normalizeBindingKeys(
  parsed: Record<string, unknown>
): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(parsed)) {
    normalized[k.startsWith("?") ? k.slice(1) : k] = v;
  }
  return normalized;
}

export function assertGoalBindings(output: string, c: GoalBindingCase): void {
  let parsed: Record<string, unknown>;
  try {
    const jsonText = extractJsonObject(output);
    parsed = normalizeBindingKeys(parseBindings(jsonText));
  } catch {
    const loose =
      parseLooseBindingLines(output) ?? parseColonLvarBindings(output);
    if (!loose) {
      throw new Error(
        `case ${c.id}: model did not return JSON, ?var = value, or ?var: 'value' bindings:\n${output}`
      );
    }
    parsed = normalizeBindingKeys(loose);
  }

  for (const [name, expected] of Object.entries(c.expectation)) {
    if (!(name in parsed)) {
      throw new Error(
        `case ${c.id}: missing binding "${name}" in ${JSON.stringify(parsed)}`
      );
    }
    const actual = parsed[name];
    if (actual !== expected) {
      throw new Error(
        `case ${c.id}: binding "${name}" expected ${JSON.stringify(expected)} got ${JSON.stringify(actual)}`
      );
    }
  }
}
