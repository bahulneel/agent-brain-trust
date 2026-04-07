/** One-shot remote LLM check: user turn + substrings that should appear in the reply. */
export type RemoteLlmCase = {
  id: string;
  user: string;
  /** Every entry must appear (case-insensitive). */
  expectSubstrings: string[];
};

export function assertRemoteLlmOutput(output: string, c: RemoteLlmCase): void {
  if (output.length === 0) {
    throw new Error(`empty model output for case ${c.id}`);
  }
  const low = output.toLowerCase();
  for (const frag of c.expectSubstrings) {
    const needle = frag.toLowerCase();
    if (!low.includes(needle)) {
      throw new Error(`case ${c.id}: expected output to contain "${frag}"`);
    }
  }
}
