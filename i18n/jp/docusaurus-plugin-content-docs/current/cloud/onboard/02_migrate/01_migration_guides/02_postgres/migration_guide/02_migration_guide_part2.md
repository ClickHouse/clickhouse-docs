---
slug: /migrations/postgresql/rewriting-queries
title: 'PostgreSQL クエリの書き換え'
keywords: ['postgres', 'postgresql', 'rewriting queries']
description: 'PostgreSQL から ClickHouse への移行ガイドのパート 2'
sidebar_label: 'パート 2'
doc_type: 'guide'
---

> これは PostgreSQL から ClickHouse への移行ガイドの **パート 2** です。実践的な例を用いて、リアルタイムレプリケーション (CDC) アプローチにより、どのように効率的に移行を行うかを示します。ここで扱う多くの概念は、PostgreSQL から ClickHouse への手動によるバルクデータ転送にも適用できます。

PostgreSQL 環境で使用しているほとんどの SQL クエリは、ClickHouse でも変更なしで実行でき、かつより高速に動作する可能性があります。



## CDCを使用した重複排除 {#deduplication-cdc}

CDCを用いたリアルタイムレプリケーションを使用する際は、更新や削除によって重複行が発生する可能性があることに留意してください。これに対処するには、ビューやリフレッシュ可能なマテリアライズドビューを活用した手法を使用できます。

CDCを用いたリアルタイムレプリケーションで移行する際に、PostgreSQLからClickHouseへアプリケーションを円滑に移行する方法については、この[ガイド](/integrations/clickpipes/postgres/deduplication#query-like-with-postgres)を参照してください。


## ClickHouseでクエリを最適化する {#optimize-queries-in-clickhouse}

最小限のクエリ書き換えで移行することは可能ですが、ClickHouseの機能を活用してクエリを大幅に簡素化し、クエリパフォーマンスをさらに向上させることを推奨します。

ここでの例は、一般的なクエリパターンを取り上げ、ClickHouseでそれらを最適化する方法を示しています。これらの例では、PostgreSQLとClickHouseの同等のリソース(8コア、32GiB RAM)上で、完全な[Stack Overflowデータセット](/getting-started/example-datasets/stackoverflow)(2024年4月まで)を使用しています。

> 簡潔にするため、以下のクエリではデータの重複排除技術の使用を省略しています。

> ここでのカウントは若干異なります。Postgresのデータは外部キーの参照整合性を満たす行のみを含んでいるためです。ClickHouseはそのような制約を課さないため、完全なデータセット(例:匿名ユーザーを含む)を保持しています。

最も多くの閲覧数を獲得しているユーザー(10件以上の質問を投稿):

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

5行を取得しました。経過時間:0.360秒。処理行数:2437万行、140.45 MB(6773万行/秒、390.38 MB/秒)
ピークメモリ使用量:510.71 MiB。
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

時間:107620.508ミリ秒(01:47.621)
```

最も多くの`閲覧数`を獲得している`タグ`:

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

5行を取得しました。経過時間:0.908秒。処理行数:5982万行、1.45 GB(6587万行/秒、1.59 GB/秒)
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

時間:112508.083ミリ秒(01:52.508)
```

**集約関数**

可能な限り、ユーザーはClickHouseの集約関数を活用すべきです。以下では、[argMax](/sql-reference/aggregate-functions/reference/argmax)関数を使用して、各年で最も閲覧された質問を計算する方法を示します。


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
行 1:
──────
Year:                   2008
MostViewedQuestionTitle: リスト内の指定されたアイテムのインデックスを見つける方法は？
MaxViewCount:           6316987

行 2:
──────
Year:                   2009
MostViewedQuestionTitle: Gitで最新のローカルコミットを取り消すにはどうすればよいですか？
MaxViewCount:           13962748

...

行 16:
───────
Year:                   2023
MostViewedQuestionTitle: pip 3を使用するたびに「error: externally-managed-environment」を解決するにはどうすればよいですか？
MaxViewCount:           506822

行 17:
───────
Year:                   2024
MostViewedQuestionTitle: 警告「サードパーティのCookieがブロックされます。詳細は問題タブをご覧ください」
MaxViewCount:           66975

17行のセット。経過時間: 0.677秒。処理された行数: 2437万行、1.86 GB（3601万行/秒、2.75 GB/秒）
ピークメモリ使用量: 554.31 MiB。
```

これは、同等の Postgres クエリと比べて、はるかにシンプル（かつ高速）です。

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
 2008 | リスト内の指定された項目のインデックスを見つける方法は?                                                                       |       6316987
 2009 | Gitで最新のローカルコミットを取り消す方法は?                                                                                   |       13962748

...

 2023 | pip 3を使用するたびに「error: externally-managed-environment」を解決する方法は?                                                  |       506822
 2024 | 警告「サードパーティCookieがブロックされます。詳細については問題タブを参照してください」                                                    |       66975
(17行)

時間: 125822.015 ms (02:05.822)
```

**条件式と配列**

条件式および配列関数を使うと、クエリを大幅に簡潔に記述できます。次のクエリは、2022 年から 2023 年にかけて出現回数が 10,000 回を超えるタグのうち、増加率が最大のものを算出します。以下の ClickHouse クエリが、条件式や配列関数、そして HAVING 句および SELECT 句でエイリアスを再利用できる機能のおかげで、いかに簡潔になっているかに注目してください。

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


5 行が結果セットにあります。経過時間: 0.247 秒。処理済み 5.08 百万行、155.73 MB（20.58 百万行/秒、630.61 MB/秒）。
ピークメモリ使用量: 403.04 MiB.

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

[パート3はこちら](/migrations/postgresql/data-modeling-techniques)
