---
slug: /whats-new/cloud-compatibility
sidebar_label: 'Cloud 兼容性'
title: 'Cloud 兼容性'
description: '本指南概述在 ClickHouse Cloud 中可预期的功能和运维特性。'
keywords: ['ClickHouse Cloud', '兼容性']
doc_type: 'guide'
---

# ClickHouse Cloud 兼容性指南 \{#clickhouse-cloud-compatibility-guide\}

本指南从功能和运维两个层面概述在 ClickHouse Cloud 中应当预期的特性和行为。尽管 ClickHouse Cloud 构建于开源 ClickHouse 发行版之上，但在架构和实现细节上可能存在一些差异。读者可能会对这篇关于[我们如何构建 ClickHouse Cloud](https://clickhouse.com/blog/building-clickhouse-cloud-from-scratch-in-a-year)的博客感兴趣，将其作为背景阅读会很有帮助。

## ClickHouse Cloud 架构 \{#clickhouse-cloud-architecture\}

ClickHouse Cloud 显著简化了运维开销，并降低了大规模运行 ClickHouse 的成本。您无需在前期为部署预估容量、为高可用性配置复制、手动对数据进行分片、在负载增加时扩容服务器，或在负载降低时缩容服务器——这些都由我们来处理。

这些优势源自 ClickHouse Cloud 底层的架构设计：

- 计算与存储相分离，因此可以分别自动扩缩容，您无需在静态实例配置中为存储或计算过度预留资源。
- 构建在对象存储之上的分层存储和多级缓存，提供几乎无限的扩展能力和良好的性价比，因此您无需提前规划存储分区容量，也不必担心高昂的存储成本。
- 默认启用高可用，并透明地管理复制，因此您可以专注于构建应用或分析数据。
- 对于持续且变化的工作负载，默认开启自动扩缩容，因此您无需提前为服务预估容量、在负载增加时扩容服务器，或在业务活动减少时手动缩容服务器。
- 对于间歇性工作负载，默认启用无缝休眠。我们会在一段时间无活动后自动暂停计算资源，并在新的查询到达时透明地重新启动它，这样您无需为空闲资源付费。
- 高级扩缩容控制允许您设置自动扩缩容的上限以加强成本控制，或设置自动扩缩容的下限，以为具有特殊性能要求的应用预留计算资源。

## 功能 \{#capabilities\}

ClickHouse Cloud 在开源发行版的 ClickHouse 中提供了一组精心挑选的功能。下方的表格描述了目前在 ClickHouse Cloud 中被禁用的部分功能。

### 数据库和表引擎 \{#database-and-table-engines\}

ClickHouse Cloud 默认提供高可用的副本服务。因此，所有数据库和表引擎本质上都是 “Replicated” 的。无需显式指定 “Replicated”——例如，在 ClickHouse Cloud 中，`ReplicatedMergeTree` 和 `MergeTree` 的使用效果是等同的。

**支持的表引擎**

- ReplicatedMergeTree（默认，在未指定时）
- ReplicatedSummingMergeTree
- ReplicatedAggregatingMergeTree
- ReplicatedReplacingMergeTree
- ReplicatedCollapsingMergeTree
- ReplicatedVersionedCollapsingMergeTree
- MergeTree（会转换为 ReplicatedMergeTree）
- SummingMergeTree（会转换为 ReplicatedSummingMergeTree）
- AggregatingMergeTree（会转换为 ReplicatedAggregatingMergeTree）
- ReplacingMergeTree（会转换为 ReplicatedReplacingMergeTree）
- CollapsingMergeTree（会转换为 ReplicatedCollapsingMergeTree）
- VersionedCollapsingMergeTree（会转换为 ReplicatedVersionedCollapsingMergeTree）
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
- Kafka

### 接口 \{#interfaces\}

ClickHouse Cloud 支持 HTTPS、原生接口，以及 [MySQL 线协议](/interfaces/mysql)。对更多接口（例如 Postgres）的支持即将推出。

### 字典 \{#dictionaries\}

字典是在 ClickHouse 中加速查找的一种常用方法。ClickHouse Cloud 目前支持来自 PostgreSQL、MySQL、远程和本地 ClickHouse 服务器、Redis、MongoDB 以及 HTTP 数据源的字典。

### 联邦查询 \{#federated-queries\}

我们在 Cloud 中支持 ClickHouse 联邦查询，可用于跨集群通信，以及与外部自管理 ClickHouse 集群的通信。ClickHouse Cloud 目前通过以下集成引擎支持联邦查询：

- Deltalake
- Hudi
- MySQL
- MongoDB
- NATS
- RabbitMQ
- PostgreSQL
- S3

针对某些外部数据库和表引擎（例如 SQLite、ODBC、JDBC、Redis、HDFS 和 Hive）的联邦查询目前尚不支持。

### 用户自定义函数 \{#user-defined-functions\}

ClickHouse Cloud 中的用户自定义函数目前处于[私有预览](https://clickhouse.com/docs/sql-reference/functions/udf)阶段。

#### 设置行为 \{#udf-settings-behavior\}

:::warning 重要
ClickHouse Cloud 中的 UDF **不会继承用户级别的设置**。它们在默认系统设置下执行。
:::

这意味着：

- 会话级别的设置（通过 `SET` 语句设置）不会传递到 UDF 执行上下文中
- 用户配置（profile）中的设置不会被 UDF 继承
- 查询级别的设置在 UDF 执行过程中不生效

### 实验性特性 \{#experimental-features\}

在 ClickHouse Cloud 服务中禁用实验性特性，以确保服务部署的稳定性。

### 命名集合 \{#named-collections\}

[命名集合](/operations/named-collections) 目前在 ClickHouse Cloud 中尚不支持。

## 默认运行配置和注意事项 \{#operational-defaults-and-considerations\}

以下是 ClickHouse Cloud 服务的默认设置。在某些情况下，这些设置是固定不变的，以确保服务正常运行；在其他情况下，则可以根据需要进行调整。

### 运维限制 \{#operational-limits\}

#### `max_parts_in_total: 10,000` \{#max_parts_in_total-10000\}

MergeTree 表的 `max_parts_in_total` 设置默认值已从 100,000 下调至 10,000。这样调整的原因是我们发现，在 Cloud 中过多的数据分区片段很可能会导致服务启动时间变长。大量分区片段通常意味着分区键划分得过于细粒度，这一般是无意造成的，应当避免。默认值的更改将有助于更早地发现此类情况。

#### `max_concurrent_queries: 1,000` \{#max_concurrent_queries-1000\}

将每台服务器的此设置从默认的 `100` 提高到 `1000`，以支持更高的并发。  
对于所提供的分级服务，这意味着并发查询数为 `副本数量 * 1,000`。  
对于仅限单个副本的 Basic 层服务，并发查询数为 `1000`；对于 Scale 和 Enterprise 层，  
并发查询数为 `1000+`，具体取决于配置的副本数量。

#### `max_table_size_to_drop: 1,000,000,000,000` \{#max_table_size_to_drop-1000000000000\}

将该设置由 50GB 上调，使其允许删除大小最高达 1TB 的表或分区。

### 系统设置 \{#system-settings\}

ClickHouse Cloud 针对可变工作负载进行了优化，因此目前大多数系统设置无法由用户自行配置。我们预计大多数用户无需调整系统设置，但如果您对高级系统调优有任何问题，请联系 ClickHouse Cloud 支持团队。

### 高级安全管理 \{#advanced-security-administration\}

在创建 ClickHouse 服务时，我们会创建一个默认数据库，以及一个对该数据库具有广泛权限的默认用户。该初始用户可以创建其他用户，并为其分配对该数据库的权限。除此之外，目前尚不支持在数据库中通过 Kerberos、LDAP 或 SSL X.509 证书认证来启用下列安全功能。

## 路线图 \{#roadmap\}

我们正在评估在 ClickHouse Cloud 中支持更多功能的需求。如果您有反馈，或希望请求某个特定功能，请[在此提交](https://console.clickhouse.cloud/support)。