---
slug: /whats-new/cloud-compatibility
sidebar_label: '云兼容性'
title: '云兼容性'
description: '本指南概述在 ClickHouse Cloud 中，从功能和运维角度可以预期的特性和行为。'
keywords: ['ClickHouse Cloud', 'compatibility']
doc_type: 'guide'
---



# ClickHouse Cloud 兼容性指南

本指南概述了在 ClickHouse Cloud 中从功能和运维角度可以预期的行为。虽然 ClickHouse Cloud 构建于开源 ClickHouse 发行版之上，但在架构和实现方面可能存在一些差异。你可能会对这篇关于[我们如何构建 ClickHouse Cloud](https://clickhouse.com/blog/building-clickhouse-cloud-from-scratch-in-a-year)的博客感兴趣，作为背景阅读非常有参考价值。



## ClickHouse Cloud 架构 {#clickhouse-cloud-architecture}

ClickHouse Cloud 显著简化了运维开销,并降低了大规模运行 ClickHouse 的成本。您无需预先规划部署规模、为高可用性设置副本、手动分片数据、在工作负载增加时扩展服务器,或在不使用时缩减服务器——这一切我们都为您处理。

这些优势源于 ClickHouse Cloud 的底层架构设计:

- 计算和存储分离,因此可以沿不同维度自动扩展,您无需在静态实例配置中过度配置存储或计算资源。
- 基于对象存储的分层存储和多级缓存提供了几乎无限的扩展能力和良好的性价比,您无需预先规划存储分区大小,也不必担心高昂的存储成本。
- 高可用性默认启用,副本管理透明化,让您可以专注于构建应用程序或分析数据。
- 针对可变持续工作负载的自动扩展默认启用,您无需预先规划服务规模、在工作负载增加时扩展服务器,或在活动减少时手动缩减服务器。
- 针对间歇性工作负载的无缝休眠默认启用。我们会在一段时间不活动后自动暂停您的计算资源,并在新查询到达时透明地重新启动,因此您无需为空闲资源付费。
- 高级扩展控制提供了设置自动扩展上限以实现额外成本控制的能力,或设置自动扩展下限以为有特殊性能要求的应用程序预留计算资源。


## 功能特性 {#capabilities}

ClickHouse Cloud 提供对 ClickHouse 开源版本中精选功能集的访问。下表列出了目前在 ClickHouse Cloud 中禁用的部分功能。

### DDL 语法 {#ddl-syntax}

大多数情况下,ClickHouse Cloud 的 DDL 语法与自管理部署中的语法一致。以下是几个值得注意的例外:

- 不支持 `CREATE AS SELECT`,该功能目前不可用。作为替代方案,建议使用 `CREATE ... EMPTY ... AS SELECT`,然后向该表插入数据(参见[此博客](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1)中的示例)。
- 某些实验性语法可能被禁用,例如 `ALTER TABLE ... MODIFY QUERY` 语句。
- 出于安全考虑,某些内省功能可能被禁用,例如 `addressToLine` SQL 函数。
- 不要在 ClickHouse Cloud 中使用 `ON CLUSTER` 参数——这些参数并非必需。虽然这些参数大多为空操作,但如果您尝试使用[宏](/operations/server-configuration-parameters/settings#macros),仍可能导致错误。宏在 ClickHouse Cloud 中通常无法正常工作且并非必需。

### 数据库和表引擎 {#database-and-table-engines}

ClickHouse Cloud 默认提供高可用的复制服务。因此,所有数据库和表引擎都是"Replicated"(复制)类型。您无需显式指定"Replicated"——例如,在 ClickHouse Cloud 中使用时,`ReplicatedMergeTree` 和 `MergeTree` 是等效的。

**支持的表引擎**

- ReplicatedMergeTree(未指定时的默认引擎)
- ReplicatedSummingMergeTree
- ReplicatedAggregatingMergeTree
- ReplicatedReplacingMergeTree
- ReplicatedCollapsingMergeTree
- ReplicatedVersionedCollapsingMergeTree
- MergeTree(转换为 ReplicatedMergeTree)
- SummingMergeTree(转换为 ReplicatedSummingMergeTree)
- AggregatingMergeTree(转换为 ReplicatedAggregatingMergeTree)
- ReplacingMergeTree(转换为 ReplicatedReplacingMergeTree)
- CollapsingMergeTree(转换为 ReplicatedCollapsingMergeTree)
- VersionedCollapsingMergeTree(转换为 ReplicatedVersionedCollapsingMergeTree)
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

ClickHouse Cloud 支持 HTTPS、原生接口和 [MySQL 线协议](/interfaces/mysql)。对更多接口(如 Postgres)的支持即将推出。

### 字典 {#dictionaries}

字典是在 ClickHouse 中加速查找的常用方式。ClickHouse Cloud 目前支持来自 PostgreSQL、MySQL、远程和本地 ClickHouse 服务器、Redis、MongoDB 和 HTTP 源的字典。

### 联邦查询 {#federated-queries}

我们支持用于云中跨集群通信以及与外部自管理 ClickHouse 集群通信的联邦 ClickHouse 查询。ClickHouse Cloud 目前支持使用以下集成引擎的联邦查询:

- Deltalake
- Hudi
- MySQL
- MongoDB
- NATS
- RabbitMQ
- PostgreSQL
- S3

尚不支持与某些外部数据库和表引擎(如 SQLite、ODBC、JDBC、Redis、HDFS 和 Hive)的联邦查询。

### 用户自定义函数 {#user-defined-functions}

用户自定义函数是 ClickHouse 中的较新功能。ClickHouse Cloud 目前仅支持 SQL UDF。

### 实验性功能 {#experimental-features}

为确保服务部署的稳定性,ClickHouse Cloud 服务中禁用了实验性功能。

### Kafka {#kafka}

[Kafka 表引擎](/integrations/data-ingestion/kafka/index.md)在 ClickHouse Cloud 中不普遍可用。我们建议采用将 Kafka 连接组件与 ClickHouse 服务解耦的架构,以实现关注点分离。推荐使用 [ClickPipes](https://clickhouse.com/cloud/clickpipes) 从 Kafka 流中拉取数据。或者,可以考虑 [Kafka 用户指南](/integrations/data-ingestion/kafka/index.md)中列出的基于推送的替代方案。

### 命名集合 {#named-collections}

[命名集合](/operations/named-collections)目前在 ClickHouse Cloud 中不受支持。


## 运行默认值和注意事项 {#operational-defaults-and-considerations}

以下是 ClickHouse Cloud 服务的默认设置。某些设置是固定的以确保服务正常运行,其他设置则可以调整。

### 运行限制 {#operational-limits}

#### `max_parts_in_total: 10,000` {#max_parts_in_total-10000}

MergeTree 表的 `max_parts_in_total` 设置默认值已从 100,000 降低到 10,000。做出此更改的原因是我们观察到大量数据分片可能会导致云服务启动时间变慢。大量分片通常表明分区键选择过于细粒度,这通常是无意为之,应当避免。更改默认值可以更早地发现这些情况。

#### `max_concurrent_queries: 1,000` {#max_concurrent_queries-1000}

将此单服务器设置从默认的 `100` 提高到 `1000`,以支持更高的并发性。
这将使所提供的层级服务支持 `副本数 * 1,000` 个并发查询。
Basic 层级服务限制为单个副本,支持 `1000` 个并发查询,而 Scale 和 Enterprise 层级支持 `1000+` 个并发查询,
具体取决于配置的副本数量。

#### `max_table_size_to_drop: 1,000,000,000,000` {#max_table_size_to_drop-1000000000000}

将此设置从 50GB 提高,以支持删除最大 1TB 的表/分区。

### 系统设置 {#system-settings}

ClickHouse Cloud 针对可变工作负载进行了优化,因此目前大多数系统设置不可配置。我们预计大多数用户无需调整系统设置,但如果您对高级系统调优有疑问,请联系 ClickHouse Cloud 支持团队。

### 高级安全管理 {#advanced-security-administration}

在创建 ClickHouse 服务时,我们会创建一个默认数据库以及对该数据库具有广泛权限的默认用户。此初始用户可以创建其他用户并为其分配对该数据库的权限。除此之外,目前不支持使用 Kerberos、LDAP 或 SSL X.509 证书认证在数据库中启用相关安全功能。


## 路线图 {#roadmap}

我们正在 ClickHouse Cloud 中引入可执行 UDF 支持,并评估其他多项功能的需求。如果您有反馈意见或希望申请特定功能,请[在此提交](https://console.clickhouse.cloud/support)。
