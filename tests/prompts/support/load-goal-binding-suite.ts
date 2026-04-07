import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { GoalBindingCase } from "./goal-bindings.js";

export function loadGoalBindingCases(
  pathRelativeToRepoRoot: string
): GoalBindingCase[] {
  const abs = join(process.cwd(), pathRelativeToRepoRoot);
  const raw = readFileSync(abs, "utf-8");
  return JSON.parse(raw) as GoalBindingCase[];
}
