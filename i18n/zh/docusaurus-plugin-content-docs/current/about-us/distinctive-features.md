---
slug: /about-us/distinctive-features
sidebar_label: '为什么 ClickHouse 与众不同？'
sidebar_position: 50
description: '了解 ClickHouse 相较于其他数据库管理系统的独特之处'
title: 'ClickHouse 的独特特性'
keywords: ['压缩', '二级索引','列式']
doc_type: 'guide'
---

# ClickHouse 的独特特性 {#distinctive-features-of-clickhouse}

## 真正的列式数据库管理系统 {#true-column-oriented-database-management-system}

在真正的列式 DBMS 中，值本身不会附带存储任何额外数据。这意味着必须支持定长值，以避免在值旁边额外存储一个表示其长度的“数值”。例如，十亿个 `UInt8` 类型的值在未压缩时应大约只占用 1 GB，否则会对 CPU 的使用造成明显影响。即使在未压缩的情况下，也必须以紧凑的方式存储数据（没有任何“垃圾”），因为解压缩速度（CPU 占用）主要取决于未压缩数据的体积。

这与某些系统形成对比，这些系统虽然可以将不同列的值分开存储，但由于针对其他场景进行了优化，无法高效处理分析型查询，例如 HBase、Bigtable、Cassandra 和 Hypertable。在这些系统中，你大约只能获得每秒十万行量级的吞吐量，而不是每秒数亿行。

最后，ClickHouse 是一个数据库管理系统，而不是单一的数据库。它允许在运行时创建表和数据库、加载数据以及执行查询，而无需重新配置和重启服务器。

## 数据压缩 {#data-compression}

有些列式 DBMS 不使用数据压缩。然而，数据压缩在实现卓越性能方面起着关键作用。

除了在磁盘空间与 CPU 消耗之间具有不同权衡的高效通用压缩编解码器之外，ClickHouse 还为特定类型的数据提供了[专用编解码器](/sql-reference/statements/create/table.md#specialized-codecs)，使 ClickHouse 不仅能够与更小众的数据库（例如时序数据库）竞争，还能在性能上超越它们。

## 数据的磁盘存储 {#disk-storage-of-data}

按主键对数据进行物理排序，可以在几十毫秒内以极低延迟按特定值或值范围提取数据。一些列式 DBMS，例如 SAP HANA 和 Google PowerDrill，只能依赖内存运行。这种方式需要投入远高于实时分析实际需求的硬件预算。

ClickHouse 被设计为能够在普通硬盘上工作，这意味着每 GB 数据存储成本较低，但如果有 SSD 和额外内存，也会被充分利用。

## 在多核上进行并行处理 {#parallel-processing-on-multiple-cores}

大型查询会自动并行执行，充分利用当前服务器上所有可用资源。

## 在多台服务器上的分布式处理 {#distributed-processing-on-multiple-servers}

上文提到的列式 DBMS 几乎都不支持分布式查询处理。

在 ClickHouse 中，数据可以分布在不同的分片上。每个分片可以由一组用于容错的副本组成。所有分片都会参与并行执行查询，对用户而言是透明的。

## SQL 支持 {#sql-support}

ClickHouse 支持一种基于 SQL 的 [声明式查询语言](/sql-reference/)，该语言在很大程度上兼容 ANSI SQL 标准。

支持的查询包括 [GROUP BY](../sql-reference/statements/select/group-by.md)、[ORDER BY](../sql-reference/statements/select/order-by.md)、[FROM](../sql-reference/statements/select/from.md) 中的子查询、[JOIN](../sql-reference/statements/select/join.md) 子句、[IN](../sql-reference/operators/in.md) 运算符、[窗口函数](../sql-reference/window-functions/index.md) 以及标量子查询。

在撰写本文时，尚不支持关联（依赖）子查询，但未来可能会提供支持。

## 向量计算引擎 {#vector-engine}

数据不仅按列存储，还以向量（列的一部分）为单位进行处理，从而实现很高的 CPU 利用效率。

## 实时数据插入 {#real-time-data-updates}

ClickHouse 支持带有主键的表。为了能够快速在主键范围内执行查询，数据会通过 MergeTree 以增量方式排序。得益于这种机制，数据可以持续不断地写入到表中。在摄取新数据时不会对表加锁。

## 主键索引 {#primary-index}

将数据按主键进行物理排序，可以以低至几十毫秒的延迟，根据特定值或取值范围提取数据。

## 二级索引 {#secondary-indexes}

与其他数据库管理系统不同，ClickHouse 中的二级索引并不指向特定的行或行范围。相反，它们使数据库能够预先判断某些数据部分中的所有行都不满足查询过滤条件，从而完全不读取这些数据部分，因此它们被称为[数据跳过索引（data skipping indexes）](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes)。

## 适用于在线查询 {#suitable-for-online-queries}

大多数 OLAP 数据库管理系统并不以支持延迟低于一秒的在线查询为目标。在其他系统中，生成报表耗时几十秒甚至几分钟通常被认为是可以接受的。有时耗时甚至更长，从而迫使系统改为离线生成报表（预先生成，或者通过返回“稍后再来”来延后处理）。

在 ClickHouse 中，“低延迟”意味着查询可以在没有额外等待时间、也无需尝试提前准备结果的情况下完成处理，恰好在用户界面页面加载的那一刻返回结果——换句话说，就是 *在线*。

## 对近似计算的支持 {#support-for-approximated-calculations}

ClickHouse 提供多种在准确性和性能之间进行权衡的方式：

1.  用于近似计算不同取值数量、中位数和分位数的聚合函数。
2.  基于部分数据（[SAMPLE](../sql-reference/statements/select/sample.md)）运行查询并获取近似结果。在这种情况下，从磁盘读取的数据量会按比例减少。
3.  仅对有限数量的随机键执行聚合，而不是对所有键执行聚合。在数据中键的分布满足特定条件的情况下，这种方式在使用更少资源的前提下，仍可提供足够精确的结果。

## 自适应 JOIN 算法 {#adaptive-join-algorithm}

ClickHouse 会自适应地选择多表 [JOIN](../sql-reference/statements/select/join.md) 的方式：优先使用哈希 JOIN，当存在多个大表时则退回为合并 JOIN。

## 数据复制与数据完整性支持 {#data-replication-and-data-integrity-support}

ClickHouse 使用异步多主复制。数据写入任一可用副本后，其余所有副本都会在后台拉取该数据的副本。系统会在不同副本上维护一致的数据。在大多数故障情况下可以自动恢复，在复杂场景下则可以通过半自动方式完成恢复。

有关更多信息，请参阅[数据复制](../engines/table-engines/mergetree-family/replication.md)一节。

## 基于角色的访问控制 {#role-based-access-control}

ClickHouse 通过 SQL 查询实现用户账号管理，并支持 [基于角色的访问控制配置](/guides/sre/user-management/index.md)，其工作方式类似于 ANSI SQL 标准以及常见关系型数据库管理系统中的实现。

## 可能被视为缺点的特性 {#clickhouse-features-that-can-be-considered-disadvantages}

1.  不支持完整的事务。
2.  无法以高吞吐、低延迟的方式修改或删除已插入的数据。可以通过批量删除和更新来清理或修改数据，例如用于遵守 [GDPR](https://gdpr-info.eu) 要求。
3.  稀疏索引使得 ClickHouse 在通过键检索单行记录的点查询场景下效率不够高。
