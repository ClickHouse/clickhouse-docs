---
slug: /migrations/postgresql/rewriting-queries
title: 'PostgreSQL クエリの書き換え'
keywords: ['postgres', 'postgresql', 'rewriting queries']
description: 'PostgreSQL から ClickHouse への移行ガイドのパート 2'
sidebar_label: 'パート 2'
doc_type: 'guide'
---

> これは PostgreSQL から ClickHouse への移行ガイドの **パート 2** です。実践的な例を用いて、リアルタイムレプリケーション（CDC）アプローチにより、どのように効率的に移行を行うかを示します。ここで解説する多くの概念は、PostgreSQL から ClickHouse への手動による一括データ転送にも適用できます。

PostgreSQL 環境で使用しているほとんどの SQL クエリは、変更なしで ClickHouse 上でも実行でき、多くの場合より高速に動作します。



## CDC を使用した重複排除 {#deduplication-cdc}

リアルタイムレプリケーションに CDC を用いる場合、更新や削除によって行が重複する可能性があることに注意してください。これに対処するために、ビューおよび Refreshable マテリアライズドビューを利用する手法が使えます。

CDC を利用したリアルタイムレプリケーションで PostgreSQL から ClickHouse へアプリケーションをできるだけスムーズに移行する方法については、この[ガイド](/integrations/clickpipes/postgres/deduplication#query-like-with-postgres)を参照してください。



## ClickHouse でクエリを最適化する

最小限のクエリ書き換えで移行することも可能ですが、クエリを大幅に単純化し、さらにクエリパフォーマンスを向上させるために、ClickHouse の機能を活用することを推奨します。

ここでの例では一般的なクエリパターンを取り上げ、ClickHouse を用いてどのように最適化できるかを示します。これらは、PostgreSQL と ClickHouse で同等のリソース（8 コア、32GiB RAM）上に用意した [Stack Overflow データセット](/getting-started/example-datasets/stackoverflow)（2024 年 4 月まで）全体を使用しています。

> 説明を簡潔にするため、以下のクエリではデータの重複排除のための手法は省略しています。

> ここでの件数はわずかに異なります。これは、Postgres 側のデータには外部キーの参照整合性を満たす行のみが含まれている一方で、ClickHouse にはそのような制約がなく、たとえば匿名ユーザーを含む完全なデータセットが格納されているためです。

最も多く閲覧されているユーザー（質問数が 10 件を超えるユーザー）:

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

5行を返しました。経過時間: 0.360秒。処理: 2437万行、140.45 MB (6773万行/秒、390.38 MB/秒)
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

        ownerdisplayname        | total_views
-------------------------+-------------
 Joan Venge             |       25520387
 Ray Vega               |       21576470
 Tim                    |       18283579
 J. Pablo Fern&#225;ndez |      12446818
 Matt                   |       12298764

Time: 107620.508 ms (01:47.621)
```

どの`tags`が最も多くの`views`を獲得しているか:

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

**集約関数**

可能であれば、ClickHouse の集約関数を活用してください。以下では、各年でもっとも多く閲覧された質問を求めるために [argMax](/sql-reference/aggregate-functions/reference/argmax) 関数を使用する例を示します。


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

これは、同等の Postgres クエリよりも大幅にシンプル（かつ高速）です：

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
 2008 | リスト内の特定の項目のインデックスを見つける方法は？                                                                       |       6316987
 2009 | Gitで最新のローカルコミットを取り消す方法は？                                                                     |       13962748

...

 2023 | pip 3を使用するたびに「error: externally-managed-environment」を解決する方法は？                                          |       506822
 2024 | 警告「サードパーティCookieがブロックされます。詳細は問題タブを参照してください」                                              |       66975
(17行)

時間: 125822.015 ms (02:05.822)
```

**条件式と配列**

条件関数と配列関数を使うと、クエリを大幅に簡潔に記述できます。次のクエリは、2022 年から 2023 年にかけて出現回数が 10,000 回を超えるタグのうち、増加率が最も大きいものを計算します。条件関数や配列関数、そして HAVING 句や SELECT 句内でエイリアスを再利用できるおかげで、次の ClickHouse クエリがいかに簡潔になっているかに注目してください。

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


5 行が返されました。経過時間: 0.247 秒。処理済み 5.08 百万行、155.73 MB (20.58 百万行/秒、630.61 MB/秒)。
ピークメモリ使用量: 403.04 MiB。

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
