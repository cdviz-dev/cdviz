import { mkdir } from "node:fs/promises";
import type { Dashboard } from "@grafana/grafana-foundation-sdk/dashboard";

export async function saveDashboard(dashboard: Dashboard, folder: string) {
  const content = JSON.stringify(dashboard, null, 2);
  const filepath = `${folder}/${dashboard.uid}.json`;

  await mkdir(folder, { recursive: true });
  await Bun.write(filepath, content);
  console.info(`${filepath} generated`);
}
