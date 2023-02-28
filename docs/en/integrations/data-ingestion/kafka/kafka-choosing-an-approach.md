---
sidebar_label: Choosing an Approach
sidebar_position: 2
slug: /en/integrations/kafka/kafka-choosing-an-approach
description: The most common approaches for integrating Kafka with ClickHouse
---

# Choosing an option

When integrating Kafka with ClickHouse, you will need to make early architectural decisions about the high-level approach used. We outline the most common strategies below: 

## Kafka table engine
* The [Kafka table engine](./kafka-table-engine) provides a Native ClickHouse integration. This table engine **pulls** data from the source system. This requires ClickHouse to have direct access to Kafka.
:::note
Kafka table engine is not supported on [ClickHouse Cloud](https://clickhouse.com/cloud). Please consider one of the following alternatives.
:::

## Cloud-based Kafka Connectivity
* [**Confluent Cloud**](./cloud/confluent/) - Confluent platform provides HTTP Sink connector for Confluent Cloud that integrates Apache Kafka with an API via HTTP or HTTPS.

* [**Amazon MSK**](./cloud/amazon-msk/) - support Amazon MSK Connect framework to forward data from Apache Kafka clusters to external systems such as ClickHouse. You can install **ClickHouse Kafka Connect** on Amazon MSK.

## Self-managed Kafka Connectivity
* [**Kafka Connect**](./self-managed/connect-sink) - Kafka Connect is a free, open-source component of Apache Kafka® that works as a centralized data hub for simple data integration between Kafka and other data systems.  Connectors provide a simple means of scalably and reliably streaming data to and from Kafka.  Source Connectors inserts data to Kafka topics from other systems, whilst Sink Connectors delivers data from Kafka topics into other data stores such as ClickHouse.
* [**Vector**](./self-managed/vector) - Vector is a vendor agnostic data pipeline. With the ability to read from Kafka, and send events to ClickHouse, this represents a robust integration option.
* [**JDBC Connect Sink**](./self-managed/jdbc) - The Kafka Connect JDBC Sink connector allows you to export data from Kafka topics to any relational database with a JDBC driver
* **Custom code** - Custom code using respective client libraries for Kafka and ClickHouse may be appropriate cases where custom processing of events is required. This is beyond the scope of this documentation.

## Choosing an approach
It comes down to a few decision points:

* **Connectivity** - The Kafka table engine needs to be able to pull from Kafka if ClickHouse is the destination. This requires bi-directional connectivity. If there is a network separation, e.g. ClickHouse is in the Cloud and Kafka is self-managed, you may be hesitant to remove this for compliance and security reasons. (This approach is not currently supported in ClickHouse Cloud.) The Kafka table engine utilizes resources within ClickHouse itself, utilizing threads for the consumers. Placing this resource pressure on ClickHouse may not be possible due to resource constraints, or your architects may prefer a separation of concerns. In this case, tools such as Kafka Connect, which run as a separate process and can be deployed on different hardware may be preferable. This allows the process responsible for pulling Kafka data to be scaled independently of ClickHouse.

* **Hosting on Cloud** - Cloud vendors may set limitations on Kafka components available on their platform. Follow the guide to explore recommended options for each Cloud vendor.

* **External enrichment** - Whilst messages can be manipulated before insertion into ClickHouse, through the use of functions in the select statement of the materialized view, users may prefer to move complex enrichment external to ClickHouse.

* **Data flow direction** - Vector only supports the transfer of data from Kafka to ClickHouse.
