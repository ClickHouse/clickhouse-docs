---
title: '查询性能 - 时间序列'
sidebar_label: '查询性能'
description: '提升时间序列查询性能'
slug: /use-cases/time-series/query-performance
keywords: ['时间序列', '查询性能', '优化', '索引', '分区', '查询调优', '性能']
show_related_blogs: true
doc_type: 'guide'
---

# 时序查询性能 {#time-series-query-performance}

在完成存储优化之后，下一步是提升查询性能。
本节将探讨两项关键技术：优化 `ORDER BY` 排序键以及使用物化视图。
我们将看到，这些方法如何把查询时间从秒级降低到毫秒级。

## 优化 `ORDER BY` 键 {#time-series-optimize-order-by}

在尝试其他优化之前，您应当先优化排序键，以确保 ClickHouse 能够生成尽可能快的查询结果。
选择合适的键在很大程度上取决于您将要运行的查询。假设我们的多数查询都按 `project` 和 `subproject` 列进行过滤。
在这种情况下，把它们加入排序键是个好主意——同时也应包含 `time` 列，因为我们同样会按时间进行查询。

让我们创建一个表的新版本，它与 `wikistat` 具有相同的列类型，但按照 `(project, subproject, time)` 进行排序。

```sql
CREATE TABLE wikistat_project_subproject
(
    `time` DateTime,
    `project` String,
    `subproject` String,
    `path` String,
    `hits` UInt64
)
ENGINE = MergeTree
ORDER BY (project, subproject, time);
```

现在我们来对比多条查询语句，以了解排序键表达式对性能究竟有多重要。注意我们尚未应用之前的数据类型和编解码器优化，因此任何查询性能差异都仅由排序顺序导致。

<table>
  <thead>
    <tr>
      <th style={{ width: '36%' }}>查询</th>
      <th style={{ textAlign: 'right', width: '32%' }}>`(time)`</th>
      <th style={{ textAlign: 'right', width: '32%' }}>`(project, subproject, time)`</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>
        ```sql
SELECT project, sum(hits) AS h
FROM wikistat
GROUP BY project
ORDER BY h DESC
LIMIT 10;
```
      </td>

      <td style={{ textAlign: 'right' }}>2.381 秒</td>
      <td style={{ textAlign: 'right' }}>1.660 秒</td>
    </tr>

    <tr>
      <td>
        ```sql
SELECT subproject, sum(hits) AS h
FROM wikistat
WHERE project = 'it'
GROUP BY subproject
ORDER BY h DESC
LIMIT 10;
```
      </td>

      <td style={{ textAlign: 'right' }}>2.148 秒</td>
      <td style={{ textAlign: 'right' }}>0.058 秒</td>
    </tr>

    <tr>
      <td>
        ```sql
SELECT toStartOfMonth(time) AS m, sum(hits) AS h
FROM wikistat
WHERE (project = 'it') AND (subproject = 'zero')
GROUP BY m
ORDER BY m DESC
LIMIT 10;
```
      </td>

      <td style={{ textAlign: 'right' }}>2.192 秒</td>
      <td style={{ textAlign: 'right' }}>0.012 秒</td>
    </tr>

    <tr>
      <td>
        ```sql
SELECT path, sum(hits) AS h
FROM wikistat
WHERE (project = 'it') AND (subproject = 'zero')
GROUP BY path
ORDER BY h DESC
LIMIT 10;
```
      </td>

      <td style={{ textAlign: 'right' }}>2.968 秒</td>
      <td style={{ textAlign: 'right' }}>0.010 秒</td>
    </tr>
  </tbody>
</table>

## 物化视图 {#time-series-materialized-views}

另一种方式是使用物化视图来聚合并存储高频查询的结果。之后可以直接查询这些结果，而无需访问原始表。假设在我们的场景中经常会执行如下查询：

```sql
SELECT path, SUM(hits) AS v
FROM wikistat
WHERE toStartOfMonth(time) = '2015-05-01'
GROUP BY path
ORDER BY v DESC
LIMIT 10
```

```text
┌─path──────────────────┬────────v─┐
│ -                     │ 89650862 │
│ Angelsberg            │ 19165753 │
│ Ana_Sayfa             │  6368793 │
│ Academy_Awards        │  4901276 │
│ Accueil_(homonymie)   │  3805097 │
│ Adolf_Hitler          │  2549835 │
│ 2015_in_spaceflight   │  2077164 │
│ Albert_Einstein       │  1619320 │
│ 19_Kids_and_Counting  │  1430968 │
│ 2015_Nepal_earthquake │  1406422 │
└───────────────────────┴──────────┘

10 rows in set. Elapsed: 2.285 sec. Processed 231.41 million rows, 9.22 GB (101.26 million rows/s., 4.03 GB/s.)
Peak memory usage: 1.50 GiB.
```

