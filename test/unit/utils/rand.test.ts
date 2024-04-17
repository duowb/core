import { expect, test } from "vitest";
import { rand } from "@/main";

test("Random number", () => {
  const num = rand(1, 10);
  expect(num).toBeGreaterThanOrEqual(1);
  expect(num).toBeLessThanOrEqual(10);
});

test("Random number with decimal", () => {
  const num = rand(1, 10, 1);
  expect(num).toBeGreaterThanOrEqual(1);
  expect(num).toBeLessThanOrEqual(10);
});