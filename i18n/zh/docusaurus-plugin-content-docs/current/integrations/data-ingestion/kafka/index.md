---
'sidebar_label': '将 Kafka 与 ClickHouse 集成'
'sidebar_position': 1
'slug': '/integrations/kafka'
'description': 'Kafka 与 ClickHouse 的介绍'
'title': '将 Kafka 与 ClickHouse 集成'
---


# 将 Kafka 与 ClickHouse 集成

[Apache Kafka](https://kafka.apache.org/) 是一个开源的分布式事件流平台，被数千家公司用于高性能数据管道、流分析、数据集成和关键业务应用。在涉及 Kafka 和 ClickHouse 的大多数情况下，用户希望将基于 Kafka 的数据插入 ClickHouse。以下我们概述了两种用例的几种选项，并指出每种方法的优缺点。

## 选择选项 {#choosing-an-option}

在将 Kafka 与 ClickHouse 集成时，您需要在使用的高级方法上做出早期架构决策。我们在下面列出了最常见的策略：

### ClickPipes for Kafka (ClickHouse Cloud) {#clickpipes-for-kafka-clickhouse-cloud}
* [**ClickPipes**](../clickpipes/kafka.md) 提供了将数据导入 ClickHouse Cloud 的最简单、最直观的方法。今天支持 Apache Kafka、Confluent Cloud 和亚马逊 MSK，未来还会有更多数据源。

### 第三方基于云的 Kafka 连接性 {#3rd-party-cloud-based-kafka-connectivity}
* [**Confluent Cloud**](./confluent/index.md) - Confluent 平台提供了一个选项，以便在 Confluent Cloud 上上传和 [运行 ClickHouse Connector Sink](./confluent/custom-connector.md)，或者使用 [HTTP Sink Connector for Confluent Platform](./confluent/kafka-connect-http.md)，通过 HTTP 或 HTTPS 将 Apache Kafka 与 API 集成。

* [**Amazon MSK**](./msk/index.md) - 支持 Amazon MSK Connect 框架将数据从 Apache Kafka 集群转发到外部系统，如 ClickHouse。您可以在 Amazon MSK 上安装 ClickHouse Kafka Connect。

* [**Redpanda Cloud**](https://cloud.redpanda.com/) - Redpanda 是一个与 Kafka API 兼容的流数据平台，可以用作 ClickHouse 的上游数据源。托管的云平台 Redpanda Cloud 通过 Kafka 协议与 ClickHouse 集成，实现流分析工作负载的实时数据摄取。

### 自管理的 Kafka 连接性 {#self-managed-kafka-connectivity}
* [**Kafka Connect**](./kafka-clickhouse-connect-sink.md) - Kafka Connect 是 Apache Kafka 的一个免费的开源组件，作为 Kafka 和其他数据系统之间简单数据集成的集中数据中心。连接器提供了一种简单的可扩展和可靠的数据流入 Kafka 和流出 Kafka 的方式。源连接器从其他系统插入数据到 Kafka 主题，而接收连接器则将数据从 Kafka 主题传递到其他数据存储，如 ClickHouse。
* [**Vector**](./kafka-vector.md) - Vector 是一个不依赖于供应商的数据管道。能够从 Kafka 中读取并将事件发送到 ClickHouse，这是一个强大的集成选项。
* [**JDBC Connect Sink**](./kafka-connect-jdbc.md) - Kafka Connect JDBC Sink 连接器允许您从 Kafka 主题导出数据到任何具有 JDBC 驱动程序的关系数据库。
* **自定义代码** - 使用相应的 Kafka 和 ClickHouse 客户端库的自定义代码可能适用于需要自定义事件处理的情况。此内容超出了本文件的范围。
* [**Kafka 表引擎**](./kafka-table-engine.md) 提供了原生的 ClickHouse 集成（在 ClickHouse Cloud 上不可用）。此表引擎**拉取**源系统中的数据。这需要 ClickHouse 直接访问 Kafka。
* [**具有命名集合的 Kafka 表引擎**](./kafka-table-engine-named-collections.md) - 使用命名集合提供了与 Kafka 的原生 ClickHouse 集成。这种方法允许与多个 Kafka 集群的安全连接，集中配置管理，提高可扩展性和安全性。

### 选择一种方法 {#choosing-an-approach}
这取决于几个决策点：

* **连接性** - 如果 ClickHouse 是目标，则 Kafka 表引擎需要能够从 Kafka 中拉取。这需要双向连接。如果存在网络隔离，例如 ClickHouse 在云中而 Kafka 是自管理的，出于合规性和安全原因，您可能会犹豫取消这种隔离。（这种方法在 ClickHouse Cloud 中当前不受支持。）Kafka 表引擎利用 ClickHouse 内部的资源，使用线程作为消费者。这种资源压力可能由于资源限制而没有可能，或您的架构师可能更喜欢关注的分离。在这种情况下，类似 Kafka Connect 这样的工具，作为单独的进程运行并可以部署在不同硬件上，可能更可取。这使得负责拉取 Kafka 数据的过程可以独立于 ClickHouse 进行扩展。

* **云托管** - 云供应商可能会对其平台上可用的 Kafka 组件设置限制。请遵循指南，探索每个云供应商的推荐选项。

* **外部增强** - 虽然可以通过使用物化视图的选择语句中的函数在插入 ClickHouse 之前操纵消息，但用户可能更喜欢将复杂的增强移动到 ClickHouse 之外。

* **数据流向** - Vector 仅支持从 Kafka 到 ClickHouse 的数据传输。

## 假设 {#assumptions}

上述用户指南假设以下内容：

* 您对 Kafka 的基本知识，如生产者、消费者和主题非常熟悉。
* 您已经为这些示例准备了一个主题。我们假设所有数据以 JSON 的形式存储在 Kafka 中，尽管如果使用 Avro 原则仍然相同。
* 在我们的示例中，我们使用卓越的 [kcat](https://github.com/edenhill/kcat)（以前称为 kafkacat）来发布和消费 Kafka 数据。
* 尽管我们提到了一些用于加载示例数据的 Python 脚本，您可以自由地根据您的数据集进行调整。
* 您对 ClickHouse 物化视图大致熟悉。
