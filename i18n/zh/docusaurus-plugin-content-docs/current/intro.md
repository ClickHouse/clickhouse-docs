---
'slug': '/intro'
'sidebar_label': 'ClickHouse 是什么？'
'description': 'ClickHouse 是一种面向列的 SQL 数据库管理系统（DBMS），用于在线分析处理（OLAP）。它既可以作为开源软件，也可以作为云服务提供。'
'title': '什么是 ClickHouse？'
---

import column_example from '@site/static/images/column-oriented-example-query.png';
import row_orientated from '@site/static/images/row-oriented.gif';
import column_orientated from '@site/static/images/column-oriented.gif';
import Image from '@theme/IdealImage';

ClickHouse® 是一个高性能、面向列的 SQL 数据库管理系统 (DBMS)，用于在线分析处理 (OLAP)。它作为 [开源软件](https://github.com/ClickHouse/ClickHouse) 和 [云服务](https://clickhouse.com/cloud) 双重提供。

## 什么是分析? {#what-are-analytics}

分析，也称为 OLAP（在线分析处理），是指对庞大数据集进行复杂计算（例如聚合、字符串处理、算术运算）的 SQL 查询。

与交易查询（或 OLTP，在线事务处理）不同，交易查询每次只读取和写入几行数据，因此能在毫秒级别内完成，而分析查询通常处理数十亿和数万亿行数据。

在许多用例中，[分析查询必须是“实时的”](https://clickhouse.com/engineering-resources/what-is-real-time-analytics)，即在不到一秒的时间内返回结果。

## 行式存储与列式存储 {#row-oriented-vs-column-oriented-storage}

如此高的性能只能通过正确的数据“方向”来实现。

数据库可以以 [行式或列式](https://clickhouse.com/engineering-resources/what-is-columnar-database) 存储数据。

在行式数据库中，连续的表行依次存储在一起。这种布局允许快速检索行，因为每行的列值是存储在一起的。

ClickHouse 是一个列式数据库。在这样的系统中，表作为一组列进行存储，即每列的值是依次存储在一起的。这种布局使得恢复单行数据变得更加困难（因为现在行值之间存在间隔），但列操作（例如过滤或聚合）比行式数据库要快得多。

通过对一个运行于 1 亿行 [实际匿名网络分析数据](/getting-started/example-datasets/metrica) 的示例查询进行解释，可以清楚地展示这种差异：

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

您可以在 ClickHouse SQL Playground 上 [运行此查询](https://sql.clickhouse.com?query=U0VMRUNUIE1vYmlsZVBob25lTW9kZWwsIENPVU5UKCkgQVMgYyAKRlJPTSBtZXRyaWNhLmhpdHMgCldIRVJFIAogICAgICBSZWdpb25JRCA9IDIyOSAKICBBTkQgRXZlbnREYXRlID49ICcyMDEzLTA3LTAxJyAKICBBTkQgRXZlbnREYXRlIDw9ICcyMDEzLTA3LTMxJyAKICBBTkQgTW9iaWxlUGhvbmUgIT0gMCAKICBBTkQgTW9iaWxlUGhvbmVNb2RlbCBub3QgaW4gWycnLCAnaVBhZCddIApHUk9VUCBCWSBNb2JpbGVQaG9uZU1vZGVsCk9SREVSIEJZIGMgREVTQyAKTElNSVQgODs&chart=eyJ0eXBlIjoicGllIiwiY29uZmlnIjp7InhheGlzIjoiTW9iaWxlUGhvbmVNb2RlbCIsInlheGlzIjoiYyJ9fQ&run_query=true)，该查询选择并过滤 [仅仅是超过 100 个](https://sql.clickhouse.com/?query=U0VMRUNUIG5hbWUKRlJPTSBzeXN0ZW0uY29sdW1ucwpXSEVSRSBkYXRhYmFzZSA9ICdtZXRyaWNhJyBBTkQgdGFibGUgPSAnaGl0cyc7&tab=results&run_query=true) 已存在列，并在毫秒内返回结果：

<Image img={column_example} alt="列式数据库中的示例查询" size="lg"/>

正如您在上图的统计部分所见，该查询在 92 毫秒内处理了 1 亿行，吞吐量大约为 3 亿行或接近每秒 7 GB。

**行式 DBMS**

在行式数据库中，即使上述查询只处理了现有列中的几个，系统仍需从磁盘加载其他现有列的数据到内存。原因是数据以称为 [块](https://en.wikipedia.org/wiki/Block_(data_storage)) 的固定大小块（例如 4 KB 或 8 KB）存储在磁盘上。块是从磁盘读入内存的最小数据单位。当应用程序或数据库请求数据时，操作系统的磁盘 I/O 子系统会从磁盘读取所需的块。即使只需要块的一部分，整个块也会被读入内存（这与磁盘和文件系统的设计有关）：

<Image img={row_orientated} alt="行式数据库结构" size="lg"/>

**列式 DBMS**

由于每列的值在磁盘上是依次存储在一起的，因此在运行上述查询时没有加载不必要的数据。
因为块级存储与从磁盘到内存的传输方式与分析查询的数据访问模式对齐，因此只有查询所需的列会从磁盘读取，避免了对未使用数据的多余 I/O。这与行式存储相比是 [更快的](https://benchmark.clickhouse.com/)，后者会读取整行（包括不相关的列）：

<Image img={column_orientated} alt="列式数据库结构" size="lg"/>

## 数据复制与完整性 {#data-replication-and-integrity}

ClickHouse 使用异步多主复制方案来确保数据在多个节点上冗余存储。数据在写入任何可用副本后，所有剩余副本将在后台检索其副本。该系统在不同副本上保持相同的数据。大多数故障后的恢复是自动执行的，复杂情况下则是半自动执行。

## 基于角色的访问控制 {#role-based-access-control}

ClickHouse 实现用户账户管理，使用 SQL 查询，并允许基于角色的访问控制配置，类似于 ANSI SQL 标准和流行的关系数据库管理系统中所见。

## SQL 支持 {#sql-support}

ClickHouse 支持一种 [基于 SQL 的声明性查询语言](/sql-reference)，在许多情况下与 ANSI SQL 标准相同。支持的查询子句包括 [GROUP BY](/sql-reference/statements/select/group-by)、[ORDER BY](/sql-reference/statements/select/order-by)、[FROM](/sql-reference/statements/select/from) 中的子查询、[JOIN](/sql-reference/statements/select/join) 子句、[IN](/sql-reference/operators/in) 操作符、[窗口函数](/sql-reference/window-functions) 和标量子查询。

## 近似计算 {#approximate-calculation}

ClickHouse 提供了在性能与精度之间进行权衡的方法。例如，有些聚合函数近似计算不同值的计数、中位数和分位数。此外，可以在数据的样本上运行查询，以快速计算近似结果。最后，聚合可以使用有限数量的键进行，而不是对所有键进行聚合。根据键的分布情况，这可以提供一个相对准确的结果，而所需资源远少于精确计算。

## 自适应连接算法 {#adaptive-join-algorithms}

ClickHouse 自适应地选择连接算法，首先使用快速哈希连接，如果有多个大型表，则回退到合并连接。

## 卓越的查询性能 {#superior-query-performance}

ClickHouse 以其极快的查询性能而闻名。
要了解 ClickHouse 多么快速，请参阅 [为什么 ClickHouse 快？](/concepts/why-clickhouse-is-so-fast.md) 指南。
