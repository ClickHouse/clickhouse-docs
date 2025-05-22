---
'slug': '/intro'
'sidebar_label': '什么是ClickHouse？'
'description': 'ClickHouse® 是一个面向列的 SQL 数据库管理系统（DBMS），用于在线分析处理（OLAP）。它既可以作为开源软件使用，也可以作为云服务提供。'
'title': '什么是ClickHouse？'
---

import column_example from '@site/static/images/column-oriented-example-query.png';
import row_orientated from '@site/static/images/row-oriented.gif';
import column_orientated from '@site/static/images/column-oriented.gif';
import Image from '@theme/IdealImage';

ClickHouse® 是一个高性能的、面向列的 SQL 数据库管理系统（DBMS），用于在线分析处理（OLAP）。它既可以作为 [开源软件](https://github.com/ClickHouse/ClickHouse) 也可以作为 [云服务](https://clickhouse.com/cloud) 提供。

## 什么是分析？ {#what-are-analytics}

分析，也称为 OLAP（在线分析处理），指的是对大数据集进行复杂计算（例如聚合、字符串处理、算术）的 SQL 查询。

与事务查询（或 OLTP，在线事务处理）不同，后者每个查询读取和写入的行数有限，因此在毫秒内完成，分析查询通常处理数十亿和数万亿行。

在许多用例中，[分析查询必须是“实时”的](https://clickhouse.com/engineering-resources/what-is-real-time-analytics)，即在不到一秒的时间内返回结果。

## 行式存储与列式存储 {#row-oriented-vs-column-oriented-storage}

这样的性能水平只能通过正确的数据“取向”来实现。

数据库可以以 [行式或列式](https://clickhouse.com/engineering-resources/what-is-columnar-database) 存储数据。

在行式数据库中，连续的表行按顺序一个接一个地存储。此布局允许快速检索行，因为每行的列值是一起存储的。

ClickHouse 是一个面向列的数据库。在这种系统中，表作为列的集合存储，即每列的值依次顺序存储。这种布局使得恢复单行变得更加困难（因为行值之间现在存在间隙），但列操作（例如过滤或聚合）变得比行式数据库快得多。

这个区别最好通过一个在 1 亿行的 [真实世界匿名网页分析数据](/getting-started/example-datasets/metrica) 上运行的示例查询进行解释：

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

您可以在 [ClickHouse SQL Playground](https://sql.clickhouse.com?query=U0VMRUNUIE1vYmlsZVBob25lTW9kZWwsIENPVU5UKCkgQVMgYyAKRlJPTSBtZXRyaWNhLmhpdHMgCldIRVJFIAogICAgICBSZWdpb25JRCA9IDIyOSAKICBBTkQgRXZlbnREYXRlID49ICcyMDEzLTA3LTAxJyAKICBBTkQgRXZlbnREYXRlIDw9ICcyMDEzLTA3LTMxJyAKICBBTkQgTW9iaWxlUGhvbmUgIT0gMCAKICBBTkQgTW9iaWxlUGhvbmVNb2RlbCBub3QgaW4gWycnLCAnaVBhZCddIApHUk9VUCBCWSBNb2JpbGVQaG9uZU1vZGVsCk9SREVSIEJZIGMgREVTQyAKTElNSVQgODs&chart=eyJ0eXBlIjoicGllIiwiY29uZmlnIjp7InhheGlzIjoiTW9iaWxlUGhvbmVNb2RlbCIsInlheGlzIjoiYyJ9fQ&run_query=true) 上运行此查询，该查询选择和过滤 [超过 100 个现有列中的一些列](https://sql.clickhouse.com/?query=U0VMRUNUIG5hbWUKRlJPTSBzeXN0ZW0uY29sdW1ucwpXSEVSRSBkYXRhYmFzZSA9ICdtZXRyaWNhJyBBTkQgdGFibGUgPSAnaGl0cyc7&tab=results&run_query=true)，并在毫秒内返回结果：

<Image img={column_example} alt="Example query in a column-oriented database" size="lg"/>

正如您在上面图表的统计部分所看到的，该查询在 92 毫秒内处理了 1 亿行，吞吐量约为 3 亿行，或每秒不到 7 GB。

**行式 DBMS**

在行式数据库中，尽管上面的查询仅处理了现有列中的少数几列，系统仍然需要从磁盘加载其他现有列的数据到内存。原因在于数据以称为 [块](https://en.wikipedia.org/wiki/Block_(data_storage)) 的分块形式存储在磁盘上（通常是固定大小，例如 4 KB 或 8 KB）。块是从磁盘读取到内存的最小数据单位。当应用程序或数据库请求数据时，操作系统的磁盘 I/O 子系统读取所需的块。如果仅需要块的一部分，则整个块将被读入内存（这是由于磁盘和文件系统设计所致）：

<Image img={row_orientated} alt="Row-oriented database structure" size="lg"/>

**列式 DBMS**

由于每个列的值顺序存储在磁盘上，因此在运行上述查询时不会加载不必要的数据。
由于按块存储和从磁盘转移到内存与分析查询的数据访问模式对齐，只有查询所需的列从磁盘读取，避免了对未使用数据的不必要 I/O。这与基于行的存储相比 [快得多](https://benchmark.clickhouse.com/)，后者是将整个行（包括不相关的列）读取：

<Image img={column_orientated} alt="Column-oriented database structure" size="lg"/>

## 数据复制与完整性 {#data-replication-and-integrity}

ClickHouse 使用异步多主复制方案，确保数据在多个节点上冗余存储。在写入任何可用副本之后，所有剩余副本在后台检索其副本。该系统在不同副本上维护相同的数据。大多数故障后的恢复是自动执行的，复杂情况下则半自动。

## 基于角色的访问控制 {#role-based-access-control}

ClickHouse 使用 SQL 查询实施用户帐户管理，并允许类似于 ANSI SQL 标准和流行关系数据库管理系统的基于角色的访问控制配置。

## SQL 支持 {#sql-support}

ClickHouse 支持基于 SQL 的 [声明性查询语言](/sql-reference)，在许多情况下与 ANSI SQL 标准相同。支持的查询子句包括 [GROUP BY](/sql-reference/statements/select/group-by)、[ORDER BY](/sql-reference/statements/select/order-by)、[FROM](/sql-reference/statements/select/from) 中的子查询、[JOIN](/sql-reference/statements/select/join) 子句、[IN](/sql-reference/operators/in) 操作符、[窗口函数](/sql-reference/window-functions) 和标量子查询。

## 近似计算 {#approximate-calculation}

ClickHouse 提供了在性能和准确性之间进行权衡的方法。例如，它的某些聚合函数近似计算唯一值计数、中位数和分位数。此外，可以在数据样本上运行查询，以快速计算近似结果。最后，可以使用有限数量的键运行聚合，而不是对所有键进行聚合。根据键的分布是否偏斜，这可以提供一个合理准确的结果，同时使用的资源远少于精确计算。

## 自适应连接算法 {#adaptive-join-algorithms}

ClickHouse 自适应选择连接算法，首先使用快速的哈希连接，如果有多个大表，则回退到合并连接。

## 优越的查询性能 {#superior-query-performance}

ClickHouse 以其极快的查询性能而闻名。
要了解 ClickHouse 为什么如此快速，请查看 [为什么 ClickHouse 快？](/concepts/why-clickhouse-is-so-fast.md) 指南。
