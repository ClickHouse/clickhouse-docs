---
slug: /about-us/distinctive-features
sidebar_label: '为什么 ClickHouse 与众不同？'
sidebar_position: 50
description: '了解 ClickHouse 与其他数据库管理系统相比的独特之处'
title: 'ClickHouse 的独特特性'
keywords: ['compression', 'secondary-indexes','column-oriented']
doc_type: 'guide'
---



# ClickHouse 的显著特性



## 真正的列式数据库管理系统 {#true-column-oriented-database-management-system}

在真正的列式数据库管理系统中,值本身不会附带存储额外数据。这意味着必须支持定长值,以避免在值旁边存储表示其长度的"数字"。例如,十亿个 UInt8 类型的值在未压缩状态下应该占用约 1 GB 空间,否则会严重影响 CPU 使用效率。即使在未压缩状态下,紧凑地存储数据(不含任何"冗余信息")也至关重要,因为解压缩速度(CPU 使用率)主要取决于未压缩数据的体积。

这与某些系统形成对比,这些系统虽然可以分别存储不同列的值,但由于针对其他场景进行了优化而无法有效处理分析查询,例如 HBase、BigTable、Cassandra 和 HyperTable。在这些系统中,吞吐量约为每秒数十万行,而非每秒数亿行。

最后,ClickHouse 是一个数据库管理系统,而不是单一数据库。它允许在运行时创建表和数据库、加载数据以及运行查询,无需重新配置和重启服务器。


## 数据压缩 {#data-compression}

某些列式数据库管理系统不使用数据压缩。然而,数据压缩在实现卓越性能方面发挥着关键作用。

除了提供在磁盘空间和 CPU 消耗之间进行不同权衡的高效通用压缩编解码器外,ClickHouse 还针对特定类型的数据提供了[专用编解码器](/sql-reference/statements/create/table.md#specialized-codecs),使 ClickHouse 能够与时序数据库等更专业的数据库竞争并超越它们。


## 数据的磁盘存储 {#disk-storage-of-data}

通过主键对数据进行物理排序,可以在几十毫秒内以低延迟提取基于特定值或值范围的数据。一些列式数据库管理系统,如 SAP HANA 和 Google PowerDrill,只能在内存中运行。这种方法需要分配比实时分析实际所需更大的硬件预算。

ClickHouse 设计为可在普通硬盘上运行,这意味着每 GB 数据存储成本较低,同时如果有 SSD 和额外内存可用,也会被充分利用。


## 多核并行处理 {#parallel-processing-on-multiple-cores}

大型查询会自动并行化处理,充分利用当前服务器上的所有可用资源。


## 多服务器分布式处理 {#distributed-processing-on-multiple-servers}

上述提到的列式数据库管理系统几乎都不支持分布式查询处理。

在 ClickHouse 中,数据可以存储在不同的分片上。每个分片可以是一组用于容错的副本。查询会在所有分片上并行执行,这一过程对用户是透明的。


## SQL 支持 {#sql-support}

ClickHouse 支持基于 SQL 的[声明式查询语言](/sql-reference/),与 ANSI SQL 标准高度兼容。

支持的查询包括 [GROUP BY](../sql-reference/statements/select/group-by.md)、[ORDER BY](../sql-reference/statements/select/order-by.md)、[FROM](../sql-reference/statements/select/from.md) 中的子查询、[JOIN](../sql-reference/statements/select/join.md) 子句、[IN](../sql-reference/operators/in.md) 运算符、[窗口函数](../sql-reference/window-functions/index.md)以及标量子查询。

目前暂不支持关联(依赖)子查询,但未来可能会提供支持。


## 向量计算引擎 {#vector-engine}

数据不仅按列存储,还按向量(列的部分)进行处理,这使得 CPU 能够高效运行。


## 实时数据插入 {#real-time-data-updates}

ClickHouse 支持带有主键的表。为了快速执行基于主键范围的查询,数据通过合并树进行增量排序。因此,数据可以持续不断地添加到表中。在写入新数据时不会加锁。


## 主索引 {#primary-index}

通过主键对数据进行物理排序，使得基于特定值或值范围提取数据成为可能,延迟低至几十毫秒以内。


## 二级索引 {#secondary-indexes}

与其他数据库管理系统不同,ClickHouse 中的二级索引不指向特定的行或行范围。相反,它们使数据库能够提前判断某些数据部分中的所有行都不满足查询过滤条件,从而完全跳过对这些数据的读取,因此被称为[数据跳过索引](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes)。


## 适用于在线查询 {#suitable-for-online-queries}

大多数 OLAP 数据库管理系统并不追求亚秒级延迟的在线查询能力。在其他系统中,数十秒甚至数分钟的报表生成时间通常被认为是可以接受的。有时甚至需要更长时间,这迫使系统采用离线方式准备报表(提前生成或回复"请稍后再来")。

在 ClickHouse 中,"低延迟"意味着查询可以在用户界面页面加载的同时即时处理,无需延迟,也无需提前准备答案——换句话说,就是_在线_处理。


## 近似计算支持 {#support-for-approximated-calculations}

ClickHouse 提供了多种以准确性换取性能的方法:

1.  用于近似计算唯一值数量、中位数和分位数的聚合函数。
2.  基于部分数据([SAMPLE](../sql-reference/statements/select/sample.md))运行查询并获得近似结果。在这种情况下,从磁盘读取的数据量会按比例减少。
3.  对有限数量的随机键运行聚合,而不是对所有键进行聚合。在数据中键分布满足特定条件的情况下,这种方法可以在使用更少资源的同时提供足够准确的结果。


## 自适应连接算法 {#adaptive-join-algorithm}

ClickHouse 会自适应地选择如何[连接](../sql-reference/statements/select/join.md)多个表，优先使用哈希连接，当存在多个大表时则回退到归并连接。


## 数据复制和数据完整性支持 {#data-replication-and-data-integrity-support}

ClickHouse 使用异步多主复制。数据写入任何可用副本后,所有其他副本会在后台获取其数据副本。系统在不同副本上维护相同的数据。大多数故障后的恢复会自动执行,在复杂情况下则半自动执行。

有关更多信息,请参阅[数据复制](../engines/table-engines/mergetree-family/replication.md)部分。


## 基于角色的访问控制 {#role-based-access-control}

ClickHouse 通过 SQL 查询实现用户账户管理,并支持[基于角色的访问控制配置](/guides/sre/user-management/index.md),与 ANSI SQL 标准和主流关系型数据库管理系统中的实现类似。


## 可被视为缺点的特性 {#clickhouse-features-that-can-be-considered-disadvantages}

1.  不支持完整的事务功能。
2.  无法以高吞吐量和低延迟的方式修改或删除已插入的数据。不过可以使用批量删除和更新操作来清理或修改数据,例如用于满足 [GDPR](https://gdpr-info.eu) 合规要求。
3.  稀疏索引使得 ClickHouse 在通过键值检索单行数据的点查询场景中效率较低。
