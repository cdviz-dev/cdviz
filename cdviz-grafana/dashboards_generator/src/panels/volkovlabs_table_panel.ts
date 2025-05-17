// the d3 panel does not exist (yet)
// So we used the [marcusolsson-dynamictext-panel](https://volkovlabs.io/plugins/business-text/) from volkovlabs
import * as dashboard from "@grafana/grafana-foundation-sdk/dashboard";

// TODO improve type constraint with enums,...
export interface VolkovlabsTablePanelOptions {
  isColumnManagerAvailable: boolean;
  nestedObjects: [];
  saveUserPreference: boolean;
  showFiltersInColumnManager: boolean;
  tables: unknown[]; // too complex (and I'm too lazy to search its type)
  tabsSorting: boolean;
  toolbar: {
    alignment: "left" | "right" | "center";
    export: boolean;
    exportFormats: ("xlsx" | "csv")[];
  };
}

export const defaultVolkovlabsTablePanelOptions =
  (): VolkovlabsTablePanelOptions => ({
    isColumnManagerAvailable: false,
    nestedObjects: [],
    saveUserPreference: false,
    showFiltersInColumnManager: false,
    tables: [
      {
        actionsColumnConfig: {
          alignment: "start",
          fontSize: "md",
          label: "",
          width: {
            auto: false,
            value: 100,
          },
        },
        addRow: {
          enabled: false,
          permission: {
            mode: "",
            userRole: [],
          },
          request: {
            datasource: "",
            payload: {},
          },
        },
        deleteRow: {
          enabled: false,
          permission: {
            mode: "",
            userRole: [],
          },
          request: {
            datasource: "",
            payload: {},
          },
        },
        expanded: true,
        items: [
          {
            aggregation: "none",
            appearance: {
              alignment: "start",
              background: {
                applyToRow: false,
              },
              colors: {},
              header: {
                fontSize: "md",
              },
              width: {
                auto: true,
                max: 100,
                min: 20,
                value: 100,
              },
              wrap: true,
            },
            columnTooltip: "",
            edit: {
              editor: {
                type: "string",
              },
              enabled: false,
              permission: {
                mode: "",
                userRole: [],
              },
            },
            enabled: true,
            field: {
              name: "timestamp",
              source: "A",
            },
            fileCell: {
              size: "md",
              text: "",
              variant: "primary",
            },
            filter: {
              enabled: false,
              mode: "client",
              variable: "",
            },
            footer: [],
            gauge: {
              mode: "basic",
              valueDisplayMode: "text",
              valueSize: 14,
            },
            group: false,
            label: "",
            newRowEdit: {
              editor: {
                type: "string",
              },
              enabled: false,
            },
            objectId: "",
            pin: "left",
            preformattedStyle: false,
            scale: "auto",
            showingRows: 20,
            sort: {
              descFirst: true,
              enabled: true,
            },
            type: "auto",
          },
          {
            aggregation: "none",
            appearance: {
              alignment: "start",
              background: {
                applyToRow: false,
              },
              colors: {},
              header: {
                fontSize: "md",
              },
              width: {
                auto: true,
                max: 130,
                min: 20,
                value: 100,
              },
              wrap: true,
            },
            columnTooltip: "",
            edit: {
              editor: {
                type: "string",
              },
              enabled: false,
              permission: {
                mode: "",
                userRole: [],
              },
            },
            enabled: true,
            field: {
              name: "subject",
              source: "A",
            },
            fileCell: {
              size: "md",
              text: "",
              variant: "primary",
            },
            filter: {
              enabled: false,
              mode: "client",
              variable: "",
            },
            footer: [],
            gauge: {
              mode: "basic",
              valueDisplayMode: "text",
              valueSize: 14,
            },
            group: false,
            label: "",
            newRowEdit: {
              editor: {
                type: "string",
              },
              enabled: false,
            },
            objectId: "",
            pin: "",
            preformattedStyle: false,
            scale: "auto",
            showingRows: 20,
            sort: {
              descFirst: false,
              enabled: false,
            },
            type: "auto",
          },
          {
            aggregation: "none",
            appearance: {
              alignment: "start",
              background: {
                applyToRow: false,
              },
              colors: {},
              header: {
                fontSize: "md",
              },
              width: {
                auto: true,
                max: 130,
                min: 20,
                value: 100,
              },
              wrap: true,
            },
            columnTooltip: "",
            edit: {
              editor: {
                type: "string",
              },
              enabled: false,
              permission: {
                mode: "",
                userRole: [],
              },
            },
            enabled: true,
            field: {
              name: "predicate",
              source: "A",
            },
            fileCell: {
              size: "md",
              text: "",
              variant: "primary",
            },
            filter: {
              enabled: false,
              mode: "client",
              variable: "",
            },
            footer: [],
            gauge: {
              mode: "basic",
              valueDisplayMode: "text",
              valueSize: 14,
            },
            group: false,
            label: "",
            newRowEdit: {
              editor: {
                type: "string",
              },
              enabled: false,
            },
            objectId: "",
            pin: "",
            preformattedStyle: false,
            scale: "auto",
            showingRows: 20,
            sort: {
              descFirst: false,
              enabled: false,
            },
            type: "auto",
          },
          {
            aggregation: "none",
            appearance: {
              alignment: "start",
              background: {
                applyToRow: false,
              },
              colors: {},
              header: {
                fontSize: "md",
              },
              width: {
                auto: true,
                min: 300,
                value: 100,
              },
              wrap: false,
            },
            columnTooltip: "",
            edit: {
              editor: {
                type: "string",
              },
              enabled: false,
              permission: {
                mode: "",
                userRole: [],
              },
            },
            enabled: true,
            field: {
              name: "payload_subject",
              source: "A",
            },
            fileCell: {
              size: "md",
              text: "",
              variant: "primary",
            },
            filter: {
              enabled: false,
              mode: "client",
              variable: "",
            },
            footer: [],
            gauge: {
              mode: "basic",
              valueDisplayMode: "text",
              valueSize: 14,
            },
            group: false,
            label: "",
            newRowEdit: {
              editor: {
                type: "string",
              },
              enabled: false,
            },
            objectId: "",
            pin: "",
            preformattedStyle: false,
            scale: "auto",
            showingRows: 20,
            sort: {
              descFirst: false,
              enabled: false,
            },
            type: "json",
          },
          {
            aggregation: "none",
            appearance: {
              alignment: "start",
              background: {
                applyToRow: false,
              },
              colors: {},
              header: {
                fontSize: "md",
              },
              width: {
                auto: true,
                min: 300,
                value: 100,
              },
              wrap: false,
            },
            columnTooltip: "",
            edit: {
              editor: {
                type: "string",
              },
              enabled: false,
              permission: {
                mode: "",
                userRole: [],
              },
            },
            enabled: true,
            field: {
              name: "payload_context",
              source: "A",
            },
            fileCell: {
              size: "md",
              text: "",
              variant: "primary",
            },
            filter: {
              enabled: false,
              mode: "client",
              variable: "",
            },
            footer: [],
            gauge: {
              mode: "basic",
              valueDisplayMode: "text",
              valueSize: 14,
            },
            group: false,
            label: "",
            newRowEdit: {
              editor: {
                type: "string",
              },
              enabled: false,
            },
            objectId: "",
            pin: "",
            preformattedStyle: false,
            scale: "auto",
            showingRows: 20,
            sort: {
              descFirst: false,
              enabled: false,
            },
            type: "json",
          },
          {
            aggregation: "none",
            appearance: {
              alignment: "start",
              background: {
                applyToRow: false,
              },
              colors: {},
              header: {
                fontSize: "md",
              },
              width: {
                auto: true,
                max: 100,
                min: 20,
                value: 100,
              },
              wrap: true,
            },
            columnTooltip: "",
            edit: {
              editor: {
                type: "string",
              },
              enabled: false,
              permission: {
                mode: "",
                userRole: [],
              },
            },
            enabled: true,
            field: {
              name: "imported_at",
              source: "A",
            },
            fileCell: {
              size: "md",
              text: "",
              variant: "primary",
            },
            filter: {
              enabled: false,
              mode: "client",
              variable: "",
            },
            footer: [],
            gauge: {
              mode: "basic",
              valueDisplayMode: "text",
              valueSize: 14,
            },
            group: false,
            label: "",
            newRowEdit: {
              editor: {
                type: "string",
              },
              enabled: false,
            },
            objectId: "",
            pin: "",
            preformattedStyle: false,
            scale: "auto",
            showingRows: 20,
            sort: {
              descFirst: false,
              enabled: false,
            },
            type: "auto",
          },
        ],
        name: "Events",
        pagination: {
          defaultPageSize: 10,
          enabled: true,
          mode: "query",
          query: {
            offsetVariable: "offset",
            pageIndexVariable: "pageIndex",
            pageSizeVariable: "pageSize",
            totalCountField: {
              name: "count",
              source: "B",
            },
          },
        },
        rowHighlight: {
          backgroundColor: "transparent",
          columnId: "",
          enabled: false,
          scrollTo: "",
          smooth: false,
          variable: "",
        },
        showHeader: true,
        update: {
          datasource: "",
          payload: {},
        },
      },
    ],
    tabsSorting: false,
    toolbar: {
      alignment: "left",
      export: true,
      exportFormats: ["xlsx", "csv"],
    },
  });

export class VolkovlabsTablePanelBuilder extends dashboard.PanelBuilder {
  constructor() {
    super();
    this.internal.type = "volkovlabs-table-panel"; // panel plugin ID
    if (!this.internal.options) {
      this.internal.options = defaultVolkovlabsTablePanelOptions();
    }
  }

  tableOptions(table: unknown[]): this {
    this.internal.options.table = table;
    return this;
  }
}
