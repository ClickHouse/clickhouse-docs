---
slug: /use-cases/observability/clickstack/sdks/java
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: 'Java SDK for ClickStack - The ClickHouse Observability Stack'
title: 'Java'
doc_type: 'explanation'
---

ClickStack uses the OpenTelemetry standard for collecting telemetry data (logs and
traces). Traces are auto-generated with automatic instrumentation, so manual
instrumentation isn't required to get value out of tracing.

**This guide Integrates:**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ Logs</td>
      <td className="pe-2">✅ Metrics</td>
      <td className="pe-2">✅ Traces</td>
    </tr>
  </tbody>
</table>

## Getting started {#getting-started}

:::note
At present, the integration is compatible exclusively with **Java 8+**
:::

### Download OpenTelemetry Java agent {#download-opentelemtry-java-agent}

Download [`opentelemetry-javaagent.jar`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar)
and place the JAR in your preferred directory. The JAR file contains the agent
and instrumentation libraries. You can also use the following command to
download the agent:

```shell
curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
```

### Configure environment variables {#configure-environment-variables}

Afterwards you'll need to configure the following environment variables in your shell to ship telemetry to ClickStack:

```shell
export JAVA_TOOL_OPTIONS="-javaagent:PATH/TO/opentelemetry-javaagent.jar" \
OTEL_EXPORTER_OTLP_ENDPOINT=https://localhost:4318 \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>' \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_LOGS_EXPORTER=otlp \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>'
```

_The `OTEL_SERVICE_NAME` environment variable is used to identify your service in the HyperDX app, it can be any name you want._

The `OTEL_EXPORTER_OTLP_HEADERS` environment variable contains the API Key available via HyperDX app in `Team Settings → API Keys`.

### Run the application with OpenTelemetry Java agent {#run-the-application-with-otel-java-agent}

```shell
java -jar target/<APPLICATION_JAR_FILE>
```
<br/>
Read more about Java OpenTelemetry instrumentation here: [https://opentelemetry.io/docs/instrumentation/java/](https://opentelemetry.io/docs/instrumentation/java/)