### 创建物化视图 {#time-series-create-materialized-view}

我们可以创建如下的物化视图：

```sql
CREATE TABLE wikistat_top
(
    `path` String,
    `month` Date,
    hits UInt64
)
ENGINE = SummingMergeTree
ORDER BY (month, hits);
```

```sql
CREATE MATERIALIZED VIEW wikistat_top_mv 
TO wikistat_top
AS
SELECT
    path,
    toStartOfMonth(time) AS month,
    sum(hits) AS hits
FROM wikistat
GROUP BY path, month;
```

### 回填目标表 {#time-series-backfill-destination-table}

此目标表只有在向 `wikistat` 表插入新记录时才会写入数据，因此我们需要对其进行一些[回填](/docs/data-modeling/backfilling)。

执行此操作的最简单方式是使用 [`INSERT INTO SELECT`](/docs/sql-reference/statements/insert-into#inserting-the-results-of-select) 语句，利用该视图的 `SELECT` 查询（转换）[直接插入](https://github.com/ClickHouse/examples/tree/main/ClickHouse_vs_ElasticSearch/DataAnalytics#variant-1---directly-inserting-into-the-target-table-by-using-the-materialized-views-transformation-query)到物化视图的目标表中：

```sql
INSERT INTO wikistat_top
SELECT
    path,
    toStartOfMonth(time) AS month,
    sum(hits) AS hits
FROM wikistat
GROUP BY path, month;
```

取决于原始数据集的基数（我们有 10 亿行数据！），这可能是一种内存占用很高的做法。你也可以选择一种占用内存极少的方案：

* 使用 Null 表引擎创建一个临时表
* 将一个与正常使用的物化视图相同的副本关联到该临时表
* 使用 `INSERT INTO SELECT` 查询，将原始数据集中的所有数据复制到该临时表
* 删除该临时表和临时物化视图。

采用这种方法时，来自原始数据集的行会按数据块方式复制到临时表中（该表并不会存储这些行），并且针对每个数据块，会计算一个部分状态并写入目标表，在目标表中这些状态会在后台被增量合并。

```sql
CREATE TABLE wikistat_backfill
(
    `time` DateTime,
    `project` String,
    `subproject` String,
    `path` String,
    `hits` UInt64
)
ENGINE = Null;
```

接下来，我们将创建一个物化视图，从 `wikistat_backfill` 读取数据并写入 `wikistat_top`

```sql
CREATE MATERIALIZED VIEW wikistat_backfill_top_mv 
TO wikistat_top
AS
SELECT
    path,
    toStartOfMonth(time) AS month,
    sum(hits) AS hits
FROM wikistat_backfill
GROUP BY path, month;
```

最后，我们将使用初始的 `wikistat` 表来填充 `wikistat_backfill` 表：

```sql
INSERT INTO wikistat_backfill
SELECT * 
FROM wikistat;
```

当该查询完成后，我们就可以删除回填表和物化视图：

```sql
DROP VIEW wikistat_backfill_top_mv;
DROP TABLE wikistat_backfill;
```

现在可以查询物化视图，而无需再查询原始表：

```sql
SELECT path, sum(hits) AS hits
FROM wikistat_top
WHERE month = '2015-05-01'
GROUP BY ALL
ORDER BY hits DESC
LIMIT 10;
```

```text
┌─path──────────────────┬─────hits─┐
│ -                     │ 89543168 │
│ Angelsberg            │  7047863 │
│ Ana_Sayfa             │  5923985 │
│ Academy_Awards        │  4497264 │
│ Accueil_(homonymie)   │  2522074 │
│ 2015_in_spaceflight   │  2050098 │
│ Adolf_Hitler          │  1559520 │
│ 19_Kids_and_Counting  │   813275 │
│ Andrzej_Duda          │   796156 │
│ 2015_Nepal_earthquake │   726327 │
└───────────────────────┴──────────┘

10 rows in set. Elapsed: 0.004 sec.
```

这里的性能提升非常显著。
此前执行这个查询得出结果需要 2 秒多一点，而现在只需 4 毫秒。
