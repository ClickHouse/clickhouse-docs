---
'slug': '/about-us/distinctive-features'
'sidebar_label': '为什么ClickHouse独特？'
'sidebar_position': 50
'description': '了解是什么使ClickHouse与其他数据库管理系统不同'
'title': 'ClickHouse的独特特点'
'keywords':
- 'compression'
- 'secondary-indexes'
- 'column-oriented'
'doc_type': 'guide'
---


# ClickHouse的独特特性

## 真正的列式数据库管理系统 {#true-column-oriented-database-management-system}

在真正的列式数据库管理系统中，值旁边不会存储额外的数据。这意味着必须支持恒定长度的值，以避免将它们的长度“数字”存储在值旁边。例如，十亿个UInt8类型的值在未压缩的情况下应该消耗大约1GB，否则会严重影响CPU使用率。即使在未压缩的情况下，也必须紧凑存储数据（没有任何“垃圾”），因为解压缩的速度（CPU使用率）主要取决于未压缩数据的体积。

这与能够分别存储不同列值的系统形成对比，这些系统由于优化用于其他场景而无法有效处理分析查询，例如HBase、Bigtable、Cassandra和Hypertable。在这些系统中，您可以获得每秒大约十万行的吞吐量，而不是每秒数亿行。

最后，ClickHouse是一个数据库管理系统，而不是单一的数据库。它允许在运行时创建表和数据库、加载数据并运行查询，而无需重新配置和重启服务器。

## 数据压缩 {#data-compression}

一些列式数据库管理系统不使用数据压缩。然而，数据压缩在实现卓越性能方面发挥着关键作用。

除了具有不同磁盘空间与CPU消耗权衡的高效通用压缩编解码器外，ClickHouse还提供[专用编解码器](/sql-reference/statements/create/table.md#specialized-codecs)，以处理特定类型的数据，这使得ClickHouse能够与更小众的数据库（如时间序列数据库）竞争并表现优于它们。

## 数据的磁盘存储 {#disk-storage-of-data}

通过主键物理排序数据，可以基于特定值或值范围以低延迟（少于几十毫秒）提取数据。一些列式数据库管理系统，如SAP HANA和Google PowerDrill，仅能在RAM中工作。这种方法需要分配比实时分析所需的更大硬件预算。

ClickHouse旨在在常规硬盘上工作，这意味着每GB数据存储的成本较低，但如有可用SSD和额外RAM，也会充分利用。

## 多核并行处理 {#parallel-processing-on-multiple-cores}

大查询自然实现并行化，利用当前服务器上所有可用的资源。

## 多服务器分布式处理 {#distributed-processing-on-multiple-servers}

几乎没有上述提到的列式数据库管理系统支持分布式查询处理。

在ClickHouse中，数据可以位于不同的分片上。每个分片可以是用于容错的一组副本。所有分片同时用于并行运行查询，对用户是透明的。

## SQL支持 {#sql-support}

ClickHouse支持基于SQL的[声明性查询语言](/sql-reference/)，它大体上与ANSI SQL标准兼容。

支持的查询包括[GROUP BY](../sql-reference/statements/select/group-by.md)、[ORDER BY](../sql-reference/statements/select/order-by.md)、在[FROM](../sql-reference/statements/select/from.md)中的子查询、[JOIN](../sql-reference/statements/select/join.md)子句、[IN](../sql-reference/operators/in.md)操作符、[窗口函数](../sql-reference/window-functions/index.md)和标量子查询。

在撰写时，不支持相关（相依）子查询，但未来可能会提供。

## 向量计算引擎 {#vector-engine}

数据不仅以列存储，还以向量（列的一部分）进行处理，从而实现高CPU效率。

## 实时数据插入 {#real-time-data-updates}

ClickHouse支持具有主键的表。为了快速在主键范围上执行查询，数据使用合并树进行增量排序。因此，可以不断向表中添加数据。新数据被引入时不会加锁。

## 主索引 {#primary-index}

通过主键物理排序数据，可以基于特定值或值范围以低延迟（少于几十毫秒）提取数据。

## 次级索引 {#secondary-indexes}

与其他数据库管理系统不同，ClickHouse的次级索引并不指向特定的行或行范围。相反，它们允许数据库提前知道某些数据部分中的所有行都不符合查询过滤条件，因此完全不读取它们，因此它们被称为[数据跳过索引](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes)。

## 适合在线查询 {#suitable-for-online-queries}

大多数OLAP数据库管理系统并不追求亚秒延迟的在线查询。在替代系统中，几秒钟甚至几分钟的报告生成时间通常被认为是可以接受的。有时所需的时间甚至更长，这迫使系统提前准备离线报告（或回应“稍后再来”）。

在ClickHouse中，“低延迟”意味着查询可以在没有延迟的情况下处理，而无需试图提前准备答案，正好在用户界面页面加载时——换句话说，*在线*。

## 支持近似计算 {#support-for-approximated-calculations}

ClickHouse提供多种在性能与准确性之间进行权衡的方法：

1.  聚合函数用于近似计算不同值的数量、中位数和分位数。
2.  基于数据的一部分（[SAMPLE](../sql-reference/statements/select/sample.md)）运行查询并获取近似结果。在这种情况下，从磁盘检索的数据量相对较少。
3.  对有限数量的随机键进行聚合，而不是对所有键进行聚合。在数据中键分布的特定条件下，这能提供合理准确的结果，同时使用更少的资源。

## 自适应连接算法 {#adaptive-join-algorithm}

ClickHouse自适应选择如何[JOIN](../sql-reference/statements/select/join.md)多个表，优先使用哈希连接，并在存在多个大表时回退到合并连接。

## 数据复制和数据完整性支持 {#data-replication-and-data-integrity-support}

ClickHouse使用异步多主复制。在写入任何可用副本后，所有剩余的副本在后台检索各自的副本。该系统在不同副本之间保持相同的数据。大多数故障后的恢复是自动进行的，复杂情况下为半自动进行。

有关更多信息，请参阅[数据复制](../engines/table-engines/mergetree-family/replication.md)部分。

## 基于角色的访问控制 {#role-based-access-control}

ClickHouse通过SQL查询实现用户账户管理，并允许进行类似于ANSI SQL标准和流行关系数据库管理系统中可以找到的[基于角色的访问控制配置](/guides/sre/user-management/index.md)。

## 可视为缺点的特性 {#clickhouse-features-that-can-be-considered-disadvantages}

1.  不支持完整的事务。
2.  缺乏以高速和低延迟修改或删除已插入数据的能力。提供批量删除和更新功能以清理或修改数据，例如，遵守[GDPR](https://gdpr-info.eu)。
3.  稀疏索引使得ClickHouse在通过键检索单行的点查询时效率较低。
