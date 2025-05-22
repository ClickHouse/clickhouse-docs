
# 时间序列查询性能

在优化存储之后，下一步是提高查询性能。 
本节探讨两个关键技术：优化 `ORDER BY` 键和使用物化视图。 
我们将看到这些方法如何将查询时间从秒减少到毫秒。

## 优化 ORDER BY 键 {#time-series-optimize-order-by}

在尝试其他优化之前，您应该优化排序键，以确保 ClickHouse 产生最快的结果。 
选择合适的键在很大程度上取决于您打算运行的查询。假设我们的大多数查询按 `project` 和 `subproject` 列进行过滤。 
在这种情况下，将它们添加到排序键是个好主意——再加上时间列，因为我们也按时间查询：

让我们创建一个版本的表，其列类型与 `wikistat` 相同，但按 `(project, subproject, time)` 排序。

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

现在让我们比较多个查询，以了解排序键表达式对性能的影响。请注意，我们尚未应用之前的数据类型和编解码优化，因此任何查询性能差异仅基于排序顺序。

<table>
    <thead>
        <tr>
            <th  style={{ width: '36%' }}>查询</th>
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

另一个选项是使用物化视图来聚合和存储热门查询的结果。这些结果可以而不是原始表进行查询。假设在我们的案例中，以下查询被频繁执行：


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

我们可以创建以下物化视图：

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

此目标表仅在新记录插入 `wikistat` 表时 populates，因此我们需要做一些 [回填](/docs/data-modeling/backfilling)。

最简单的方法是使用 [`INSERT INTO SELECT`](/docs/sql-reference/statements/insert-into#inserting-the-results-of-select) 语句直接插入到物化视图的目标表 [使用](https://github.com/ClickHouse/examples/tree/main/ClickHouse_vs_ElasticSearch/DataAnalytics#variant-1---directly-inserting-into-the-target-table-by-using-the-materialized-views-transformation-query) 视图的 SELECT 查询（转换）：

```sql
INSERT INTO wikistat_top
SELECT
    path,
    toStartOfMonth(time) AS month,
    sum(hits) AS hits
FROM wikistat
GROUP BY path, month;
```

根据原始数据集的基数（我们有 10 亿行！），这可能是一个内存密集型的方法。或者，您可以使用一种需要最小内存的变体：

* 创建一个 Null 表引擎的临时表
* 将正常使用的物化视图的副本连接到该临时表
* 使用 INSERT INTO SELECT 查询，将所有数据从原始数据集复制到该临时表中
* 删除临时表和临时物化视图。

通过这种方法，原始数据集的行按块复制到临时表中（该表不存储这些行的任何内容），并且对于每个行块，计算出一个部分状态并写入目标表，其中这些状态在后台逐渐合并。


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

接下来，我们将创建一个物化视图，以便从 `wikistat_backfill` 中读取并写入 `wikistat_top`


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

最后，我们将从初始的 `wikistat` 表中填充 `wikistat_backfill`：

```sql
INSERT INTO wikistat_backfill
SELECT * 
FROM wikistat;
```

一旦该查询完成，我们可以删除回填表和物化视图：

```sql
DROP VIEW wikistat_backfill_top_mv;
DROP TABLE wikistat_backfill;
```

现在我们可以查询物化视图，而不是原始表：


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


我们的性能提升显著。 
之前计算该查询的结果需要刚刚超过 2 秒，而现在只需 4 毫秒。
