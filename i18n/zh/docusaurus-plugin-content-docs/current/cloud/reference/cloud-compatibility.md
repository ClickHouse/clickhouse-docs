---
'slug': '/whats-new/cloud-compatibility'
'sidebar_label': '云兼容性'
'title': '云兼容性'
'description': '本指南概述了在ClickHouse云中在功能和操作上可以预期的情况。'
---




# ClickHouse Cloud — 兼容性指南

本指南概述了在 ClickHouse Cloud 中功能和操作上的预期。尽管 ClickHouse Cloud 基于开源的 ClickHouse 发行版，但在架构和实现上可能会有一些差异。您可能会对这篇关于 [我们如何构建 ClickHouse Cloud](https://clickhouse.com/blog/building-clickhouse-cloud-from-scratch-in-a-year) 的博客感兴趣，作为背景阅读。

## ClickHouse Cloud 架构 {#clickhouse-cloud-architecture}
ClickHouse Cloud 显著简化了操作开销，并降低了大规模运行 ClickHouse 的成本。您无需提前确定部署规模，设置高可用性的复制，手动分片数据，当工作负载增加时扩展服务器，或在不使用时缩减服务器 — 这些都由我们来处理。

这些好处源于 ClickHouse Cloud 背后的架构选择：
- 计算和存储是分开的，因此可以沿不同维度自动扩展，因此您无需在静态实例配置中过度配置存储或计算。
- 基于对象存储的分层存储和多级缓存提供了几乎无极限的扩展以及良好的性价比，因此您无需提前确定存储分区的大小并担心高存储成本。
- 默认开启高可用性，复制透明管理，因此您可以专注于构建应用程序或分析数据。
- 变量连续工作负载的自动扩展默认开启，因此您无需提前确定服务的规模，当工作负载增加时扩展服务器，或在活动减少时手动缩减服务器。
- 默认启用间歇性工作负载的无缝休眠。我们会在一定时间不活动后自动暂停计算资源，并在新查询到达时透明地重新启动，因此您无需为闲置资源支付费用。
- 高级扩展控制提供了设置自动扩展最大值以实现额外成本控制的能力，或设置自动扩展最小值以为具有特殊性能要求的应用程序保留计算资源。

## 能力 {#capabilities}
ClickHouse Cloud 提供了对开源 ClickHouse 发行版中经过筛选的一组能力的访问。以下表格描述了目前在 ClickHouse Cloud 中禁用的一些功能。

### DDL 语法 {#ddl-syntax}
在大多数情况下，ClickHouse Cloud 的 DDL 语法应与自管理安装中可用的相匹配。几个显著的例外：
  - 当前不支持 `CREATE AS SELECT`。作为变通方案，我们建议使用 `CREATE ... EMPTY ... AS SELECT` 然后插入到该表中（请参见 [这篇博客](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1) 的示例）。
  - 一些实验性语法可能被禁用，例如 `ALTER TABLE ... MODIFY QUERY` 语句。
  - 出于安全原因，某些自省功能可能被禁用，例如 `addressToLine` SQL 函数。
  - 请勿在 ClickHouse Cloud 中使用 `ON CLUSTER` 参数 — 这些是不需要的。虽然这些大多是无操作（no-op）函数，但如果您尝试使用 [macros](/operations/server-configuration-parameters/settings#macros)，仍然可能导致错误。在 ClickHouse Cloud 中，宏通常不起作用且不必要。

### 数据库和表引擎 {#database-and-table-engines}

ClickHouse Cloud 默认提供高可用的复制服务。因此，所有数据库和表引擎都是“复制的”。您无需指定“复制” — 例如，`ReplicatedMergeTree` 和 `MergeTree` 在 ClickHouse Cloud 中是相同的。

**支持的表引擎**

  - ReplicatedMergeTree（默认值，如果未指定）
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
ClickHouse Cloud 支持 HTTPS、原生接口和 [MySQL 线协议](/interfaces/mysql)。对更多接口的支持，如 Postgres，即将推出。

### 字典 {#dictionaries}
字典是一种加速在 ClickHouse 中进行查找的流行方式。ClickHouse Cloud 当前支持来自 PostgreSQL、MySQL、远程和本地 ClickHouse 服务器、Redis、MongoDB 和 HTTP 源的字典。

### 联邦查询 {#federated-queries}
我们支持在云中进行跨集群通信的联邦 ClickHouse 查询，以及与外部自管理 ClickHouse 集群的通信。ClickHouse Cloud 当前支持使用以下集成引擎的联邦查询：
  - Deltalake
  - Hudi
  - MySQL
  - MongoDB
  - NATS
  - RabbitMQ
  - PostgreSQL
  - S3

与某些外部数据库和表引擎（如 SQLite、ODBC、JDBC、Redis、HDFS 和 Hive）的联邦查询尚不支持。

### 用户自定义函数 {#user-defined-functions}

用户自定义函数是 ClickHouse 最近推出的功能。ClickHouse Cloud 当前仅支持 SQL UDFs。

### 实验性功能 {#experimental-features}

为了确保服务部署的稳定性，ClickHouse Cloud 服务中禁用了实验性功能。

### Kafka {#kafka}

[Kafka 表引擎](/integrations/data-ingestion/kafka/index.md) 在 ClickHouse Cloud 中尚未全面提供。相反，我们建议依赖将 Kafka 连接组件与 ClickHouse 服务解耦的架构，以实现职能分离。我们推荐 [ClickPipes](https://clickhouse.com/cloud/clickpipes) 从 Kafka 流中提取数据。或者，请考虑在 [Kafka 用户指南](/integrations/data-ingestion/kafka/index.md) 中列出的基于推送的替代方案。

### 命名集合 {#named-collections}

[命名集合](/operations/named-collections) 在 ClickHouse Cloud 中当前不受支持。

## 操作默认设置和注意事项 {#operational-defaults-and-considerations}
以下是 ClickHouse Cloud 服务的默认设置。在某些情况下，这些设置是固定的，以确保服务的正确运行，而在其他情况下，可以进行调整。

### 操作限制 {#operational-limits}

#### `max_parts_in_total: 10,000` {#max_parts_in_total-10000}
MergeTree 表的 `max_parts_in_total` 设置的默认值已从 100,000 降低到 10,000。更改原因在于，我们观察到大量数据分片可能会导致云中服务的启动时间变慢。大量片段通常表明选择了过于细粒度的分区键，通常是意外进行的，应避免。更改默认值将允许更早检测到这些情况。

#### `max_concurrent_queries: 1,000` {#max_concurrent_queries-1000}
将每台服务器的此设置从默认的 `100` 增加到 `1000`，以允许更多的并发。
这将导致提供的级别服务的 `副本数量 * 1,000` 的并发查询。
对于仅限于单个副本的基础级服务为 `1000` 并发查询，对于规模和企业级服务为 `1000+`，具体取决于配置的副本数量。

#### `max_table_size_to_drop: 1,000,000,000,000` {#max_table_size_to_drop-1000000000000}
将此设置从 50GB 提升，以便允许删除高达 1TB 的表/分区。

### 系统设置 {#system-settings}
ClickHouse Cloud 针对变化工作负载进行了调整，因此大多数系统设置目前不可配置。我们认为大多数用户无需调整系统设置，但如果您对高级系统调整有疑问，请联系 ClickHouse Cloud 支持。

### 高级安全管理 {#advanced-security-administration}
作为创建 ClickHouse 服务的一部分，我们会创建一个默认数据库，以及具有广泛权限的默认用户。此初始用户可以创建其他用户并为该数据库分配权限。除此之外，当前不支持在数据库中使用 Kerberos、LDAP 或 SSL X.509 证书认证启用以下安全功能的能力。

## 路线图 {#roadmap}

我们正在为云引入可执行 UDF 的支持，并评估对许多其他功能的需求。如果您有反馈并希望请求特定功能，请 [在这里提交](https://console.clickhouse.cloud/support)。
