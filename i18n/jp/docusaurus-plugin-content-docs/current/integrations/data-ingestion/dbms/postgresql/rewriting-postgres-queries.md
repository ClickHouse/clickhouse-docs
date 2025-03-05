---
slug: /migrations/postgresql/rewriting-queries
title: PostgreSQLクエリの書き換え
keywords: [postgres, postgresql, クエリの書き換え, クエリ書き換え]
---


# ClickHouseにおけるPostgreSQLクエリの書き換え

> これはPostgreSQLからClickHouseへの移行に関するガイドの**第4部**です。この内容は入門的なもので、ユーザーがClickHouseのベストプラクティスに従った初期機能システムを展開する手助けをすることを目的としています。複雑なトピックは避けられており、完全に最適化されたスキーマには至りませんが、ユーザーが生産システムを構築し、学ぶための堅固な基盤を提供します。

以下はPostgreSQLとClickHouseを比較した例のクエリです。このリストは、ClickHouseの機能を利用してクエリを大幅に簡素化する方法を示すことを目的としています。これらのクエリは大抵の場合、ClickHouseでより速く実行されます。ここでの例は、PostgreSQLとClickHouseで同等のリソース（8コア、32GiB RAM）を持つフルな[Stack Overflowデータセット](/getting-started/example-datasets/stackoverflow)（2024年4月までのもの）を使用しています。

> ここでのカウントは、Postgresのデータが外部キーの参照整合性を満たす行のみを含んでいるため、わずかに異なります。ClickHouseにはそのような制約はなく、例えば無名ユーザーも含む全データセットを持ちます。

ユーザー（質問が10件以上ある）の中でビュー数が最も多いユーザー：

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

5行がセットに含まれています。経過時間: 0.360秒。24.37百万行を処理し、140.45MB（67.73百万行/秒、390.38MB/秒）。
ピークメモリ使用量: 510.71 MiB。
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

最も視聴される`tags`：

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

5行がセットに含まれています。経過時間: 0.908秒。59.82百万行を処理し、1.45 GB（65.87百万行/秒、1.59 GB/秒）。
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

可能な限り、ユーザーはClickHouseの集約関数を活用すべきです。以下に、各年の最も視聴された質問を計算するための[argMax](/sql-reference/aggregate-functions/reference/argmax)関数の使用を示します。

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

17行がセットに含まれています。経過時間: 0.677秒。24.37百万行を処理し、1.86 GB（36.01百万行/秒、2.75 GB/秒）。
ピークメモリ使用量: 554.31 MiB。
```

これは、同等のPostgresクエリよりも大幅に簡素化され（かつ速く）、速さも向上しています：

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

条件文および配列関数は、クエリを大幅に簡素化します。以下のクエリは、2022年から2023年にかけて変化率が最も大きい（10,000件以上出現した）タグを計算します。以下のClickHouseクエリは条件文、配列関数、HAVINGおよびSELECT句内でのエイリアス再利用により簡潔になっていることに注意してください。

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

5行がセットに含まれています。経過時間: 0.247秒。5.08百万行を処理し、155.73MB（20.58百万行/秒、630.61MB/秒）。
ピークメモリ使用量: 403.04 MiB。
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

これで、PostgresからClickHouseに移行するユーザーのための基本ガイドは終了です。Postgresから移行するユーザーは、ClickHouse内のデータモデリングに関する[ガイド](/data-modeling/schema-design)を読むことをお勧めします。より高度なClickHouseの機能について学ぶことができます。
