---
'slug': '/intro'
'sidebar_label': '什么是 ClickHouse？'
'description': 'ClickHouse® 是一个面向列的 SQL 数据库管理系统 (DBMS)，用于在线分析处理 (OLAP)。它既可以作为开源软件提供，也可以作为云服务提供。'
'title': '什么是 ClickHouse？'
---

import column_example from '@site/static/images/column-oriented-example-query.png';
import row_orientated from '@site/static/images/row-oriented.gif';
import column_orientated from '@site/static/images/column-oriented.gif';
import Image from '@theme/IdealImage';

ClickHouse® 是一个高性能的、面向列的 SQL 数据库管理系统 (DBMS)，适用于在线分析处理 (OLAP)。它可作为 [开源软件](https://github.com/ClickHouse/ClickHouse) 和 [云服务](https://clickhouse.com/cloud) 提供。

## 什么是分析？ {#what-are-analytics}

分析，也称为 OLAP（在线分析处理），是指在大规模数据集上执行复杂计算（例如聚合、字符串处理、算术）的 SQL 查询。

与只读取和写入每个查询仅几行的事务查询（或 OLTP，在线事务处理）不同，分析查询通常处理数十亿或数万亿行数据。

在许多用例中，[分析查询必须是“实时的”](https://clickhouse.com/engineering-resources/what-is-real-time-analytics)，即结果必须在一秒钟以内返回。

## 行式 vs 列式存储 {#row-oriented-vs-column-oriented-storage}

这样的性能水平只能通过正确的数据“方向”来实现。

数据库要么以 [行式存储，或者列式存储](https://clickhouse.com/engineering-resources/what-is-columnar-database)。

在行式数据库中，连续的表行依次顺序存储。此布局允许快速检索行，因为每行的列值被一起存储。

ClickHouse 是一个面向列的数据库。在此类系统中，表作为列的集合存储，即每列的值顺序存储在一起。这种布局使恢复单行变得更加困难（因为行值之间存在空隙），但列操作，例如过滤或聚合，比行式数据库要快得多。

差异可以通过一个示例查询来解释，该查询在 1 亿行的 [现实世界匿名 web 分析数据](/getting-started/example-datasets/metrica) 上运行：

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

您可以在 [ClickHouse SQL Playground](https://sql.clickhouse.com?query=U0VMRUNUIE1vYmlsZVBob25lTW9kZWwsIENPVU5UKCkgQVMgYyAKRlJPTSBtZXRyaWNhLmhpdHMgCldIRVJFIAogICAgICBSZWdpb25JRCA9IDIyOSAKICBBTkQgRXZlbnREYXRlID49ICcyMDEzLTA3LTAxJyAKICBBTkQgRXZlbnREYXRlIDw9ICcyMDEzLTA3LTMxJyAKICBBTkQgTW9iaWxlUGhvbmUgIT0gMCAKICBBTkQgTW9iaWxlUGhvbmVNb2RlbCBub3QgaW4gWycnLCAnaVBhZCddIApHUk9VUCBCWSBNb2JpbGVQaG9uZU1vZGVsCk9SREVSIEJZIGMgREVTQyAKTElNSVQgODs&chart=eyJ0eXBlIjoicGllIiwiY29uZmlnIjp7InhheGlzIjoiTW9iaWxlUGhvbmVNb2RlbCIsInlheGlzIjoiYyJ9fQ&run_query=true) 上运行此查询，该查询选择和过滤了 [100 多个现有列中的几个](https://sql.clickhouse.com/?query=U0VMRUNUIG5hbWUKRlJPTSBzeXN0ZW0uY29sdW1ucwpXSEVSRSBkYXRhYmFzZSA9ICdtZXRyaWNhJyBBTkQgdGFibGUgPSAnaGl0cyc7&tab=results&run_query=true)，在毫秒内返回结果：

<Image img={column_example} alt="列式数据库中的示例查询" size="lg"/>

正如您在上图的统计部分所看到的，该查询在 92 毫秒内处理了 1 亿行，吞吐量约为 3 亿行，或者不到每秒 7 GB。

**行式 DBMS**

在行式数据库中，即使上面的查询仅处理现有列中的几个，系统仍然需要从磁盘加载其他现有列的数据到内存中。这是因为数据存储在称为 [块](https://en.wikipedia.org/wiki/Block_(data_storage)) 的块中（通常是固定大小，例如 4 KB 或 8 KB）。块是从磁盘读取到内存的最小数据单元。当应用程序或数据库请求数据时，操作系统的磁盘 I/O 子系统从磁盘读取所需的块。即使只需要块的一部分，整个块也会被读入内存（这是由于磁盘和文件系统的设计）：

<Image img={row_orientated} alt="行式数据库结构" size="lg"/>

**列式 DBMS**

由于每列的值在磁盘上是顺序存储的，因此在运行上述查询时不会加载不必要的数据。
由于块级存储和从磁盘到内存的传输与分析查询的数据访问模式对齐，因此仅读取查询所需的列数据，从而避免了对未使用数据的不必要 I/O。这与行式存储相比，[速度快得多](https://benchmark.clickhouse.com/)，因为整行（包括不相关的列）都被读取：

<Image img={column_orientated} alt="列式数据库结构" size="lg"/>

## 数据复制和完整性 {#data-replication-and-integrity}

ClickHouse 使用异步多主复制方案，以确保数据在多个节点上冗余存储。在写入任何可用副本后，所有剩余副本在后台检索其副本。系统在不同副本上维护相同的数据。在大多数故障后，恢复是自动进行的，复杂情况时则为半自动。

## 基于角色的访问控制 {#role-based-access-control}

ClickHouse 使用 SQL 查询实现用户帐户管理，并允许进行基于角色的访问控制配置，类似于 ANSI SQL 标准和流行的关系数据库管理系统中找到的配置。

## SQL 支持 {#sql-support}

ClickHouse 支持基于 SQL 的 [声明性查询语言](/sql-reference)，在许多情况下与 ANSI SQL 标准相同。支持的查询子句包括 [GROUP BY](/sql-reference/statements/select/group-by)、[ORDER BY](/sql-reference/statements/select/order-by)、[FROM](/sql-reference/statements/select/from) 中的子查询、[JOIN](/sql-reference/statements/select/join) 子句、[IN](/sql-reference/operators/in) 操作符、[窗口函数](/sql-reference/window-functions) 和标量子查询。

## 近似计算 {#approximate-calculation}

ClickHouse 提供了一些方法来在性能和准确性之间进行权衡。例如，它的一些聚合函数大致计算不同值的数量、中位数和分位数。此外，可以在数据样本上运行查询以快速计算近似结果。最后，可以使用有限的键运行聚合，而不是对所有键进行聚合。根据键的分布情况，这可以提供一个合理准确的结果，使用的资源远少于精确计算。

## 自适应连接算法 {#adaptive-join-algorithms}

ClickHouse 自适应选择连接算法，它首先使用快速哈希连接，如果有多个大型表，则退回到合并连接。

## 优越的查询性能 {#superior-query-performance}

ClickHouse 以极快的查询性能而闻名。
要了解 ClickHouse 为什么如此快速，请参阅 [ClickHouse 为什么快？](/concepts/why-clickhouse-is-so-fast.md) 指南。
