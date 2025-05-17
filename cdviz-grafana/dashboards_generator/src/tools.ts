import { mkdir } from "node:fs/promises";
import type { Dashboard } from "@grafana/grafana-foundation-sdk/dashboard";

export async function saveDashboard(dashboard: Dashboard, folder: string) {
  dashboard.version = datetimeAsVersion();
  const content = JSON.stringify(dashboard, null, 2);
  const filepath = `${folder}/${dashboard.uid}.json`;
  if (await compareMemAndDisk(content, filepath)) {
    console.info(`${filepath} kept`);
  } else {
    await mkdir(folder, { recursive: true });
    await Bun.write(filepath, content);
    console.info(`${filepath} generated`);
  }
}

/**
 * return the date like a version number using format `YYYYMMDDHHmm` (in UTC timezone)
 */
export function datetimeAsVersion(d?: Date): number {
  const dt = d || new Date();
  return (
    1 * dt.getUTCMinutes() + //UTC minutes (0-59)
    100 * dt.getUTCHours() + // UTC hours (0-23)
    10000 * dt.getUTCDate() + // UTC day (1-31)
    1000000 * (dt.getUTCMonth() + 1) + // UTC month (0-11)
    100000000 * dt.getUTCFullYear()
  );
}

async function compareMemAndDisk(
  dashboardTxt: string,
  filepath: string,
): Promise<boolean> {
  const file = Bun.file(filepath);
  if (!(await file.exists())) {
    return false;
  }
  const content = await file.text();
  const other = JSON.parse(content);

  return deepCompare(JSON.parse(dashboardTxt), other);
}

/**
 * Compare `value1` and `value2` (ignore field `version`)
 */
function deepCompare(value1: unknown, value2: unknown): boolean {
  // compare types
  if (typeof value1 !== typeof value2) {
    return false;
  }

  // compare properties recursively
  if (typeof value1 === "object") {
    if (Array.isArray(value1) !== Array.isArray(value2)) {
      return false;
    }
    if (Array.isArray(value1) && Array.isArray(value2)) {
      if (value1.length !== value2.length) {
        return false;
      }
      for (let i = 0; i < value1.length; i++) {
        if (!deepCompare(value1[i], value2[i])) {
          return false;
        }
      }
    } else {
      const o1 = value1 as { [key: string]: unknown };
      const o2 = value2 as { [key: string]: unknown };
      const keys1 = Object.keys(o1).filter((k) => k !== "version");
      const keys2 = Object.keys(o2).filter((k) => k !== "version");
      if (keys1.length !== keys2.length) {
        return false;
      }
      for (const key of keys1) {
        if (
          !Object.prototype.hasOwnProperty.call(value2, key) ||
          !deepCompare(o1[key], o2[key])
        ) {
          return false;
        }
      }
    }
  } else {
    // compare primitive values
    if (value1 !== value2) {
      return false;
    }
  }

  // objects are equal
  return true;
}
