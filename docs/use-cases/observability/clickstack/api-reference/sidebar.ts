import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "use-cases/observability/clickstack/api-reference/hyperdx-external-api",
    },
    {
      type: "category",
      label: "Dashboards",
      items: [
        {
          type: "doc",
          id: "use-cases/observability/clickstack/api-reference/list-dashboards",
          label: "List Dashboards",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "use-cases/observability/clickstack/api-reference/create-dashboard",
          label: "Create Dashboard",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "use-cases/observability/clickstack/api-reference/get-dashboard",
          label: "Get Dashboard",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "use-cases/observability/clickstack/api-reference/update-dashboard",
          label: "Update Dashboard",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "use-cases/observability/clickstack/api-reference/delete-dashboard",
          label: "Delete Dashboard",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "Alerts",
      items: [
        {
          type: "doc",
          id: "use-cases/observability/clickstack/api-reference/get-alert",
          label: "Get Alert",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "use-cases/observability/clickstack/api-reference/update-alert",
          label: "Update Alert",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "use-cases/observability/clickstack/api-reference/delete-alert",
          label: "Delete Alert",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "use-cases/observability/clickstack/api-reference/list-alerts",
          label: "List Alerts",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "use-cases/observability/clickstack/api-reference/create-alert",
          label: "Create Alert",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Charts",
      items: [
        {
          type: "doc",
          id: "use-cases/observability/clickstack/api-reference/query-chart-series",
          label: "Query Chart Series Data",
          className: "api-method post",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
