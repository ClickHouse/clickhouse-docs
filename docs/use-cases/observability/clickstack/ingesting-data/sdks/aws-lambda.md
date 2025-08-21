---
slug: /use-cases/observability/clickstack/sdks/aws_lambda
pagination_prev: null
pagination_next: null
sidebar_position: 6
description: 'AWS Lambda for ClickStack - The ClickHouse Observability Stack'
title: 'AWS Lambda'
doc_type: 'how-to'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

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

## Installing the OpenTelemetry Lambda layers {#installing-the-otel-lambda-layers}

The OpenTelemetry project provides separate lambda layers to:

1. Automatically instrument your Lambda function code with OpenTelemetry auto-instrumentation.
2. Forward the collected logs, metrics, and traces to ClickStack.

### Adding the language-specific auto-instrumentation layer {#adding-language-specific-auto-instrumentation}

The language-specific auto-instrumentation lambda layers automatically instrument your Lambda function code with OpenTelemetry auto-instrumentation package for your specific language. 

Each language and region has its own layer ARN.

If your Lambda is already instrumented with an OpenTelemetry SDK, you can skip this step.

**To get started**:

1. In the Layers section click "Add a layer"
2. Select specify an ARN and choose the correct ARN based on language,  ensure you replace the `<region>` with your region (ex. `us-east-2`):

<Tabs groupId="install-language-options">
<TabItem value="javascript" label="Javascript" default>

```shell
arn:aws:lambda:<region>:184161586896:layer:opentelemetry-nodejs-0_7_0:1
```

</TabItem>
<TabItem value="python" label="Python" default>

```shell copy
arn:aws:lambda:<region>:184161586896:layer:opentelemetry-python-0_7_0:1
```

</TabItem>

<TabItem value="java" label="Java" default>

```shell copy
arn:aws:lambda:<region>:184161586896:layer:opentelemetry-javaagent-0_6_0:1
```

</TabItem>

<TabItem value="ruby" label="Ruby" default>

```shell copy
arn:aws:lambda:<region>:184161586896:layer:opentelemetry-ruby-0_1_0:1
```

</TabItem>

</Tabs>

_The latest releases of the layers can be found in the [OpenTelemetry Lambda Layers GitHub repository](https://github.com/open-telemetry/opentelemetry-lambda/releases)._

3. Configure the following environment variables in your Lambda function under "Configuration" > "Environment variables".

<Tabs groupId="install-language-env">
<TabItem value="javascript" label="Javascript" default>

```shell
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler
OTEL_PROPAGATORS=tracecontext
OTEL_TRACES_SAMPLER=always_on
```

</TabItem>
<TabItem value="python" label="Python" default>

```shell
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-instrument
OTEL_PROPAGATORS=tracecontext
OTEL_TRACES_SAMPLER=always_on
```

</TabItem>

<TabItem value="java" label="Java" default>

```shell
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler
OTEL_PROPAGATORS=tracecontext
OTEL_TRACES_SAMPLER=always_on
```

</TabItem>

<TabItem value="ruby" label="Ruby" default>

```shell
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler
OTEL_PROPAGATORS=tracecontext
OTEL_TRACES_SAMPLER=always_on
```

</TabItem>

</Tabs>

### Installing the OpenTelemetry collector Lambda layer {#installing-the-otel-collector-layer}

The collector Lambda layer allows you to forward logs, metrics, and traces from your Lambda function to ClickStack without impacting response times due 
to exporter latency.

**To install the collector layer**:

1. In the Layers section click "Add a layer"
2. Select specify an ARN and choose the correct ARN based on architecture,  ensure you replace the `<region>` with your region (ex. `us-east-2`):

<Tabs groupId="install-language-layer">

<TabItem value="x86_64" label="x86_64" default>

```shell
arn:aws:lambda:<region>:184161586896:layer:opentelemetry-collector-amd64-0_8_0:1
```

</TabItem>

<TabItem value="arm64" label="arm64" default>

```shell
arn:aws:lambda:<region>:184161586896:layer:opentelemetry-collector-arm64-0_8_0:1
```

</TabItem>

</Tabs>

3. Add the following `collector.yaml` file to your project to configure the collector to send to ClickStack:

```yaml
# collector.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 'localhost:4317'
      http:
        endpoint: 'localhost:4318'

processors:
  batch:
  decouple:

exporters:
  otlphttp:
    endpoint: "<YOU_OTEL_COLLECTOR_HTTP_ENDPOINT>
    headers:
      authorization: <YOUR_INGESTION_API_KEY>
    compression: gzip

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch, decouple]
      exporters: [otlphttp]
    metrics:
      receivers: [otlp]
      processors: [batch, decouple]
      exporters: [otlphttp]
    logs:
      receivers: [otlp]
      processors: [batch, decouple]
      exporters: [otlphttp]
```

4. Add the following environment variable:

```shell
OPENTELEMETRY_COLLECTOR_CONFIG_FILE=/var/task/collector.yaml
```

## Checking the installation {#checking-the-installation}

After deploying the layers, you should now see traces automatically
collected from your Lambda function in HyperDX. The `decouple` and `batching` 
processor may introduce a delay in telemetry collection, so traces may be 
delayed in showing up. To emit custom logs or metrics, you'll need to instrument your code your language-specific 
OpenTelemetry SDKs.

## Troubleshooting {#troubleshoting}

### Custom instrumentation not sending {#custom-instrumentation-not-sending}

If you're not seeing your manually defined traces or other telemetry, you may
be using an incompatible version of the OpenTelemetry API package. Ensure your
OpenTelemetry API package is at least the same or lower version than the 
version included in the AWS lambda.

### Enabling SDK debug logs {#enabling-sdk-debug-logs}

Set the `OTEL_LOG_LEVEL` environment variable to `DEBUG` to enable debug logs from
the OpenTelemetry SDK. This will help ensure that the auto-instrumentation layer
is correctly instrumenting your application.

### Enabling collector debug logs {#enabling-collector-debug-logs}

To debug collector issues, you can enable debug logs by modifying your collector
configuration file to add the `logging` exporter and setting the telemetry 
log level to `debug` to enable more verbose logging from the collector lambda layer.

```yaml
# collector.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 'localhost:4317'
      http:
        endpoint: 'localhost:4318'

exporters:
  logging:
    verbosity: detailed
  otlphttp:
    endpoint: "https://in-otel.hyperdx.io"
    headers:
      authorization: <YOUR_INGESTION_API_KEY>
    compression: gzip

service:
  telemetry:
    logs:
      level: "debug"
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch, decouple]
      exporters: [otlphttp, logging]
    metrics:
      receivers: [otlp]
      processors: [batch, decouple]
      exporters: [otlphttp, logging]
    logs:
      receivers: [otlp]
      processors: [batch, decouple]
      exporters: [otlphttp, logging]
```
