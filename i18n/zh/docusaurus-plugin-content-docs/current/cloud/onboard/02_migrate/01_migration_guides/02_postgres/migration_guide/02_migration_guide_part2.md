---
slug: /migrations/postgresql/rewriting-queries
title: '重写 PostgreSQL 查询'
keywords: ['postgres', 'postgresql', 'rewriting queries']
description: '从 PostgreSQL 迁移到 ClickHouse 指南的第 2 部分'
sidebar_label: '第 2 部分'
doc_type: 'guide'
---

> 本文是从 PostgreSQL 迁移到 ClickHouse 指南的**第 2 部分**。通过一个实际示例，演示如何采用实时复制（CDC）方式高效完成迁移。文中介绍的许多概念同样适用于从 PostgreSQL 到 ClickHouse 的手动批量数据迁移。

你在 PostgreSQL 部署中的大多数 SQL 查询在 ClickHouse 中通常无需修改即可运行，并且往往能以更快的速度执行。



## 使用 CDC 进行去重 {#deduplication-cdc}

在使用 CDC 进行实时复制时,请注意更新和删除操作可能会产生重复行。为了处理这个问题,您可以使用视图和可刷新物化视图等技术。

请参阅此[指南](/integrations/clickpipes/postgres/deduplication#query-like-with-postgres),了解如何在使用 CDC 进行实时复制迁移时,以最小代价将应用程序从 PostgreSQL 迁移到 ClickHouse。


## 在 ClickHouse 中优化查询 {#optimize-queries-in-clickhouse}

虽然可以在最少查询重写的情况下进行迁移,但建议充分利用 ClickHouse 的特性来显著简化查询并进一步提升查询性能。

这里的示例涵盖了常见的查询模式,并展示了如何使用 ClickHouse 对其进行优化。示例在 PostgreSQL 和 ClickHouse 的等效资源(8 核,32GiB 内存)上使用完整的 [Stack Overflow 数据集](/getting-started/example-datasets/stackoverflow)(截至 2024 年 4 月)。

> 为简单起见,以下查询省略了数据去重技术的使用。

> 这里的计数会略有不同,因为 Postgres 数据仅包含满足外键引用完整性的行。ClickHouse 不施加此类约束,因此拥有完整的数据集,例如包括匿名用户。

获得最多浏览量的用户(提出超过 10 个问题):

```sql
-- ClickHouse
SELECT OwnerDisplayName, sum(ViewCount) AS total_views
FROM stackoverflow.posts
WHERE (PostTypeId = 'Question') AND (OwnerDisplayName != '')
GROUP BY OwnerDisplayName
HAVING count() > 10
ORDER BY total_views DESC
LIMIT 5

┌─OwnerDisplayName────────┬─total_views─┐
│ Joan Venge            │       25520387 │
│ Ray Vega              │       21576470 │
│ anon                  │       19814224 │
│ Tim                   │       19028260 │
│ John                  │       17638812 │
└─────────────────────────┴─────────────┘

5 rows in set. Elapsed: 0.360 sec. Processed 24.37 million rows, 140.45 MB (67.73 million rows/s., 390.38 MB/s.)
Peak memory usage: 510.71 MiB.
```

```sql
--Postgres
SELECT OwnerDisplayName, SUM(ViewCount) AS total_views
FROM public.posts
WHERE (PostTypeId = 1) AND (OwnerDisplayName != '')
GROUP BY OwnerDisplayName
HAVING COUNT(*) > 10
ORDER BY total_views DESC
LIMIT 5;

        ownerdisplayname        | total_views
-------------------------+-------------
 Joan Venge             |       25520387
 Ray Vega               |       21576470
 Tim                    |       18283579
 J. Pablo Fern&#225;ndez |      12446818
 Matt                   |       12298764

Time: 107620.508 ms (01:47.621)
```

哪些 `tags` 获得最多的 `views`:

```sql
--ClickHouse
SELECT arrayJoin(arrayFilter(t -> (t != ''), splitByChar('|', Tags))) AS tags,
        sum(ViewCount) AS views
FROM posts
GROUP BY tags
ORDER BY views DESC
LIMIT 5

┌─tags───────┬──────views─┐
│ javascript │ 8190916894 │
│ python        │ 8175132834 │
│ java          │ 7258379211 │
│ c#            │ 5476932513 │
│ android       │ 4258320338 │
└────────────┴────────────┘

5 rows in set. Elapsed: 0.908 sec. Processed 59.82 million rows, 1.45 GB (65.87 million rows/s., 1.59 GB/s.)
```

```sql
--Postgres
WITH tags_exploded AS (
        SELECT
        unnest(string_to_array(Tags, '|')) AS tag,
        ViewCount
        FROM public.posts
),
filtered_tags AS (
        SELECT
        tag,
        ViewCount
        FROM tags_exploded
        WHERE tag <> ''
)
SELECT tag AS tags,
        SUM(ViewCount) AS views
FROM filtered_tags
GROUP BY tag
ORDER BY views DESC
LIMIT 5;

        tags    |   views
------------+------------
 javascript | 7974880378
 python         | 7972340763
 java           | 7064073461
 c#             | 5308656277
 android        | 4186216900
(5 rows)

Time: 112508.083 ms (01:52.508)
```

**聚合函数**

在可能的情况下,用户应充分利用 ClickHouse 的聚合函数。下面我们展示如何使用 [argMax](/sql-reference/aggregate-functions/reference/argmax) 函数来计算每年浏览量最高的问题。


```sql
--ClickHouse
SELECT  toYear(CreationDate) AS Year,
        argMax(Title, ViewCount) AS MostViewedQuestionTitle,
        max(ViewCount) AS MaxViewCount
FROM stackoverflow.posts
WHERE PostTypeId = 'Question'
GROUP BY Year
ORDER BY Year ASC
FORMAT Vertical
Row 1:
──────
Year:                   2008
MostViewedQuestionTitle: 如何查找列表中给定项的索引?
MaxViewCount:           6316987

Row 2:
──────
Year:                   2009
MostViewedQuestionTitle: 如何撤销 Git 中最近的本地提交?
MaxViewCount:           13962748

...

Row 16:
───────
Year:                   2023
MostViewedQuestionTitle: 每次使用 pip 3 时如何解决 "error: externally-managed-environment" 错误?
MaxViewCount:           506822

Row 17:
───────
Year:                   2024
MostViewedQuestionTitle: 警告 "第三方 cookie 将被阻止。在 Issues 选项卡中了解更多信息"
MaxViewCount:           66975

返回 17 行。耗时:0.677 秒。处理了 2437 万行,1.86 GB(每秒 3601 万行,2.75 GB/s.)
峰值内存使用量:554.31 MiB。
```

这比等价的 Postgres 查询要简单得多（而且更快）：

```sql
--Postgres
WITH yearly_views AS (
        SELECT
        EXTRACT(YEAR FROM CreationDate) AS Year,
        Title,
        ViewCount,
        ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM CreationDate) ORDER BY ViewCount DESC) AS rn
        FROM public.posts
        WHERE PostTypeId = 1
)
SELECT
        Year,
        Title AS MostViewedQuestionTitle,
        ViewCount AS MaxViewCount
FROM yearly_views
WHERE rn = 1
ORDER BY Year;
 year |                                                 mostviewedquestiontitle                                                 | maxviewcount
------+-----------------------------------------------------------------------------------------------------------------------+--------------
 2008 | 如何在列表中查找给定项的索引?                                                                       |       6316987
 2009 | 如何撤销 Git 中最近的本地提交?                                                                     |       13962748

...

 2023 | 如何解决每次使用 pip 3 时出现的"error: externally-managed-environment"错误?                                          |       506822
 2024 | 警告"第三方 Cookie 将被阻止。在问题选项卡中了解更多信息"                                              |       66975
(17 行)

时间:125822.015 ms (02:05.822)
```

**条件语句与数组**

条件函数和数组函数可以显著简化查询。下面的查询会计算那些在 2022 年到 2023 年期间出现次数超过 10000 次、且同比增幅百分比最大的标签。请注意，得益于条件函数、数组函数，以及在 `HAVING` 和 `SELECT` 子句中重用别名的能力，下面的 ClickHouse 查询非常简洁。

```sql
--ClickHouse
SELECT  arrayJoin(arrayFilter(t -> (t != ''), splitByChar('|', Tags))) AS tag,
        countIf(toYear(CreationDate) = 2023) AS count_2023,
        countIf(toYear(CreationDate) = 2022) AS count_2022,
        ((count_2023 - count_2022) / count_2022) * 100 AS percent_change
FROM stackoverflow.posts
WHERE toYear(CreationDate) IN (2022, 2023)
GROUP BY tag
HAVING (count_2022 > 10000) AND (count_2023 > 10000)
ORDER BY percent_change DESC
LIMIT 5

┌─tag─────────┬─count_2023─┬─count_2022─┬──────percent_change─┐
│ next.js       │       13788 │         10520 │   31.06463878326996 │
│ spring-boot │         16573 │         17721 │  -6.478189718413183 │
│ .net          │       11458 │         12968 │ -11.644046884639112 │
│ azure         │       11996 │         14049 │ -14.613139725247349 │
│ docker        │       13885 │         16877 │  -17.72826924216389 │
└─────────────┴────────────┴────────────┴─────────────────────┘
```


5 行结果。耗时：0.247 秒。已处理 508 万行，155.73 MB（每秒 2,058 万行，630.61 MB/秒）。
峰值内存使用：403.04 MiB。

````

```sql
--Postgres
SELECT
        tag,
        SUM(CASE WHEN year = 2023 THEN count ELSE 0 END) AS count_2023,
        SUM(CASE WHEN year = 2022 THEN count ELSE 0 END) AS count_2022,
        ((SUM(CASE WHEN year = 2023 THEN count ELSE 0 END) - SUM(CASE WHEN year = 2022 THEN count ELSE 0 END))
        / SUM(CASE WHEN year = 2022 THEN count ELSE 0 END)::float) * 100 AS percent_change
FROM (
        SELECT
        unnest(string_to_array(Tags, '|')) AS tag,
        EXTRACT(YEAR FROM CreationDate) AS year,
        COUNT(*) AS count
        FROM public.posts
        WHERE EXTRACT(YEAR FROM CreationDate) IN (2022, 2023)
        AND Tags <> ''
        GROUP BY tag, year
) AS yearly_counts
GROUP BY tag
HAVING SUM(CASE WHEN year = 2022 THEN count ELSE 0 END) > 10000
   AND SUM(CASE WHEN year = 2023 THEN count ELSE 0 END) > 10000
ORDER BY percent_change DESC
LIMIT 5;

        tag     | count_2023 | count_2022 |   percent_change
-------------+------------+------------+---------------------
 next.js        |       13712 |         10370 |   32.22757955641273
 spring-boot |          16482 |         17474 |  -5.677005837243905
 .net           |       11376 |         12750 | -10.776470588235295
 azure          |       11938 |         13966 | -14.520979521695546
 docker         |       13832 |         16701 | -17.178612059158134
(5 rows)

Time: 116750.131 ms (01:56.750)
````

[点击此处查看第 3 篇](/migrations/postgresql/data-modeling-techniques)
