---
slug: /use-cases/observability/clickstack/ingesting-data/otel-collector
pagination_prev: null
pagination_next: null
description: 'Open Telemetry Collector for ClickStack - The ClickHouse Observability Stack'
sidebar_label: 'OTel Collector'
title: 'ClickStack OTel Collector'
---

import Image from '@theme/IdealImage';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import observability_9 from '@site/static/images/use-cases/observability/observability-9.png';


All data is ingested into ClickStack via the **OpenTelemetry Collector**, which acts as the primary entry point for logs, metrics, traces, and session data. 

Users can send data to these endpoints either directly from [language SDKs](/use-cases/observability/clickstack/sdks) or through intermediate OpenTelemetry collector acting as agents over OTLP e.g. collecting infrastructure metrics and logs.

## Installing {#installing}

The OpenTelemetry Collector is included in most ClickStack distributions, including:

- [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)
- [Helm](/use-cases/observability/clickstack/deployment/helm)

If you're using the [HyperDX-only](/use-cases/observability/clickstack/deployment/hyperdx-only) distribution, you are responsible for delivering data into ClickHouse yourself. This can be done by:

- Running your own OpenTelemetry Collector and pointing it at ClickHouse - see [Standalone](#standalone).
- Sending directly to ClickHouse using alternative tooling (e.g., [Vector](https://vector.dev/), Fluentd, etc.)

:::note We recommend using the OpenTelemetry Collector
This allows users to benefit from standardized ingestion, enforced schemas, and out-of-the-box compatibility with the HyperDX UI. Using the default schema enables automatic source detection and preconfigured column mappings.
:::

### Standalone {#standalone}


## Creating a ClickHouse user {#creating-a-user}


## Collector roles {#collector-roles}


## Sending data to OpenTelemetry Endpoints {#opentelemetry-endpoints}

To send data to ClickStack, point your OpenTelemetry instrumentation to the following endpoints made available by the OpenTelemetry collector:

- **HTTP (OTLP):** `http://localhost:4318`
- **gRPC (OTLP):** `localhost:4317`

### Example {#example}

Set the `OTEL_EXPORTER_OTLP_ENDPOINT` environment variable in your application:

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

This configuration applies to most [language SDKs](/use-cases/observability/clickstack/sdks) and telemetry libraries that support OpenTelemetry.


## Securing the collector {#securing-the-collector}

SSL collector, use a key - RUM


## Processing - filtering, transforming and enriching {#processing-filtering-transforming-enriching}

Users will invariably want to filter, transform, and enrich event messages during ingestion. This can be achieved using a number of capabilities in OpenTelemetry:

- **Processors** - Processors take the data collected by [receivers and modify or transform](https://opentelemetry.io/docs/collector/transforming-telemetry/) it before sending it to the exporters. Processors are applied in the order as configured in the `processors` section of the collector configuration. These are optional, but the minimal set is [typically recommended](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors). When using an OTel collector with ClickHouse, we recommend limiting processors to:

- A [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md) is used to prevent out of memory situations on the collector. See [Estimating Resources](#estimating-resources) for recommendations.
- Any processor that does enrichment based on context. For example, the [Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) allows the automatic setting of spans, metrics, and logs resource attributes with k8s metadata e.g. enriching events with their source pod id.
- [Tail or head sampling](https://opentelemetry.io/docs/concepts/sampling/) if required for traces.
- [Basic filtering](https://opentelemetry.io/docs/collector/transforming-telemetry/) - Dropping events that are not required if this cannot be done via operator (see below).
- [Batching](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - essential when working with ClickHouse to ensure data is sent in batches. See ["Optimizing inserts"](#optimizing-inserts).

- **Operators** - [Operators](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) provide the most basic unit of processing available at the receiver. Basic parsing is supported, allowing fields such as the Severity and Timestamp to be set. JSON and regex parsing are supported here along with event filtering and basic transformations. We recommend performing event filtering here.

We recommend users avoid doing excessive event processing using operators or [transform processors](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md). These can incur considerable memory and CPU overhead, especially JSON parsing.  It is possible to do all processing in ClickHouse at insert time with materialized views and columns with some exceptions - specifically, context-aware enrichment e.g. adding of k8s metadata. For more details see [Extracting structure with SQL](/use-cases/observability/schema-design#extracting-structure-with-sql).

If processing is done using the OTel collector, we recommend doing transformations at the ClickStack collector (the gateway) instances and minimizing any work done at agent instances. This will ensure the resources required by agents at the edge, running on servers, are as minimal as possible. Typically, we see users only performing filtering (to minimize unnecessary network usage), timestamp setting (via operators), and enrichment, which requires context in agents. For example, if gateway instances reside in a different Kubernetes cluster, k8s enrichment will need to occur in the agent.

### Example {#example-processing}


For more advanced configuration we suggest the [OpenTelemetry Collector documentation](https://opentelemetry.io/docs/collector/).

## Optimizing inserts {#optimizing-inserts}

In order to achieve high insert performance while obtaining strong consistency guarantees, users should adhere to simple rules when inserting Observability data into ClickHouse via the ClickStack collector. With the correct configuration of the OTel collector, the following rules should be straightforward to follow.  This also avoids [common issues](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse) users encounter when using ClickHouse for the first time.

### Batching {#batching}

By default, each insert sent to ClickHouse causes ClickHouse to immediately create a part of storage containing the data from the insert together with other metadata that needs to be stored. Therefore sending a smaller amount of inserts that each contain more data, compared to sending a larger amount of inserts that each contain less data, will reduce the number of writes required. We recommend inserting data in fairly large batches of at least 1,000 rows at a time. Further details [here](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance).

By default, inserts into ClickHouse are synchronous and idempotent if identical. For tables of the merge tree engine family, ClickHouse will, by default, automatically [deduplicate inserts](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time). This means inserts are tolerant in cases like the following:

- (1) If the node receiving the data has issues, the insert query will time out (or get a more specific error) and not receive an acknowledgment.
- (2) If the data got written by the node, but the acknowledgement can't be returned to the sender of the query because of network interruptions, the sender will either get a time-out or a network error.

From the collector's perspective, (1) and (2) can be hard to distinguish. However, in both cases, the unacknowledged insert can just immediately be retried. As long as the retried insert query contains the same data in the same order, ClickHouse will automatically ignore the retried insert if the (unacknowledged) original insert succeeded.

For this reason the ClickStack distribution of the OTel collector uses the batch [batch processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md). This ensures inserts are sent as consistent batches of rows satisfying the above requirements. If a collector is expected to have high throughput (events per second), and at least 5000 events can be sent in each insert, this is usually the only batching required in the pipeline. In this case the collector will flush batches before the batch processor's `timeout` is reached, ensuring the end-to-end latency of the pipeline remains low and batches are of a consistent size.

### Use Asynchronous inserts {#use-asynchronous-inserts}

Typically, users are forced to send smaller batches when the throughput of a collector is low, and yet they still expect data to reach ClickHouse within a minimum end-to-end latency. In this case, small batches are sent when the `timeout` of the batch processor expires. This can cause problems and is when asynchronous inserts are required. This issue is rare if users are sending data to the ClickStack collector acting as a Gateway - by acting as aggregators they alleviate this problem - see [Collector roles](#collector-roles).

If large batches cannot be guaranteed, users can delegate batching to ClickHouse using [Asynchronous Inserts](/best-practices/selecting-an-insert-strategy#asynchronous-inserts). With asynchronous inserts, data is inserted into a buffer first and then written to the database storage later or asynchronously respectively.

<Image img={observability_6} alt="Async inserts" size="md"/>

With [enabled asynchronous inserts](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), when ClickHouse ① receives an insert query, the query's data is ② immediately written into an in-memory buffer first. When ③ the next buffer flush takes place, the buffer's data is [sorted](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) and written as a part to the database storage. Note, that the data is not searchable by queries before being flushed to the database storage; the buffer flush is [configurable](/optimize/asynchronous-inserts).

To enable asynchronous inserts for the collector, add `async_insert=1` to the connection string. We recommend users use `wait_for_async_insert=1` (the default) to get delivery guarantees - see [here](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) for further details.

Data from an async insert is inserted once the ClickHouse buffer is flushed. This occurs either after the [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size) is exceeded or after [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) milliseconds since the first INSERT query. If the `async_insert_stale_timeout_ms` is set to a non-zero value, the data is inserted after `async_insert_stale_timeout_ms milliseconds` since the last query. Users can tune these settings to control the end-to-end latency of their pipeline. Further settings which can be used to tune buffer flushing are documented [here](/operations/settings/settings#async_insert). Generally, defaults are appropriate.

:::note Consider Adaptive Asynchronous Inserts
In cases where a low number of agents are in use, with low throughput but strict end-to-end latency requirements, [adaptive asynchronous inserts](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts) may be useful. Generally, these are not applicable to high throughput Observability use cases, as seen with ClickHouse.
:::

Finally, the previous deduplication behavior associated with synchronous inserts into ClickHouse is not enabled by default when using asynchronous inserts. If required, see the setting [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate).

Full details on configuring this feature can be found [here](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), with a deep dive [here](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse).

## Scaling {#scaling}

The ClickStack OTel collector acts a Gateway instance - see [Collector roles](#collector-roles). These provide a standalone service, typically per data center or per region. These receive events from applications (or other collectors in the agent role) via a single OTLP endpoint. Typically a set of collector instances are deployed, with an out-of-the-box load balancer used to distribute the load amongst them.

<Image img={observability_8} alt="Scaling with gateways" size="md"/>

The objective of this architecture is to offload computationally intensive processing from the agents, thereby minimizing their resource usage. These ClickStack gateways can perform transformation tasks that would otherwise need to be done by agents. Furthermore, by aggregating events from many agents, the gateways can ensure large batches are sent to ClickHouse - allowing efficient insertion. These gateway collectors can easily be scaled as more agents and SDK sources are added and event throughput increases. 

### Adding Kafka {#adding-kafka}

Readers may notice the above architectures do not use Kafka as a message queue.

Using a Kafka queue as a message buffer is a popular design pattern seen in logging architectures and was popularized by the ELK stack. It provides a few benefits; principally, it helps provide stronger message delivery guarantees and helps deal with backpressure. Messages are sent from collection agents to Kafka and written to disk. In theory, a clustered Kafka instance should provide a high throughput message buffer since it incurs less computational overhead to write data linearly to disk than parse and process a message – in Elastic, for example, the tokenization and indexing incurs significant overhead. By moving data away from the agents, you also incur less risk of losing messages as a result of log rotation at the source. Finally, it offers some message reply and cross-region replication capabilities, which might be attractive for some use cases.

However, ClickHouse can handle inserting data very quickly - millions of rows per second on moderate hardware. Back pressure from ClickHouse is rare. Often, leveraging a Kafka queue means more architectural complexity and cost. If you can embrace the principle that logs do not need the same delivery guarantees as bank transactions and other mission-critical data, we recommend avoiding the complexity of Kafka.

However, if you require high delivery guarantees or the ability to replay data (potentially to multiple sources), Kafka can be a useful architectural addition.

<Image img={observability_9} alt="Adding kafka" size="md"/>

In this case, OTel agents can be configured to send data to Kafka via the [Kafka exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md). Gateway instances, in turn, consume messages using the [Kafka receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md). We recommend the Confluent and OTel documentation for further details.


## Estimating resources {#estimating-resources}

Resource requirements for the OTel collector will depend on the event throughput, the size of messages and amount of processing performed. The OpenTelemetry project maintains [benchmarks users](https://opentelemetry.io/docs/collector/benchmarks/) can use to estimate resource requirements.

[In our experience](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview), a ClickStack gateway instance with 3 cores and 12GB of RAM can handle around 60k events per second. This assumes a minimal processing pipeline responsible for renaming fields and no regular expressions.

For agent instances responsible for shipping events to a gateway, and only setting the timestamp on the event, we recommend users size based on the anticipated logs per second. The following represent approximate numbers users can use as a starting point:

| Logging rate | Resources to collector agent |
|--------------|------------------------------|
| 1k/second    | 0.2CPU, 0.2GiB              |
| 5k/second    | 0.5 CPU, 0.5GiB             |
| 10k/second   | 1 CPU, 1GiB                 |
