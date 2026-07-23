import ExampleOTelConfig from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_config_example_otel.md';

Use an OpenTelemetry Collector as a gateway between your applications and ClickHouse Cloud.

The example uses the dedicated `clickstack-ingest` user. If you skipped the optional user-creation step, use the `default` user and its password instead.

Merge the following components into your existing configuration rather than replacing unrelated receivers, processors, exporters, or extensions.

:::note[Collector components required]
Your collector distribution must include the [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) and [routing connector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/routingconnector). The OpenTelemetry Collector Contrib distribution includes both components.
:::

The example adds OTLP receivers, batching and memory limiting, Session Replay routing, and ClickHouse exporters.

<ExampleOTelConfig/>

Reuse your existing OTLP receiver and preserve its authentication and TLS settings. If your configuration already uses the component or pipeline IDs in the example, merge or rename them instead of creating duplicate IDs. Running two receivers on ports `4317` and `4318` causes a port conflict.

After merging the configuration, reload or restart the collector using your existing deployment process.

For further details on configuring OpenTelemetry collectors, see [Ingesting with OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry).
