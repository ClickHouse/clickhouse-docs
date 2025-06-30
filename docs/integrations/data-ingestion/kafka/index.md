
# Integrating Kafka with ClickHouse

[Apache Kafka](https://kafka.apache.org/) is an open-source distributed event streaming platform used by thousands of companies for high-performance data pipelines, streaming analytics, data integration, and mission-critical applications. ClickHouse provides multiple options to **read from** and **write to** Kafka and other Kafka API-compatible brokers (e.g., Redpanda, Amazon MSK).

## Available options {#available-options}

Choosing the right option for your use case depends on multiple factors, including your ClickHouse deployment type, data flow direction and operational requirements.

|Option   | Deployment type | Kafka to ClickHouse | ClickHouse to Kafka | Fully managed      |
|---------|------------|:-------------------:|:-------------------:|:------------------:|
| [ClickPipes for Kafka](../clickpipes/kafka.md) | [CH Cloud]                  | ✅ |   | ✅ |
| [Kafka Connect Sink](./kafka-clickhouse-connect-sink.md)   | [CH Cloud], [CH BYOC], [CH OSS] | ✅ |   |   |
| [Kafka table engine](./kafka-table-engine.md)   | [CH Cloud], [CH BYOC], [CH OSS] | ✅ | ✅ |   |

For a more detailed comparison between these options, see [Choosing an option](#choosing-an-option).

### ClickPipes for Kafka {#clickpipes-for-kafka}

[ClickPipes](../clickpipes/index.md) is a managed integration platform that makes ingesting data from a diverse set of sources as simple as clicking a few buttons. Because it is fully managed and purpose-built for production workloads, ClickPipes significantly lowers infrastructure (CAPEX) and operational (OPEC'S) costs, removing the need for external data streaming and ETL tools.

:::tip
This is the recommended option if you're a ClickHouse Cloud user. ClickPipes is **fully managed** and purpose-built to deliver the **best performance** in Cloud environments.
:::

#### Main features {#clickpipes-for-kafka-main-features}

[//]: # "TODO(morsapaes) It isn't optimal to link to a static alpha-release of the Terraform provider. Link to a Terraform guide once that's available."

* Optimized for ClickHouse Cloud, delivering blazing-fast performance
* Horizontal and vertical scalability for high-throughput workloads
* Built-in fault tolerance with configurable replicas and automatic retries
* Deployment and management via ClickHouse Cloud UI, [Open API](../../../cloud/manage/api/api-overview.md), or [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.3.3-alpha2/docs/resources/clickpipe)
* Enterprise-grade security with support for cloud-native authorization (IAM) and private connectivity (PrivateLink)
* Support for a wide range of [data sources](../clickpipes/kafka.md#supported-data-sources), including Confluent Cloud, Amazon MSK, Redpanda Cloud, and Azure Event Hubs

#### Getting started {#clickpipes-for-kafka-getting-started}

To get started using ClickPipes for Kafka, see the [reference documentation](../clickpipes/kafka.md) or navigate to the `Data Sources` tab in the ClickHouse Cloud UI.

### Kafka Connect Sink {#kafka-connect-sink}

Kafka Connect is an open-source framework that works as a centralized data hub for simple data integration between Kafka and other data systems. The [ClickHouse Kafka Connect Sink](https://github.com/ClickHouse/clickhouse-kafka-connect) connector provides a scalable and highly-configurable option to read data from Apache Kafka and other Kafka API-compatible brokers.

:::tip
This is the recommended option if you're already a Kafka Connect user. The Kafka Connect Sink offers a rich set of features and configuration options for **advanced tuning**.
:::

#### Main features {#kafka-connect-sink-main-features}

* Can be configured to support exactly-once semantics
* Supports all ClickHouse data types
* Handles structured data with declared schemas and unstructured JSON data
* Tested continuously against ClickHouse Cloud

#### Getting started {#kafka-connect-sink-getting-started}

To get started using the ClickHouse Kafka Connect Sink, see the [reference documentation](./kafka-clickhouse-connect-sink.md).

### Kafka Table Engine {#kafka-table-engine}

The [Kafka table engine](./kafka-table-engine.md) can be used to read data from and write data to Apache Kafka and other Kafka API-compatible brokers. This option is bundled with open-source ClickHouse and is available across all deployment types.

:::tip
This is the recommended option if you're self-hosting ClickHouse and need a **low entry barrier** option, or if you need to **write** data to Kafka.
:::

#### Main features {#kafka-table-engine-main-features}

* Can be used for reading and writing data
* Bundled with open-source ClickHouse
* Supports all ClickHouse data types

#### Getting started {kafka-table-engine-getting-started}

To get started using the Kafka Table Engine, see the [reference documentation](./kafka-table-engine.md).

### Choosing an option {#choosing-an-option}

| Product | Deployment | Strengths | Weaknesses |
|---------|------------|-----------|------------|
| **ClickPipes for Kafka** | [CH Cloud] | • Scalable architecture for high throughput and low latency<br/>• Built-in monitoring and schema management<br/>• Private networking connections (via PrivateLink)<br/>• Supports SSL/TLS authentication and IAM authorization<br/>• Supports programmatic configuration (Terraform, API endpoints) | • Does not support pushing data to Kafka<br/>• At-least-once semantics |
| **Kafka Connect Sink** | [CH Cloud]<br/>[CH BYOC]<br/>[CH OSS] | • Exactly-once semantics<br/>• Allows granular control over data transformation, batching and error handling<br/>• Can be deployed in private networks<br/>• Allows real-time replication from databases not yet supported in ClickPipes via Debezium | • Does not support pushing data to Kafka<br/>• Operationally complex to set up and maintain<br/>• Requires Kafka and Kafka Connect expertise |
| **Kafka Table Engine** | [CH Cloud]<br/>[CH BYOC]<br/>[CH OSS] | • Supports pushing data to Kafka<br/>• Allows real-time replication from databases not yet supported in ClickPipes via Debezium | • At-least-once semantics<br/>• Limited horizontal scaling for consumers. Cannot be scaled independently from the CH server<br/>• Limited error handling and debugging options<br/>• Requires Kafka expertise |

### Other options {#other-options}

* [**Confluent Cloud**](./confluent/index.md) - Confluent platform provides an option to upload and [run ClickHouse Connector Sink on Confluent Cloud](./confluent/custom-connector.md) or use [HTTP Sink Connector for Confluent Platform](./confluent/kafka-connect-http.md) that integrates Apache Kafka with an API via HTTP or HTTPS.

* [**Vector**](./kafka-vector.md) - Vector is a vendor agnostic data pipeline. With the ability to read from Kafka, and send events to ClickHouse, this represents a robust integration option.

* [**JDBC Connect Sink**](./kafka-connect-jdbc.md) - The Kafka Connect JDBC Sink connector allows you to export data from Kafka topics to any relational database with a JDBC driver.

* **Custom code** - Custom code using respective client libraries for Kafka and ClickHouse may be appropriate cases where custom processing of events is required. This is beyond the scope of this documentation.

[CH BYOC]: ../../../cloud/reference/byoc.md
[CH Cloud]: ../../../cloud-index.md
[CH OSS]: ../../../intro.md
