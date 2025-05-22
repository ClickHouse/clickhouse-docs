---
'slug': '/about-us/distinctive-features'
'sidebar_label': '为什么ClickHouse独特？'
'sidebar_position': 50
'description': '了解ClickHouse与其他数据库管理系统的不同之处'
'title': 'ClickHouse的独特特征'
---


# ClickHouse 的独特特性

## 真正的列式数据库管理系统 {#true-column-oriented-database-management-system}

在真正的列式数据库管理系统中，值旁边不会存储额外的数据。这意味着必须支持固定长度的值，以避免在值旁边存储其长度的“数字”。例如，十亿个UInt8类型的值应消耗大约1 GB的未压缩存储，否则会严重影响CPU使用率。即使在未压缩的情况下，也必须紧凑地存储数据（没有任何“垃圾”），因为解压缩的速度（CPU使用）主要取决于未压缩数据的体积。

这与能够单独存储不同列值的系统形成对比，但由于这些系统优化用于其他场景，因此无法有效处理分析查询，例如HBase、Bigtable、Cassandra和Hypertable。在这些系统中，你每秒获得的吞吐量大约为十万行，而不是每秒数亿行。

最后，ClickHouse是一个数据库管理系统，而不是单个数据库。它允许在运行时创建表和数据库，加载数据并运行查询，而无需重新配置和重启服务器。

## 数据压缩 {#data-compression}

一些列式数据库管理系统不使用数据压缩。然而，数据压缩在实现卓越性能方面发挥着关键作用。

除了具有效率的通用压缩编解码器，可在磁盘空间和CPU消耗之间进行不同的权衡外，ClickHouse还提供[专业编解码器](/sql-reference/statements/create/table.md#specialized-codecs)以用于特定类型的数据，这使得ClickHouse能够与更多小众数据库（如时间序列数据库）进行竞争并超越它们。

## 数据的磁盘存储 {#disk-storage-of-data}

按照主键物理排序数据可以以低延迟（少于几十毫秒）提取基于特定值或值范围的数据。一些列式数据库管理系统，如SAP HANA和Google PowerDrill，仅能在内存中工作。这种方法需要分配比实时分析所需的更大的硬件预算。

ClickHouse旨在在常规硬盘上工作，这意味着每GB数据存储的成本较低，但如果可用，也会充分利用SSD和额外的RAM。

## 多核并行处理 {#parallel-processing-on-multiple-cores}

大型查询会自然地进行并行处理，利用当前服务器上所有必要的资源。

## 多服务器分布式处理 {#distributed-processing-on-multiple-servers}

几乎没有上述提到的列式数据库管理系统支持分布式查询处理。

在ClickHouse中，数据可以分布在不同的分片上。每个分片可以是用于容错的副本组。所有分片用于并行运行查询，对用户透明。

## SQL支持 {#sql-support}

ClickHouse支持[SQL语言](/sql-reference/)，与ANSI SQL标准大体兼容。

支持的查询包括[GROUP BY](../sql-reference/statements/select/group-by.md)、[ORDER BY](../sql-reference/statements/select/order-by.md)、[FROM](../sql-reference/statements/select/from.md)中的子查询、[JOIN](../sql-reference/statements/select/join.md)子句、[IN](../sql-reference/operators/in.md)运算符、[窗口函数](../sql-reference/window-functions/index.md)和标量子查询。

在撰写本文时，不支持相关（依赖）子查询，但未来可能会可用。

## 向量计算引擎 {#vector-engine}

数据不仅按列存储，还按向量（列的部分）处理，这使得高CPU效率得以实现。

## 实时数据插入 {#real-time-data-updates}

ClickHouse支持带有主键的表。为了快速对主键范围执行查询，数据使用merge tree进行增量排序。因此，可以持续将数据添加到表中。新数据被摄入时不会占用锁。

## 主索引 {#primary-index}

按照主键物理排序的数据可以以低延迟（少于几十毫秒）提取基于特定值或值范围的数据。

## 二级索引 {#secondary-indexes}

与其他数据库管理系统不同，ClickHouse中的二级索引并不指向特定的行或行范围。相反，它们允许数据库提前知道某些数据部分中的所有行都不符合查询过滤条件，从而完全不读取它们，因此称为[数据跳过索引](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes)。

## 适合在线查询 {#suitable-for-online-queries}

大多数OLAP数据库管理系统并不旨在支持亚秒延迟的在线查询。在替代系统中，报告生成时间为数十秒甚至几分钟通常被认为是可以接受的。有时所需时间更长，这迫使系统提前准备离线报告（或通过回应“稍后再来”）。

在ClickHouse中，“低延迟”意味着可以在用户界面页面加载的同时，立即处理查询，而无需尝试提前准备答案。换句话说，就是在线的。

## 支持近似计算 {#support-for-approximated-calculations}

ClickHouse提供多种方式以性能换取准确性：

1.  用于近似计算不同值数量、中位数和分位数的聚合函数。
2.  基于数据部分（[SAMPLE](../sql-reference/statements/select/sample.md)）运行查询并获得近似结果。在这种情况下，从磁盘提取的数据比例较少。
3.  对有限数量的随机键进行聚合，而不是对所有键聚合。在数据中的键分布满足某些条件时，这将在使用更少资源的情况下提供合理准确的结果。

## 自适应连接算法 {#adaptive-join-algorithm}

ClickHouse自适应选择如何[JOIN](../sql-reference/statements/select/join.md)多个表，优先选择哈希连接算法，而在有多个大表时回退到合并连接算法。

## 数据复制和数据完整性支持 {#data-replication-and-data-integrity-support}

ClickHouse使用异步多主复制。在写入任何可用副本后，所有其他副本在后台检索其副本。系统在不同副本上维持相同的数据。在大多数故障后的恢复是自动的，或者在复杂情况下是半自动的。

有关更多信息，请参阅[数据复制](../engines/table-engines/mergetree-family/replication.md)一节。

## 基于角色的访问控制 {#role-based-access-control}

ClickHouse使用SQL查询实现用户账户管理，并允许进行类似于ANSI SQL标准和流行关系数据库管理系统中的[基于角色的访问控制配置](/guides/sre/user-management/index.md)。

## 可以被视为缺点的特性 {#clickhouse-features-that-can-be-considered-disadvantages}

1.  不支持完整的事务。
2.  无法以高速度和低延迟修改或删除已插入的数据。可以进行批量删除和更新，以清理或修改数据，例如，以遵守[GDPR](https://gdpr-info.eu)。
3.  稀疏索引使得ClickHouse在按键检索单行的点查询时效率不高。
