---
'slug': '/about-us/distinctive-features'
'sidebar_label': 'ClickHouse的独特之处'
'sidebar_position': 50
'description': '了解ClickHouse与其他数据库管理系统的不同之处'
'title': 'ClickHouse独特特性'
---




# ClickHouse 的独特功能

## 真正的列式数据库管理系统 {#true-column-oriented-database-management-system}

在真正的列式数据库管理系统中，没有额外的数据与值一起存储。这意味着必须支持定长值，以避免在值旁边存储其长度“数字”。例如，十亿个 UInt8 类型的值在未压缩时约需消耗 1 GB，或者这会严重影响 CPU 使用。即使在未压缩时，紧凑存储数据（无任何“垃圾”）也是至关重要的，因为解压速度（CPU 使用）主要取决于未压缩数据的体积。

这与那些能够将不同列的值单独存储的系统形成对比，但由于优化涉及其他场景，因此无法有效处理分析查询，比如 HBase、Bigtable、Cassandra 和 Hypertable。在这些系统中，您可以达到每秒约十万行的吞吐量，而不是每秒数亿行。

最后，ClickHouse 是一个数据库管理系统，而不是单一的数据库。它允许在运行时创建表和数据库，加载数据并运行查询，而无需重新配置和重启服务器。

## 数据压缩 {#data-compression}

一些列式数据库管理系统不使用数据压缩。然而，数据压缩在实现卓越性能方面起着关键作用。

除了高效的通用压缩编解码器（在磁盘空间和 CPU 消耗之间具有不同权衡）外，ClickHouse 还提供了[专用编解码器](/sql-reference/statements/create/table.md#specialized-codecs)来处理特定类型的数据，这使得 ClickHouse 能够竞争并超越一些更专业的数据库，如时间序列数据库。

## 磁盘数据存储 {#disk-storage-of-data}

通过主键物理排序数据，使得基于特定值或值范围提取数据成为可能，延迟低于几十毫秒。一些列式数据库管理系统，例如 SAP HANA 和 Google PowerDrill，只能在内存中工作。这种方法需要比实际需要为实时分析分配更大的硬件预算。

ClickHouse 被设计为可以在常规硬盘上工作，这意味着每 GB 数据存储的成本较低，但如果可用，SSD 和额外的 RAM 也可以充分使用。

## 多核心的并行处理 {#parallel-processing-on-multiple-cores}

大型查询自然会并行化，充分利用当前服务器上可用的所有必要资源。

## 多服务器的分布式处理 {#distributed-processing-on-multiple-servers}

几乎没有上述列式数据库管理系统支持分布式查询处理。

在 ClickHouse 中，数据可以驻留在不同的分片上。每个分片可以是一组用于容错的副本。所有分片在用户不知情的情况下并行执行查询。

## SQL 支持 {#sql-support}

ClickHouse 支持与 ANSI SQL 标准大体兼容的[SQL 语言](/sql-reference/)。

支持的查询包括[GROUP BY](../sql-reference/statements/select/group-by.md)、[ORDER BY](../sql-reference/statements/select/order-by.md)、[FROM](../sql-reference/statements/select/from.md)中的子查询、[JOIN](../sql-reference/statements/select/join.md)子句、[IN](../sql-reference/operators/in.md)操作符、[窗口函数](../sql-reference/window-functions/index.md)和标量子查询。

在撰写本文时，不支持相关（依赖）子查询，但将来可能会推出。

## 向量计算引擎 {#vector-engine}

数据不仅以列的形式存储，而且以向量（列的部分）进行处理，这使得 CPU 效率高。

## 实时数据插入 {#real-time-data-updates}

ClickHouse 支持具有主键的表。为了快速对主键范围执行查询，数据使用合并树增量排序。因此，可以不断地将数据添加到表中。当新数据摄取时，不会进行锁定。

## 主索引 {#primary-index}

通过主键物理排序数据，使得基于特定值或值范围提取数据成为可能，延迟低于几十毫秒。

## 次级索引 {#secondary-indexes}

与其他数据库管理系统不同，ClickHouse 中的次级索引并不指向特定的行或行范围。相反，它们允许数据库提前知道某些数据部分中的所有行都不匹配查询过滤条件，因此根本不读取它们，因此它们被称为[数据跳过索引](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes)。

## 适合在线查询 {#suitable-for-online-queries}

大多数 OLAP 数据库管理系统并不旨在执行亚秒延迟的在线查询。在替代系统中，报告生成时间十几秒甚至几分钟往往被认为是可以接受的。有时甚至需要更长时间，这迫使系统以离线（预先或通过响应“稍后回来”）的方式准备报告。

在 ClickHouse 中，“低延迟”意味着查询可以无延迟地处理，而无需提前准备答案，恰好在用户界面页面加载的同时。换句话说，在线。

## 支持近似计算 {#support-for-approximated-calculations}

ClickHouse 提供多种方法来以性能换取准确性：

1.  用于近似计算不同值数量、中位数和分位数的聚合函数。
2.  基于部分数据（[SAMPLE](../sql-reference/statements/select/sample.md)）运行查询并获得近似结果。在此情况下，从磁盘检索的数据比例较少。
3.  对有限数量的随机键进行聚合，而不是对所有键进行聚合。在数据中键分布的特定条件下，这能够在使用更少资源的同时提供相对准确的结果。

## 自适应连接算法 {#adaptive-join-algorithm}

ClickHouse 采用自适应方式选择如何[JOIN](../sql-reference/statements/select/join.md)多个表，优先使用哈希连接算法，在遇到多个大型表时回退到合并连接算法。

## 数据复制和数据完整性支持 {#data-replication-and-data-integrity-support}

ClickHouse 使用异步多主复制。在写入任何可用副本后，其余副本在后台获取其副本。系统在不同副本之间维持相同的数据。大多数故障后的恢复是自动执行的，或在复杂情况下半自动进行。

有关更多信息，请参见[数据复制](../engines/table-engines/mergetree-family/replication.md)部分。

## 基于角色的访问控制 {#role-based-access-control}

ClickHouse 实现了用户帐户管理，使用 SQL 查询，并允许配置[基于角色的访问控制](/guides/sre/user-management/index.md)，类似于 ANSI SQL 标准和流行关系数据库管理系统中的功能。

## 可视为缺点的功能 {#clickhouse-features-that-can-be-considered-disadvantages}

1.  没有完整的事务支持。
2.  缺乏以高频率和低延迟修改或删除已插入数据的能力。可以进行批量删除和更新，以清理或修改数据，例如遵守[GDPR](https://gdpr-info.eu)。
3.  稀疏索引使 ClickHouse 在通过键检索单行的点查询中效率较低。
