---
'slug': '/whats-new/cloud-compatibility'
'sidebar_label': '云兼容性'
'title': '云兼容性'
'description': '本指南提供了在 ClickHouse Cloud 中功能和操作方面的期望概述。'
'doc_type': 'guide'
---


# ClickHouse Cloud 兼容性指南

本指南概述了在 ClickHouse Cloud 中的功能与操作预期。虽然 ClickHouse Cloud 基于开源的 ClickHouse 发行版，但在架构和实现上可能存在一些差异。您可能会发现这篇关于 [我们如何从零构建 ClickHouse Cloud](https://clickhouse.com/blog/building-clickhouse-cloud-from-scratch-in-a-year) 的博客有趣且相关。

## ClickHouse Cloud 架构 {#clickhouse-cloud-architecture}
ClickHouse Cloud 显著简化了操作开销，并降低了大规模运行 ClickHouse 的成本。您无需提前确定部署规模，设置高可用性的复制，手动对数据进行分片，工作负载增加时扩展服务器，或在不使用时缩减服务器规模——我们为您处理这一切。

这些好处是 ClickHouse Cloud 基础架构选择的结果：
- 计算和存储相互分离，因此可以沿独立维度进行自动扩展，这样您就不必在静态实例配置中过度配置存储或计算。
- 基于对象存储的分层存储和多级缓存提供了几乎无限的扩展能力和良好的性价比，因此您无需提前确定存储分区的规模，也不必担心高昂的存储成本。
- 默认启用高可用性并透明管理复制，因此您可以专注于构建应用程序或分析数据。
- 默认启用可变连续工作负载的自动扩展，因此您无需提前确定服务规模，工作负载增加时扩展服务器，或在活动减少时手动缩减服务器。
- 默认启用间歇性工作负载的无缝休眠。我们会在一段时间的非活动后自动暂停计算资源，并在到达新查询时透明地重新启动它，因此您无需为闲置资源支付费用。
- 高级扩展控制提供了设置自动扩展上限以控制额外成本的能力，或设置自动扩展下限来为具有特定性能要求的应用预留计算资源。

## 功能 {#capabilities}
ClickHouse Cloud 提供了一组经过精心策划的功能，基于 ClickHouse 的开源版本。下表描述了目前在 ClickHouse Cloud 中禁用的一些功能。

### DDL 语法 {#ddl-syntax}
大多数情况下，ClickHouse Cloud 的 DDL 语法应与自管理安装中可用的语法相匹配。几个显著的例外：
- 不支持 `CREATE AS SELECT`。作为一种变通方法，我们建议使用 `CREATE ... EMPTY ... AS SELECT`，然后插入到该表中（有关示例，请参见[这篇博客](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1)）。
- 一些实验性语法可能被禁用，例如 `ALTER TABLE ... MODIFY QUERY` 语句。
- 一些自省功能可能出于安全原因被禁用，例如 `addressToLine` SQL 函数。
- 请勿在 ClickHouse Cloud 中使用 `ON CLUSTER` 参数——这些是多余的。虽然这些多数是无操作函数，但如果您试图使用 [宏](/operations/server-configuration-parameters/settings#macros)，还是会导致错误。宏通常在 ClickHouse Cloud 中不起作用且不必要。

### 数据库和表引擎 {#database-and-table-engines}

ClickHouse Cloud 默认提供高可用、复制的服务。因此，所有数据库和表引擎都是“复制的”。您无需指定“复制”——例如，`ReplicatedMergeTree` 和 `MergeTree` 在 ClickHouse Cloud 中是相同的。

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
ClickHouse Cloud 支持 HTTPS、本地接口和 [MySQL 线协议](/interfaces/mysql)。对更多接口的支持，比如 Postgres，正在开发中。

### 字典 {#dictionaries}
字典是在 ClickHouse 中加速查找的流行方式。ClickHouse Cloud 当前支持来自 PostgreSQL、MySQL、远程和本地 ClickHouse 服务器、Redis、MongoDB 和 HTTP 源的字典。

### 联邦查询 {#federated-queries}
我们支持用于跨集群通信和与外部自管理 ClickHouse 集群通信的联邦 ClickHouse 查询。ClickHouse Cloud 当前支持使用以下集成引擎的联邦查询：
- Deltalake
- Hudi
- MySQL
- MongoDB
- NATS
- RabbitMQ
- PostgreSQL
- S3

某些外部数据库和表引擎的联邦查询，如 SQLite、ODBC、JDBC、Redis、HDFS 和 Hive 目前尚不支持。

### 用户定义函数 {#user-defined-functions}

用户定义函数是 ClickHouse 的一项新功能。ClickHouse Cloud 当前仅支持 SQL UDFs。

### 实验性功能 {#experimental-features}

为确保服务部署的稳定性，ClickHouse Cloud 服务中禁用了实验性功能。

### Kafka {#kafka}

[Kafka 表引擎](/integrations/data-ingestion/kafka/index.md)在 ClickHouse Cloud 中未普遍可用。相反，我们建议依赖将 Kafka 连接组件与 ClickHouse 服务分离的架构，以实现职责分离。我们推荐使用 [ClickPipes](https://clickhouse.com/cloud/clickpipes) 从 Kafka 流中提取数据。或者，请考虑 [Kafka 用户指南](/integrations/data-ingestion/kafka/index.md) 中列出的基于推送的替代方案。

### 命名集合 {#named-collections}

[命名集合](/operations/named-collections) 当前在 ClickHouse Cloud 中不受支持。

## 操作默认值和注意事项 {#operational-defaults-and-considerations}
以下是 ClickHouse Cloud 服务的默认设置。在某些情况下，这些设置是固定的，以确保服务的正确操作，而在其他情况下，它们可以进行调整。

### 操作限制 {#operational-limits}

#### `max_parts_in_total: 10,000` {#max_parts_in_total-10000}
MergeTree 表的 `max_parts_in_total` 设置的默认值已降低从 100,000 至 10,000。更改的原因是我们观察到大量数据部分可能导致云中服务的启动时间变慢。大量部分通常表示选择了过于细粒度的分区键，通常是意外造成的，应当避免。更改默认值将允许更早地检测到这些情况。

#### `max_concurrent_queries: 1,000` {#max_concurrent_queries-1000}
将此每服务器设置从默认的 `100` 增加到 `1000`，以允许更多并发。
这将导致提供的服务层级可处理 `number of replicas * 1,000` 的并发查询。
对于限于单一副本的基础层服务，支持 `1000` 个并发查询；而对于规模和企业层，支持 `1000+` 个并发查询，具体取决于配置的副本数量。

#### `max_table_size_to_drop: 1,000,000,000,000` {#max_table_size_to_drop-1000000000000}
将此设置从 50GB 提高，以允许删除大小达到 1TB 的表/分区。

### 系统设置 {#system-settings}
ClickHouse Cloud 针对可变工作负载进行了调整，因此目前大多数系统设置不可配置。我们不预期大多数用户需要调整系统设置，但如果您有关于高级系统调整的问题，请联系 ClickHouse Cloud 支持。

### 高级安全管理 {#advanced-security-administration}
在创建 ClickHouse 服务时，我们会创建一个默认数据库，以及一个对此数据库具有广泛权限的默认用户。此初始用户可以创建其他用户并分配其对该数据库的权限。在此之外，使用 Kerberos、LDAP 或 SSL X.509 证书认证启用数据库中的以下安全功能目前不受支持。

## 路线图 {#roadmap}

我们正在 Cloud 中引入可执行 UDFs 的支持，并评估许多其他功能的需求。如果您有反馈并希望请求特定功能，请 [在此提交](https://console.clickhouse.cloud/support)。
