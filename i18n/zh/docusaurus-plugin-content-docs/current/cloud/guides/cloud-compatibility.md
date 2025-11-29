---
slug: /whats-new/cloud-compatibility
sidebar_label: '云兼容性'
title: '云兼容性'
description: '本指南从功能和运维两个层面概述在 ClickHouse Cloud 中可以预期的体验。'
keywords: ['ClickHouse Cloud', '兼容性']
doc_type: 'guide'
---



# ClickHouse Cloud 兼容性指南 {#clickhouse-cloud-compatibility-guide}

本指南概述在 ClickHouse Cloud 中在功能和运维方面可以预期的行为和特性。虽然 ClickHouse Cloud 构建于开源 ClickHouse 发行版之上，但在架构和实现上可能存在一些差异。你可能会对这篇关于[我们如何构建 ClickHouse Cloud](https://clickhouse.com/blog/building-clickhouse-cloud-from-scratch-in-a-year) 的博客感兴趣，它可作为相关的背景阅读材料。



## ClickHouse Cloud 架构 {#clickhouse-cloud-architecture}
ClickHouse Cloud 大幅简化了运维开销，并降低了大规模运行 ClickHouse 的成本。无需预先规划部署规模、为高可用性配置复制、手动对数据进行分片、在工作负载增加时扩容服务器，或在空闲时缩容服务器——这一切都由 ClickHouse Cloud 代为处理。

这些优势源自 ClickHouse Cloud 的底层架构设计：
- 计算与存储相分离，并且可以在各自维度上独立自动伸缩，因此无需在静态实例配置中为存储或计算预留过多资源。
- 基于对象存储的分层存储以及多级缓存，几乎提供了无限的扩展能力和出色的性价比，因此无需预先规划存储分区大小，也不用担心高昂的存储成本。
- 高可用性默认启用，复制过程由系统透明管理，因此可以专注于构建应用程序或分析数据。
- 针对波动的持续性工作负载，自动伸缩默认启用，因此无需预先规划服务规模，也无需在工作负载增加时扩容服务器，或在活动减少时手动缩容服务器。
- 针对间歇性工作负载的无缝休眠功能默认启用。系统会在一段时间无活动后自动暂停计算资源，并在有新查询到达时透明地重新启动它们，因此无需为闲置资源付费。
- 高级伸缩控制允许设置自动伸缩的最大值以进一步控制成本，或设置自动伸缩的最小值，为具有特殊性能要求的应用程序预留计算资源。



## 能力 {#capabilities}
ClickHouse Cloud 提供对开源版 ClickHouse 中一组精心筛选功能的访问。下文列出了当前在 ClickHouse Cloud 中被禁用的部分特性。

### DDL 语法 {#ddl-syntax}
在大多数情况下，ClickHouse Cloud 的 DDL 语法应与自管安装中可用的语法一致。少数几个值得注意的例外如下：
- 对 `CREATE AS SELECT` 的支持当前不可用。作为替代方案，建议使用 `CREATE ... EMPTY ... AS SELECT`，然后向该表插入数据（示例参见[这篇博客](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1)）。
- 某些实验性语法可能被禁用，例如 `ALTER TABLE ... MODIFY QUERY` 语句。
- 出于安全目的，部分自省功能可能被禁用，例如 `addressToLine` SQL 函数。
- 不要在 ClickHouse Cloud 中使用 `ON CLUSTER` 参数——这些参数是不需要的。尽管这些大多是空操作，但在尝试使用[宏](/operations/server-configuration-parameters/settings#macros)时，它们仍可能导致错误。宏在 ClickHouse Cloud 中通常不起作用，也并不需要。

### 数据库和表引擎 {#database-and-table-engines}

ClickHouse Cloud 默认提供高可用、带副本的服务。因此，所有数据库和表引擎都是 “Replicated” 的。无需显式指定 “Replicated”——例如，在 ClickHouse Cloud 中，`ReplicatedMergeTree` 和 `MergeTree` 的使用效果是相同的。

**支持的表引擎**

- ReplicatedMergeTree（默认，当未指定任何引擎时）
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
ClickHouse Cloud 支持 HTTPS、原生接口以及 [MySQL wire protocol](/interfaces/mysql)。对更多接口（例如 Postgres）的支持即将推出。

### 字典 {#dictionaries}
字典是在 ClickHouse 中加速查找的一种常用方式。ClickHouse Cloud 当前支持来自 PostgreSQL、MySQL、远程和本地 ClickHouse 服务器、Redis、MongoDB 以及 HTTP 源的字典。

### 联邦查询 {#federated-queries}
我们支持在云中用于跨集群通信的联邦 ClickHouse 查询，以及与外部自管 ClickHouse 集群的通信。ClickHouse Cloud 当前通过以下集成引擎支持联邦查询：
- Deltalake
- Hudi
- MySQL
- MongoDB
- NATS
- RabbitMQ
- PostgreSQL
- S3

针对 SQLite、ODBC、JDBC、Redis、HDFS 和 Hive 等部分外部数据库和表引擎的联邦查询目前尚不支持。

### 用户自定义函数 {#user-defined-functions}

用户自定义函数是 ClickHouse 中的一个较新特性。ClickHouse Cloud 当前仅支持 SQL UDF。

### 实验性功能 {#experimental-features}

为确保服务部署的稳定性，ClickHouse Cloud 服务中禁用了实验性功能。

### Kafka {#kafka}

[Kafka Table Engine](/integrations/data-ingestion/kafka/index.md) 在 ClickHouse Cloud 中尚未普遍可用。相应地，我们建议采用将 Kafka 连接组件与 ClickHouse 服务解耦的架构，以实现关注点分离。我们推荐使用 [ClickPipes](https://clickhouse.com/cloud/clickpipes) 从 Kafka 流中拉取数据。或者，可以考虑 [Kafka 用户指南](/integrations/data-ingestion/kafka/index.md) 中列出的基于推送的替代方案。

### 命名集合 {#named-collections}

[命名集合](/operations/named-collections) 目前在 ClickHouse Cloud 中尚不受支持。



## 默认运行配置与注意事项 {#operational-defaults-and-considerations}
以下是 ClickHouse Cloud 服务的默认设置。在某些情况下，这些设置是固定的，以确保服务正确运行；在其他情况下，则可以进行调整。

### 运行限制 {#operational-limits}

#### `max_parts_in_total: 10,000` {#max_parts_in_total-10000}
MergeTree 表的 `max_parts_in_total` 设置默认值已从 100,000 降低为 10,000。做出此更改的原因是我们观察到，大量数据分片很可能导致云中服务的启动时间变慢。大量分片通常意味着分区键划分过于细粒度，这通常是无意为之，应当避免。默认值的更改将有助于更早发现这类情况。

#### `max_concurrent_queries: 1,000` {#max_concurrent_queries-1000}
将此每个服务器的设置从默认的 `100` 提升到 `1000`，以支持更高的并发度。  
对于所提供的不同服务等级，这将带来 `副本数量 * 1,000` 的并发查询数。  
对于仅限单副本的 Basic 等级服务，可支持 `1000` 个并发查询；对于 Scale 和 Enterprise 等级服务，则可支持 `1000+` 个并发查询，具体取决于配置的副本数量。

#### `max_table_size_to_drop: 1,000,000,000,000` {#max_table_size_to_drop-1000000000000}
将此设置从 50GB 提升，以允许删除大小最高为 1TB 的表/分区。

### 系统设置 {#system-settings}
ClickHouse Cloud 针对变化的工作负载进行了调优，因此目前大多数系统设置不可配置。我们预计大多数用户无需调整系统设置，但如果对高级系统调优有疑问，请联系 ClickHouse Cloud 支持团队。

### 高级安全管理 {#advanced-security-administration}
在创建 ClickHouse 服务的过程中，我们会创建一个默认数据库，以及一个对该数据库拥有广泛权限的默认用户。该初始用户可以创建其他用户，并为这些用户分配对此数据库的权限。除此之外，目前不支持在数据库中启用以下安全功能：使用 Kerberos、LDAP 或 SSL X.509 证书认证的安全机制。



## 路线图 {#roadmap}

我们正在为 ClickHouse Cloud 引入对可执行 UDF 的支持，并评估对许多其他功能的需求。如果您有任何反馈或希望请求某个特定功能，请[在此提交](https://console.clickhouse.cloud/support)。
