---
slug: /use-cases/observability/clickstack/integrations/jvm-metrics
title: 'Monitoring JVM Metrics with ClickStack'
sidebar_label: 'JVM Metrics'
pagination_prev: null
pagination_next: null
description: 'Monitoring JVM with ClickStack'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import api_key from '@site/static/images/clickstack/api-key.png';

# Monitoring JVM Metrics with ClickStack {#jvm-clickstack}

:::note[TL;DR]
This guide shows you how to monitor JVM applications with ClickStack using the OpenTelemetry Java agent to collect metrics. You'll learn how to:
- Attach the OpenTelemetry Java agent to your JVM application
- Configure the agent to send metrics to ClickStack via OTLP
- Use a pre-built dashboard to visualize heap memory, garbage collection, threads, and CPU

A demo dataset with sample metrics is available if you want to test the integration before instrumenting your production applications.

Time Required: 5-10 minutes
:::

## Integration with existing JVM application {#existing-jvm}

This section covers configuring your existing JVM application to send metrics to ClickStack using the OpenTelemetry Java agent.

If you would like to test the integration before configuring your production setup, you can test with our demo dataset in the [following section](/use-cases/observability/clickstack/integrations/jvm#demo-dataset).

##### Prerequisites {#prerequisites}
- ClickStack instance running
- Existing Java application (Java 8+)
- Access to modify JVM startup arguments

<VerticalStepper headerLevel="h4">

#### Get ClickStack API key {#get-api-key}

The OpenTelemetry Java agent sends data to ClickStack's OTLP endpoint, which requires authentication.

1. Open HyperDX at your ClickStack URL (e.g., http://localhost:8080)
2. Create an account or log in if needed
3. Navigate to **Team Settings → API Keys**
4. Copy your **Ingestion API Key**

<Image img={api_key} alt="ClickStack API Key"/>

#### Download OpenTelemetry Java agent {#download-agent}

Download the OpenTelemetry Java agent JAR file:

```bash
curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v2.22.0/opentelemetry-javaagent.jar
```

This downloads the agent to your current directory. You can place it wherever makes sense for your deployment (e.g., `/opt/opentelemetry/` or alongside your application JAR).

#### Configure JVM startup arguments {#configure-jvm}

Add the Java agent to your JVM startup command. The agent automatically collects JVM metrics and sends them to ClickStack.

##### Option 1: Command line flags {#command-line-flags}

```bash
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.service.name=my-java-app \
  -Dotel.exporter.otlp.endpoint=http://localhost:4318 \
  -Dotel.exporter.otlp.protocol=http/protobuf \
  -Dotel.exporter.otlp.headers="authorization=YOUR_API_KEY" \
  -Dotel.metrics.exporter=otlp \
  -Dotel.logs.exporter=none \
  -Dotel.traces.exporter=none \
  -jar my-application.jar
```

**Replace the following:**
- `opentelemetry-javaagent.jar` → Full path to the agent JAR (e.g., `/opt/opentelemetry/opentelemetry-javaagent.jar`)
- `my-java-app` → A meaningful name for your service (e.g., `payment-service`, `user-api`)
- `YOUR_API_KEY` → Your ClickStack API key from the command above
- `my-application.jar` → Your application's JAR file name
- `http://localhost:4318` → Your ClickStack endpoint (use `localhost:4318` if ClickStack runs on the same machine, otherwise use `http://your-clickstack-host:4318`)

##### Option 2: Environment variables {#env-vars}

Alternatively, use environment variables:

```bash
export JAVA_TOOL_OPTIONS="-javaagent:opentelemetry-javaagent.jar"
export OTEL_SERVICE_NAME="my-java-app"
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
export OTEL_EXPORTER_OTLP_HEADERS="authorization=YOUR_API_KEY"
export OTEL_METRICS_EXPORTER="otlp"
export OTEL_LOGS_EXPORTER="none"
export OTEL_TRACES_EXPORTER="none"

java -jar my-application.jar
```

**Replace the following:**
- `opentelemetry-javaagent.jar` → Full path to the agent JAR
- `my-java-app` → Your service name
- `YOUR_API_KEY` → Your ClickStack API key
- `http://localhost:4318` → Your ClickStack endpoint
- `my-application.jar` → Your application's JAR file name

:::tip
The OpenTelemetry Java agent automatically collects these JVM metrics:
- **Memory**: `jvm.memory.used`, `jvm.memory.limit`, `jvm.memory.committed`, `jvm.memory.used_after_last_gc`
- **Garbage Collection**: `jvm.gc.duration`
- **Threads**: `jvm.thread.count`
- **Classes**: `jvm.class.count`, `jvm.class.loaded`, `jvm.class.unloaded`
- **CPU**: `jvm.cpu.time`, `jvm.cpu.count`
:::

#### Verify metrics in HyperDX {#verifying-metrics}

Once your application is running with the agent, verify metrics are flowing to ClickStack:

1. Open HyperDX at http://localhost:8080 (or your ClickStack URL)
2. Navigate to **Chart Explorer**
3. Search for metrics starting with `jvm.` (e.g., `jvm.memory.used`, `jvm.gc.duration`, `jvm.thread.count`)

</VerticalStepper>

## Demo dataset {#demo-dataset}

For users who want to test the JVM metrics integration before instrumenting their applications, we provide a sample dataset with pre-generated metrics showing realistic JVM behavior.

<VerticalStepper headerLevel="h4">

#### Download the sample dataset {#download-sample}

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/jvm-metrics.jsonl
```

The dataset includes 24 hours of JVM metrics showing:
- Heap memory growth with periodic garbage collection events
- Thread count variations
- Realistic GC pause times
- Class loading activity
- CPU utilization patterns

#### Start ClickStack {#start-clickstack}

If you don't already have ClickStack running:

```bash
docker run -d --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

Wait a few moments for ClickStack to fully start up.

#### Import the demo dataset {#import-demo-data}

```bash
docker exec -i clickstack clickhouse-client --query="
  INSERT INTO otel.otel_metrics_sum FORMAT JSONEachRow
" < jvm-metrics.jsonl
```

This imports the metrics directly into ClickStack's metrics table.

#### Verify the demo data {#verify-demo-metrics}

Once imported:

1. Open HyperDX at http://localhost:8080 and log in (create an account if needed)
2. Navigate to the Search view and set source to **Metrics**
3. Set the time range to **2025-10-20 00:00:00 - 2025-10-21 00:00:00**
4. Search for `jvm.memory.used` or `jvm.gc.duration`

You should see metrics for the demo service.

:::note[Timezone Display]
HyperDX displays timestamps in your browser's local timezone. The demo data spans 2025-10-20 00:00:00 - 2025-10-21 00:00:00 UTC (24 hours).
:::

</VerticalStepper>

## Dashboards and visualization {#dashboards}

To help you monitor JVM applications with ClickStack, we provide a pre-built dashboard with essential visualizations for JVM metrics.

<VerticalStepper headerLevel="h4">

#### Download the dashboard configuration {#download}

Download the [jvm-metrics-dashboard.json](https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/jvm-metrics-dashboard.json) file.

#### Import the dashboard {#import-dashboard}

1. Open HyperDX and navigate to Dashboards
2. Click "Import Dashboard" in the upper right corner
3. Upload the `jvm-metrics-dashboard.json` file and click finish import

#### View the dashboard {#created-dashboard}

:::note
For the demo dataset, set the time range to **2025-10-20 00:00:00 - 2025-10-21 00:00:00 (UTC)**. Adjust based on your local timezone.
:::

The dashboard includes:
- **Heap Memory Usage**: Visualize heap usage across different memory pools (Eden, Survivor, Old Gen)
- **Garbage Collection**: Track GC pause duration over time
- **Thread Count**: Monitor threads by state (runnable, blocked, waiting, timed_waiting)
- **Non-Heap Memory**: Metaspace usage
- **CPU Utilization**: JVM CPU usage percentage
- **Class Loading**: Number of loaded classes over time

</VerticalStepper>

## Troubleshooting {#troubleshooting}

### Agent not starting {#troubleshooting-not-loading}

**Verify the agent JAR exists:**
```bash
ls -lh /path/to/opentelemetry-javaagent.jar
```

**Check Java version compatibility (requires Java 8+):**
```bash
java -version
```

**Look for agent startup log message:**
When your application starts, you should see:
```
[otel.javaagent] OpenTelemetry Javaagent v2.22.0 started
```

### No metrics appearing in HyperDX {#no-metrics}

**Verify ClickStack is running and accessible:**
```bash
docker ps | grep clickstack
curl -v http://localhost:4318/v1/metrics
```

**Check that metrics exporter is configured:**
```bash
# If using environment variables, verify:
echo $OTEL_METRICS_EXPORTER
# Should output: otlp
```

**Check application logs for OpenTelemetry errors:**
Look for any error messages related to OpenTelemetry or OTLP export failures in your application logs.

**Verify network connectivity:**
If ClickStack is on a remote host, ensure port 4318 is accessible from your application server.

### High CPU or memory overhead {#high-overhead}

**Adjust metric export interval (default is 60 seconds):**
```bash
-Dotel.metric.export.interval=120000  # Export every 120 seconds instead
```

**Verify agent version:**
Ensure you're using the latest stable agent version (currently 2.22.0), as newer versions often include performance improvements.

## Next steps {#next-steps}

Now that you have JVM metrics flowing into ClickStack, consider:

- **Set up alerts** for critical metrics like high heap usage, frequent GC pauses, or thread exhaustion
- **Correlate with traces** by enabling trace collection with the same agent to see how JVM performance impacts request latency
- **Monitor multiple instances** and compare JVM behavior across different services or environments
- **Create custom dashboards** tailored to your specific application's memory and performance characteristics