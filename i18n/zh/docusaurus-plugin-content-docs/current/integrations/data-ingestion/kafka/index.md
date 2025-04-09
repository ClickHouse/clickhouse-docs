---
sidebar_label: '将 Kafka 与 ClickHouse 集成'
sidebar_position: 1
slug: /integrations/kafka
description: '使用 ClickHouse 的 Kafka 介绍'
---


# 将 Kafka 与 ClickHouse 集成

[Apache Kafka](https://kafka.apache.org/) 是一个开源的分布式事件流平台，被成千上万家公司使用，用于高性能的数据管道、流分析、数据集成和关键任务应用程序。在大多数涉及 Kafka 和 ClickHouse 的情况下，用户希望将基于 Kafka 的数据插入 ClickHouse。下面我们概述了几种选项，供这两种用例使用，并指出了每种方法的优缺点。

## 选择一个选项 {#choosing-an-option}

在将 Kafka 与 ClickHouse 集成时，您需要对所使用的高层次方案做出早期架构决策。我们在下面概述了最常见的策略：

### ClickPipes for Kafka (ClickHouse Cloud) {#clickpipes-for-kafka-clickhouse-cloud}
* [**ClickPipes**](../clickpipes/kafka.md) 提供了将数据导入 ClickHouse Cloud 的最简单且最直观的方法。目前支持 Apache Kafka、Confluent Cloud 和 Amazon MSK，未来将支持更多数据源。

### 第三方基于云的 Kafka 连接 {#3rd-party-cloud-based-kafka-connectivity}
* [**Confluent Cloud**](./confluent/index.md) - Confluent 平台提供了一个选项，可以在 Confluent Cloud 上上传和 [运行 ClickHouse Connector Sink](./confluent/custom-connector.md)，或使用 [Confluent Platform 的 HTTP Sink Connector](./confluent/kafka-connect-http.md)，通过 HTTP 或 HTTPS 将 Apache Kafka 与 API 集成。

* [**Amazon MSK**](./msk/index.md) - 支持 Amazon MSK Connect 框架，将数据从 Apache Kafka 集群转发到外部系统，如 ClickHouse。您可以在 Amazon MSK 上安装 ClickHouse Kafka Connect。

* [**Redpanda Cloud**](https://cloud.redpanda.com/) - Redpanda 是一个 Kafka API 兼容的流数据平台，可以用作 ClickHouse 的上游数据源。托管的云平台 Redpanda Cloud 通过 Kafka 协议与 ClickHouse 集成，实现流分析工作负载的实时数据摄取。

### 自管理的 Kafka 连接 {#self-managed-kafka-connectivity}
* [**Kafka Connect**](./kafka-clickhouse-connect-sink.md) - Kafka Connect 是 Apache Kafka 的一个免费开源组件，作为一个集中式数据中心，简化 Kafka 与其他数据系统之间的数据集成。连接器提供了一种简单的方式来可靠地在 Kafka 中流式传输数据。源连接器将数据从其他系统插入到 Kafka 主题，而接收连接器则将数据从 Kafka 主题传输到其他数据存储，如 ClickHouse。
* [**Vector**](./kafka-vector.md) - Vector 是一个独立于供应商的数据管道。能够从 Kafka 读取并将事件发送到 ClickHouse，代表了一个强大的集成选项。
* [**JDBC Connect Sink**](./kafka-connect-jdbc.md) - Kafka Connect JDBC Sink 连接器允许您将数据从 Kafka 主题导出到任何具有 JDBC 驱动程序的关系数据库。
* **自定义代码** - 使用相应的 Kafka 和 ClickHouse 客户端库的自定义代码可能适用于需要自定义事件处理的情况。这超出了本文档的范围。
* [**Kafka 表引擎**](./kafka-table-engine.md) 提供本地 ClickHouse 集成（在 ClickHouse Cloud 上不可用）。该表引擎 **拉取** 源系统中的数据。这要求 ClickHouse 可以直接访问 Kafka。
* [**带命名集合的 Kafka 表引擎**](./kafka-table-engine-named-collections.md) - 使用命名集合提供与 Kafka 的本地 ClickHouse 集成。此方法允许安全连接多个 Kafka 集群，集中管理配置，提高可扩展性和安全性。

### 选择一种方法 {#choosing-an-approach}
最终取决于几个决策点：

* **连接性** - 如果 ClickHouse 是目标，则 Kafka 表引擎需要能够从 Kafka 中拉取数据。这需要双向连接。如果存在网络隔离，例如 ClickHouse 在云中，而 Kafka 自我管理，您可能由于合规和安全原因而不愿移除这一点。（此方法在 ClickHouse Cloud 上目前不支持。）Kafka 表引擎利用 ClickHouse 本身的资源，使用线程作为消费者。由于资源限制，把这一资源压力放在 ClickHouse 上可能不可行，或者您的架构师可能更倾向于关注分离。在这种情况下，像 Kafka Connect 这样的工具运行独立进程，并可以部署在不同的硬件上可能更可取。这使得负责拉取 Kafka 数据的进程能够独立于 ClickHouse 进行扩展。

* **云端托管** - 云服务提供商可能会对其平台上可用的 Kafka 组件设定限制。请遵循指南，以探索每个云服务提供商的推荐选项。

* **外部增值** - 虽然可以在将消息插入 ClickHouse 之前，通过物化视图的选择语句中的函数对其进行操作，但用户可能更喜欢将复杂的增值处理移到 ClickHouse 之外。

* **数据流向** - Vector 仅支持将数据从 Kafka 转移到 ClickHouse。

## 假设 {#assumptions}

上述用户指南假设以下内容：

* 您熟悉 Kafka 的基础知识，例如生产者、消费者和主题。
* 您已为这些示例准备了一个主题。我们假设所有数据以 JSON 存储在 Kafka 中，尽管如果使用 Avro，原则仍然相同。
* 我们在示例中利用了优秀的 [kcat](https://github.com/edenhill/kcat)（以前称为 kafkacat）来发布和消费 Kafka 数据。
* 虽然我们引用了一些用于加载示例数据的 Python 脚本，但可以自由将示例调整为您的数据集。
* 您对 ClickHouse 物化视图大体上是熟悉的。
