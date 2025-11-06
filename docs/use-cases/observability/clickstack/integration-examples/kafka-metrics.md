---
slug: /use-cases/observability/clickstack/integrations/kafka-metrics
title: 'Monitoring Kafka metrics with ClickStack'
sidebar_label: 'Kafka Metrics'
pagination_prev: null
pagination_next: null
description: 'Monitoring Kafka metrics with ClickStack'
doc_type: 'guide'
keywords: ['Kafka', 'metrics', 'OTEL', 'ClickStack', 'JMX']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/kafka/import-kafka-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/kafka/kafka-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

# Monitoring Kafka metrics with ClickStack {#kafka-metrics-clickstack}

:::note[TL;DR]
This guide shows you how to monitor Apache Kafka performance metrics with ClickStack by configuring the OpenTelemetry collector's JMX receiver. You'll learn how to:

- Configure the OTel collector to collect Kafka metrics via JMX
- Deploy ClickStack with your custom configuration
- Use a pre-built dashboard to visualize Kafka performance (broker throughput, partition lag, request rates, disk usage)

A demo dataset with sample metrics is available if you want to test the integration before configuring your production Kafka cluster.

Time required: 10-15 minutes
:::

## Integration with existing Kafka {#existing-kafka}

This section covers configuring your existing Kafka installation to send metrics to ClickStack by configuring the ClickStack OTel collector with the JMX receiver.

