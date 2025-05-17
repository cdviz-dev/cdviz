import {
  type Dashboard,
  DashboardBuilder,
  RowBuilder,
} from "@grafana/grafana-foundation-sdk/dashboard";
import { DataqueryBuilder } from "@grafana/grafana-foundation-sdk/prometheus";
import { PanelBuilder } from "@grafana/grafana-foundation-sdk/timeseries";
import { applyDefaults } from "./utils";

export function buildDashboard(): Dashboard {
  const builder = applyDefaults(
    new DashboardBuilder("[TEST] Node Exporter / Raspberry 2").uid(
      "test-dashboard-raspberry",
    ),
  )
    .withRow(new RowBuilder("Overview"))
    .withPanel(
      new PanelBuilder()
        .title("Network Received")
        .unit("bps")
        .min(0)
        .withTarget(
          new DataqueryBuilder()
            .expr(
              'rate(node_network_receive_bytes_total{job="integrations/raspberrypi-node", device!="lo"}[$__rate_interval]) * 8',
            )
            .legendFormat("{{ device }}"),
        ),
    );
  return builder.build();
}
