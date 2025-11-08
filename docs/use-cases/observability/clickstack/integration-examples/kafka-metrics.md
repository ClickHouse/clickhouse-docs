---
slug: /use-cases/observability/clickstack/integrations/kafka-metrics
title: 'Monitoring Kafka Metrics with ClickStack'
sidebar_label: 'Kafka Metrics'
pagination_prev: null
pagination_next: null
description: 'Monitoring Kafka Metrics with ClickStack'
doc_type: 'guide'
keywords: ['Kafka', 'metrics', 'OTEL', 'ClickStack', 'JMX']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/kafka/import-kafka-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/kafka/kafka-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

# Monitoring Kafka Metrics with ClickStack {#kafka-metrics-clickstack}

:::note[TL;DR]
This guide shows you how to monitor Apache Kafka performance metrics with ClickStack by using the OpenTelemetry JMX Metric Gatherer. You'll learn how to:

- Enable JMX on Kafka brokers and configure the JMX Metric Gatherer
- Send Kafka metrics to ClickStack via OTLP
- Use a pre-built dashboard to visualize Kafka performance (broker throughput, consumer lag, partition health, request latency)

A demo dataset with sample metrics is available if you want to test the integration before configuring your production Kafka cluster.

Time required: 10-15 minutes
:::

## Integration with existing Kafka {#existing-kafka}

This section covers configuring your existing Kafka installation to send metrics to ClickStack using the OpenTelemetry JMX Metric Gatherer.

