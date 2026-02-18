import { randomInt } from "node:crypto";

export function secureRandomIndex(maxExclusive: number) {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new Error("maxExclusive must be a positive integer");
  }
  return randomInt(0, maxExclusive);
}
