---
slug: /migrations/postgresql/rewriting-queries
title: 重写 PostgreSQL 查询
keywords: ['postgres', 'postgresql', '重写查询', '重写查询']
---


# 在 ClickHouse 中重写 PostgreSQL 查询

> 这是关于从 PostgreSQL 迁移到 ClickHouse 指南的 **第 4 部分**。该内容可以视为入门指南，旨在帮助用户部署一个初步功能性系统，遵循 ClickHouse 的最佳实践。它避免了复杂的主题，不能产生完全优化的模式；而是为用户构建生产系统并以此为基础进行学习提供了一个坚实的基础。

以下提供了比较 PostgreSQL 和 ClickHouse 的示例查询。此列表旨在演示如何利用 ClickHouse 的功能显著简化查询。这些查询在大多数情况下在 ClickHouse 中执行也更快。这里的示例使用了完整的 [Stack Overflow 数据集](/getting-started/example-datasets/stackoverflow)（截至 2024 年 4 月）在 PostgreSQL 和 ClickHouse 中的等效资源（8 核心，32GiB RAM）。

> 此处的计数可能略有不同，因为 Postgres 数据仅包含满足外键引用完整性的行。ClickHouse 不强加此类约束，从而具有完整的数据集，例如包含匿名用户。

用户（提问超过 10 个）收到最多查看数：

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
│ Joan Venge          	│	25520387 │
│ Ray Vega            	│	21576470 │
│ anon                	│	19814224 │
│ Tim                 	│	19028260 │
│ John                	│	17638812 │
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

	ownerdisplayname 	| total_views
-------------------------+-------------
 Joan Venge          	|	25520387
 Ray Vega            	|	21576470
 Tim                 	|	18283579
 J. Pablo Fern&#225;ndez |	12446818
 Matt                	|	12298764

Time: 107620.508 ms (01:47.621)
```

哪些 `tags` 接受的 `views` 最多：

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
│ python 	│ 8175132834 │
│ java   	│ 7258379211 │
│ c#     	│ 5476932513 │
│ android	│ 4258320338 │
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

	tags	|   views
------------+------------
 javascript | 7974880378
 python 	| 7972340763
 java   	| 7064073461
 c#     	| 5308656277
 android	| 4186216900
(5 rows)

Time: 112508.083 ms (01:52.508)
```

**聚合函数**

用户应在哪儿可能利用 ClickHouse 聚合函数。下面我们展示了使用 [argMax](/sql-reference/aggregate-functions/reference/argmax) 函数计算每年的最受欢迎问题。

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
Year:                	2008
MostViewedQuestionTitle: How to find the index for a given item in a list?
MaxViewCount:        	6316987

Row 2:
──────
Year:                	2009
MostViewedQuestionTitle: How do I undo the most recent local commits in Git?
MaxViewCount:        	13962748

...

Row 16:
───────
Year:                	2023
MostViewedQuestionTitle: How do I solve "error: externally-managed-environment" every time I use pip 3?
MaxViewCount:        	506822

Row 17:
───────
Year:                	2024
MostViewedQuestionTitle: Warning "Third-party cookie will be blocked. Learn more in the Issues tab"
MaxViewCount:        	66975

17 rows in set. Elapsed: 0.677 sec. Processed 24.37 million rows, 1.86 GB (36.01 million rows/s., 2.75 GB/s.)
Peak memory usage: 554.31 MiB.
```

这比等效的 Postgres 查询简单得多（且更快）：

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
 year |                                            	mostviewedquestiontitle                                            	| maxviewcount
------+-----------------------------------------------------------------------------------------------------------------------+--------------
 2008 | How to find the index for a given item in a list?                                                                 	|  	6316987
 2009 | How do I undo the most recent local commits in Git?                                                               	| 	13962748

...

 2023 | How do I solve "error: externally-managed-environment" every time I use pip 3?                                    	|   	506822
 2024 | Warning "Third-party cookie will be blocked. Learn more in the Issues tab"                                        	|    	66975
(17 rows)

Time: 125822.015 ms (02:05.822)
```

**条件和数组**

条件和数组函数使查询显著简化。以下查询计算了 2022 年到 2023 年标签（超过 10000 次出现）的最大百分比增长。请注意，以下 ClickHouse 查询得益于条件、数组函数和在 HAVING 和 SELECT 子句中重用别名而显得简洁。

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
│ next.js 	│  	13788 │  	10520 │   31.06463878326996 │
│ spring-boot │  	16573 │  	17721 │  -6.478189718413183 │
│ .net    	│  	11458 │  	12968 │ -11.644046884639112 │
│ azure   	│  	11996 │  	14049 │ -14.613139725247349 │
│ docker  	│  	13885 │  	16877 │  -17.72826924216389 │
└─────────────┴────────────┴────────────┴─────────────────────┘

5 rows in set. Elapsed: 0.247 sec. Processed 5.08 million rows, 155.73 MB (20.58 million rows/s., 630.61 MB/s.)
Peak memory usage: 403.04 MiB.
```

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

 	tag 	| count_2023 | count_2022 |   percent_change
-------------+------------+------------+---------------------
 next.js 	|  	13712 |  	10370 |   32.22757955641273
 spring-boot |  	16482 |  	17474 |  -5.677005837243905
 .net    	|  	11376 |  	12750 | -10.776470588235295
 azure   	|  	11938 |  	13966 | -14.520979521695546
 docker  	|  	13832 |  	16701 | -17.178612059158134
(5 rows)

Time: 116750.131 ms (01:56.750)
```

这总结了我们对于从 Postgres 迁移到 ClickHouse 的基本指南。我们建议从 Postgres 迁移的用户阅读 [ClickHouse 数据建模指南](/data-modeling/schema-design)，以了解更多关于 ClickHouse 的高级功能。
