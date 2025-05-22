---
'slug': '/whats-new/cloud-compatibility'
'sidebar_label': '云兼容性'
'title': '云兼容性'
'description': '本指南提供了在 ClickHouse Cloud 中功能和操作上的期望概述。'
---


# ClickHouse Cloud — 兼容性指南

本指南提供了在 ClickHouse Cloud 中功能和操作的概述。虽然 ClickHouse Cloud 基于开源 ClickHouse 发行版，但在架构和实现上可能会有一些差异。您可能会发现这篇关于 [我们如何在一年内从零开始构建 ClickHouse Cloud 的博客](https://clickhouse.com/blog/building-clickhouse-cloud-from-scratch-in-a-year) 很有趣且相关，可以作为背景阅读。

## ClickHouse Cloud 架构 {#clickhouse-cloud-architecture}
ClickHouse Cloud 显著简化了操作开销，并降低了大规模运行 ClickHouse 的成本。您无需提前制定部署规模，设置高可用性的复制、手动分片数据、在工作负载增加时扩大服务器规模或者在不使用时缩减它们——我们会为您处理这些。

这些好处源于 ClickHouse Cloud 的架构选择：
- 计算和存储是分开的，因此可以沿着不同的维度自动扩展，因此您无需在静态实例配置中过度配置存储或计算。
- 基于对象存储的分层存储和多级缓存提供了几乎无限的扩展性和良好的性价比，因此您无需提前确定存储分区的大小并担心高存储成本。
- 高可用性默认开启，并且复制透明管理，因此您可以专注于构建应用程序或分析数据。
- 对于可变的持续工作负载，自动缩放默认开启，因此您不必提前规定服务规模，在工作负载增加时扩展服务器，或在活动较少时手动缩减服务器。
- 对于间歇性工作负载，透明的无缝休眠默认开启。我们会在一段时间的非活动后自动暂停您的计算资源，并在新的查询到达时透明地重新启动，因此您无需为闲置资源付费。
- 先进的缩放控制允许设置自动缩放的最大值，以进行额外的成本控制，或设置自动缩放的最小值，以为具有特殊性能需求的应用程序保留计算资源。

## 功能 {#capabilities}
ClickHouse Cloud 提供对开源 ClickHouse 中一组精选功能的访问。以下表格描述了当前在 ClickHouse Cloud 中禁用的一些功能。

### DDL 语法 {#ddl-syntax}
在大多数情况下，ClickHouse Cloud 的 DDL 语法应与自管理安装中提供的内容一致。几个显著的例外：
  - 不支持 `CREATE AS SELECT`。作为变通方法，我们建议使用 `CREATE ... EMPTY ... AS SELECT`，然后插入数据到该表中（请参见 [这篇博客](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1) 中的示例）。
  - 一些实验性语法可能被禁用，例如 `ALTER TABLE ... MODIFY QUERY` 语句。
  - 出于安全原因，某些自省功能可能被禁用，例如 `addressToLine` SQL 函数。
  - 在 ClickHouse Cloud 中请不要使用 `ON CLUSTER` 参数——这些参数并不需要。虽然这些主要是无效操作，但如果您尝试使用 [宏](/operations/server-configuration-parameters/settings#macros)，它们仍可能会导致错误。宏通常在 ClickHouse Cloud 中无法正常工作，也不需要使用。

### 数据库和表引擎 {#database-and-table-engines}

ClickHouse Cloud 默认提供高可用的复制服务。因此，所有数据库和表引擎都是 "Replicated"。您不需要指定 "Replicated"——例如，`ReplicatedMergeTree` 和 `MergeTree` 在 ClickHouse Cloud 中是完全相同的。

**支持的表引擎**

  - ReplicatedMergeTree（默认，当没有指定时）
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
ClickHouse Cloud 支持 HTTPS、原生接口和 [MySQL wire protocol](/interfaces/mysql)。对更多接口（如 Postgres）的支持即将推出。

### 字典 {#dictionaries}
字典是加速 ClickHouse 查找的流行方式。当前 ClickHouse Cloud 支持来自 PostgreSQL、MySQL、远程和本地 ClickHouse 服务器、Redis、MongoDB 和 HTTP 源的字典。

### 联邦查询 {#federated-queries}
我们支持在云中进行跨集群通信的联邦 ClickHouse 查询，以及与外部自管理 ClickHouse 集群的通信。ClickHouse Cloud 当前支持以下集成引擎的联邦查询：
  - Deltalake
  - Hudi
  - MySQL
  - MongoDB
  - NATS
  - RabbitMQ
  - PostgreSQL
  - S3

与一些外部数据库和表引擎（如 SQLite、ODBC、JDBC、Redis、HDFS 和 Hive）的联邦查询尚未支持。

### 用户定义函数 {#user-defined-functions}

用户定义函数是 ClickHouse 的一项新功能。ClickHouse Cloud 当前仅支持 SQL UDFs。

### 实验性功能 {#experimental-features}

为确保服务部署的稳定性，ClickHouse Cloud 服务中禁用了实验性功能。

### Kafka {#kafka}

[Kafka 表引擎](/integrations/data-ingestion/kafka/index.md) 在 ClickHouse Cloud 中尚未普遍可用。相反，我们建议依赖将 Kafka 连接组件与 ClickHouse 服务解耦的架构，以实现关注点的分离。我们推荐使用 [ClickPipes](https://clickhouse.com/cloud/clickpipes) 从 Kafka 流中提取数据。或者，可以考虑 [Kafka 用户指南](/integrations/data-ingestion/kafka/index.md) 中列出的基于推送的替代方案。

### 命名集合 {#named-collections}

[命名集合](/operations/named-collections) 当前未在 ClickHouse Cloud 中支持。

## 操作默认值和注意事项 {#operational-defaults-and-considerations}
以下是 ClickHouse Cloud 服务的默认设置。在某些情况下，这些设置是固定的，以确保服务的正确运行，而在其他情况下，它们可以进行调整。

### 操作限制 {#operational-limits}

#### `max_parts_in_total: 10,000` {#max_parts_in_total-10000}
默认的 `max_parts_in_total` 设置值已从 100,000 降低到 10,000。此次更改的原因是我们观察到，大量数据部分可能会导致云中服务的启动时间变慢。大量部分通常表明选择了过于细粒度的分区键，这通常是意外造成的，应该避免。默认值的更改将允许更早地检测到这些情况。

#### `max_concurrent_queries: 1,000` {#max_concurrent_queries-1000}
已将此每服务器设置从默认的 `100` 增加到 `1000`，以允许更高的并发性。 
这将导致所提供层级服务的并发查询总数为 `副本数 * 1,000`。 
对于限于单个副本的基础层服务为 `1000`，对于可扩展和企业版服务为 `1000+`，具体取决于配置的副本数量。

#### `max_table_size_to_drop: 1,000,000,000,000` {#max_table_size_to_drop-1000000000000}
已将此设置从 50GB 增加，以允许删除大小达到 1TB 的表/分区。

### 系统设置 {#system-settings}
ClickHouse Cloud 为可变工作负载进行了优化，因此大多数系统设置目前不可配置。我们不预期大多数用户会需要调整系统设置，但如果您有关于高级系统调整的问题，请联系 ClickHouse Cloud 支持。

### 高级安全管理 {#advanced-security-administration}
作为创建 ClickHouse 服务的一部分，我们创建了一个默认数据库，并为这个数据库创建了一个具有广泛权限的默认用户。此初始用户可以创建其他用户并将其权限分配给该数据库。除此之外，目前仍不支持使用 Kerberos、LDAP 或 SSL X.509 证书认证在数据库中启用以下安全功能。

## 路线图 {#roadmap}

我们正在 Cloud 中引入对可执行 UDFs 的支持，并评估对许多其他功能的需求。如果您有反馈并希望请求特定功能，请 [在此提交](https://console.clickhouse.cloud/support)。
