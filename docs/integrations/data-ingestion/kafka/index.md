---
sidebar_label: 'Integrating Kafka with ClickHouse'
sidebar_position: 1
slug: /integrations/kafka
description: 'Introduction to Kafka with ClickHouse'
title: 'Integrating Kafka with ClickHouse'
---

import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import Image from '@theme/IdealImage';

# Integrating Kafka with ClickHouse

[Apache Kafka](https://kafka.apache.org/) is an open-source distributed event streaming platform used by thousands of companies for high-performance data pipelines, streaming analytics, data integration, and mission-critical applications. ClickHouse provides different options to **read** data from and **write** data to Apache Kafka and other Kafka API-compatible brokers (e.g., Redpanda, Amazon MSK).

## Choosing an option {#choosing-an-option}

Choosing the right option for your use case depends on multiple factors, including your ClickHouse deployment type, data flow direction and networking requirements.

|Option   | Deployment | Kafka to ClickHouse | ClickHouse to Kafka | Private Networking |
|---------|------------|---------------------|---------------------|--------------------|
| ClickPipes for Kafka | CH Cloud                  | ✅ | ❌ | ✅ |
| Kafka Connect Sink   | CH Cloud, CH BYOC, CH OSS | ✅ | ❌ | ✅ |
| Kafka table engine   | CH Cloud, CH BYOC, CH OSS | ✅ | ✅ | ❌ |

For a more detailed comparison between these options, see [Choosing an approach](#choosing-an-approach).

### ClickPipes for Kafka {#clickpipes-for-kafka}

[ClickPipes](../clickpipes.md) is the native integration engine in ClickHouse Cloud and makes ingesting massive volumes of data from a diverse set of sources as simple as clicking a few buttons. It natively supports **private network** connections (i.e., PrivateLink), scaling ingestion and cluster resources **independently**, and **comprehensive monitoring** for streaming data into ClickHouse from Apache Kafka and other Kafka API-compatible brokers.

| Name                 |Logo|Type| Status          | Documentation                                                                                          |
|----------------------|----|----|-----------------|------------------------------------------------------------------------------------------------------|
| Apache Kafka         |<Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/>|Streaming| Stable          | [ClickPipes for Kafka integration guide](../clickpipes/kafka.md)     |
| Confluent Cloud      |<Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>|Streaming| Stable          | [ClickPipes for Kafka integration guide](../clickpipes/kafka.md)          |
| Redpanda             |<Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>|Streaming| Stable          | [ClickPipes for Kafka integration guide](../clickpipes/kafka.md)         |
| AWS MSK              |<Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>|Streaming| Stable          | [ClickPipes for Kafka integration guide](../clickpipes/kafka.md)          |
| Azure Event Hubs     |<Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>|Streaming| Stable          | [ClickPipes for Kafka integration guide](../clickpipes/kafka.md) |
| WarpStream           |<Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>|Streaming| Stable          | [ClickPipes for Kafka integration guide](../clickpipes/kafka.md) |

More connectors will get added to ClickPipes in the future. You can find out more by [contacting us](https://clickhouse.com/company/contact?loc=clickpipes).

### Kafka Connect Sink {#kafka-connect-sink}

Kafka Connect is an open-source framework that works as a centralized data hub for simple data integration between Kafka and other data systems. The [ClickHouse Kafka Connect Sink](./kafka-clickhouse-connect-sink.md) connector provides a scalable and reliable way to **read** data Apache Kafka and other Kafka API-compatible brokers.

### Kafka Table Engine {#kafka-table-engine}

The [Kafka table engine](./kafka-table-engine.md) can be used to **read** data from and **write** data to Apache Kafka and other Kafka API-compatible brokers. This engine does **not** support private network connections, which means your broker(s) must be configured for public access.

### Choosing an approach {#choosing-an-approach}

| Product | Deployment | Strengths | Weaknesses |
|---------|------------|-----------|------------|
| **ClickPipes for Kafka** | CH Cloud | • Native CH Cloud experience for ingesting from Kafka. Built-in monitoring and schema management • Scalable architecture that ensures high throughput and low latency • Supports private networking connections on AWS (via PrivateLink) • Supports SSL/TLS authentication (incl. mTLS) and IAM authorization • Supports programmatic configuration (Terraform, API endpoints) | • Does not support pushing data to Kafka • Does not support AWS Private Link connections to Confluent Cloud • Does not support Private Service Connect or Azure Private Link • Not available on GCP or Azure, though it can connect to services in these cloud providers • At-least-once semantics • Protobuf is not supported yet, only Avro and JSON |
| **Kafka Connect Sink** | CH Cloud CH BYOC OSS CH | • Exactly-once semantics • Allows granular control over data transformation, batching and error handling • Can be deployed in private networks • Allows real-time replication from databases not yet supported in ClickPipes via Debezium | • Does not support pushing data to Kafka • Operationally complex to set up and maintain • Requires Kafka and Kafka Connect expertise |
| **Kafka Table Engine** | CH Cloud CH BYOC OSS CH | • Supports pushing data to Kafka • Supports most common formats (Avro, JSON, Protobuf) • Allows real-time replication from databases not yet supported in ClickPipes via Debezium | • At-least-once semantics • Requires brokers to be exposed to a public network (IP whitelisting possible) • Limited horizontal scaling for consumers. Cannot be scaled independently from the CH server • Limited error handling and debugging information • No SSL/TLS authentication in CH Cloud • Requires Kafka expertise |

### Other options {#other-options}

* [**Confluent Cloud**](./confluent/index.md) - Confluent platform provides an option to upload and [run ClickHouse Connector Sink on Confluent Cloud](./confluent/custom-connector.md) or use [HTTP Sink Connector for Confluent Platform](./confluent/kafka-connect-http.md) that integrates Apache Kafka with an API via HTTP or HTTPS.

* [**Vector**](./kafka-vector.md) - Vector is a vendor agnostic data pipeline. With the ability to read from Kafka, and send events to ClickHouse, this represents a robust integration option.

* [**JDBC Connect Sink**](./kafka-connect-jdbc.md) - The Kafka Connect JDBC Sink connector allows you to export data from Kafka topics to any relational database with a JDBC driver.

* **Custom code** - Custom code using respective client libraries for Kafka and ClickHouse may be appropriate cases where custom processing of events is required. This is beyond the scope of this documentation.
