---
slug: /intro
sidebar_label: '什么是 ClickHouse？'
description: 'ClickHouse® 是一款列式 SQL 数据库管理系统（DBMS），用于联机分析处理（OLAP）。它既提供开源软件版本，也提供云服务。'
title: '什么是 ClickHouse？'
keywords: ['ClickHouse', '列式数据库', 'OLAP 数据库', '分析型数据库', '高性能数据库']
doc_type: 'guide'
---

import column_example from '@site/static/images/column-oriented-example-query.png';
import row_orientated from '@site/static/images/row-oriented.gif';
import column_orientated from '@site/static/images/column-oriented.gif';
import Image from '@theme/IdealImage';

ClickHouse® 是一款高性能的列式存储 SQL 数据库管理系统（DBMS），用于联机分析处理（OLAP）。它既可以作为[开源软件](https://github.com/ClickHouse/ClickHouse)，也可以作为[云服务](https://clickhouse.com/cloud)提供。


## 什么是分析？ {#what-are-analytics}

Analytics（也称为 OLAP，即联机分析处理，Online Analytical Processing）是指在海量数据集上执行包含复杂计算（例如聚合、字符串处理、算术运算）的 SQL 查询。

与事务型查询（或 OLTP，Online Transaction Processing，即联机事务处理）不同，后者每个查询只读写少量行，因此可在毫秒级完成，而分析型查询通常需要处理数十亿乃至数万亿行数据。

在许多应用场景中，[分析查询必须是“实时”的](https://clickhouse.com/engineering-resources/what-is-real-time-analytics)，即在不到一秒内返回结果。



## 行式存储 vs 列式存储

只有采用合适的数据组织方式，才能达到这样的性能水平。

数据库中的数据要么采用[行式存储，要么采用列式存储](https://clickhouse.com/engineering-resources/what-is-columnar-database)。

在行式数据库中，连续的表行会一个接一个按顺序存储。这种布局可以快速检索整行数据，因为每一行的各个列值是存放在一起的。

ClickHouse 是一款列式数据库。在这类系统中，表是按列的集合来存储的，即每一列的值一个接一个按顺序存放。这种布局会让还原单行记录变得更困难（因为现在同一行的各个值之间存在间隔），但列级操作（例如过滤或聚合）会比在行式数据库中快得多。

下面通过一个在 1 亿行[真实世界的匿名 Web 分析数据](/getting-started/example-datasets/metrica)上运行的示例查询来最直观地说明这一差异：

```sql
SELECT MobilePhoneModel, COUNT() AS c
FROM metrica.hits
WHERE
      RegionID = 229
  AND EventDate >= '2013-07-01'
  AND EventDate <= '2013-07-31'
  AND MobilePhone != 0
  AND MobilePhoneModel not in ['', 'iPad']
GROUP BY MobilePhoneModel
ORDER BY c DESC
LIMIT 8;
```

你可以在 [ClickHouse SQL Playground 上运行此查询](https://sql.clickhouse.com?query=U0VMRUNUIE1vYmlsZVBob25lTW9kZWwsIENPVU5UKCkgQVMgYyAKRlJPTSBtZXRyaWNhLmhpdHMgCldIRVJFIAogICAgICBSZWdpb25JRCA9IDIyOSAKICBBTkQgRXZlbnREYXRlID49ICcyMDEzLTA3LTAxJyAKICBBTkQgRXZlbnREYXRlIDw9ICcyMDEzLTA3LTMxJyAKICBBTkQgTW9iaWxlUGhvbmUgIT0gMCAKICBBTkQgTW9iaWxlUGhvbmVNb2RlbCBub3QgaW4gWycnLCAnaVBhZCddIApHUk9VUCBCWSBNb2JpbGVQaG9uZU1vZGVsCk9SREVSIEJZIGMgREVTQyAKTElNSVQgODs\&chart=eyJ0eXBlIjoicGllIiwiY29uZmlnIjp7InhheGlzIjoiTW9iaWxlUGhvbmVNb2RlbCIsInlheGlzIjoiYyJ9fQ\&run_query=true)，该查询从超过 100 个[现有列中只选择并过滤其中少数几列](https://sql.clickhouse.com/?query=U0VMRUNUIG5hbWUKRlJPTSBzeXN0ZW0uY29sdW1ucwpXSEVSRSBkYXRhYmFzZSA9ICdtZXRyaWNhJyBBTkQgdGFibGUgPSAnaGl0cyc7\&tab=results\&run_query=true)，并在毫秒级内返回结果：

<Image img={column_example} alt="列式数据库中的示例查询" size="lg" />

如上图的统计信息部分所示，该查询在 92 毫秒内处理了 1 亿行数据，吞吐量大约为每秒超过 10 亿行，或每秒接近 7 GB 的数据传输量。

**行式 DBMS**

在行式数据库中，即使上面的查询只处理现有列中的一小部分，系统仍然需要将其他现有列的数据从磁盘加载到内存中。原因在于，数据在磁盘上是以称为[块](https://en.wikipedia.org/wiki/Block_\(data_storage\))的片段进行存储（通常为固定大小，例如 4 KB 或 8 KB）。块是从磁盘读取到内存的数据的最小单位。当应用程序或数据库请求数据时，操作系统的磁盘 I/O 子系统会从磁盘读取所需的块。即使只需要块的一部分，整个块也会被读入内存（这是由磁盘和文件系统的设计决定的）：

<Image img={row_orientated} alt="行式数据库结构" size="lg" />

**列式 DBMS**


由于每一列的值在磁盘上依次顺序存储，执行上面的查询时不会加载不必要的数据。
由于按数据块进行存储并从磁盘传输到内存的方式与分析型查询的数据访问模式相匹配，查询只会从磁盘读取所需的列，从而避免为未使用的数据执行不必要的 I/O 操作。相比之下，在[基于行的存储](https://benchmark.clickhouse.com/)中，会读取整行数据（包括无关的列），效率要低得多：

<Image img={column_orientated} alt="列式数据库结构" size="lg"/>



## 数据复制与完整性 {#data-replication-and-integrity}

ClickHouse 使用异步多主复制架构，确保数据在多个节点上冗余存储。数据写入任一可用副本后，其余所有副本会在后台获取各自的副本数据。系统会在不同副本上维护完全一致的数据。在大多数故障情况下，系统能够自动完成恢复；在复杂场景下，则采用半自动方式完成恢复。



## 基于角色的访问控制 {#role-based-access-control}

ClickHouse 通过 SQL 查询实现用户账号管理，并支持配置基于角色的访问控制，方式类似于 ANSI SQL 标准和主流关系型数据库管理系统中的实现。



## SQL 支持 {#sql-support}

ClickHouse 支持一种[基于 SQL 的声明式查询语言](/sql-reference)，在很多方面与 ANSI SQL 标准保持一致。支持的查询子句包括 [GROUP BY](/sql-reference/statements/select/group-by)、[ORDER BY](/sql-reference/statements/select/order-by)、[FROM](/sql-reference/statements/select/from) 中的子查询、[JOIN](/sql-reference/statements/select/join) 子句、[IN](/sql-reference/operators/in) 运算符、[窗口函数](/sql-reference/window-functions) 以及标量子查询。



## 近似计算 {#approximate-calculation}

ClickHouse 提供了一些以精度换取性能的方式。例如，其中一些聚合函数可以近似计算不同值的数量、中位数和分位数。此外，可以在数据的一个样本上执行查询，从而快速得到近似结果。最后，可以只在有限数量的键上执行聚合，而不是对所有键进行聚合。根据键分布偏斜程度的不同，这种方式在显著减少相较于精确计算所需资源的同时，仍然可以提供相当精确的结果。



## 自适应 Join 算法 {#adaptive-join-algorithms}

ClickHouse 会自适应地选择 join 算法：它首先使用快速的哈希 join，当存在多张大表时，会回退为合并 join。



## 卓越的查询性能 {#superior-query-performance}

ClickHouse 以其极快的查询性能而闻名。
要了解 ClickHouse 为何如此之快，请参阅 [Why is ClickHouse fast?](/concepts/why-clickhouse-is-so-fast.mdx) 指南。



<!--
## 什么是 OLAP？ {#what-is-olap}
OLAP 场景需要在大规模数据集上对复杂的分析查询提供实时响应，具有以下特征：
- 数据集规模可能极其庞大——数十亿甚至数万亿行
- 数据以包含众多列的表格形式组织
- 任何特定查询仅需选择少数几列
- 查询结果必须在毫秒或秒级内返回




## 列式数据库与行式数据库 {#column-oriented-vs-row-oriented-databases}
在行式数据库管理系统（DBMS）中，数据按行存储，同一行的所有相关值在物理存储上彼此相邻。

在列式数据库管理系统（DBMS）中，数据按列存储，同一列中的值被集中存放在一起。



## 为什么列式数据库在 OLAP 场景中表现更好 {#why-column-oriented-databases-work-better-in-the-olap-scenario}

列式数据库更适合 OLAP 场景：在处理大多数查询时，它们的速度至少快 100 倍。原因会在下文中详细解释，但通过下面的图示更容易直观地看出来：

看出区别了吗？

本文的其余部分将解释为什么列式数据库在这些场景中表现出色，以及为什么 ClickHouse 在这一类别的系统中[表现优于](/concepts/why-clickhouse-is-so-fast/concepts/why-clickhouse-is-so-fast#storage-layer-concurrent-inserts-and-selects-are-isolated)其他方案。



## 为什么 ClickHouse 如此之快？ {#why-is-clickhouse-so-fast}

ClickHouse 充分利用系统的全部可用资源，将其性能发挥到极致，从而尽可能快速地处理每个分析查询。之所以能够做到这一点，是因为它将强大的分析能力与对实现最快 OLAP 数据库所需底层细节的高度打磨独特地结合在一起。

如需深入了解该主题，可参考以下文章：
- [ClickHouse 性能](/concepts/why-clickhouse-is-so-fast)
- [ClickHouse 的独特特性](/about-us/distinctive-features.md)
- [常见问题：为什么 ClickHouse 如此之快？](/knowledgebase/why-clickhouse-is-so-fast)



## 实时处理分析型查询 {#processing-analytical-queries-in-real-time}

在行式 DBMS 中，数据按如下方式存储：

| 行 | WatchID     | JavaEnable | Title              | GoodEvent | EventTime           |
|-----|-------------|------------|--------------------|-----------|---------------------|
| #0 | 89354350662 | 1          | Investor Relations | 1         | 2016-05-18 05:19:20 |
| #1 | 90329509958 | 0          | Contact us         | 1         | 2016-05-18 08:10:20 |
| #2 | 89953706054 | 1          | Mission            | 1         | 2016-05-18 07:38:00 |
| #N | ...           | ...          | ...                  | ...         | ...                   |

换句话说，与一行相关的所有值在物理上是彼此相邻存储的。

行式 DBMS 的示例有 MySQL、Postgres 和 MS SQL Server。

在列式 DBMS 中，数据是这样存储的：

| 行：        | #0                 | #1                 | #2                 | #N |
|-------------|---------------------|---------------------|---------------------|-----|
| WatchID：    | 89354350662         | 90329509958         | 89953706054         | ...   |
| JavaEnable： | 1                   | 0                   | 1                   | ...   |
| Title：      | Investor Relations  | Contact us          | Mission             | ...   |
| GoodEvent：  | 1                   | 1                   | 1                   | ...   |
| EventTime：  | 2016-05-18 05:19:20 | 2016-05-18 08:10:20 | 2016-05-18 07:38:00 | ...   |

这些示例只展示了数据排列的顺序。不同列的值是分开存储的，同一列的数据则集中存储在一起。

列式 DBMS 的示例包括：Vertica、Paraccel（Actian Matrix 和 Amazon Redshift）、Sybase IQ、Exasol、Infobright、InfiniDB、MonetDB（VectorWise 和 Actian Vector）、LucidDB、SAP HANA、Google Dremel、Google PowerDrill、Druid 和 kdb+。

不同的数据存储方式更适合不同的使用场景。数据访问场景指的是：会发出哪些查询、查询的频率和比例；每种类型的查询会读取多少数据——包括行数、列数以及字节数；读写数据之间的关系；数据工作集的大小及其局部性；是否使用事务以及事务的隔离级别；对数据复制和逻辑完整性的要求；对每种类型查询的延迟和吞吐量要求，等等。

系统负载越高，就越需要根据具体使用场景对系统进行有针对性的配置调整，而且这种调整会越精细。不存在一种系统可以同样好地适配明显不同的场景。如果一个系统试图适配非常广泛的场景，在高负载下，它要么在所有场景中的表现都很差，要么只在少数场景下表现良好。

### OLAP 场景的关键特性 {#key-properties-of-olap-scenario}

- 表是「宽表」，也就是说包含大量列。
- 数据集规模很大，单次查询需要高吞吐量（每台服务器每秒可处理数十亿行）。
- 列值通常较小：数字和短字符串（例如每个 URL 60 字节）。
- 查询会读取大量行，但只涉及少量列。
- 对于简单查询，可以接受约 50ms 的延迟。
- 每个查询通常涉及一张大表；除其中一张外，其余表都较小。
- 查询结果相对于源数据要小得多。换句话说，数据会被过滤或聚合，使结果可以装入单台服务器的内存。
- 查询相对较少（通常每台服务器每秒最多几百个查询）。
- 插入以较大的批次进行（> 1000 行），而不是逐行插入。
- 不需要事务。

可以很容易看出，OLAP 场景与其他常见场景（例如 OLTP 或 Key-Value 访问）有显著差异。因此，如果希望获得良好的性能，就不应尝试使用 OLTP 或 Key-Value 数据库来处理分析型查询。比如，如果你尝试使用 MongoDB 或 Redis 做分析，与 OLAP 数据库相比，你会得到非常差的性能表现。



### 输入/输出 {#inputoutput}

1.  对于分析型查询，只需要读取表中少量列。在列式数据库中，你可以只读取所需的数据。比如，如果在 100 列中只需要 5 列，可以预期 I/O 量减少 20 倍。
2.  由于数据是按数据块读取的，因此更易于压缩。按列存储的数据也更易压缩。这进一步降低了 I/O 量。
3.  由于 I/O 减少，更多数据可以放入系统缓存。

例如，查询“统计每个广告平台的记录数”只需要读取一个“广告平台 ID”列，该列在未压缩时每行占用 1 字节。如果大部分流量并非来自广告平台，可以预期该列至少能获得 10 倍的压缩率。在使用快速压缩算法时，数据解压速度至少可以达到每秒数 GB 的未压缩数据。换句话说，在单个服务器上，该查询可以以每秒大约数十亿行的速度进行处理。实践中确实能够达到这一速度。

### CPU {#cpu}

由于执行查询需要处理大量行，将所有操作针对整块向量而不是针对单独行来分发，或将查询引擎实现为几乎没有分发开销，会有所帮助。如果不这样做，即使磁盘子系统足够优秀，查询解释器也会不可避免地让 CPU 空转。因此，在存储数据时按列存储，并在可能的情况下按列进行处理，是合理的做法。

有两种方式可以做到这一点：

1.  向量引擎。所有操作都针对向量而不是单个值来编写。这意味着你无需频繁调用操作，分发开销可以忽略不计。操作代码内部包含经过优化的循环。

2.  代码生成。为查询生成的代码中包含了所有间接调用。

在行式数据库中通常不会这么做，因为在执行简单查询时没有意义。但也有例外。例如，MemSQL 使用代码生成来降低处理 SQL 查询时的延迟。（相比之下，分析型 DBMS 需要优化的是吞吐量，而不是延迟。）

请注意，为提高 CPU 效率，查询语言必须是声明式的（SQL 或 MDX），或者至少是向量化的（如 J、K）。查询应只包含隐式循环，以便进行优化。
 -->
