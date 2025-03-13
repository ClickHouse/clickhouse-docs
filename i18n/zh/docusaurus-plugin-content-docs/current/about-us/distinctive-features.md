---
slug: /about-us/distinctive-features
sidebar_label: 为什么 ClickHouse 独特？
sidebar_position: 50
description: 了解使 ClickHouse 在其他数据库管理系统中脱颖而出的原因
---


# ClickHouse 的独特特性

## 真正的列式数据库管理系统 {#true-column-oriented-database-management-system}

在真正的列式数据库管理系统中，不会与值一起存储额外的数据。这意味着必须支持定长值，以避免在值旁边存储它们的长度“数字”。例如，一个十亿个 UInt8 类型的值在未压缩的情况下应消耗约 1 GB，否则这将严重影响 CPU 使用率。即使在未压缩的情况下，紧凑地存储数据（没有任何“垃圾”）也是至关重要的，因为解压缩速度（CPU 使用）主要依赖于未压缩数据的体积。

这与能够单独存储不同列值的系统形成对比，但这些系统由于其对其他场景的优化，无法有效处理分析查询，例如 HBase、Bigtable、Cassandra 和 Hypertable。在这些系统中，您可以获得每秒大约一十万行的吞吐量，但无法达到每秒数亿行。

最后，ClickHouse 是一个数据库管理系统，而不是单一的数据库。它允许在运行时创建表和数据库，加载数据，并运行查询，而无需重新配置和重启服务器。

## 数据压缩 {#data-compression}

一些列式数据库管理系统不使用数据压缩。然而，数据压缩在实现出色性能方面起着关键作用。

除了提供不同磁盘空间和 CPU 消耗之间权衡的高效通用压缩编解码器外，ClickHouse 还提供 [专用编解码器](/sql-reference/statements/create/table.md#specialized-codecs) 来处理特定类型的数据，这使得 ClickHouse 能够与更小众的数据库（如时间序列数据库）竞争并超越它们。

## 数据的磁盘存储 {#disk-storage-of-data}

物理上按主键排序的数据使得基于特定值或值范围以低延迟提取数据成为可能，延迟少于几十毫秒。一些列式数据库管理系统，比如 SAP HANA 和 Google PowerDrill，只能在 RAM 中工作。这种方法需要比实际需求更大的硬件预算来进行实时分析。

ClickHouse 设计为可以在普通硬盘上工作，这意味着每 GB 数据存储的成本较低，但如果有可用的 SSD 和额外的 RAM 也会被充分利用。

## 多核的并行处理 {#parallel-processing-on-multiple-cores}

大型查询能够自然而然地并行化，利用当前服务器上可用的所有必要资源。

## 多服务器的分布式处理 {#distributed-processing-on-multiple-servers}

上面提到的几乎所有列式数据库管理系统都不支持分布式查询处理。

在 ClickHouse 中，数据可以位于不同的分片上。每个分片都可以是一个用于容错的副本组。所有分片被用来并行运行查询，对用户而言是透明的。

## SQL 支持 {#sql-support}

ClickHouse 支持与 ANSI SQL 标准大致兼容的 [SQL 语言](/sql-reference/)。

支持的查询包括 [GROUP BY](../sql-reference/statements/select/group-by.md)、[ORDER BY](../sql-reference/statements/select/order-by.md)、[FROM](../sql-reference/statements/select/from.md) 子查询、[JOIN](../sql-reference/statements/select/join.md) 子句、[IN](../sql-reference/operators/in.md) 操作符、[窗口函数](../sql-reference/window-functions/index.md) 和标量子查询。

在撰写本文时，不支持相关（依赖）子查询，但未来可能会提供。

## 向量计算引擎 {#vector-engine}

数据不仅以列的形式存储，而且通过向量（列的部分）进行处理，这允许实现高 CPU 效率。

## 实时数据插入 {#real-time-data-updates}

ClickHouse 支持具有主键的表。为了快速对主键范围进行查询，数据使用合并树增量排序。因此，可以持续地向表中添加数据。在新数据被摄取时不会产生锁定。

## 主索引 {#primary-index}

物理上按主键排序的数据使得基于特定值或值范围以低延迟提取数据成为可能，延迟少于几十毫秒。

## 次索引 {#secondary-indexes}

与其他数据库管理系统不同，ClickHouse 中的次索引不指向特定行或行范围。相反，它们使数据库能够提前知道某些数据部分中的所有行都不会满足查询过滤条件，因此根本不读取它们，因此称为 [数据跳过索引](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes)。

## 适合在线查询 {#suitable-for-online-queries}

大多数 OLAP 数据库管理系统并不旨在进行具有亚秒延迟的在线查询。在替代系统中，报告生成时间达到十几秒甚至几分钟通常被认为是可以接受的。有时甚至需要更长时间，这迫使系统在离线（提前准备或回应“稍后回来”）的情况下准备报告。

在 ClickHouse 中，“低延迟”意味着查询可以在没有延迟的情况下处理，而不尝试提前准备答案，而是在用户界面页面加载的同时进行换句话说，就是在线。

## 对近似计算的支持 {#support-for-approximated-calculations}

ClickHouse 提供多种方式来在性能与准确性之间进行权衡：

1.  用于近似计算不同值数量、中位数和分位数的聚合函数。
2.  在数据的一部分（[SAMPLE](../sql-reference/statements/select/sample.md)）上运行查询并获得近似结果。在这种情况下，从磁盘检索的数据比例较少。
3.  对有限数量的随机键进行聚合，而不是对所有键进行聚合。在数据的键分布满足特定条件的情况下，这在使用更少资源的同时提供相对准确的结果。

## 自适应连接算法 {#adaptive-join-algorithm}

ClickHouse 自适应地选择如何 [JOIN](../sql-reference/statements/select/join.md) 多个表，优先采用哈希连接算法，如果有多个大型表则回退到合并连接算法。

## 数据复制和数据完整性支持 {#data-replication-and-data-integrity-support}

ClickHouse 使用异步多主复制。在写入任何可用副本后，所有剩余副本在后台检索其副本。系统在不同副本之间维护相同的数据。在大多数故障后，恢复是自动或在复杂情况下半自动的。

有关更多信息，请参阅 [数据复制](../engines/table-engines/mergetree-family/replication.md) 部分。

## 基于角色的访问控制 {#role-based-access-control}

ClickHouse 实现了使用 SQL 查询的用户账户管理，并允许进行类似于 ANSI SQL 标准和流行关系数据库管理系统的 [基于角色的访问控制配置](/guides/sre/user-management/index.md)。

## 可视为缺点的特性 {#clickhouse-features-that-can-be-considered-disadvantages}

1.  无完全的事务支持。
2.  缺乏以高频率和低延迟修改或删除已插入数据的能力。可以进行批量删除和更新，以清理或修改数据，例如，遵循 [GDPR](https://gdpr-info.eu)。
3.  稀疏索引使得 ClickHouse 在通过其键检索单行的点查询时效率不高。
