import { expect, test } from "bun:test";
import { datetimeAsVersion } from "./tools";

test("datetimeAsVersion", () => {
  expect(datetimeAsVersion(new Date("2024-01-01T00:00:00.000Z"))).toEqual(
    202401010000,
  );
  expect(datetimeAsVersion(new Date(2024, 0, 1, 0, 0, 0, 0))).toEqual(
    202401010000,
  );
  expect(datetimeAsVersion(new Date(2025, 11, 31, 23, 59, 59, 0))).toEqual(
    202512312359,
  );
});