If you would like to test the Kafka Metrics integration before configuring your own existing setup, you can test with our preconfigured demo dataset in the [following section](#demo-dataset).

##### Prerequisites {#prerequisites}
- ClickStack instance running
- Existing Kafka installation (version 2.0 or newer)
- JMX port exposed on Kafka brokers (default port 9999)
- Network access from ClickStack to Kafka JMX endpoints
- JMX authentication credentials if enabled

<VerticalStepper headerLevel="h4">

#### Enable JMX on Kafka brokers {#enable-jmx}

Kafka exposes metrics via JMX (Java Management Extensions). Ensure JMX is enabled on your Kafka brokers.

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
# Test JMX connection (requires jmxterm or similar tool)
echo "domains" | java -jar jmxterm.jar -l localhost:9999 -n
# Should list available JMX domains including kafka.server
```

**Common Kafka JMX endpoints:**
- **Local installation**: `localhost:9999`
- **Docker**: Use container name or service name (e.g., `kafka:9999`)
- **Remote**: `<kafka-host>:9999`

#### Create custom OTel collector configuration {#custom-otel}

ClickStack allows you to extend the base OpenTelemetry collector configuration by mounting a custom configuration file and setting an environment variable. The custom configuration is merged with the base configuration managed by HyperDX via OpAMP.

Create a file named `kafka-metrics.yaml` with the following configuration:
```yaml title="kafka-metrics.yaml"
receivers:
  jmx:
    jar_path: /opt/opentelemetry-jmx-metrics.jar
    endpoint: "kafka:9999"
    target_system: kafka
    collection_interval: 10s
    # Uncomment if JMX requires authentication
    # username: ${env:JMX_USERNAME}
    # password: ${env:JMX_PASSWORD}

processors:
  resource:
    attributes:
      - key: service.name
        value: "kafka"
        action: upsert
      - key: kafka.broker.id
        value: "broker-0"
        action: upsert

service:
  pipelines:
    metrics/kafka:
      receivers: [jmx]
      processors:
        - resource
        - memory_limiter
        - batch
      exporters:
        - clickhouse
```

This configuration:
- Connects to Kafka's JMX endpoint at `kafka:9999` (adjust endpoint for your setup)
- Uses the JMX receiver with Kafka-specific metric mappings via `target_system: kafka`
- Collects metrics every 10 seconds
- **Sets the required `service.name` resource attribute** per [OpenTelemetry semantic conventions](https://opentelemetry.io/docs/specs/semconv/resource/#service)
- Routes metrics to the ClickHouse exporter via a dedicated pipeline

**Key metrics collected:**

*Broker metrics:*
- `kafka.broker.message_in_rate` - Messages received per second
- `kafka.broker.byte_in_rate` - Bytes received per second
- `kafka.broker.byte_out_rate` - Bytes sent per second
- `kafka.broker.request_rate` - Requests handled per second
- `kafka.broker.log_flush_rate` - Log flush operations per second

*Partition metrics:*
- `kafka.partition.count` - Total number of partitions
- `kafka.partition.leader_count` - Number of partitions this broker leads
- `kafka.partition.under_replicated` - Under-replicated partitions (data safety concern)
- `kafka.partition.offline` - Offline partitions (availability concern)

*Request metrics:*
- `kafka.request.produce.time.avg` - Average produce request latency
- `kafka.request.fetch_consumer.time.avg` - Average consumer fetch latency
- `kafka.request.fetch_follower.time.avg` - Average follower fetch latency
- `kafka.request.queue.size` - Request queue depth

*Consumer lag:*
- `kafka.consumer.lag` - Consumer group lag by topic and partition
- `kafka.consumer.lag_max` - Maximum lag across all partitions

*Disk and storage:*
- `kafka.log.size` - Total log size in bytes
- `kafka.log.segment.count` - Number of log segments

:::note
- You only define new receivers, processors, and pipelines in the custom config
- The `memory_limiter` and `batch` processors and `clickhouse` exporter are already defined in the base ClickStack configuration - you just reference them by name
- The `resource` processor sets the required `service.name` attribute per OpenTelemetry semantic conventions
- For production with JMX authentication, store credentials in environment variables: `${env:JMX_USERNAME}` and `${env:JMX_PASSWORD}`
- Adjust `collection_interval` based on your needs (10s default; lower values increase data volume)
- For multiple brokers, create separate receiver configurations with unique broker IDs in the resource attributes
- The JMX receiver JAR (`opentelemetry-jmx-metrics.jar`) is included in the ClickStack OTel collector image
:::

#### Configure ClickStack to load custom configuration {#load-custom}

To enable custom collector configuration in your existing ClickStack deployment, you must:

1. Mount the custom config file at `/etc/otelcol-contrib/custom.config.yaml`
2. Set the environment variable `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
3. Ensure network connectivity between ClickStack and Kafka JMX endpoints

##### Option 1: Docker Compose {#docker-compose}

Update your ClickStack deployment configuration:
```yaml
services:
  clickstack:
    # ... existing configuration ...
    environment:
      - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
      # Optional: If JMX requires authentication
      # - JMX_USERNAME=monitoring
      # - JMX_PASSWORD=your-jmx-password
      # ... other environment variables ...
    volumes:
      - ./kafka-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      # ... other volumes ...
    # If Kafka is in the same compose file:
    depends_on:
      - kafka

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

##### Option 2: Docker run (all-in-one image) {#all-in-one}

If using the all-in-one image with `docker run`:
```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/kafka-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

**Important:** If Kafka is running in another container, use Docker networking:
```bash
# Create a network
docker network create monitoring

# Run Kafka on the network
docker run -d --name kafka --network monitoring \
  -e JMX_PORT=9999 \
  -e KAFKA_JMX_HOSTNAME=kafka \
  -p 9092:9092 -p 9999:9999 \
  confluentinc/cp-kafka:latest

# Run ClickStack on the same network (endpoint is "kafka:9999" in config)
docker run --name clickstack \
  --network monitoring \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/kafka-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

#### Verify metrics in HyperDX {#verifying-metrics}

Once configured, log into HyperDX and verify metrics are flowing:

1. Navigate to the Metrics explorer
2. Search for metrics starting with `kafka.` (e.g., `kafka.broker.message_in_rate`, `kafka.partition.count`)
3. You should see metric data points appearing at your configured collection interval

</VerticalStepper>

## Demo dataset {#demo-dataset}

For users who want to test the Kafka Metrics integration before configuring their production systems, we provide a pre-generated dataset with realistic Kafka metrics patterns.

<VerticalStepper headerLevel="h4">

#### Download the sample metrics dataset {#download-sample}

Download the pre-generated metrics files (24 hours of Kafka metrics with realistic patterns):
```bash
# Download gauge metrics (partition counts, queue sizes)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/kafka/kafka-metrics-gauge.csv

# Download sum metrics (message rates, byte rates, request counts)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/kafka/kafka-metrics-sum.csv
```

The dataset includes realistic patterns:
- **Morning traffic ramp (07:00-09:00)** - Gradual increase in message throughput
- **Production deployment (11:30)** - Brief spike in consumer lag, then recovery
- **Peak load (14:00-16:00)** - Maximum throughput with occasional under-replicated partitions
- **Rebalance event (18:45)** - Consumer group rebalance causing temporary lag spike
- **Daily patterns** - Business hours peaks, off-hours baseline, weekend traffic drops

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
# Load gauge metrics (partition counts, queue sizes)
cat kafka-metrics-gauge.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"

# Load sum metrics (message rates, byte rates)
cat kafka-metrics-sum.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_sum FORMAT CSVWithNames"
```

#### Verify metrics in HyperDX {#verify-metrics}

Once loaded, the quickest way to see your metrics is through the pre-built dashboard.

Proceed to the [Dashboards and visualization](#dashboards) section to import the dashboard and view all Kafka metrics at once.

:::note
The demo dataset time range is 2025-10-20 00:00:00 to 2025-10-21 05:00:00. Make sure your time range in HyperDX matches this window.

Look for these interesting patterns:
- **07:00-09:00** - Morning traffic ramp-up
- **11:30** - Production deployment with lag spike
- **14:00-16:00** - Peak throughput period
- **18:45** - Consumer rebalance event
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

**Dashboard panels include:**
- **Broker Throughput** - Messages/sec and bytes/sec in/out
- **Request Performance** - Average latency for produce, consumer fetch, and follower fetch requests
- **Partition Health** - Total partitions, leaders, under-replicated, and offline counts
- **Consumer Lag** - Current lag and maximum lag across consumer groups
- **Request Queue** - Pending requests indicating broker saturation
- **Disk Usage** - Total log size and segment counts

:::note
For the demo dataset, ensure the time range is set to 2025-10-20 05:00:00 - 2025-10-21 05:00:00.
:::

</VerticalStepper>

## Troubleshooting {#troubleshooting}

### Custom config not loading {#troubleshooting-not-loading}

Verify the environment variable `CUSTOM_OTELCOL_CONFIG_FILE` is set correctly:
```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

Check that the custom config file is mounted at `/etc/otelcol-contrib/custom.config.yaml`:
```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
```

View the custom config content to verify it's readable:
```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```

### No metrics appearing in HyperDX {#no-metrics}

Verify JMX is accessible from the collector:
```bash
# Test connectivity to JMX port
docker exec <clickstack-container> telnet kafka 9999
# Should connect successfully
```

Check if the JMX metrics JAR is present:
```bash
docker exec <container> ls -lh /opt/opentelemetry-jmx-metrics.jar
# Should show the JAR file
```

Verify the effective config includes your JMX receiver:
```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 "jmx:"
```

Check for errors in the collector logs:
```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i jmx
# Look for connection errors or authentication failures
```

### JMX authentication errors {#auth-errors}

If you see authentication errors in the logs:
```bash
# Verify JMX authentication is enabled in Kafka
docker exec <kafka-container> env | grep JMX

# Ensure credentials are set in ClickStack environment
docker exec <clickstack-container> printenv JMX_USERNAME
docker exec <clickstack-container> printenv JMX_PASSWORD
```

Update your configuration to use credentials:
```yaml
receivers:
  jmx:
    endpoint: "kafka:9999"
    target_system: kafka
    username: ${env:JMX_USERNAME}
    password: ${env:JMX_PASSWORD}
```

### Network connectivity issues {#network-issues}

If ClickStack can't reach Kafka JMX:
```bash
# Check if both containers are on the same network
docker network inspect <network-name>

# Test connectivity
docker exec <clickstack-container> ping kafka
docker exec <clickstack-container> telnet kafka 9999
```

Ensure your Docker Compose file or `docker run` commands place both containers on the same network.

### JMX receiver performance issues {#performance-issues}

If the JMX receiver is consuming too many resources:

- Increase the `collection_interval` to reduce scraping frequency (e.g., `30s` instead of `10s`)
- Configure the JMX receiver to collect only specific metrics using the `additional_jvm_metrics` option
- Monitor the collector's memory usage and adjust the `memory_limiter` processor if needed

### Missing specific metrics {#missing-metrics}

If certain Kafka metrics are not appearing:

- Verify the metric exists in Kafka's JMX endpoint using a JMX browser tool
- Check that `target_system: kafka` is set correctly in the receiver configuration
- Some metrics may only appear under specific conditions (e.g., consumer lag only appears when consumers are active)
- Review the [OpenTelemetry JMX receiver documentation](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/jmx-metrics) for the complete list of Kafka metrics

## Next steps {#next-steps}

If you want to explore further, here are some next steps to experiment with your monitoring:

- Set up [alerts](/use-cases/observability/clickstack/alerts) for critical metrics (under-replicated partitions, consumer lag thresholds, disk usage)
- Create additional dashboards for specific use cases (producer performance, topic-level metrics, consumer group monitoring)
- Monitor multiple Kafka brokers by duplicating the receiver configuration with different endpoints and broker IDs
- Integrate Kafka topic metadata using the Kafka receiver for deeper visibility into message flow
- Correlate Kafka metrics with application traces to understand end-to-end request performance
