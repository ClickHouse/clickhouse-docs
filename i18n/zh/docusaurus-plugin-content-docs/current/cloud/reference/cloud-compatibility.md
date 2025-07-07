---
'slug': '/whats-new/cloud-compatibility'
'sidebar_label': '云兼容性'
'title': '云兼容性'
'description': '本指南提供了在 ClickHouse Cloud 中功能和操作方面的概述。'
---


# ClickHouse Cloud — 兼容性指南

本指南提供了在 ClickHouse Cloud 中功能和操作上的预期概述。尽管 ClickHouse Cloud 基于开源的 ClickHouse 分发版本，但在架构和实现上可能会有一些差异。您可能会觉得这篇关于 [如何从头构建 ClickHouse Cloud 的博客](https://clickhouse.com/blog/building-clickhouse-cloud-from-scratch-in-a-year) 读起来有趣且相关。

## ClickHouse Cloud 架构 {#clickhouse-cloud-architecture}
ClickHouse Cloud 显著简化了操作开销，并降低了大规模运行 ClickHouse 的成本。您无需提前调整部署规模、设置高可用性的复制、手动分片数据、在工作负载增加时扩展服务器，或在不使用时缩减服务器——我们为您处理这些。

这些好处来自于 ClickHouse Cloud 背后的架构选择：
- 计算和存储是分开的，因此可以沿不同维度自动扩展，因此您无需在静态实例配置中过度配置存储或计算。
- 在对象存储上建立的分层存储和多级缓存提供了几乎无限的扩展和良好的价格/性能比，因此您无需提前调整存储分区并担心高存储成本。
- 默认情况下启用高可用性，复制管理透明，因此您可以专注于构建应用或分析数据。
- 对于可变的连续工作负载，默认启用了自动扩展，因此您无需提前调整服务规模，在工作负载增加时扩展服务器，或在活动减少时手动缩减服务器。
- 默认启用无缝休眠以处理间歇性工作负载。我们会在长时间不活动后自动暂停计算资源，并在新查询到达时透明地重新启动，因此您无需为闲置资源支付费用。
- 高级扩展控制提供了设置自动扩展最大值的能力，以便进行额外的成本控制，或设置自动扩展最小值，以便为具有特殊性能要求的应用保留计算资源。

## 功能 {#capabilities}
ClickHouse Cloud 提供对开源 ClickHouse 分发版本中经过筛选的一组功能的访问。下面的表描述了目前在 ClickHouse Cloud 中禁用的一些特性。

### DDL 语法 {#ddl-syntax}
在大多数情况下，ClickHouse Cloud 的 DDL 语法应与自管理安装中可用的语法相匹配。有一些显著的例外：
  - 不支持 `CREATE AS SELECT`，作为解决方法，我们建议使用 `CREATE ... EMPTY ... AS SELECT`，然后将数据插入该表中（请参阅 [这篇博客](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1) 的示例）。
  - 一些实验性语法可能被禁用，例如 `ALTER TABLE ... MODIFY QUERY` 语句。
  - 一些用于反向工程的功能可能因安全原因被禁用，例如 `addressToLine` SQL 函数。
  - 不要在 ClickHouse Cloud 中使用 `ON CLUSTER` 参数 —— 这些是没有必要的。尽管这些大多数是无操作的函数，但如果您尝试使用 [宏](/operations/server-configuration-parameters/settings#macros)，仍然可能会导致错误。宏通常不在 ClickHouse Cloud 中工作且没有必要。

### 数据库与表引擎 {#database-and-table-engines}

ClickHouse Cloud 默认提供高可用和复制的服务。因此，所有数据库和表引擎都是“复制的”。您无需指定“复制”——例如，`ReplicatedMergeTree` 和 `MergeTree` 在 ClickHouse Cloud 中是相同的。

**支持的表引擎**

  - ReplicatedMergeTree（默认情况下，未指定时）
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
ClickHouse Cloud 支持 HTTPS、本地接口和 [MySQL 传输协议](/interfaces/mysql)。对于 Postgres 等更多接口的支持即将推出。

### 字典 {#dictionaries}
字典是在 ClickHouse 中加速查找的流行方式。ClickHouse Cloud 目前支持来自 PostgreSQL、MySQL、远程和本地 ClickHouse 服务器、Redis、MongoDB 和 HTTP 源的字典。

### 联邦查询 {#federated-queries}
我们支持在云中的跨集群通信和与外部自管理 ClickHouse 集群之间的联邦 ClickHouse 查询。ClickHouse Cloud 目前支持使用以下集成引擎进行联邦查询：
  - Deltalake
  - Hudi
  - MySQL
  - MongoDB
  - NATS
  - RabbitMQ
  - PostgreSQL
  - S3

尚不支持与某些外部数据库和表引擎的联邦查询，例如 SQLite、ODBC、JDBC、Redis、HDFS 和 Hive。

### 用户定义函数 {#user-defined-functions}

用户定义函数是 ClickHouse 的一项新功能。ClickHouse Cloud 目前仅支持 SQL 用户定义函数（UDFs）。

### 实验性功能 {#experimental-features}

为了确保服务部署的稳定性，ClickHouse Cloud 服务中禁用实验性功能。

### Kafka {#kafka}

[Kafka 表引擎](/integrations/data-ingestion/kafka/index.md)在 ClickHouse Cloud 中不可用。相反，我们建议依赖将 Kafka 连接组件与 ClickHouse 服务解耦的架构，以实现关注分离。我们推荐使用 [ClickPipes](https://clickhouse.com/cloud/clickpipes) 从 Kafka 流中拉取数据。或者，考虑 [Kafka 用户指南](/integrations/data-ingestion/kafka/index.md) 中列出的基于推送的替代方案。

### 命名集合 {#named-collections}

[命名集合](/operations/named-collections)目前在 ClickHouse Cloud 中不受支持。

## 操作默认值和考虑事项 {#operational-defaults-and-considerations}
以下是 ClickHouse Cloud 服务的默认设置。在某些情况下，这些设置是固定的，以确保服务的正确运行，而在其他情况下，它们可以进行调整。

### 操作限制 {#operational-limits}

#### `max_parts_in_total: 10,000` {#max_parts_in_total-10000}
MergeTree 表的 `max_parts_in_total` 设置的默认值已从 100,000 降低到 10,000。此更改的原因是，我们观察到大量数据片段可能会导致云中服务启动时间缓慢。大量的片段通常表示选择了过于细粒度的分区键，这通常是意外造成的，应该避免。默认值的更改将允许更早地检测这些情况。

#### `max_concurrent_queries: 1,000` {#max_concurrent_queries-1000}
将此每个服务器设置从默认的 `100` 增加到 `1000` 以允许更多的并发。
这将导致为所提供层服务的并发查询数为 `副本数 * 1,000`。
对于限于单个副本的基础服务，支持 `1000` 个并发查询，对于规模和企业版，支持 `1000+`，具体取决于配置的副本数量。

#### `max_table_size_to_drop: 1,000,000,000,000` {#max_table_size_to_drop-1000000000000}
将此设置从 50GB 提高，以允许删除高达 1TB 的表/分区。

### 系统设置 {#system-settings}
ClickHouse Cloud 针对可变工作负载进行了调整，因此大多数系统设置目前不可配置。我们不预计大多数用户需要调整系统设置，但如果您对高级系统调整有任何疑问，请联系 ClickHouse Cloud 支持。

### 高级安全管理 {#advanced-security-administration}
在创建 ClickHouse 服务时，我们创建了一个默认数据库，以及具有广泛权限的默认用户。此初始用户可以创建其他用户并为其分配对该数据库的权限。除此之外，当前不支持在数据库内使用 Kerberos、LDAP 或 SSL X.509 证书身份验证启用以下安全功能的能力。

## 路线图 {#roadmap}

我们正在 Cloud 中引入对可执行用户定义函数（UDFs）的支持，并评估对许多其他功能的需求。如果您有反馈并希望请求特定功能，请 [在这里提交](https://console.clickhouse.cloud/support)。
