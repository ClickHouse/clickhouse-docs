If you have existing applications or infrastructure to instrument with OpenTelemetry, navigate to the relevant guides linked from the UI. 

To instrument your applications to collect traces and logs, use the [supported language SDKs](/use-cases/observability/clickstack/sdks) which send data to your OpenTelemetry Collector acting as a gateway for ingestion into Managed ClickStack. 

Logs can be [collected using OpenTelemetry Collectors](/use-cases/observability/clickstack/integrations/host-logs) running in agent mode, forwarding data to the same collector. For Kubernetes monitoring, follow the [dedicated guide](/use-cases/observability/clickstack/integrations/kubernetes). For other integrations, see our [quickstart guides](/use-cases/observability/clickstack/integration-guides).

### Demo data {#demo-data}

Alternatively, if you don't have existing data, try one of our sample datasets.

- [Example dataset](/use-cases/observability/clickstack/getting-started/sample-data) - Load an example dataset from our public demo. Diagnose a simple issue.
- [Local files and metrics](/use-cases/observability/clickstack/getting-started/local-data) - Load local files and monitor the system on OSX or Linux using a local OTel collector.
