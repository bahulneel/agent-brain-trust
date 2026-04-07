import { loadPromptFiles } from "./llm-chat.js";

/** Path segment relative to repo root (`content/rpl/*.md`). */
export const RPL_CONTENT_DIR = "content/rpl" as const;

/**
 * Full prompt stack: **rpl + eager + translation** (see `rpl.md`, `eager.md`, `translation.md`).
 */
export function rplEagerTranslationSystemPrompt(): string {
  return loadPromptFiles(RPL_CONTENT_DIR, "rpl.md", "eager.md", "translation.md");
}

/**
 * Full prompt stack: **rpl + lazy + translation** (`rpl.md`, `lazy.md`, `translation.md`).
 */
export function rplLazyTranslationSystemPrompt(): string {
  return loadPromptFiles(RPL_CONTENT_DIR, "rpl.md", "lazy.md", "translation.md");
}

export const rplSystemPrompt = rplEagerTranslationSystemPrompt;
export const lrplSystemPrompt = rplLazyTranslationSystemPrompt;
export const proseSystemPrompt = rplEagerTranslationSystemPrompt;
export const translationSystemPrompt = rplEagerTranslationSystemPrompt;
