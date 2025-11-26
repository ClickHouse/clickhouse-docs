---
slug: /migrations/postgresql/rewriting-queries
title: '重写 PostgreSQL 查询'
keywords: ['postgres', 'postgresql', 'rewriting queries']
description: '从 PostgreSQL 迁移到 ClickHouse 指南的第 2 部分'
sidebar_label: '第 2 部分'
doc_type: 'guide'
---

> 这是从 PostgreSQL 迁移到 ClickHouse 指南的**第 2 部分**。通过一个实际示例，本文演示了如何采用实时复制（CDC，变更数据捕获）方式高效完成迁移。文中涉及的许多概念同样适用于从 PostgreSQL 到 ClickHouse 的手动批量数据传输。

在大多数情况下，现有 PostgreSQL 环境中的 SQL 查询无需修改即可在 ClickHouse 上运行，并且通常会执行得更快。



## 使用 CDC 进行去重 {#deduplication-cdc}

在使用基于 CDC（变更数据捕获）的实时复制时，需要注意更新和删除操作可能会导致重复行。为解决这一问题，可以使用基于视图和可刷新物化视图的去重方案。

请参考此[指南](/integrations/clickpipes/postgres/deduplication#query-like-with-postgres)，了解在使用基于 CDC 的实时复制时，如何以尽可能小的改动将应用程序从 PostgreSQL 迁移到 ClickHouse。



## 在 ClickHouse 中优化查询

虽然可以在对查询做最少改写的情况下完成迁移，但建议充分利用 ClickHouse 的特性，以显著简化查询并进一步提升查询性能。

这里的示例涵盖了常见的查询模式，并展示了如何在 ClickHouse 中对它们进行优化。示例使用了 PostgreSQL 和 ClickHouse 上等价资源（8 核 CPU、32GiB 内存）的完整 [Stack Overflow 数据集](/getting-started/example-datasets/stackoverflow)（截至 2024 年 4 月）。

> 为了简化示例，下面的查询省略了数据去重技术。

> 这里的计数结果会略有不同，因为 Postgres 数据只包含满足外键参照完整性的行。ClickHouse 不施加此类约束，因此拥有完整的数据集，例如包括匿名用户。

获得最多浏览量的用户（问题数超过 10 个）：

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

返回 5 行。用时:0.360 秒。已处理 2437 万行,140.45 MB(6773 万行/秒,390.38 MB/秒)。
峰值内存使用量:510.71 MiB。
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

耗时:107620.508 毫秒 (01:47.621)
```

哪些 `tags` 的 `views` 最高：

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

在条件允许的情况下，用户应尽可能利用 ClickHouse 的聚合函数。下面我们演示如何使用 [argMax](/sql-reference/aggregate-functions/reference/argmax) 函数来计算每一年浏览次数最多的问题。


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

这相比等价的 Postgres 查询，要简单得多且更快：

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
 2008 | 如何在列表中查找给定项的索引？                                                                       |       6316987
 2009 | 如何撤销 Git 中最近的本地提交？                                                                     |       13962748

...

 2023 | 每次使用 pip 3 时如何解决 "error: externally-managed-environment" 错误？                                          |       506822
 2024 | 警告 "第三方 cookie 将被阻止。在问题选项卡中了解更多信息"                                              |       66975
(17 rows)

Time: 125822.015 ms (02:05.822)
```

**条件和数组**

条件函数和数组函数可以显著简化查询。下面的查询用于计算从 2022 年到 2023 年，出现次数超过 10000 次且百分比增幅最大的标签。请注意，下面的 ClickHouse 查询之所以简洁，是因为使用了条件函数、数组函数，以及在 HAVING 和 SELECT 子句中重复使用别名的能力。

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


5 行结果。耗时：0.247 秒。已处理 508 万行、155.73 MB（2058 万行/秒，630.61 MB/秒）。
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
(5 行)

执行时间:116750.131 ms (01:56.750)
````

[点击此处查看第3部分](/migrations/postgresql/data-modeling-techniques)
