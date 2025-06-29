---
sidebar_label: 'Integrating Kafka with ClickHouse'
sidebar_position: 1
slug: /integrations/kafka
description: 'Introduction to Kafka with ClickHouse'
title: 'Integrating Kafka with ClickHouse'
---

# Integrating Kafka with ClickHouse

[Apache Kafka](https://kafka.apache.org/) is an open-source distributed event streaming platform used by thousands of companies for high-performance data pipelines, streaming analytics, data integration, and mission-critical applications. In most cases involving Kafka and ClickHouse, users will wish to insert Kafka based data into ClickHouse. Below we outline several options for both use cases, identifying the pros and cons of each approach.

## Choosing an option {#choosing-an-option}

When integrating Kafka with ClickHouse, you will need to make early architectural decisions about the high-level approach used. We outline the most common strategies below:

### ClickPipes for Kafka (ClickHouse Cloud) {#clickpipes-for-kafka-clickhouse-cloud}
* [**ClickPipes**](../clickpipes/kafka.md) offers the easiest and most intuitive way to ingest data into ClickHouse Cloud. With support for Apache Kafka, Confluent Cloud and Amazon MSK today, and many more data sources coming soon.

### Third party cloud-based Kafka connectivity {#3rd-party-cloud-based-kafka-connectivity}
* [**Confluent Cloud**](./confluent/index.md) - Confluent platform provides an option to upload and [run ClickHouse Connector Sink on Confluent Cloud](./confluent/custom-connector.md) or use [HTTP Sink Connector for Confluent Platform](./confluent/kafka-connect-http.md) that integrates Apache Kafka with an API via HTTP or HTTPS.

* [**Amazon MSK**](./msk/index.md) - support Amazon MSK Connect framework to forward data from Apache Kafka clusters to external systems such as ClickHouse. You can install ClickHouse Kafka Connect on Amazon MSK.

* [**Redpanda Cloud**](https://cloud.redpanda.com/) - Redpanda is a Kafka API-compatible streaming data platform that can be used as an upstream data source for ClickHouse. The hosted cloud platform, Redpanda Cloud, integrates with ClickHouse over Kafka protocol, enabling real-time data ingestion for streaming analytics workloads

### Self-managed Kafka connectivity {#self-managed-kafka-connectivity}
* [**Kafka Connect**](./kafka-clickhouse-connect-sink.md) - Kafka Connect is a free, open-source component of Apache Kafka that works as a centralized data hub for simple data integration between Kafka and other data systems.  Connectors provide a simple means of scalable and reliably streaming data to and from Kafka.  Source Connectors inserts data to Kafka topics from other systems, whilst Sink Connectors delivers data from Kafka topics into other data stores such as ClickHouse.
* [**Vector**](./kafka-vector.md) - Vector is a vendor agnostic data pipeline. With the ability to read from Kafka, and send events to ClickHouse, this represents a robust integration option.
* [**JDBC Connect Sink**](./kafka-connect-jdbc.md) - The Kafka Connect JDBC Sink connector allows you to export data from Kafka topics to any relational database with a JDBC driver
* **Custom code** - Custom code using respective client libraries for Kafka and ClickHouse may be appropriate cases where custom processing of events is required. This is beyond the scope of this documentation.
* [**Kafka table engine**](./kafka-table-engine.md) provides a Native ClickHouse integration (not available on ClickHouse Cloud). This table engine **pulls** data from the source system. This requires ClickHouse to have direct access to Kafka.
* [**Kafka table engine with named collections**](./kafka-table-engine-named-collections.md) - Using named collections provides native ClickHouse integration with Kafka. This approach allows secure connections to multiple Kafka clusters, centralizing configuration management and improving scalability and security.

### Choosing an approach {#choosing-an-approach}
It comes down to a few decision points:

* **Connectivity** - The Kafka table engine needs to be able to pull from Kafka if ClickHouse is the destination. This requires bi-directional connectivity. If there is a network separation, e.g. ClickHouse is in the Cloud and Kafka is self-managed, you may be hesitant to remove this for compliance and security reasons. (This approach is not currently supported in ClickHouse Cloud.) The Kafka table engine utilizes resources within ClickHouse itself, utilizing threads for the consumers. Placing this resource pressure on ClickHouse may not be possible due to resource constraints, or your architects may prefer a separation of concerns. In this case, tools such as Kafka Connect, which run as a separate process and can be deployed on different hardware may be preferable. This allows the process responsible for pulling Kafka data to be scaled independently of ClickHouse.

* **Hosting on Cloud** - Cloud vendors may set limitations on Kafka components available on their platform. Follow the guide to explore recommended options for each Cloud vendor.

* **External enrichment** - Whilst messages can be manipulated before insertion into ClickHouse, through the use of functions in the select statement of the materialized view, users may prefer to move complex enrichment external to ClickHouse.

* **Data flow direction** - Vector only supports the transfer of data from Kafka to ClickHouse.

## Assumptions {#assumptions}

The user guides linked above assume the following:

* You are familiar with the Kafka fundamentals, such as producers, consumers and topics.
* You have a topic prepared for these examples. We assume all data is stored in Kafka as JSON, although the principles remain the same if using Avro.
* We utilise the excellent [kcat](https://github.com/edenhill/kcat) (formerly kafkacat) in our examples to publish and consume Kafka data.
* Whilst we reference some python scripts for loading sample data, feel free to adapt the examples to your dataset.
* You are broadly familiar with ClickHouse materialized views.
