---
'slug': '/about-us/distinctive-features'
'sidebar_label': '为什么ClickHouse独特?'
'sidebar_position': 50
'description': '了解是什么让ClickHouse在其他数据库管理系统中脱颖而出'
'title': 'ClickHouse的独特特征'
---


# ClickHouse 的独特特性

## 真正的列式数据库管理系统 {#true-column-oriented-database-management-system}

在真正的列式数据库管理系统中，不会与值一起存储额外的数据。这意味着必须支持定长值，以避免将其长度“数字”存储在值旁边。例如，一十亿个 UInt8 类型的值在未压缩的情况下应该消耗约 1 GB，否则这会严重影响 CPU 的使用。即使在未压缩的情况下，紧凑存储数据（没有任何“垃圾”）也是至关重要的，因为解压速度（CPU 使用）主要取决于未压缩数据的量。

这与可以分别存储不同列值但由于针对其他场景的优化而无法有效处理分析查询的系统形成对比，比如 HBase、Bigtable、Cassandra 和 Hypertable。在这些系统中，你的吞吐量大约为每秒十万行，而不是每秒数亿行。

最后，ClickHouse 是一种数据库管理系统，而不是单一数据库。它允许在运行时创建表和数据库，加载数据，并运行查询，而无需重新配置和重启服务器。

## 数据压缩 {#data-compression}

一些列式数据库管理系统不使用数据压缩。然而，数据压缩在实现优异性能方面发挥着关键作用。

除了在磁盘空间和 CPU 消耗之间有不同权衡的高效通用压缩编解码器外，ClickHouse 还提供 [专用编解码器](/sql-reference/statements/create/table.md#specialized-codecs)，以针对特定类型的数据，使 ClickHouse 能够与更小众的数据库竞争并超越它们，如时间序列数据库。

## 数据的磁盘存储 {#disk-storage-of-data}

通过主键对数据进行物理排序，使得基于特定值或值范围快速提取数据成为可能，延迟低于几十毫秒。一些列式数据库管理系统，如 SAP HANA 和 Google PowerDrill，仅能在 RAM 中工作。这种方法需要分配比必要的硬件预算更大的开支以进行实时分析。

ClickHouse 旨在在常规硬盘上工作，这意味着每 GB 数据存储的成本较低，但如果可用也可以充分利用 SSD 和额外的 RAM。

## 多核上的并行处理 {#parallel-processing-on-multiple-cores}

大型查询会自然地并行化，利用当前服务器上所有可用的资源。

## 多服务器上的分布式处理 {#distributed-processing-on-multiple-servers}

几乎以上提到的所有列式数据库管理系统都不支持分布式查询处理。

在 ClickHouse 中，数据可以驻留在不同的分片上。每个分片可以是一组用于容错的副本。所有分片用于并行运行查询，对用户透明。

## SQL 支持 {#sql-support}

ClickHouse 支持与 ANSI SQL 标准大部分兼容的 [SQL 语言](/sql-reference/)。

支持的查询包括 [GROUP BY](../sql-reference/statements/select/group-by.md)、[ORDER BY](../sql-reference/statements/select/order-by.md)、在 [FROM](../sql-reference/statements/select/from.md) 中的子查询、[JOIN](../sql-reference/statements/select/join.md) 子句、[IN](../sql-reference/operators/in.md) 操作符、[窗口函数](../sql-reference/window-functions/index.md) 和标量子查询。

在撰写本文时，不支持相关（依赖）子查询，但将来可能会提供。

## 向量计算引擎 {#vector-engine}

数据不仅按列存储，还通过向量（列的部分）处理，这使得能够实现高 CPU 效率。

## 实时数据插入 {#real-time-data-updates}

ClickHouse 支持带有主键的表。为了快速执行主键范围内的查询，数据使用合并树进行增量排序。因此，可以不断向表中添加数据。在摄取新数据时不会采取任何锁。

## 主索引 {#primary-index}

通过主键对数据进行物理排序使得基于特定值或值范围快速提取数据成为可能，延迟低于几十毫秒。

## 次级索引 {#secondary-indexes}

与其他数据库管理系统不同，ClickHouse 中的次级索引不会指向特定的行或行范围。相反，它们允许数据库提前知道某些数据部分中的所有行都不会匹配查询过滤条件，因此完全不读取它们，因此它们被称为 [数据跳过索引](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes)。

## 适合在线查询 {#suitable-for-online-queries}

大多数 OLAP 数据库管理系统并不以在线查询为目标，通常延迟在秒级的查询算作可接受。在替代系统中，报告生成时间达到十秒甚至几分钟常常被视为可接受。有时甚至需要更长时间，这迫使系统提前准备报告（或者通过回复“稍后再来”来响应）。

在 ClickHouse 中，“低延迟”意味着查询可以无延迟地处理，而不必试图提前准备答案，正是在用户界面页面加载的同时换句话说，是在线的。

## 支持近似计算 {#support-for-approximated-calculations}

ClickHouse 提供多种方式以牺牲准确性换取性能：

1.  用于近似计算唯一值数量、中位数和分位数的聚合函数。
2.  基于部分数据（[SAMPLE](../sql-reference/statements/select/sample.md)）运行查询并得到近似结果。在这种情况下，从磁盘检索的数据相对较少。
3.  针对有限数量随机键进行聚合，而不是所有键。在数据的键分布满足特定条件时，这能在使用更少的资源的同时提供合理准确的结果。

## 自适应连接算法 {#adaptive-join-algorithm}

ClickHouse 自适应选择如何 [JOIN](../sql-reference/statements/select/join.md) 多个表，优先使用哈希连接算法，而在大型表数量超过一个时退回到合并连接算法。

## 数据复制和数据完整性支持 {#data-replication-and-data-integrity-support}

ClickHouse 使用异步多主复制。在写入任何可用副本后，所有剩余副本会在后台获取它们的副本。系统在不同副本上维护相同的数据。在大多数故障后的恢复是自动进行的，复杂的情况下则为半自动。

有关更多信息，请参阅 [数据复制](../engines/table-engines/mergetree-family/replication.md) 部分。

## 基于角色的访问控制 {#role-based-access-control}

ClickHouse 使用 SQL 查询实现用户账户管理，并允许进行 [基于角色的访问控制配置](/guides/sre/user-management/index.md)，这与 ANSI SQL 标准和流行的关系数据库管理系统中的配置相似。

## 可以视为缺点的特性 {#clickhouse-features-that-can-be-considered-disadvantages}

1.  没有完整的事务。
2.  缺乏以高频率和低延迟修改或删除已插入数据的能力。可以通过批量删除和更新来清理或修改数据，例如，以遵守 [GDPR](https://gdpr-info.eu)。
3.  稀疏索引使 ClickHouse 在通过键检索单行的点查询时效率不高。
