---
slug: /migrations/postgresql/rewriting-queries
title: PostgreSQLクエリの書き換え
keywords: [postgres, postgresql, クエリの書き換え, クエリの再構築]
---

# ClickHouseにおけるPostgreSQLクエリの書き換え

> これはPostgreSQLからClickHouseへの移行に関するガイドの**パート4**です。この内容は導入的なものであり、ユーザーがClickHouseのベストプラクティスに従った初期の機能的なシステムを展開するのを助けることを目的としています。複雑なトピックは避け、完全に最適化されたスキーマを構築するものではなく、ユーザーがプロダクションシステムを構築し、学習の基盤を築くためのしっかりとした基礎を提供します。

以下は、PostgreSQLとClickHouseを比較したクエリの例を示しています。このリストは、ClickHouseの機能を利用してクエリを大幅に簡素化する方法を示すことを目的としています。これらのクエリは、大抵の場合、ClickHouseでより早く実行されることもあります。ここでの例は、PostgreSQLとClickHouseにおける同等のリソース（8コア、32GiB RAM）を使用した完全な[Stack Overflowデータセット](/getting-started/example-datasets/stackoverflow)（2024年4月まで）を利用しています。

> ここでのカウントは、Postgresデータが外部キーの参照整合性を満たす行のみを含むため、若干の違いがあります。ClickHouseはそのような制約を課さないため、完全なデータセット（例：匿名ユーザーを含む）を持っています。

質問を10件以上投稿したユーザーのビュー数が最も多いユーザー：

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

5行のセット。経過時間: 0.360 秒。24.37百万行を処理、140.45 MB (67.73百万行/s., 390.38 MB/s.)
ピークメモリ使用量: 510.71 MiB.
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

時間: 107620.508 ms (01:47.621)
```

最も多くの`ビュー`を取得する`タグ`：

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

5行のセット。経過時間: 0.908 秒。59.82百万行を処理、1.45 GB (65.87百万行/s., 1.59 GB/s.)
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
(5行)

時間: 112508.083 ms (01:52.508)
```

**集約関数**

可能な限り、ユーザーはClickHouseの集約関数を利用すべきです。以下に、最もビュー数が多い質問を年ごとに計算するために[argMax](/sql-reference/aggregate-functions/reference/argmax)関数を使用した例を示します。

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

17行のセット。経過時間: 0.677 秒。24.37百万行を処理、1.86 GB (36.01百万行/s., 2.75 GB/s.)
ピークメモリ使用量: 554.31 MiB.
```

これは、同等のPostgresクエリよりも大幅に簡単（かつ早い）です：

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
(17行)

時間: 125822.015 ms (02:05.822)
```

**条件文と配列**

条件文と配列関数を使用すると、クエリを大幅に簡素化できます。以下のクエリは、2022年から2023年にかけての発生件数が最も多いタグ（発生件数が10000以上）のパーセンテージ変化を計算します。以下のClickHouseクエリは条件文、配列関数、およびHAVINGおよびSELECT句でエイリアスを再利用できる能力のおかげで簡潔です。

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

5行のセット。経過時間: 0.247 秒。5.08百万行を処理、155.73 MB (20.58百万行/s., 630.61 MB/s.)
ピークメモリ使用量: 403.04 MiB.
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
(5行)

時間: 116750.131 ms (01:56.750)
```

これで、PostgresからClickHouseへの移行を行うユーザーに向けた基本的なガイドが終了します。Postgresから移行するユーザーには、[ClickHouseでのデータモデリングに関するガイド](/data-modeling/schema-design)を読むことをお勧めします。これにより、ClickHouseの高度な機能についてさらに学ぶことができます。
