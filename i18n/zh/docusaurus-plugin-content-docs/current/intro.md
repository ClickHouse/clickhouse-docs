---
sidebar_label: 什么是 ClickHouse？
description: "ClickHouse® 是一个面向列的 SQL 数据库管理系统 (DBMS)，用于在线分析处理 (OLAP)。它既有开源软件版本，也有云服务版本。"
title: 什么是 ClickHouse？
---

import RowOrientedExample from '@site/static/images/column-oriented-example-query.png';
import RowOriented from '@site/static/images/row-oriented.gif';
import ColumnOriented from '@site/static/images/column-oriented.gif';

ClickHouse® 是一个高性能的面向列的 SQL 数据库管理系统 (DBMS)，用于在线分析处理 (OLAP)。它既有 [开源软件](https://github.com/ClickHouse/ClickHouse) 版本，也有 [云服务](https://clickhouse.com/cloud) 版本。

## 什么是分析？ {#what-are-analytics}

分析，也称为 OLAP（在线分析处理），是指对大量数据集进行复杂计算（例如，聚合、字符串处理、算数）的 SQL 查询。

与仅在每次查询中读取和写入少量行的事务查询（或 OLTP，在线事务处理）不同，分析查询通常处理数十亿和数万亿行数据。

在许多用例中，[分析查询必须是“实时的”](https://clickhouse.com/engineering-resources/what-is-real-time-analytics)，即在不到一秒的时间内返回结果。

## 行式存储与列式存储 {#row-oriented-vs-column-oriented-storage}

如此高的性能只能通过合适的数据“方向”来实现。

数据库可以以 [行式或列式](https://clickhouse.com/engineering-resources/what-is-columnar-database) 存储数据。

在行式数据库中，连续的表行是依次存储的。这种布局允许快速检索行，因为每行的列值一起存储。

ClickHouse 是一个面向列的数据库。在这种系统中，表被存储为列的集合，即每列的值依次存储。这种布局使恢复单个行变得更加困难（因为现在行值之间存在间隙），但列操作，例如过滤或聚合，变得比行式数据库要快得多。

通过一个示例查询可以最好地说明这一点，该查询在 1 亿行的 [真实世界匿名网络分析数据](/getting-started/example-datasets/metrica) 中运行：

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

您可以在 [ClickHouse SQL Playground](https://sql.clickhouse.com?query=U0VMRUNUIE1vYmlsZVBob25lTW9kZWwsIENPVU5UKCkgQVMgYyAKRlJPTSBtZXRyaWNhLmhpdHMgCldIRVJFIAogICAgICBSZWdpb25JRCA9IDIyOSAKICBBTkQgRXZlbnREYXRlID49ICcyMDEzLTA3LTAxJyAKICBBTkQgRXZlbnREYXRlIDw9ICcyMDEzLTA3LTMxJyAKICBBTkQgTW9iaWxlUGhvbmUgIT0gMCAKICBBTkQgTW9iaWxlUGhvbmVNb2RlbCBub3QgaW4gWycnLCAnaVBhZCddIApHUk9VUCBCWSBNb2JpbGVQaG9uZU1vZGVsCk9SREVSIEJZIGMgREVTQyAKTElNSVQgODs&chart=eyJ0eXBlIjoicGllIiwiY29uZmlnIjp7InhheGlzIjoiTW9iaWxlUGhvbmVNb2RlbCIsInlheGlzIjoiYyJ9fQ&run_query=true) 上运行此查询，并过滤出 [超过 100 个现有列中的少数几列](https://sql.clickhouse.com/?query=U0VMRUNUIG5hbWUKRlJPTSBzeXN0ZW0uY29sdW1ucwpXSEVSRSBkYXRhYmFzZSA9ICdtZXRyaWNhJyBBTkQgdGFibGUgPSAnaGl0cyc7&tab=results&run_query=true)，结果在毫秒级内返回：

<img src={RowOrientedExample} alt="列式数据库中的示例查询" />

正如您在上面图表中的统计部分所看到的，该查询在 92 毫秒内处理了 1 亿行，吞吐量约为 3 亿行，或每秒不足 7 GB。

**行式 DBMS**

在行式数据库中，尽管上述查询只处理了少数现有列，但系统仍然需要将来自其他现有列的数据从磁盘加载到内存中。原因是数据以称为 [块](https://en.wikipedia.org/wiki/Block_(data_storage)) 的块形式存储在磁盘上（通常为固定大小，例如 4 KB 或 8 KB）。块是从磁盘读取到内存的最小数据单位。当应用程序或数据库请求数据时，操作系统的磁盘 I/O 子系统会从磁盘读取所需的块。即使只需要块的一部分，整个块也会被读入内存（这是由于磁盘和文件系统的设计）：

<img src={RowOriented} alt="行式数据库结构" />

**列式 DBMS**

由于每列的值被依次存储在磁盘上，因此在运行上述查询时不会加载不必要的数据。
由于块状存储和从磁盘到内存的传输与分析查询的数据访问模式相一致，只读取查询所需的列，从而避免了对未使用数据的不必要 I/O。这与行式存储相比，性能要 [快得多](https://benchmark.clickhouse.com/)，在行式存储中，会读取整个行（包括不相关的列）：

<img src={ColumnOriented} alt="列式数据库结构" />

## 数据复制与完整性 {#data-replication-and-integrity}

ClickHouse 使用异步多主复制方案，确保数据在多个节点上冗余存储。在写入任何可用副本后，所有剩余副本会在后台获取其副本。系统在不同副本上维护相同的数据。大多数故障后的恢复是自动执行的，在复杂情况下则是半自动执行。

## 基于角色的访问控制 {#role-based-access-control}

ClickHouse 实施用户账户管理，使用 SQL 查询并允许进行基于角色的访问控制配置，类似于 ANSI SQL 标准和流行的关系数据库管理系统中所能找到的内容。

## SQL 支持 {#sql-support}

ClickHouse 支持基于 SQL 的 [声明式查询语言](/sql-reference)，在许多情况下与 ANSI SQL 标准一模一样。支持的查询子句包括 [GROUP BY](/sql-reference/statements/select/group-by)、[ORDER BY](/sql-reference/statements/select/order-by)、[FROM](/sql-reference/statements/select/from) 中的子查询、[JOIN](/sql-reference/statements/select/join) 子句、[IN](/sql-reference/operators/in) 操作符、[窗口函数](/sql-reference/window-functions) 和标量子查询。

## 近似计算 {#approximate-calculation}

ClickHouse 提供几种方式以牺牲准确性换取性能。例如，其一些聚合函数近似计算不同值的计数、中位数和分位数。此外，还可以在数据的一个样本上运行查询，以迅速计算出近似结果。最后，可以使用有限数量的键运行聚合，而不是对所有键进行聚合。根据键的分布情况，这可以提供相对准确的结果，同时相比精确计算使用更少的资源。

## 自适应连接算法 {#adaptive-join-algorithms}

ClickHouse 以自适应的方式选择连接算法，起始使用快速的哈希连接，如果有超过一个大的表则回退到合并连接。

## 优越的查询性能 {#superior-query-performance}

ClickHouse 以极快的查询性能而闻名。
要了解 ClickHouse 为什么如此快速，请参见 [为什么 ClickHouse 快？](/concepts/why-clickhouse-is-so-fast.md) 指南。
