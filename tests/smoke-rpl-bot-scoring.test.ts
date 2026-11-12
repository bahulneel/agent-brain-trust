import { describe, expect, it } from "vitest";

import { probes, type Check } from "../scripts/smoke-rpl-bot.ts";

function check(probeId: string, checkId: string): Check {
  const probe = probes.find((p) => p.id === probeId);
  const found = probe?.checks.find((c) => c.id === checkId);
  if (!found) {
    throw new Error(`missing check ${probeId}/${checkId}`);
  }
  return found;
}

const orderMatters = check("possibility-order", "order-matters");
const notInterchangeable = check("necessity-vs-possibility", "not-interchangeable");

const earlierRight = [
  "No. The two operators are not interchangeable.",
  "No, they do not have the same meaning.",
  "No. Swapping them does not give the same meaning: BlackSwan would become the mode.",
  "not interchangeable",
  "do not have the same meaning",
  "Swapping them does not give the same meaning",
  "No, they don't mean the same thing.",
  "No. They aren't interchangeable.",
  "not the same; order matters",
  "don't mean the same thing",
  "aren't interchangeable",
  "it's not the same meaning",
  "They are different: one is necessity, the other possibility.",
  "They mean different things.",
  "...so they differ.",
  "Reversing the arguments changes which side is the mode.",
] as const;

const earlierWrong = [
  "they're interchangeable",
  "same meaning either way",
  "they are equivalent",
  "they have the same meaning",
  "the order does not matter",
  "they are the same",
  "they are identical",
  "Different spellings, same meaning either way.",
  "Yes, swapping them gives the same sentence.",
  "mostly the same meaning",
  "basically the same",
  "not the same spelling, but it is the same meaning",
  "not the same operator, but the sentences are equivalent",
  "order doesn't matter",
  "effectively interchangeable",
  "they mean the same thing",
] as const;

describe("run-3 probes 8-9 scoring", () => {
  it("rejects claims that the meaning is identical or amounts to the same", () => {
    for (const reply of [
      "They differ only in spelling; the meaning is identical.",
      "The symbols are different, but it amounts to the same.",
    ]) {
      expect(orderMatters.test(reply), `probe 8 should fail: ${reply}`).toBe(false);
      expect(notInterchangeable.test(reply), `probe 9 should fail: ${reply}`).toBe(false);
    }
  });

  it("accepts contracted 'doesn't give the same'", () => {
    for (const reply of [
      "No, it doesn't give the same sentence.",
      "No — it doesn't give the same sentence.",
    ]) {
      expect(orderMatters.test(reply), `probe 8 should pass: ${reply}`).toBe(true);
      expect(notInterchangeable.test(reply), `probe 9 should pass: ${reply}`).toBe(true);
    }
  });

  it("still accepts earlier right answers on both probes", () => {
    for (const reply of earlierRight) {
      expect(orderMatters.test(reply), `probe 8 should pass: ${reply}`).toBe(true);
      expect(notInterchangeable.test(reply), `probe 9 should pass: ${reply}`).toBe(true);
    }
  });

  it("still rejects earlier wrong answers on both probes", () => {
    for (const reply of earlierWrong) {
      expect(orderMatters.test(reply), `probe 8 should fail: ${reply}`).toBe(false);
      expect(notInterchangeable.test(reply), `probe 9 should fail: ${reply}`).toBe(false);
    }
  });
});
