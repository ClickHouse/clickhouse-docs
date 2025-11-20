---
slug: /intro
sidebar_label: '什么是 ClickHouse？'
description: 'ClickHouse® 是一款面向在线分析处理 (OLAP) 的列式 SQL 数据库管理系统 (DBMS)。它既可以作为开源软件使用，也提供云服务。'
title: '什么是 ClickHouse？'
keywords: ['ClickHouse', 'columnar database', 'OLAP database', 'analytical database', 'high-performance database']
doc_type: 'guide'
---

import column_example from '@site/static/images/column-oriented-example-query.png';
import row_orientated from '@site/static/images/row-oriented.gif';
import column_orientated from '@site/static/images/column-oriented.gif';
import Image from '@theme/IdealImage';

ClickHouse® 是一款高性能、列式的 SQL 数据库管理系统（DBMS），用于联机分析处理（OLAP）。它既可以作为[开源软件](https://github.com/ClickHouse/ClickHouse)使用，也可以作为[云服务](https://clickhouse.com/cloud)使用。


## 什么是分析？ {#what-are-analytics}

分析（Analytics），也称为 OLAP（在线分析处理），是指对海量数据集执行包含复杂计算（如聚合、字符串处理、算术运算）的 SQL 查询。

与事务查询（或称 OLTP，在线事务处理）不同——事务查询每次仅读写少量行，因此可在毫秒级完成——分析查询通常需要处理数十亿甚至数万亿行数据。

在许多使用场景中，[分析查询必须是"实时"的](https://clickhouse.com/engineering-resources/what-is-real-time-analytics)，即在一秒内返回结果。


## 行式存储与列式存储 {#row-oriented-vs-column-oriented-storage}

只有采用正确的数据"方向"才能实现如此高的性能水平。

数据库以[行式或列式](https://clickhouse.com/engineering-resources/what-is-columnar-database)方式存储数据。

在行式数据库中,连续的表行按顺序依次存储。这种布局可以快速检索行,因为每行的列值存储在一起。

ClickHouse 是一个列式数据库。在这类系统中,表以列的集合形式存储,即每列的值按顺序依次存储。这种布局使得恢复单行变得更困难(因为行值之间现在存在间隙),但列操作(如过滤或聚合)比行式数据库快得多。

通过一个在 1 亿行[真实匿名化网络分析数据](/getting-started/example-datasets/metrica)上运行的示例查询,可以最好地解释这种差异:

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

您可以[在 ClickHouse SQL Playground 上运行此查询](https://sql.clickhouse.com?query=U0VMRUNUIE1vYmlsZVBob25lTW9kZWwsIENPVU5UKCkgQVMgYyAKRlJPTSBtZXRyaWNhLmhpdHMgCldIRVJFIAogICAgICBSZWdpb25JRCA9IDIyOSAKICBBTkQgRXZlbnREYXRlID49ICcyMDEzLTA3LTAxJyAKICBBTkQgRXZlbnREYXRlIDw9ICcyMDEzLTA3LTMxJyAKICBBTkQgTW9iaWxlUGhvbmUgIT0gMCAKICBBTkQgTW9iaWxlUGhvbmVNb2RlbCBub3QgaW4gWycnLCAnaVBhZCddIApHUk9VUCBCWSBNb2JpbGVQaG9uZU1vZGVsCk9SREVSIEJZIGMgREVTQyAKTElNSVQgODs&chart=eyJ0eXBlIjoicGllIiwiY29uZmlnIjp7InhheGlzIjoiTW9iaWxlUGhvbmVNb2RlbCIsInlheGlzIjoiYyJ9fQ&run_query=true),该查询从[超过 100 个现有列中仅选择和过滤少数几列](https://sql.clickhouse.com/?query=U0VMRUNUIG5hbWUKRlJPTSBzeXN0ZW0uY29sdW1ucwpXSEVSRSBkYXRhYmFzZSA9ICdtZXRyaWNhJyBBTkQgdGFibGUgPSAnaGl0cyc7&tab=results&run_query=true),并在毫秒内返回结果:

<Image
  img={column_example}
  alt='列式数据库中的示例查询'
  size='lg'
/>

如上图统计部分所示,该查询在 92 毫秒内处理了 1 亿行,吞吐量约为每秒超过 10 亿行,或每秒传输近 7 GB 数据。

**行式数据库管理系统**

在行式数据库中,即使上述查询仅处理现有列中的少数几列,系统仍需要将其他现有列的数据从磁盘加载到内存。原因是数据以称为[块](<https://en.wikipedia.org/wiki/Block_(data_storage)>)的数据块形式存储在磁盘上(通常为固定大小,例如 4 KB 或 8 KB)。块是从磁盘读取到内存的最小数据单元。当应用程序或数据库请求数据时,操作系统的磁盘 I/O 子系统从磁盘读取所需的块。即使只需要块的一部分,整个块也会被读入内存(这是由于磁盘和文件系统的设计):

<Image img={row_orientated} alt='行式数据库结构' size='lg' />

**列式数据库管理系统**


由于每一列的值在磁盘上是依次顺序存储的，当运行上面的查询时，不会加载多余的数据。
由于从磁盘到内存的分块存储与传输方式与分析型查询的数据访问模式相契合，只有查询所需的列才会从磁盘中读取，从而避免为未使用的数据执行不必要的 I/O。与行式存储（会读取整行数据，包括无关的列）相比，这样做[快得多](https://benchmark.clickhouse.com/)：

<Image img={column_orientated} alt="列式数据库结构" size="lg"/>



## 数据复制与完整性 {#data-replication-and-integrity}

ClickHouse 采用异步多主复制机制,确保数据冗余存储在多个节点上。数据写入任一可用副本后,其余所有副本会在后台自动获取数据副本。系统在不同副本间保持数据一致性。大多数故障后的恢复过程是自动执行的,复杂情况下则采用半自动方式。


## 基于角色的访问控制 {#role-based-access-control}

ClickHouse 使用 SQL 查询实现用户账户管理,并允许配置基于角色的访问控制,这与 ANSI SQL 标准和主流关系型数据库管理系统中的实现方式类似。


## SQL 支持 {#sql-support}

ClickHouse 支持[基于 SQL 的声明式查询语言](/sql-reference),在许多情况下与 ANSI SQL 标准一致。支持的查询子句包括 [GROUP BY](/sql-reference/statements/select/group-by)、[ORDER BY](/sql-reference/statements/select/order-by)、[FROM](/sql-reference/statements/select/from) 子句中的子查询、[JOIN](/sql-reference/statements/select/join) 子句、[IN](/sql-reference/operators/in) 运算符、[窗口函数](/sql-reference/window-functions)以及标量子查询。


## 近似计算 {#approximate-calculation}

ClickHouse 提供了以准确性换取性能的方式。例如,某些聚合函数可以近似计算唯一值数量、中位数和分位数。此外,查询可以在数据样本上运行,以快速获得近似结果。最后,聚合可以仅针对有限数量的键运行,而非所有键。根据键分布的偏斜程度,这种方式可以提供相当准确的结果,同时消耗的资源远少于精确计算。


## 自适应连接算法 {#adaptive-join-algorithms}

ClickHouse 会自适应地选择连接算法:首先使用快速的哈希连接,当存在多个大表时则回退到归并连接。


## 卓越的查询性能 {#superior-query-performance}

ClickHouse 以极快的查询性能而著称。
要了解 ClickHouse 为何如此快速,请参阅[为什么 ClickHouse 这么快?](/concepts/why-clickhouse-is-so-fast.mdx)指南。


<!--
## 什么是 OLAP? {#what-is-olap}
OLAP 场景需要在大规模数据集上对复杂的分析查询提供实时响应,具有以下特点:
- 数据集规模可能极其庞大 - 数十亿甚至数万亿行
- 数据以包含大量列的表形式组织
- 任何特定查询仅需选择少数几列
- 查询结果必须在毫秒或秒级内返回




## 列式数据库与行式数据库 {#column-oriented-vs-row-oriented-databases}

在行式数据库管理系统(DBMS)中,数据按行存储,一行中的所有值在物理上连续存放。

在列式数据库管理系统(DBMS)中,数据按列存储,同一列的值连续存放在一起。


## 为什么列式数据库在 OLAP 场景中表现更好 {#why-column-oriented-databases-work-better-in-the-olap-scenario}

列式数据库更适合 OLAP 场景:在处理大多数查询时,它们的速度至少快 100 倍。下文将详细解释其原因,但通过可视化方式更容易理解这一事实:

看出区别了吗?

本文的其余部分将解释为什么列式数据库在这些场景中表现出色,以及为什么 ClickHouse 在同类产品中[性能尤为突出](/concepts/why-clickhouse-is-so-fast/concepts/why-clickhouse-is-so-fast#storage-layer-concurrent-inserts-and-selects-are-isolated)。


## 为什么 ClickHouse 如此快速？ {#why-is-clickhouse-so-fast}

ClickHouse 充分利用所有可用的系统资源，以尽可能快的速度处理每个分析查询。这得益于其独特的分析能力组合，以及对实现最快 OLAP 数据库所需底层细节的精心打磨。

深入了解此主题的相关文章包括：

- [ClickHouse 性能](/concepts/why-clickhouse-is-so-fast)
- [ClickHouse 的显著特性](/about-us/distinctive-features.md)
- [常见问题：为什么 ClickHouse 如此快速？](/knowledgebase/why-clickhouse-is-so-fast)


## 实时处理分析查询 {#processing-analytical-queries-in-real-time}

在行式数据库管理系统中,数据按以下顺序存储:

| 行 | WatchID     | JavaEnable | Title              | GoodEvent | EventTime           |
| --- | ----------- | ---------- | ------------------ | --------- | ------------------- |
| #0  | 89354350662 | 1          | 投资者关系 | 1         | 2016-05-18 05:19:20 |
| #1  | 90329509958 | 0          | 联系我们         | 1         | 2016-05-18 08:10:20 |
| #2  | 89953706054 | 1          | 使命            | 1         | 2016-05-18 07:38:00 |
| #N  | ...         | ...        | ...                | ...       | ...                 |

换句话说,与一行相关的所有值在物理上是相邻存储的。

行式数据库管理系统的示例包括 MySQL、Postgres 和 MS SQL Server。

在列式数据库管理系统中,数据按以下方式存储:

| 行:        | #0                  | #1                  | #2                  | #N  |
| ----------- | ------------------- | ------------------- | ------------------- | --- |
| WatchID:    | 89354350662         | 90329509958         | 89953706054         | ... |
| JavaEnable: | 1                   | 0                   | 1                   | ... |
| Title:      | 投资者关系  | 联系我们          | 使命             | ... |
| GoodEvent:  | 1                   | 1                   | 1                   | ... |
| EventTime:  | 2016-05-18 05:19:20 | 2016-05-18 08:10:20 | 2016-05-18 07:38:00 | ... |

这些示例仅展示了数据的排列顺序。不同列的值是分开存储的,而同一列的数据则存储在一起。

列式数据库管理系统的示例包括:Vertica、Paraccel(Actian Matrix 和 Amazon Redshift)、Sybase IQ、Exasol、Infobright、InfiniDB、MonetDB(VectorWise 和 Actian Vector)、LucidDB、SAP HANA、Google Dremel、Google PowerDrill、Druid 和 kdb+。

不同的数据存储顺序适用于不同的场景。数据访问场景是指执行什么查询、执行频率如何、各类查询的比例如何;每种查询类型读取多少数据——行数、列数和字节数;读取和更新数据之间的关系;数据的工作集大小以及数据的局部性使用程度;是否使用事务以及事务的隔离级别;对数据复制和逻辑完整性的要求;每种查询类型对延迟和吞吐量的要求等等。

系统负载越高,根据使用场景的需求定制系统配置就越重要,定制的粒度也就越细。没有任何系统能够同样出色地适应显著不同的场景。如果一个系统能够适应广泛的场景,那么在高负载下,该系统要么对所有场景的处理都同样糟糕,要么只能在一个或少数几个可能的场景中表现良好。

### OLAP 场景的关键特性 {#key-properties-of-olap-scenario}

- 表是"宽表",即包含大量列。
- 数据集很大,查询在处理单个查询时需要高吞吐量(每台服务器每秒可达数十亿行)。
- 列值相对较小:数字和短字符串(例如,每个 URL 60 字节)。
- 查询提取大量行,但只涉及少量列。
- 对于简单查询,允许约 50 毫秒的延迟。
- 每个查询涉及一个大表;除了一个表之外,其他所有表都很小。
- 查询结果明显小于源数据。换句话说,数据经过过滤或聚合,因此结果可以放入单台服务器的内存中。
- 查询相对较少(通常每台服务器每秒数百个查询或更少)。
- 插入以相当大的批次进行(\> 1000 行),而不是单行插入。
- 不需要事务。

显而易见,OLAP 场景与其他流行场景(如 OLTP 或键值访问)有很大不同。因此,如果想要获得良好的性能,尝试使用 OLTP 或键值数据库来处理分析查询是没有意义的。例如,如果尝试使用 MongoDB 或 Redis 进行分析,与 OLAP 数据库相比,性能会非常差。


### 输入/输出 {#inputoutput}

1.  对于分析查询,只需要读取表中的少数几列。在列式数据库中,您可以只读取所需的数据。例如,如果您需要 100 列中的 5 列,I/O 可以减少 20 倍。
2.  由于数据以数据包形式读取,压缩更加容易。列中的数据也更容易压缩。这进一步减少了 I/O 量。
3.  由于 I/O 减少,系统缓存可以容纳更多数据。

例如,查询"统计每个广告平台的记录数"需要读取一个"广告平台 ID"列,该列未压缩时占用 1 字节。如果大部分流量不是来自广告平台,该列可以实现至少 10 倍的压缩率。使用快速压缩算法时,数据解压缩速度可以达到每秒至少数 GB 的未压缩数据。换句话说,此查询可以在单台服务器上以大约每秒数十亿行的速度处理。这个速度在实践中是可以达到的。

### CPU {#cpu}

由于执行查询需要处理大量行,对整个向量而不是单独的行分派所有操作会很有帮助,或者实现查询引擎使其几乎没有分派成本。如果不这样做,即使使用性能尚可的磁盘子系统,查询解释器也不可避免地会使 CPU 停滞。因此,以列的形式存储数据并在可能的情况下按列处理数据是有意义的。

有两种方法可以做到这一点:

1.  向量引擎。所有操作都是为向量而不是单独的值编写的。这意味着不需要频繁调用操作,分派成本可以忽略不计。操作代码包含优化的内部循环。

2.  代码生成。为查询生成的代码包含所有间接调用。

在行式数据库中不会这样做,因为在运行简单查询时这样做没有意义。但也有例外。例如,MemSQL 使用代码生成来减少处理 SQL 查询时的延迟。(相比之下,分析型 DBMS 需要优化吞吐量,而不是延迟。)

请注意,为了提高 CPU 效率,查询语言必须是声明式的(SQL 或 MDX),或者至少是向量式的(J、K)。查询应该只包含隐式循环,以便进行优化。
-->
