---
'slug': '/about-us/distinctive-features'
'sidebar_label': '为什么ClickHouse独特？'
'sidebar_position': 50
'description': '了解是什么让ClickHouse与其他 DATABASE 管理系统不同。'
'title': 'ClickHouse的独特特征'
'keywords':
- 'compression'
- 'secondary-indexes'
- 'column-oriented'
---


# ClickHouse 的独特特性

## 真正的列式数据库管理系统 {#true-column-oriented-database-management-system}

在真正的列式 DBMS 中，值旁边不会存储额外的数据。这意味着必须支持固定长度的值，以避免将其长度“数字”存储在值旁边。例如，十亿个 UInt8 类型的值在未压缩的情况下应该消耗大约 1 GB 的空间，否则将严重影响 CPU 的使用。即使在未压缩的情况下，紧凑存储数据（不包含任何“垃圾”）至关重要，因为解压速度（CPU 使用）主要取决于未压缩数据的量。

这与能够单独存储不同列值的系统形成对比，但由于针对其他场景的优化，无法有效处理分析查询，例如 HBase、Bigtable、Cassandra 和 Hypertable。在这些系统中，你的吞吐量大约是每秒十万个行，而不是每秒数亿行。

最后，ClickHouse 是一个数据库管理系统，而不是单一数据库。它允许在运行时创建表和数据库，加载数据，并运行查询，而无需重新配置和重启服务器。

## 数据压缩 {#data-compression}

一些列式 DBMS 不使用数据压缩。然而，数据压缩在实现卓越性能方面起着关键作用。

除了高效的通用压缩编码器，具有不同的磁盘空间和 CPU 消耗的权衡外，ClickHouse 还提供了针对特定类型数据的 [专用编码器](/sql-reference/statements/create/table.md#specialized-codecs)，使 ClickHouse 能够与更小众的数据库（例如时间序列数据库）竞争并超越它们。

## 数据的磁盘存储 {#disk-storage-of-data}

通过主键物理排序存储数据使得可以根据特定值或值范围以低延迟提取数据，低于几十毫秒。一些列式 DBMS，如 SAP HANA 和 Google PowerDrill，只能在内存中工作。这种方法需要分配比实时分析所需的更大硬件预算。

ClickHouse 旨在在常规硬盘上工作，这意味着每 GB 数据存储的成本低，但如果有的话，SSD 和额外的 RAM 也会被充分利用。

## 多核心的并行处理 {#parallel-processing-on-multiple-cores}

大型查询自然会并行化，使用当前服务器上可用的所有必要资源。

## 多服务器的分布式处理 {#distributed-processing-on-multiple-servers}

几乎没有上述提到的列式 DBMS 支持分布式查询处理。

在 ClickHouse 中，数据可以位于不同的分片上。每个分片可以是用于容错的一组副本。所有分片都用于并行运行查询，对用户都是透明的。

## SQL 支持 {#sql-support}

ClickHouse 支持与 ANSI SQL 标准大致兼容的 [SQL 语言](/sql-reference/)。

支持的查询包括 [GROUP BY](../sql-reference/statements/select/group-by.md)，[ORDER BY](../sql-reference/statements/select/order-by.md)，[FROM](../sql-reference/statements/select/from.md) 中的子查询，[JOIN](../sql-reference/statements/select/join.md) 子句，[IN](../sql-reference/operators/in.md) 运算符， [窗口函数](../sql-reference/window-functions/index.md) 以及标量子查询。

在撰写本文时，不支持相关（依赖）子查询，但未来可能会提供。

## 向量计算引擎 {#vector-engine}

数据不仅按列存储，还通过向量（列的部分）进行处理，这使得 CPU 效率高。

## 实时数据插入 {#real-time-data-updates}

ClickHouse 支持具有主键的表。为了快速在主键的范围内执行查询，数据使用合并树按增量排序。因此，数据可以不断添加到表中。新数据被摄入时不会加锁。

## 主索引 {#primary-index}

数据物理按主键排序使得可以根据特定值或值范围以低延迟提取数据，低于几十毫秒。

## 次级索引 {#secondary-indexes}

与其他数据库管理系统不同，ClickHouse 的次级索引并不指向特定行或行范围。相反，它们使数据库能够提前知道某些数据部分中的所有行不会匹配查询过滤条件，因此根本不读取它们，因此称为 [数据跳过索引](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes)。

## 适合在线查询 {#suitable-for-online-queries}

大多数 OLAP 数据库管理系统并不致力于寻求具有亚秒延迟的在线查询。在替代系统中，十几秒甚至几分钟的报告生成时间常常被视为可接受的。有时甚至需要更多时间，这迫使系统以离线（提前准备或以“稍后再来”响应）来准备报告。

在 ClickHouse 中，“低延迟”意味着查询可以在没有延迟的情况下处理，而不需要提前准备答案，正是在用户界面页面加载的同一时刻。换句话说，在线的。

## 支持近似计算 {#support-for-approximated-calculations}

ClickHouse 提供多种方式用以权衡准确性与性能：

1.  用于近似计算的聚合函数，计算独特值、均值和分位数的数量。
2.  基于数据部分 ([SAMPLE](../sql-reference/statements/select/sample.md)) 运行查询并获得近似结果。在这种情况下，比例更少的数据从磁盘中检索。
3.  对有限数量的随机键运行聚合，而不是对所有键进行聚合。在数据中键分布的特定条件下，这提供了一个相当准确的结果，同时使用更少的资源。

## 自适应连接算法 {#adaptive-join-algorithm}

ClickHouse 自适应地选择如何 [JOIN](../sql-reference/statements/select/join.md) 多个表，优先使用哈希连接算法，并在存在多个大型表时回退到合并连接算法。

## 数据复制和数据完整性支持 {#data-replication-and-data-integrity-support}

ClickHouse 使用异步多主复制。在写入任何可用副本后，所有剩余副本在后台检索其副本。系统在不同副本之间维护相同的数据。大多数故障后的恢复是自动执行的，在复杂情况下为半自动执行。

有关更多信息，请参见 [数据复制](../engines/table-engines/mergetree-family/replication.md) 一节。

## 基于角色的访问控制 {#role-based-access-control}

ClickHouse 使用 SQL 查询实现用户账户管理，并允许配置与 ANSI SQL 标准和流行关系数据库管理系统中相似的 [基于角色的访问控制](/guides/sre/user-management/index.md)。

## 可视为缺点的特性 {#clickhouse-features-that-can-be-considered-disadvantages}

1.  无完全事务。
2.  缺乏以高速度和低延迟修改或删除已插入数据的能力。可用批量删除和更新来清洁或修改数据，例如，遵守 [GDPR](https://gdpr-info.eu)。
3.  稀疏索引使 ClickHouse 在按键检索单行的点查询中效率不高。
