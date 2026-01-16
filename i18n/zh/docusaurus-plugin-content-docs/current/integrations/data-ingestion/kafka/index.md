---


sidebar_label: 'Kafka 与 ClickHouse 集成'
sidebar_position: 1
slug: /integrations/kafka
description: 'Kafka 与 ClickHouse 简介'
title: 'Kafka 与 ClickHouse 集成'
keywords: ['Apache Kafka', '事件流处理', '数据管道', '消息代理', '实时数据']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

# 在 ClickHouse 中集成 Kafka \\{#integrating-kafka-with-clickhouse\\}

[Apache Kafka](https://kafka.apache.org/) 是一个开源的分布式事件流平台，被成千上万的公司用于高性能数据管道、流式分析、数据集成以及关键业务应用。ClickHouse 提供多种方式来**从** Kafka 及其他兼容 Kafka API 的代理（如 Redpanda、Amazon MSK）读取数据，并**向其写入**数据。

## 可用选项 \\{#available-options\\}

为你的用例选择合适的选项取决于多个因素，包括 ClickHouse 部署类型、数据流向以及运维需求。

| 选项                                                  | 部署类型 | 全托管 | Kafka 到 ClickHouse | ClickHouse 到 Kafka |
|---------------------------------------------------------|------------|:-------------------:|:-------------------:|:------------------:|
| [ClickPipes for Kafka](/integrations/clickpipes/kafka)                                | [Cloud]、[BYOC]（即将推出！）   | ✅ | ✅ |   |
| [Kafka Connect Sink](./kafka-clickhouse-connect-sink.md) | [Cloud]、[BYOC]、[自托管] | | ✅ |   |
| [Kafka table engine](./kafka-table-engine.md)           | [Cloud]、[BYOC]、[自托管] | | ✅ | ✅ |

关于这些选项的更详细对比，请参阅[选择选项](#choosing-an-option)。

### ClickPipes for Kafka \\{#clickpipes-for-kafka\\}

[ClickPipes](../clickpipes/index.md) 是一个托管的集成平台，使得从多种数据源摄取数据变得像点击几个按钮一样简单。由于其为完全托管服务，并专为生产工作负载构建，ClickPipes 显著降低了基础设施和运维成本，无需再依赖外部数据流和 ETL 工具。

:::tip
如果你是 ClickHouse Cloud 用户，这是推荐的选项。ClickPipes **完全托管**，并专为在云环境中提供**最佳性能**而构建。
:::

#### 主要特性 \\{#clickpipes-for-kafka-main-features\\}

[//]: # "TODO It isn't optimal to link to a static alpha-release of the Terraform provider. Link to a Terraform guide once that's available."

* 针对 ClickHouse Cloud 优化，提供极速性能
* 为高吞吐量工作负载提供水平和垂直扩展能力
* 内置容错能力，可配置副本与自动重试
* 可通过 ClickHouse Cloud UI、[Open API](/cloud/manage/api/api-overview) 或 [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.3.3-alpha2/docs/resources/clickpipe) 进行部署和管理
* 企业级安全性，支持云原生授权（IAM）和私有连接（PrivateLink）
* 支持广泛的[数据源](/integrations/clickpipes/kafka/reference/)，包括 Confluent Cloud、Amazon MSK、Redpanda Cloud 和 Azure Event Hubs
* 支持最常见的序列化格式（JSON、Avro，Protobuf 即将推出！）

#### 入门 \\{#clickpipes-for-kafka-getting-started\\}

要开始使用 ClickPipes for Kafka，请参阅[参考文档](/integrations/clickpipes/kafka/reference)，或在 ClickHouse Cloud UI 中导航到 `Data Sources` 选项卡。

### Kafka Connect Sink \\{#kafka-connect-sink\\}

Kafka Connect 是一个开源框架，作为集中式数据枢纽，用于在 Kafka 与其他数据系统之间进行简便的数据集成。[ClickHouse Kafka Connect Sink](https://github.com/ClickHouse/clickhouse-kafka-connect) 连接器提供了一个可扩展且高度可配置的选项，用于从 Apache Kafka 和其他兼容 Kafka API 的代理中读取数据。

:::tip
如果你偏好**高度可配置性**，或已经在使用 Kafka Connect，这是推荐的选项。
:::

#### 主要特性 \\{#kafka-connect-sink-main-features\\}

* 可以配置为支持 exactly-once 语义
* 支持最常见的序列化格式（JSON、Avro、Protobuf）
* 持续在 ClickHouse Cloud 上进行测试验证

#### 入门 \\{#kafka-connect-sink-getting-started\\}

要开始使用 ClickHouse Kafka Connect Sink，请参阅[参考文档](./kafka-clickhouse-connect-sink.md)。

### Kafka table engine \\{#kafka-table-engine\\}

[Kafka table engine](./kafka-table-engine.md) 可用于从 Apache Kafka 和其他兼容 Kafka API 的代理读取数据并向其写入数据。该选项随开源 ClickHouse 一起提供，并适用于所有部署类型。

:::tip
如果你是自托管 ClickHouse，且需要一个**入门门槛低**的选项，或者你需要向 Kafka **写入**数据，这是推荐的方案。
:::

#### 主要特性 \\{#kafka-table-engine-main-features\\}

* 可用于[读取](./kafka-table-engine.md/#kafka-to-clickhouse)和[写入](./kafka-table-engine.md/#clickhouse-to-kafka)数据
* 随开源 ClickHouse 一起提供
* 支持最常见的序列化格式（JSON、Avro、Protobuf）

#### 入门 \\{#kafka-table-engine-getting-started\\}

要开始使用 Kafka 表引擎，请参阅[参考文档](./kafka-table-engine.md)。

### 选择选项 \\{#choosing-an-option\\}

| 产品 | 优点 | 缺点 |
|---------|-----------|------------|
| **ClickPipes for Kafka** | • 面向高吞吐与低延迟的可扩展架构<br/>• 内置监控和 schema 管理<br/>• 私有网络连接（通过 PrivateLink）<br/>• 支持 SSL/TLS 认证和 IAM 授权<br/>• 支持以编程方式配置（Terraform、API endpoints） | • 不支持向 Kafka 推送数据<br/>• 至少一次（at-least-once）语义 |
| **Kafka Connect Sink** | • 精确一次（exactly-once）语义<br/>• 允许对数据转换、批处理和错误处理进行精细控制<br/>• 可以部署在私有网络中<br/>• 通过 Debezium 允许对 ClickPipes 尚未支持的数据库进行实时复制 | • 不支持向 Kafka 推送数据<br/>• 搭建和运维复杂<br/>• 需要 Kafka 和 Kafka Connect 方面的专业知识 |
| **Kafka table engine** | • 支持[向 Kafka 推送数据](./kafka-table-engine.md/#clickhouse-to-kafka)<br/>• 搭建和运维简单 | • 至少一次（at-least-once）语义<br/>• 对消费者的水平扩展能力有限，无法与 ClickHouse 服务器解耦并独立扩展<br/>• 错误处理和调试选项有限<br/>• 需要 Kafka 方面的专业知识 |

### 其他选项 \\{#other-options\\}

* [**Confluent Cloud**](./confluent/index.md) - Confluent Platform 提供了一种选项，可以在 Confluent Cloud 上上传并[运行 ClickHouse Connector Sink](./confluent/custom-connector.md)，或者使用 [HTTP Sink Connector for Confluent Platform](./confluent/kafka-connect-http.md)，通过 HTTP 或 HTTPS 将 Apache Kafka 与某个 API 集成。

* [**Vector**](./kafka-vector.md) - Vector 是一个与厂商无关的数据管道。凭借从 Kafka 读取并将事件发送到 ClickHouse 的能力，这是一个健壮的集成选项。

* [**JDBC Connect Sink**](./kafka-connect-jdbc.md) - Kafka Connect JDBC Sink 连接器允许将 Kafka 主题中的数据导出到任意带有 JDBC 驱动的关系型数据库。

* **自定义代码** - 在需要对事件进行自定义处理的场景中，使用 Kafka 和 ClickHouse [客户端库](../../language-clients/index.md) 的自定义代码可能是合适的选择。

[BYOC]: /cloud/reference/byoc/overview
[Cloud]: /cloud/get-started
[Self-hosted]: ../../../intro.md
