---
slug: /en/migrations/postgresql/rewriting-queries
title: Rewriting PostgreSQL Queries
keywords: [postgres, postgresql, rewriting queries, rewrite query]
---

# Rewriting PostgreSQL queries in ClickHouse

> This is **Part 4** of a guide on migrating from PostgreSQL to ClickHouse. This content can be considered introductory, with the aim of helping users deploy an initial functional system that adheres to ClickHouse best practices. It avoids complex topics and will not result in a fully optimized schema; rather, it provides a solid foundation for users to build a production system and base their learning.

The following provides example queries comparing PostgreSQL to ClickHouse. This list aims to demonstrate how to exploit ClickHouse features to significantly simplify queries. These queries will, in most cases, also execute faster in ClickHouse. The examples here use the full [Stack Overflow dataset](https://clickhouse.com/docs/en/getting-started/example-datasets/stackoverflow) (up to April 2024) on equivalent resources in PostgreSQL and ClickHouse (8 cores, 32GiB RAM).

> Counts here will slightly differ as the Postgres data only contains rows which satisfy the referential integrity of the foreign keys. ClickHouse imposes no such constraints and thus has the full dataset e.g. inc. anon users.

Users (with more than 10 questions) which receive the most views:

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
LIMIT 10;

	ownerdisplayname 	| total_views
-------------------------+-------------
 Joan Venge          	|	25520387
 Ray Vega            	|	21576470
 Tim                 	|	18283579
 J. Pablo Fern&#225;ndez |	12446818
 Matt                	|	12298764

Time: 107620.508 ms (01:47.621)
```

Which `tags` receive the most `views`:

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

**Aggregate functions**

Where possible, users should exploit ClickHouse aggregate functions. Below we show the use of the [argMax](/en/sql-reference/aggregate-functions/reference/argmax) function to compute the most viewed question of each year.

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



This is significantly simpler (and faster) than the equivalent Postgres query:

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

**Conditionals and Arrays**

Conditional and array functions make queries significantly simpler. The following query computes the tags (with more than 10000 occurrences) with the largest percentage increase from 2022 to 2023. Note how the following ClickHouse query is succinct thanks to the conditionals, array functions, and ability to reuse aliases in the HAVING and SELECT clauses.

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

This concludes our basic guide for users migrating from Postgres to ClickHouse. We recommend users migrating from Postgres read [the guide for modeling data in ClickHouse](/en/data-modeling/schema-design) to learn more about advanced ClickHouse features.
