import type { bundles } from "../content/bundles.config.js";

export type PromptContentKey = keyof typeof bundles.byLabel;

export type PromptContentBundle = {
  label: PromptContentKey;
  files: Record<string, string>;
  text: string;
};
