---
'slug': '/intro'
'sidebar_label': '什么是 ClickHouse？'
'description': 'ClickHouse® 是一个面向列的 SQL 数据库管理系统（DBMS），用于在线分析处理（OLAP）。它同时以开源软件和云服务的形式提供。'
'title': '什么是 ClickHouse？'
'doc_type': 'guide'
---

import column_example from '@site/static/images/column-oriented-example-query.png';
import row_orientated from '@site/static/images/row-oriented.gif';
import column_orientated from '@site/static/images/column-oriented.gif';
import Image from '@theme/IdealImage';

ClickHouse® 是一个高性能、列式的 SQL 数据库管理系统 (DBMS)，用于在线分析处理 (OLAP)。它既可以作为 [开源软件](https://github.com/ClickHouse/ClickHouse) 提供，也可以作为 [云服务](https://clickhouse.com/cloud) 提供。

## 什么是分析？ {#what-are-analytics}

分析，亦称为 OLAP（在线分析处理），指的是对庞大数据集进行复杂计算（例如，聚合、字符串处理、算术运算）的 SQL 查询。

与事务查询（或 OLTP，在线事务处理）不同，后者每个查询只读取和写入少量行，因此完成时间通常在毫秒内，分析查询则常常处理数十亿或数万亿行。

在许多用例中，[分析查询必须是“实时的”](https://clickhouse.com/engineering-resources/what-is-real-time-analytics)，即在一秒钟以内返回结果。

## 行式存储 vs. 列式存储 {#row-oriented-vs-column-oriented-storage}

如此高的性能只能通过正确的数据“方向”来实现。

数据库可以 [行式或列式存储](https://clickhouse.com/engineering-resources/what-is-columnar-database) 数据。

在行式数据库中，连续的表行是一个接一个按顺序存储的。这种布局使得快速检索行成为可能，因为每行的列值是一起存储的。

ClickHouse 是一个列式数据库。在这种系统中，表作为列的集合存储，即每列的值依次存储在一起。这种布局使得恢复单行变得更加困难（因为行值之间存在间隙），但类似过滤或聚合这样的列操作比行式数据库快得多。

这个差异通过一个查询示例能更好地解释，该查询操作超过 1 亿行的 [真实世界匿名网络分析数据](/getting-started/example-datasets/metrica):

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

您可以在 [ClickHouse SQL Playground](https://sql.clickhouse.com?query=U0VMRUNUIE1vYmlsZVBob25lTW9kZWwsIENPVU5UKCkgQVMgYyAKRlJPTSBtZXRyaWNhLmhpdHMgCldIRVJFIAogICAgICBSZWdpb25JRCA9IDIyOSAKICBBTkQgRXZlbnREYXRlID49ICcyMDEzLTA3LTAxJyAKICBBTkQgRXZlbnREYXRlIDw9ICcyMDEzLTA3LTMxJyAKICBBTkQgTW9iaWxlUGhvbmUgIT0gMCAKICBBTkQgTW9iaWxlUGhvbmVNb2RlbCBub3QgaW4gWycnLCAnaVBhZCddIApHUk9VUCBCWSBNb2JpbGVQaG9uZU1vZGVsCk9SREVSIEJZIGMgREVTQyAKTElNSVQgODs&chart=eyJ0eXBlIjoicGllIiwiY29uZmlnIjp7InhheGlzIjoiTW9iaWxlUGhvbmVNb2RlbCIsInhleGlzIjoiYyJ9fQ&run_query=true) 上运行此查询，该查询选择并过滤 [仅从超过 100 个现有列中](https://sql.clickhouse.com/?query=U0VMRUNUIG5hbWUKRlJPTSBzeXN0ZW0uY29sdW1ucwpXSEVSRSBkYXRhYmFzZSA9ICdtZXRyaWNhJyBBTkQgdGFibGUgPSAnaGl0cyc7&tab=results&run_query=true) 的列，返回结果的时间在毫秒内：

<Image img={column_example} alt="列式数据库中查询的示例" size="lg"/>

如上图的统计部分所示，该查询在 92 毫秒内处理了 1 亿行，吞吐量约为每秒超过 10 亿行或每秒近 7 GB 数据传输。

**行式 DBMS**

在行式数据库中，即使上述查询只处理了少量现有列，系统仍然需要从磁盘加载其他现有列的数据到内存。原因是数据以被称为 [块](https://en.wikipedia.org/wiki/Block_(data_storage)) 的块存储在磁盘上（通常为固定大小，例如 4 KB 或 8 KB）。块是从磁盘读取到内存的最小数据单位。当应用程序或数据库请求数据时，操作系统的磁盘 I/O 子系统会从磁盘读取所需的块。即使只需要块的一部分，整个块也会被读入内存（这是由于磁盘和文件系统设计所致）：

<Image img={row_orientated} alt="行式数据库结构" size="lg"/>

**列式 DBMS**

由于每列的值按顺序一个接一个地存储在磁盘上，因此在运行上述查询时不会加载不必要的数据。
由于按块存储和从磁盘到内存的传输与分析查询的数据访问模式相一致，仅从磁盘读取查询所需的列，从而避免了对未使用数据的不必要 I/O。与行式存储相比，这 [要快得多](https://benchmark.clickhouse.com/)，在行式存储中，整个行（包括不相关的列）都会被读取：

<Image img={column_orientated} alt="列式数据库结构" size="lg"/>

## 数据复制与完整性 {#data-replication-and-integrity}

ClickHouse 使用异步多主复制方案，以确保数据在多个节点上冗余存储。在写入任何可用副本后，所有剩余副本会在后台获取其副本。系统在不同副本间保持相同的数据。大多数故障后的恢复是自动执行的，复杂情况下则为半自动执行。

## 基于角色的访问控制 {#role-based-access-control}

ClickHouse 实现了基于 SQL 查询的用户账户管理，并允许配置基于角色的访问控制，类似于 ANSI SQL 标准和流行关系数据库管理系统中的配置。

## SQL 支持 {#sql-support}

ClickHouse 支持 [基于 SQL 的声明式查询语言](/sql-reference)，在许多情况下与 ANSI SQL 标准是相同的。支持的查询子句包括 [GROUP BY](/sql-reference/statements/select/group-by)、[ORDER BY](/sql-reference/statements/select/order-by)、[FROM](/sql-reference/statements/select/from)中的子查询、[JOIN](/sql-reference/statements/select/join) 子句、[IN](/sql-reference/operators/in) 运算符、[窗口函数](/sql-reference/window-functions) 和标量子查询。

## 近似计算 {#approximate-calculation}

ClickHouse 提供以性能换取准确性的方法。例如，它的一些聚合函数约算特定值计数、中位数和分位数。此外，可以在数据的样本上运行查询以快速计算近似结果。最后，聚合可以在有限数量的键上运行，而不是对所有键进行聚合。根据键的分布不均程度，这可以提供一个合理准确的结果，且所需的资源远低于精确计算。

## 自适应连接算法 {#adaptive-join-algorithms}

ClickHouse 自适应选择连接算法：它从快速的散列连接开始，如果存在多个大型表，则回退到合并连接。

## 优越的查询性能 {#superior-query-performance}

ClickHouse 以极快的查询性能而闻名。
要了解 ClickHouse 为什么如此快速，请参阅 [ClickHouse 为什么快？](/concepts/why-clickhouse-is-so-fast.mdx) 指南。
