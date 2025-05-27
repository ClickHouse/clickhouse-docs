---
'sidebar_label': '将 Kafka 与 ClickHouse 集成'
'sidebar_position': 1
'slug': '/integrations/kafka'
'description': 'Kafka 与 ClickHouse 的介绍'
'title': '将 Kafka 与 ClickHouse 集成'
---


# 将Kafka与ClickHouse集成

[Apache Kafka](https://kafka.apache.org/) 是一个开源的分布式事件流平台，由成千上万的公司用于高性能数据管道、流分析、数据集成和关键任务应用程序。在涉及Kafka和ClickHouse的大多数情况下，用户希望将基于Kafka的数据插入到ClickHouse中。下面我们概述了这两种用例的几种选项，识别每种方法的优缺点。

## 选择一个选项 {#choosing-an-option}

在将Kafka与ClickHouse集成时，您需要对使用的高层次方法做出早期的架构决策。我们在下面概述了最常见的策略：

### ClickPipes for Kafka (ClickHouse Cloud) {#clickpipes-for-kafka-clickhouse-cloud}
* [**ClickPipes**](../clickpipes/kafka.md) 提供了向ClickHouse Cloud导入数据最简单和最直观的方法。目前支持Apache Kafka、Confluent Cloud和Amazon MSK，未来将有更多数据源添加。

### 第三方云基础的Kafka连接 {#3rd-party-cloud-based-kafka-connectivity}
* [**Confluent Cloud**](./confluent/index.md) - Confluent平台提供了在Confluent Cloud上上传和[运行ClickHouse Connector Sink](./confluent/custom-connector.md)或使用[HTTP Sink Connector for Confluent Platform](./confluent/kafka-connect-http.md)的选项，该选项通过HTTP或HTTPS将Apache Kafka与API集成。

* [**Amazon MSK**](./msk/index.md) - 支持Amazon MSK Connect框架，将数据从Apache Kafka集群转发到ClickHouse等外部系统。您可以在Amazon MSK上安装ClickHouse Kafka Connect。

* [**Redpanda Cloud**](https://cloud.redpanda.com/) - Redpanda是一个与Kafka API兼容的流数据平台，可以用作ClickHouse的上游数据源。托管云平台Redpanda Cloud通过Kafka协议与ClickHouse集成，支持流分析工作负载的实时数据导入。

### 自管理的Kafka连接 {#self-managed-kafka-connectivity}
* [**Kafka Connect**](./kafka-clickhouse-connect-sink.md) - Kafka Connect是Apache Kafka的一个免费开源组件，作为Kafka与其他数据系统之间简单数据集成的集中数据中心。连接器提供了一种简单的可伸缩和可靠地将数据流入Kafka和流出Kafka的方式。源连接器从其他系统将数据插入Kafka主题，而汇接入器将数据从Kafka主题送入其他数据存储，例如ClickHouse。
* [**Vector**](./kafka-vector.md) - Vector是一个与供应商无关的数据管道。它能够从Kafka读取，并将事件发送到ClickHouse，代表一种强大的集成选项。
* [**JDBC Connect Sink**](./kafka-connect-jdbc.md) - Kafka Connect JDBC Sink连接器允许您将数据从Kafka主题导出到任何具有JDBC驱动程序的关系数据库。
* **自定义代码** - 使用相应的Kafka和ClickHouse客户端库的自定义代码可能适用于需要自定义事件处理的情况。此内容超出了本文档的范围。
* [**Kafka表引擎**](./kafka-table-engine.md) 提供了原生ClickHouse集成（在ClickHouse Cloud上不可用）。此表引擎**从**源系统拉取数据。这要求ClickHouse能够直接访问Kafka。
* [**带有命名集合的Kafka表引擎**](./kafka-table-engine-named-collections.md) - 使用命名集合提供与Kafka的原生ClickHouse集成。这种方法允许安全连接到多个Kafka集群，集中管理配置，提高可扩展性和安全性。

### 选择一种方法 {#choosing-an-approach}
这取决于几个决策点：

* **连接性** - 如果ClickHouse是目标，则Kafka表引擎需要能够从Kafka拉取数据。这需要双向连接。如果存在网络隔离，例如ClickHouse在云中而Kafka是自管理的，您可能会因合规性和安全原因而犹豫取消此连接。（该方法在ClickHouse Cloud上当前不被支持。）Kafka表引擎利用ClickHouse本身中的资源，利用线程作为消费者。由于资源限制，可能无法将这部分资源压力施加到ClickHouse上，或者您的架构师可能更喜欢关注分离。在这种情况下，可以选择例如Kafka Connect这样的工具，它作为一个独立进程运行，可以部署在不同的硬件上。这允许处理Kafka数据的进程独立于ClickHouse进行扩展。

* **在云中托管** - 云供应商可能会对其平台上可用的Kafka组件设置限制。请遵循指南以探索每个云供应商推荐的选项。

* **外部增强** - 尽管可以在将消息插入ClickHouse之前通过物化视图的选择语句中的函数进行操作，用户可能更愿意将复杂的增强移至ClickHouse外部。

* **数据流方向** - Vector仅支持将数据从Kafka转移到ClickHouse。

## 假设 {#assumptions}

上述用户指南假设以下内容：

* 您熟悉Kafka的基础知识，如生产者、消费者和主题。
* 您已经为这些示例准备了一个主题。我们假设所有数据以JSON格式存储在Kafka中，尽管如果使用Avro，原则依然相同。
* 我们在示例中利用出色的 [kcat](https://github.com/edenhill/kcat)（以前称为kafkacat）来发布和消费Kafka数据。
* 尽管我们引用了一些用于加载示例数据的python脚本，您可以根据自己的数据集调整这些示例。
* 您对ClickHouse的物化视图有一定了解。
