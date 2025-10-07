---
'sidebar_label': '将 Kafka 与 ClickHouse 集成'
'sidebar_position': 1
'slug': '/integrations/kafka'
'description': 'Kafka 与 ClickHouse 的介绍'
'title': '将 Kafka 与 ClickHouse 集成'
'doc_type': 'guide'
---


# 将 Kafka 与 ClickHouse 集成

[Apache Kafka](https://kafka.apache.org/) 是一个开源的分布式事件流平台，被数千家公司用于高性能数据管道、流媒体分析、数据集成和关键任务应用程序。 ClickHouse 提供多种选项来 **读取** 和 **写入** Kafka 及其他兼容 Kafka API 的代理（例如 Redpanda、Amazon MSK）。

## 可用选项 {#available-options}

选择适合您用例的选项取决于多个因素，包括您的 ClickHouse 部署类型、数据流方向和操作要求。

| 选项                                                 | 部署类型 | 完全管理  | 从 Kafka 到 ClickHouse | 从 ClickHouse 到 Kafka |
|------------------------------------------------------|----------|:-------------------:|:-------------------:|:------------------:|
| [ClickPipes for Kafka](/integrations/clickpipes/kafka)                               | [Cloud], [BYOC] (即将推出!)   | ✅ | ✅ |   |
| [Kafka Connect Sink](./kafka-clickhouse-connect-sink.md) | [Cloud], [BYOC], [Self-hosted] | | ✅ |   |
| [Kafka table engine](./kafka-table-engine.md)           | [Cloud], [BYOC], [Self-hosted] | | ✅ | ✅ |

有关这些选项之间更详细的比较，请参阅 [选择一个选项](#choosing-an-option)。

### ClickPipes for Kafka {#clickpipes-for-kafka}

[ClickPipes](../clickpipes/index.md) 是一个管理集成平台，使从各种来源获取数据变得简单，只需点击几个按钮即可。由于它是完全管理的且专为生产工作负载而构建，ClickPipes 大大降低了基础设施和运营成本，消除了对外部数据流媒体和 ETL 工具的需求。

:::tip
如果您是 ClickHouse Cloud 用户，这是推荐的选项。ClickPipes 是 **完全管理** 的，专为在云环境中提供 **最佳性能** 而构建。
:::

#### 主要功能 {#clickpipes-for-kafka-main-features}

[//]: # "TODO It isn't optimal to link to a static alpha-release of the Terraform provider. Link to a Terraform guide once that's available."

* 针对 ClickHouse Cloud 进行了优化，提供超快的性能
* 高吞吐量工作负载的水平和垂直可扩展性
* 内置故障容错，具有可配置的副本和自动重试
* 通过 ClickHouse Cloud UI、[Open API](/cloud/manage/api/api-overview) 或 [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.3.3-alpha2/docs/resources/clickpipe) 进行部署和管理
* 企业级安全性，支持云原生授权 (IAM) 和私有连接 (PrivateLink)
* 支持广泛的 [数据源](/integrations/clickpipes/kafka/reference/)，包括 Confluent Cloud、Amazon MSK、Redpanda Cloud 和 Azure Event Hubs
* 支持大多数常见序列化格式 (JSON、Avro、Protobuf 即将推出!)

#### 入门 {#clickpipes-for-kafka-getting-started}

要开始使用 ClickPipes for Kafka，请参阅 [参考文档](/integrations/clickpipes/kafka/reference) 或在 ClickHouse Cloud UI 中导航到 `数据源` 标签。

### Kafka Connect Sink {#kafka-connect-sink}

Kafka Connect 是一个开源框架，作为 Kafka 和其他数据系统之间简单数据集成的集中数据中心。 [ClickHouse Kafka Connect Sink](https://github.com/ClickHouse/clickhouse-kafka-connect) connector 提供了一个可扩展和高度可配置的选项，以从 Apache Kafka 和其他兼容 Kafka API 的代理中读取数据。

:::tip
如果您更喜欢 **高度可配置性** 或已是 Kafka Connect 用户，这是推荐的选项。
:::

#### 主要功能 {#kafka-connect-sink-main-features}

* 可以配置为支持准确一次语义
* 支持大多数常见序列化格式 (JSON、Avro、Protobuf)
* 持续在 ClickHouse Cloud 上进行测试

#### 入门 {#kafka-connect-sink-getting-started}

要开始使用 ClickHouse Kafka Connect Sink，请参阅 [参考文档](./kafka-clickhouse-connect-sink.md)。

### Kafka table engine {#kafka-table-engine}

[Kafka table engine](./kafka-table-engine.md) 可用于从 Apache Kafka 读取数据和向其写入数据，以及与其他兼容 Kafka API 的代理。此选项与开源 ClickHouse 捆绑在一起，并在所有部署类型中可用。

:::tip
如果您正在自托管 ClickHouse，并且需要一个 **低入门门槛** 的选项，或者如果您需要 **向** Kafka 写入数据，这是推荐的选项。
:::

#### 主要功能 {#kafka-table-engine-main-features}

* 可用于 [读取](./kafka-table-engine.md/#kafka-to-clickhouse) 和 [写入](./kafka-table-engine.md/#clickhouse-to-kafka) 数据
* 与开源 ClickHouse 捆绑
* 支持大多数常见序列化格式 (JSON、Avro、Protobuf)

#### 入门 {#kafka-table-engine-getting-started}

要开始使用 Kafka table engine，请参阅 [参考文档](./kafka-table-engine.md)。

### 选择一个选项 {#choosing-an-option}

| 产品 | 优势 | 劣势 |
|---------|-----------|------------|
| **ClickPipes for Kafka** | • 可扩展架构以实现高吞吐量和低延迟<br/>• 内置监控和模式管理<br/>• 私有网络连接 (通过 PrivateLink)<br/>• 支持 SSL/TLS 身份验证和 IAM 授权<br/>• 支持程序化配置 (Terraform、API 端点) | • 不支持将数据推送到 Kafka<br/>• 至少一次语义 |
| **Kafka Connect Sink** | • 准确一次语义<br/>• 允许对数据转换、批处理和错误处理进行细粒度控制<br/>• 可以在私有网络中部署<br/>• 通过 Debezium 允许从尚未在 ClickPipes 中支持的数据库进行实时复制 | • 不支持将数据推送到 Kafka<br/>• 操作复杂需要设置和维护<br/>• 需要 Kafka 和 Kafka Connect 专业知识 |
| **Kafka table engine** | • 支持 [将数据推送到 Kafka](./kafka-table-engine.md/#clickhouse-to-kafka)<br/>• 操作简单，便于设置 | • 至少一次语义<br/>• 消费者的水平扩展有限，无法独立于 ClickHouse 服务器进行扩展<br/>• 限制的错误处理和调试选项<br/>• 需要 Kafka 专业知识 |

### 其他选项 {#other-options}

* [**Confluent Cloud**](./confluent/index.md) - Confluent Platform 提供了一个选项，以在 Confluent Cloud 上上传和 [运行 ClickHouse Connector Sink](./confluent/custom-connector.md) 或使用 [HTTP Sink Connector for Confluent Platform](./confluent/kafka-connect-http.md)，通过 HTTP 或 HTTPS 将 Apache Kafka 与 API 集成。

* [**Vector**](./kafka-vector.md) - Vector 是一个供应商无关的数据管道。具有从 Kafka 读取并将事件发送到 ClickHouse 的能力，这是一个强大的集成选项。

* [**JDBC Connect Sink**](./kafka-connect-jdbc.md) - Kafka Connect JDBC Sink connector 允许您将数据从 Kafka 主题导出到任何带有 JDBC 驱动程序的关系数据库。

* **自定义代码** - 使用 Kafka 和 ClickHouse [客户端库](../../language-clients/index.md) 的自定义代码可能适用于需要自定义事件处理的情况。

[BYOC]: /cloud/reference/byoc
[Cloud]: /cloud/get-started
[Self-hosted]: ../../../intro.md