If you would like to test the Kafka Metrics integration before configuring your own existing setup, you can test with our preconfigured demo dataset in the [following section](#demo-dataset).

##### Prerequisites {#prerequisites}
- ClickStack instance running with OTLP endpoint accessible (port 4317)
- Existing Kafka installation (version 2.0 or newer)
- JMX port exposed on Kafka brokers (default port 9999)
- Java Runtime Environment (JRE) 8 or higher installed on the Kafka broker host
- Network access from Kafka broker to ClickStack OTLP endpoint

<VerticalStepper headerLevel="h4">

#### Verify Kafka JMX is enabled {#verify-jmx}

Kafka exposes metrics via JMX (Java Management Extensions). Verify JMX is enabled on your Kafka brokers.

Add these settings to your Kafka broker startup configuration:
```bash
# Set JMX port
export JMX_PORT=9999

# Optional: Enable JMX authentication
# export KAFKA_JMX_OPTS="-Dcom.sun.management.jmxremote \
#   -Dcom.sun.management.jmxremote.authenticate=true \
#   -Dcom.sun.management.jmxremote.ssl=false \
#   -Dcom.sun.management.jmxremote.password.file=/path/to/jmxremote.password \
#   -Dcom.sun.management.jmxremote.access.file=/path/to/jmxremote.access"
```

For Docker deployments:
```yaml
services:
  kafka:
    image: confluentinc/cp-kafka:latest
    environment:
      JMX_PORT: 9999
      KAFKA_JMX_HOSTNAME: kafka
      # ... other Kafka configuration ...
    ports:
      - "9092:9092"
      - "9999:9999"
```

Verify JMX is accessible:
```bash
# Check if JMX port is listening
netstat -an | grep 9999
# Or check environment variable
echo $JMX_PORT
```

#### Download the JMX Metric Gatherer {#download-jmx}

Download the OpenTelemetry JMX Metric Gatherer JAR on the Kafka broker host:

```bash
curl -L -o opentelemetry-jmx-metrics.jar \
  https://github.com/open-telemetry/opentelemetry-java-contrib/releases/download/v1.32.0/opentelemetry-jmx-metrics.jar
```

#### Run the JMX Metric Gatherer {#run-jmx}

Start the JMX Metric Gatherer to collect metrics from Kafka and send them to ClickStack:

```bash
java \
  -Dotel.jmx.service.url=service:jmx:rmi:///jndi/rmi://localhost:9999/jmxrmi \
  -Dotel.jmx.target.system=kafka \
  -Dotel.metrics.exporter=otlp \
  -Dotel.exporter.otlp.endpoint=http://<clickstack-host>:4317 \
  -Dotel.resource.attributes=service.name=kafka,kafka.broker.id=broker-0 \
  -Dotel.jmx.interval.milliseconds=10000 \
  -jar opentelemetry-jmx-metrics.jar
```

Replace `<clickstack-host>` with your ClickStack hostname or IP address (use `localhost` if ClickStack is on the same host).

**For JMX authentication:**
```bash
java \
  -Dotel.jmx.service.url=service:jmx:rmi:///jndi/rmi://localhost:9999/jmxrmi \
  -Dotel.jmx.username=<jmx-username> \
  -Dotel.jmx.password=<jmx-password> \
  -Dotel.jmx.target.system=kafka \
  -Dotel.metrics.exporter=otlp \
  -Dotel.exporter.otlp.endpoint=http://<clickstack-host>:4317 \
  -Dotel.resource.attributes=service.name=kafka,kafka.broker.id=broker-0 \
  -jar opentelemetry-jmx-metrics.jar
```

**For multiple Kafka brokers**, run a separate JMX Metric Gatherer process on each broker with unique broker IDs:
```bash
# On broker 0
java -Dotel.resource.attributes=service.name=kafka,kafka.broker.id=broker-0 ...

# On broker 1
java -Dotel.resource.attributes=service.name=kafka,kafka.broker.id=broker-1 ...
```

**To run as a background service**, use `nohup` or create a systemd service:
```bash
nohup java \
  -Dotel.jmx.service.url=service:jmx:rmi:///jndi/rmi://localhost:9999/jmxrmi \
  -Dotel.jmx.target.system=kafka \
  -Dotel.metrics.exporter=otlp \
  -Dotel.exporter.otlp.endpoint=http://<clickstack-host>:4317 \
  -Dotel.resource.attributes=service.name=kafka,kafka.broker.id=broker-0 \
  -jar opentelemetry-jmx-metrics.jar > jmx-collector.log 2>&1 &
```

**Key metrics collected:**

*Broker metrics:*
- `kafka.broker.message_in_rate` - Messages received per second
- `kafka.broker.byte_in_rate` - Bytes received per second
- `kafka.broker.byte_out_rate` - Bytes sent per second

*Partition metrics:*
- `kafka.partition.count` - Total number of partitions
- `kafka.partition.under_replicated` - Under-replicated partitions (data safety concern)
- `kafka.partition.offline` - Offline partitions (availability concern)

*Request metrics:*
- `kafka.request.produce.time.avg` - Average produce request latency
- `kafka.request.fetch_consumer.time.avg` - Average consumer fetch latency

*Consumer lag:*
- `kafka.consumer.lag` - Consumer group lag by topic and partition

#### Verify metrics in HyperDX {#verifying-metrics}

Once configured, log into HyperDX and verify metrics are flowing:

1. Navigate to the Chart Explorer
2. Search for metrics starting with `kafka.` (e.g., `kafka.broker.message_in_rate`, `kafka.partition.count`)
3. You should see metric data points appearing at 10-second intervals

</VerticalStepper>

## Demo dataset {#demo-dataset}

For users who want to test the Kafka Metrics integration before configuring their production systems, we provide a pre-generated dataset with realistic Kafka metrics patterns.

<VerticalStepper headerLevel="h4">

#### Download the sample metrics dataset {#download-sample}

Download the pre-generated metrics files (29 hours of Kafka metrics with realistic patterns):
```bash
# Download gauge metrics (partition counts, queue sizes, latencies, consumer lag)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/kafka/kafka-metrics-gauge.csv

# Download sum metrics (message rates, byte rates, request counts)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/kafka/kafka-metrics-sum.csv
```

The dataset includes realistic patterns for a single-broker e-commerce Kafka cluster:
- **06:00-08:00: Morning surge** - Sharp traffic ramp from overnight baseline
- **10:00-10:15: Flash sale** - Dramatic spike to 3.5x normal traffic
- **11:30: Deployment event** - 12x consumer lag spike with under-replicated partitions
- **14:00-15:30: Peak shopping** - Sustained high traffic at 2.8x baseline
- **17:00-17:30: After-work surge** - Secondary traffic peak
- **18:45: Consumer rebalance** - 6x lag spike during rebalancing
- **20:00-22:00: Evening drop** - Steep decline to overnight levels

#### Start ClickStack {#start-clickstack}

Start a ClickStack instance:
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

Wait approximately 30 seconds for ClickStack to fully start.

#### Load metrics into ClickStack {#load-metrics}

Load the metrics directly into ClickHouse:
```bash
# Load gauge metrics (partition counts, queue sizes, latencies, consumer lag)
cat kafka-metrics-gauge.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"

# Load sum metrics (message rates, byte rates, request counts)
cat kafka-metrics-sum.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_sum FORMAT CSVWithNames"
```

#### Verify metrics in HyperDX {#verify-metrics}

Once loaded, the quickest way to see your metrics is through the pre-built dashboard.

Proceed to the [Dashboards and visualization](#dashboards) section to import the dashboard and view all Kafka metrics at once.

:::note
The demo dataset time range is 2025-11-05 16:00:00 to 2025-11-06 16:00:00. Make sure your time range in HyperDX matches this window.
:::

</VerticalStepper>

## Dashboards and visualization {#dashboards}

To help you get started monitoring Kafka with ClickStack, we provide essential visualizations for Kafka metrics.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/kafka-metrics-dashboard.json')} download="kafka-metrics-dashboard.json" eventName="docs.kafka_metrics_monitoring.dashboard_download">Download</TrackedLink> the dashboard configuration {#download}

#### Import the pre-built dashboard {#import-dashboard}

1. Open HyperDX and navigate to the Dashboards section
2. Click **Import Dashboard** in the upper right corner under the ellipses

<Image img={import_dashboard} alt="Import dashboard button"/>

3. Upload the `kafka-metrics-dashboard.json` file and click **Finish Import**

<Image img={finish_import} alt="Finish import dialog"/>

#### View the dashboard {#created-dashboard}

The dashboard will be created with all visualizations pre-configured:

<Image img={example_dashboard} alt="Kafka Metrics dashboard"/>

:::note
For the demo dataset, ensure the time range is set to 2025-11-05 16:00:00 to 2025-11-06 16:00:00.
:::

</VerticalStepper>

## Troubleshooting {#troubleshooting}

### JMX Metric Gatherer not starting {#jmx-not-starting}

Verify Java is installed and in your PATH:
```bash
java -version
# Should display Java version 8 or higher
```

Check that the JAR file was downloaded successfully:
```bash
ls -lh opentelemetry-jmx-metrics.jar
# Should show ~26MB file
```

### No metrics appearing in HyperDX {#no-metrics}

Verify the JMX Metric Gatherer is running:
```bash
# Check if process is running
ps aux | grep opentelemetry-jmx-metrics

# Check for any error output
# If you ran with nohup, check the log file
tail -f jmx-collector.log
```

Verify Kafka's JMX port is accessible:
```bash
# Check if JMX port is listening
netstat -an | grep 9999

# Test with jconsole or jmxterm if available
```

Verify ClickStack's OTLP endpoint is reachable:
```bash
# Test connectivity to ClickStack
telnet <clickstack-host> 4317
# Or
curl -v http://<clickstack-host>:4317
```

Check if metrics are in ClickHouse:
```bash
docker exec <clickstack-container> clickhouse-client --query "
SELECT DISTINCT MetricName 
FROM otel_metrics_sum 
WHERE ServiceName = 'kafka' 
  AND TimeUnix >= NOW() - INTERVAL 10 MINUTE
"
```

### JMX authentication errors {#auth-errors}

If you see authentication errors when starting the JMX Metric Gatherer:

```bash
# Verify JMX authentication is enabled in Kafka
echo $KAFKA_JMX_OPTS
```

Add authentication parameters to the java command:
```bash
java \
  -Dotel.jmx.service.url=service:jmx:rmi:///jndi/rmi://localhost:9999/jmxrmi \
  -Dotel.jmx.username=<jmx-username> \
  -Dotel.jmx.password=<jmx-password> \
  -Dotel.jmx.target.system=kafka \
  -Dotel.metrics.exporter=otlp \
  -Dotel.exporter.otlp.endpoint=http://<clickstack-host>:4317 \
  -Dotel.resource.attributes=service.name=kafka,kafka.broker.id=broker-0 \
  -jar opentelemetry-jmx-metrics.jar
```

### Network connectivity issues {#network-issues}

If the JMX Metric Gatherer can't reach Kafka JMX or ClickStack OTLP:

```bash
# Test JMX connectivity
telnet localhost 9999

# Test ClickStack OTLP endpoint
telnet <clickstack-host> 4317

# Check firewall rules
# Ensure ports 9999 (JMX) and 4317 (OTLP) are open
```

### Missing specific metrics {#missing-metrics}

If certain Kafka metrics are not appearing:

- Verify the metric exists in Kafka's JMX endpoint using a JMX browser tool like JConsole
- Check that `target_system: kafka` is set correctly
- Some metrics may only appear under specific conditions (e.g., consumer lag only appears when consumers are active)
- Review the [OpenTelemetry JMX Metric Gatherer documentation](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/jmx-metrics) for the complete list of Kafka metrics

## Next steps {#next-steps}

- Set up alerts for critical metrics (under-replicated partitions, consumer lag thresholds, high request latency)
- Monitor multiple Kafka brokers by running separate JMX Metric Gatherer processes with different broker IDs
- Correlate Kafka metrics with application traces to understand end-to-end request performance
