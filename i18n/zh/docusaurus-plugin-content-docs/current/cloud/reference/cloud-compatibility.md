---
slug: /whats-new/cloud-compatibility
sidebar_label: '云兼容性'
title: '云兼容性'
---


# ClickHouse Cloud — 兼容性指南

本指南概述了在 ClickHouse Cloud 中功能和操作的预期。虽然 ClickHouse Cloud 基于开源 ClickHouse 发行版，但在架构和实现上可能会有一些差异。您可能会发现这篇关于 [我们如何构建 ClickHouse Cloud](https://clickhouse.com/blog/building-clickhouse-cloud-from-scratch-in-a-year) 的博客很有趣，并且相关的阅读可以作为背景。

## ClickHouse Cloud 架构 {#clickhouse-cloud-architecture}
ClickHouse Cloud 显著简化了操作开销，并降低了大规模运行 ClickHouse 的成本。您无需提前规划您的部署大小，设置高可用性复制，手动分片数据，当工作负载增加时扩展服务器，或在不使用时缩减它们——我们为您处理这些。

这些好处源自 ClickHouse Cloud 的架构选择：
- 计算和存储是分开的，因此可以沿着不同的维度自动扩展，这样您就无需在静态实例配置中过度配置存储或计算。
- 基于对象存储的分层存储和多级缓存提供几乎无限的扩展能力和良好的性价比，因此您无需提前规划存储分区的大小，也无需担心高昂的存储成本。
- 高可用性是默认开启的，而复制被透明地管理，因此您可以专注于构建应用程序或分析数据。
- 变量持续工作负载的自动扩展是默认开启的，因此您无需提前规划服务大小，在工作负载增加时扩展服务器，或在活动较少时手动缩减服务器。
- 对于间歇性工作负载，无缝休眠是默认开启的。我们会在一段非活动时间后自动暂停您的计算资源，并在新查询到达时透明地重新启动它，因此您无需为闲置资源付费。
- 高级扩展控制提供了设置自动扩展最大值以控制额外成本或设置自动扩展最小值以保留计算资源用于具有专业性能要求的应用程序的能力。

## 功能 {#capabilities}
ClickHouse Cloud 提供对开源 ClickHouse 的一组策划功能的访问。下面的表格描述了一些目前在 ClickHouse Cloud 中禁用的功能。

### DDL 语法 {#ddl-syntax}
大部分情况下，ClickHouse Cloud 的 DDL 语法应与自管理安装中的可用语法相匹配。有几个显著的例外：
  - 对 `CREATE AS SELECT` 的支持目前不可用。作为一种变通方法，我们建议使用 `CREATE ... EMPTY ... AS SELECT` 然后插入该表（有关示例，请参见 [这篇博客](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1)）。
  - 一些实验性语法可能被禁用，例如 `ALTER TABLE … MODIFY QUERY` 语句。
  - 出于安全考虑，一些自省功能可能被禁用，例如 `addressToLine` SQL 函数。
  - 不要在 ClickHouse Cloud 中使用 `ON CLUSTER` 参数——这些是多余的。尽管这些主要是无操作函数，但如果您尝试使用 [宏](/operations/server-configuration-parameters/settings#macros)，它们仍可能导致错误。在 ClickHouse Cloud 中，宏通常不起作用且不需要。

### 数据库和表引擎 {#database-and-table-engines}

ClickHouse Cloud 默认提供高可用和复制的服务。因此，所有数据库和表引擎都是“副本”的。您无需指定“副本”——例如，`ReplicatedMergeTree` 和 `MergeTree` 在 ClickHouse Cloud 中是相同的。

**支持的表引擎**

  - ReplicatedMergeTree（默认，当未指定时）
  - ReplicatedSummingMergeTree
  - ReplicatedAggregatingMergeTree
  - ReplicatedReplacingMergeTree
  - ReplicatedCollapsingMergeTree
  - ReplicatedVersionedCollapsingMergeTree
  - MergeTree（转换为 ReplicatedMergeTree）
  - SummingMergeTree（转换为 ReplicatedSummingMergeTree）
  - AggregatingMergeTree（转换为 ReplicatedAggregatingMergeTree）
  - ReplacingMergeTree（转换为 ReplicatedReplacingMergeTree）
  - CollapsingMergeTree（转换为 ReplicatedCollapsingMergeTree）
  - VersionedCollapsingMergeTree（转换为 ReplicatedVersionedCollapsingMergeTree）
  - URL
  - View
  - MaterializedView
  - GenerateRandom
  - Null
  - Buffer
  - Memory
  - Deltalake
  - Hudi
  - MySQL
  - MongoDB
  - NATS
  - RabbitMQ
  - PostgreSQL
  - S3

### 接口 {#interfaces}
ClickHouse Cloud 支持 HTTPS、本机接口，以及 [MySQL wire protocol](/interfaces/mysql)。支持更多接口（如 Postgres）即将推出。

### 字典 {#dictionaries}
字典是加速 ClickHouse 中查找的流行方法。 ClickHouse Cloud 目前支持来自 PostgreSQL、MySQL、远程和本地 ClickHouse 服务器、Redis、MongoDB 和 HTTP 源的字典。

### 联邦查询 {#federated-queries}
我们在云中支持用于跨集群通信的联邦 ClickHouse 查询，以及与外部自管理 ClickHouse 集群的通信。ClickHouse Cloud 目前支持使用以下集成引擎的联邦查询：
  - Deltalake
  - Hudi
  - MySQL
  - MongoDB
  - NATS
  - RabbitMQ
  - PostgreSQL
  - S3

与某些外部数据库和表引擎（如 SQLite、ODBC、JDBC、Redis、HDFS 和 Hive）的联邦查询尚不受支持。

### 用户定义的函数 {#user-defined-functions}

用户定义的函数是 ClickHouse 中的一个新特性。ClickHouse Cloud 目前仅支持 SQL UDF。

### 实验性功能 {#experimental-features}

为了确保服务部署的稳定性，ClickHouse Cloud 服务中禁用了实验性功能。

### Kafka {#kafka}

在 ClickHouse Cloud 中，[Kafka 表引擎](/integrations/data-ingestion/kafka/index.md) 并未普遍可用。相反，我们建议依赖将 Kafka 连接组件与 ClickHouse 服务解耦的架构，以实现关注点分离。我们推荐 [ClickPipes](https://clickhouse.com/cloud/clickpipes) 来从 Kafka 流中提取数据。或者，可以考虑在 [Kafka 用户指南](/integrations/data-ingestion/kafka/index.md) 中列出的基于推送的替代方案。

### 命名集合 {#named-collections}

[命名集合](/operations/named-collections) 目前不在 ClickHouse Cloud 中支持。

## 操作默认值和注意事项 {#operational-defaults-and-considerations}
以下是 ClickHouse Cloud 服务的默认设置。在某些情况下，这些设置是固定的，以确保服务的正确运行，而在其他情况下，则可以进行调整。

### 操作限制 {#operational-limits}

#### `max_parts_in_total: 10,000` {#max_parts_in_total-10000}
MergeTree 表的 `max_parts_in_total` 设置的默认值已从 100,000 降低到 10,000。进行此更改的原因是我们观察到大量数据部分可能会导致云中服务的启动时间缓慢。大量部分通常表明选择了过于细粒度的分区键，这通常是无意中造成的，应该避免。更改默认值将允许更早地检测到这些情况。

#### `max_concurrent_queries: 1,000` {#max_concurrent_queries-1000}
将每个服务器的此设置从默认的 `100` 提高到 `1000` 以允许更多的并发。这将导致提供的层次服务的并发查询数量为 `副本数 * 1,000`。基本层服务的并发查询数限制为单个副本的 `1000`，而规模和企业版的则为 `1000+`，具体取决于配置的副本数量。

#### `max_table_size_to_drop: 1,000,000,000,000` {#max_table_size_to_drop-1000000000000}
将此设置从 50GB 增加，以允许删除最大为 1TB 的表/分区。

### 系统设置 {#system-settings}
ClickHouse Cloud 已针对可变工作负载进行调整，因此目前大多数系统设置不可配置。我们不预期大多数用户需要调整系统设置，但如果您有关于高级系统调优的问题，请联系 ClickHouse Cloud 支持。

### 高级安全管理 {#advanced-security-administration}
作为创建 ClickHouse 服务的一部分，我们创建了一个默认数据库，并具有广泛权限的默认用户。此初始用户可以创建其他用户并为其分配该数据库的权限。此外，目前不支持在数据库中使用 Kerberos、LDAP 或 SSL X.509 证书身份验证启用以下安全功能。

## 路线图 {#roadmap}

我们正在引入对云中可执行 UDF 的支持，并评估对许多其他功能的需求。如果您有反馈并希望请求特定功能，请 [在这里提交](https://console.clickhouse.cloud/support)。
