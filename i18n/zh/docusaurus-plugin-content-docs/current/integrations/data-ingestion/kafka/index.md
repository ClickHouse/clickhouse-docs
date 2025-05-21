---
'sidebar_label': '将Kafka与ClickHouse集成'
'sidebar_position': 1
'slug': '/integrations/kafka'
'description': '介绍Kafka与ClickHouse的集成'
'title': '将Kafka与ClickHouse集成'
---




# 将 Kafka 与 ClickHouse 集成

[Apache Kafka](https://kafka.apache.org/) 是一个开源的分布式事件流平台，被成千上万的公司用于高性能数据管道、流分析、数据集成和任务关键型应用。在涉及 Kafka 和 ClickHouse 的大多数情况下，用户希望将基于 Kafka 的数据插入到 ClickHouse 中。下面我们列出了几种用例的选项，并识别每种方法的优缺点。

## 选择一个选项 {#choosing-an-option}

在将 Kafka 与 ClickHouse 集成时，您需要提前做出关于所采用高级方法的架构决策。我们在下面概述了最常见的策略：

### ClickPipes for Kafka (ClickHouse Cloud) {#clickpipes-for-kafka-clickhouse-cloud}
* [**ClickPipes**](../clickpipes/kafka.md) 提供了将数据导入到 ClickHouse Cloud 的最简单和最直观的方式。当前支持 Apache Kafka、Confluent Cloud 和 Amazon MSK，未来还有更多数据源即将推出。

### 第三方云基础的 Kafka 连接 {#3rd-party-cloud-based-kafka-connectivity}
* [**Confluent Cloud**](./confluent/index.md) - Confluent 平台提供了在 Confluent Cloud 上上传和 [运行 ClickHouse Connector Sink](./confluent/custom-connector.md) 的选项，或者使用 [HTTP Sink Connector for Confluent Platform](./confluent/kafka-connect-http.md)，通过 HTTP 或 HTTPS 将 Apache Kafka 与 API 集成。

* [**Amazon MSK**](./msk/index.md) - 支持 Amazon MSK Connect 框架，将数据从 Apache Kafka 集群转发到外部系统，如 ClickHouse。您可以在 Amazon MSK 上安装 ClickHouse Kafka Connect。

* [**Redpanda Cloud**](https://cloud.redpanda.com/) - Redpanda 是一个与 Kafka API 兼容的流数据平台，可以用作 ClickHouse 的上游数据源。托管的云平台 Redpanda Cloud 通过 Kafka 协议与 ClickHouse 集成，实现了流分析工作负载的实时数据摄取。

### 自管理的 Kafka 连接 {#self-managed-kafka-connectivity}
* [**Kafka Connect**](./kafka-clickhouse-connect-sink.md) - Kafka Connect 是 Apache Kafka 的一个免费开源组件，作为一个集中式数据中心，用于简化 Kafka 与其他数据系统之间的数据集成。连接器提供了一种简单的手段，可以将数据可靠地流入和流出 Kafka。源连接器从其他系统插入数据到 Kafka 主题，而汇连接器将数据从 Kafka 主题传输到其他数据存储，例如 ClickHouse。
* [**Vector**](./kafka-vector.md) - Vector 是一个与供应商无关的数据管道，能够从 Kafka 中读取，并将事件发送到 ClickHouse，作为一种强大的集成选项。
* [**JDBC Connect Sink**](./kafka-connect-jdbc.md) - Kafka Connect JDBC Sink 连接器允许您将数据从 Kafka 主题导出到任何具有 JDBC 驱动程序的关系数据库。
* **自定义代码** - 使用相应的 Kafka 和 ClickHouse 客户端库的自定义代码可能适用于需要自定义事件处理的情况。这超出了本文件的范围。
* [**Kafka 表引擎**](./kafka-table-engine.md) 提供了与 ClickHouse 的本机集成（在 ClickHouse Cloud 中不可用）。该表引擎 **从** 源系统提取数据。这要求 ClickHouse 直接访问 Kafka。
* [**带命名集合的 Kafka 表引擎**](./kafka-table-engine-named-collections.md) - 使用命名集合提供与 Kafka 的本机 ClickHouse 集成。此方法允许对多个 Kafka 集群进行安全连接，集中管理配置，改善可扩展性和安全性。

### 选择一种方法 {#choosing-an-approach}
这归结为几个决策点：

* **连接性** - 如果 ClickHouse 是目标，则 Kafka 表引擎需要能够从 Kafka 中提取数据。这就需要双向连接。如果存在网络隔离，例如 ClickHouse 在云中而 Kafka 自管理，您可能出于合规性和安全原因而不愿去掉这一点。（此方法目前不支持在 ClickHouse Cloud 中。）Kafka 表引擎在 ClickHouse 内部利用资源，利用线程进行消费。在资源受限的情况下，将这种资源压力施加到 ClickHouse 可能不可行，或者您的架构师可能更喜欢分离关注点。在这种情况下，像 Kafka Connect 这样的工具，可以作为单独的进程运行，并可以部署在不同硬件上，可能更可取。这允许负责提取 Kafka 数据的进程独立于 ClickHouse 进行扩展。

* **云托管** - 云服务提供商可能对其平台上可用的 Kafka 组件设置限制。遵循指南以探索每个云服务提供商推荐的选项。

* **外部丰富** - 尽管可以在数据插入 ClickHouse 之前通过物化视图的选择语句中的函数来操作消息，但用户可能更愿意将复杂的丰富处理移动到 ClickHouse 之外。

* **数据流方向** - Vector 仅支持将数据从 Kafka 转移到 ClickHouse。

## 假设 {#assumptions}

上面链接的用户指南假设如下：

* 您对 Kafka 基础知识（如生产者、消费者和主题）有所了解。
* 您已为这些示例准备了一个主题。我们假设所有数据都以 JSON 存储在 Kafka 中，尽管如果使用 Avro 原则保持不变。
* 我们在示例中使用了出色的 [kcat](https://github.com/edenhill/kcat)（以前称为 kafkacat）来发布和消费 Kafka 数据。
* 尽管我们提到了一些用于加载示例数据的 python 脚本，但欢迎您根据自己的数据集调整示例。
* 您大致了解 ClickHouse 的物化视图。
