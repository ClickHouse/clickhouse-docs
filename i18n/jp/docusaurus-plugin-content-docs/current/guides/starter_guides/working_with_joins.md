---
title: 'ClickHouse における JOIN の使い方'
description: 'ClickHouse で JOIN を使用するための入門ガイド'
keywords: ['JOINs', 'SQL', 'INNER JOIN', 'OUTER JOIN', 'CROSS JOIN', 'SEMI JOIN', 'ANTI JOIN', 'ANY JOIN', 'ASOF JOIN']
sidebar_label: 'ClickHouse における JOIN の使い方'
slug: /guides/working-with-joins
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import imdb_schema from '@site/static/images/starter_guides/joins/imdb_schema.png';
import inner_join from '@site/static/images/starter_guides/joins/inner_join.png';
import outer_join from '@site/static/images/starter_guides/joins/outer_join.png';
import cross_join from '@site/static/images/starter_guides/joins/cross_join.png';
import semi_join from '@site/static/images/starter_guides/joins/semi_join.png';
import anti_join from '@site/static/images/starter_guides/joins/anti_join.png';
import any_join from '@site/static/images/starter_guides/joins/any_join.png';
import asof_join from '@site/static/images/starter_guides/joins/asof_join.png';
import asof_example from '@site/static/images/starter_guides/joins/asof_example.png';

ClickHouse は標準的な SQL の結合を完全にサポートしており、効率的なデータ分析が可能です。
このガイドでは、よく利用される代表的な結合の種類とその使い方を、ベン図と、[relational dataset repository](https://relational.fit.cvut.cz/dataset/IMDb) に由来する正規化済みの [IMDb](https://en.wikipedia.org/wiki/IMDb) データセットに対するクエリ例を用いて説明します。


## テストデータとリソース {#test-data-and-resources}

テーブルの作成とロード手順は[こちら](/integrations/dbt/guides)に記載されています。
テーブルをローカルで作成およびロードしたくない場合は、データセットを [playground](https://sql.clickhouse.com?query_id=AACTS8ZBT3G7SSGN8ZJBJY) から利用することもできます。

以下のサンプルデータセットから、次の 4 つのテーブルを使用します:

<Image img={imdb_schema} alt="IMDB スキーマ" />

これら 4 つのテーブル内のデータは、1 つまたは複数のジャンルを持つ映画を表しています。
映画内の役は俳優によって演じられます。

上記の図中の矢印は [外部キーから主キーへのリレーションシップ](https://en.wikipedia.org/wiki/Foreign_key) を表しています。例えば、`genres` テーブルの 1 行の `movie_id` カラムには、`movies` テーブルの 1 行の `id` の値が含まれます。

映画と俳優の間には [多対多のリレーションシップ](https://en.wikipedia.org/wiki/Many-to-many_(data_model)) があります。
この多対多のリレーションシップは、`roles` テーブルを使用して 2 つの [一対多のリレーションシップ](https://en.wikipedia.org/wiki/One-to-many_(data_model)) に正規化されています。
`roles` テーブルの各行には、`movies` テーブルおよび `actors` テーブルの `id` カラムの値が含まれます。

## ClickHouse でサポートされている結合の種類 {#join-types-supported-in-clickhouse}

ClickHouse は、次の結合の種類をサポートしています。

- [INNER JOIN](#inner-join)
- [OUTER JOIN](#left--right--full-outer-join)
- [CROSS JOIN](#cross-join)
- [SEMI JOIN](#left--right-semi-join)
- [ANTI JOIN](#left--right-anti-join)
- [ANY JOIN](#left--right--inner-any-join)
- [ASOF JOIN](#asof-join)

以降のセクションでは、上記の各 JOIN 種類ごとにサンプルクエリを示します。

## INNER JOIN {#inner-join}

`INNER JOIN` は、結合キーが一致する各行ペアごとに、左側のテーブルの行のカラム値と右側のテーブルの行のカラム値を組み合わせた結果を返します。
ある行に複数の一致がある場合は、それらの一致行がすべて返されます（つまり、結合キーが一致した行に対しては [cartesian product](https://en.wikipedia.org/wiki/Cartesian_product) が生成されます）。

<Image img={inner_join} alt="Inner Join" />

このクエリは、`movies` テーブルと `genres` テーブルを結合することで、各映画のジャンル（複数ある場合はすべて）を取得します。

```sql
SELECT
    m.name AS name,
    g.genre AS genre
FROM movies AS m
INNER JOIN genres AS g ON m.id = g.movie_id
ORDER BY
    m.year DESC,
    m.name ASC,
    g.genre ASC
LIMIT 10;
```

```response
┌─name───────────────────────────────────┬─genre─────┐
│ Harry Potter and the Half-Blood Prince │ Action    │
│ Harry Potter and the Half-Blood Prince │ Adventure │
│ Harry Potter and the Half-Blood Prince │ Family    │
│ Harry Potter and the Half-Blood Prince │ Fantasy   │
│ Harry Potter and the Half-Blood Prince │ Thriller  │
│ DragonBall Z                           │ Action    │
│ DragonBall Z                           │ Adventure │
│ DragonBall Z                           │ Comedy    │
│ DragonBall Z                           │ Fantasy   │
│ DragonBall Z                           │ Sci-Fi    │
└────────────────────────────────────────┴───────────┘
```

:::note
`INNER` キーワードは省略できます。
:::

以下の他の種類の結合を使用することで、`INNER JOIN` の挙動を拡張または変更できます。


## (LEFT / RIGHT / FULL) OUTER JOIN {#left--right--full-outer-join}

`LEFT OUTER JOIN` は `INNER JOIN` と同様に動作しますが、左側テーブルのうち結合相手が存在しない行に対しては、右側テーブルのカラムに [デフォルト値](/sql-reference/statements/create/table#default_values) を返します。

`RIGHT OUTER JOIN` クエリも同様で、右側テーブルのうち結合相手が存在しない行の値と、左側テーブルのカラムに対するデフォルト値をあわせて返します。

`FULL OUTER JOIN` クエリは `LEFT` と `RIGHT OUTER JOIN` を組み合わせたもので、左側および右側テーブルの結合相手が存在しない行の値と、それぞれに対応する右側および左側テーブルのカラムのデフォルト値をあわせて返します。

<Image img={outer_join} alt="Outer Join" />

:::note
ClickHouse は、デフォルト値の代わりに [NULL](/sql-reference/syntax/#null) を返すように[設定](/operations/settings/settings#join_use_nulls)できます（ただし、[パフォーマンス上の理由](/sql-reference/data-types/nullable/#storage-features)により、あまり推奨はされません）。
:::

次のクエリは、ジャンルを持たないすべての映画を検索します。`genres` テーブルに一致する行が存在しない `movies` テーブルのすべての行を取得し、その結果として、クエリ時に `movie_id` カラムにはデフォルト値 0 が設定されます。

```sql
SELECT m.name
FROM movies AS m
LEFT JOIN genres AS g ON m.id = g.movie_id
WHERE g.movie_id = 0
ORDER BY
    m.year DESC,
    m.name ASC
LIMIT 10;
```

```response
┌─name──────────────────────────────────────┐
│ """Pacific War, The"""                    │
│ """Turin 2006: XX Olympic Winter Games""" │
│ Arthur, the Movie                         │
│ Bridge to Terabithia                      │
│ Mars in Aries                             │
│ Master of Space and Time                  │
│ Ninth Life of Louis Drax, The             │
│ Paradox                                   │
│ Ratatouille                               │
│ """American Dad"""                        │
└───────────────────────────────────────────┘
```

:::note
`OUTER` キーワードは省略可能です。
:::


## CROSS JOIN {#cross-join}

`CROSS JOIN` は、結合キーを考慮せずに 2 つのテーブルの完全なデカルト積を生成します。
左側のテーブルの各行は、右側のテーブルの各行と組み合わされます。

<Image img={cross_join} alt="Cross Join" />

したがって、次のクエリでは `movies` テーブルの各行が `genres` テーブルの各行と組み合わされることになります。

```sql
SELECT
    m.name,
    m.id,
    g.movie_id,
    g.genre
FROM movies AS m
CROSS JOIN genres AS g
LIMIT 10;
```

```response
┌─name─┬─id─┬─movie_id─┬─genre───────┐
│ #28  │  0 │        1 │ Documentary │
│ #28  │  0 │        1 │ Short       │
│ #28  │  0 │        2 │ Comedy      │
│ #28  │  0 │        2 │ Crime       │
│ #28  │  0 │        5 │ Western     │
│ #28  │  0 │        6 │ Comedy      │
│ #28  │  0 │        6 │ Family      │
│ #28  │  0 │        8 │ Animation   │
│ #28  │  0 │        8 │ Comedy      │
│ #28  │  0 │        8 │ Short       │
└──────┴────┴──────────┴─────────────┘
```

前のクエリ例だけではあまり意味がありませんでしたが、`WHERE` 句を追加して拡張することで、対応する行をひも付け、各映画のジャンルを求めるための `INNER JOIN` と同様の動作を再現できます。

```sql
SELECT
    m.name AS name,
    g.genre AS genre
FROM movies AS m
CROSS JOIN genres AS g
WHERE m.id = g.movie_id
ORDER BY
    m.year DESC,
    m.name ASC,
    g.genre ASC
LIMIT 10;
```

`CROSS JOIN` の代替構文として、`FROM` 句で複数のテーブルをカンマ区切りで指定する方法があります。

ClickHouse は、クエリの `WHERE` 句に結合式がある場合、`CROSS JOIN` を `INNER JOIN` に[書き換え](https://github.com/ClickHouse/ClickHouse/blob/23.2/src/Core/Settings.h#L896)ます。

その例のクエリについては、[EXPLAIN SYNTAX](/sql-reference/statements/explain/#explain-syntax) で確認できます（クエリが[実行](https://youtu.be/hP6G2Nlz_cA)される前に書き換えられる、構文的に最適化されたバージョンを返します）。

```sql
EXPLAIN SYNTAX
SELECT
    m.name AS name,
    g.genre AS genre
FROM movies AS m
CROSS JOIN genres AS g
WHERE m.id = g.movie_id
ORDER BY
    m.year DESC,
    m.name ASC,
    g.genre ASC
LIMIT 10;
```

```response
┌─explain─────────────────────────────────────┐
│ SELECT                                      │
│     name AS name,                           │
│     genre AS genre                          │
│ FROM movies AS m                            │
│ ALL INNER JOIN genres AS g ON id = movie_id │
│ WHERE id = movie_id                         │
│ ORDER BY                                    │
│     year DESC,                              │
│     name ASC,                               │
│     genre ASC                               │
│ LIMIT 10                                    │
└─────────────────────────────────────────────┘
```

構文的に最適化された `CROSS JOIN` クエリの `INNER JOIN` 句には `ALL` キーワードが含まれています。これは、クエリが `INNER JOIN` に書き換えられた場合でも `CROSS JOIN` のデカルト積としてのセマンティクスを維持するために、明示的に追加されています。`INNER JOIN` ではデカルト積を [無効化](/operations/settings/settings#join_default_strictness) できるためです。

```sql
ALL
```

また、前述のとおり、`RIGHT OUTER JOIN` では `OUTER` キーワードを省略でき、さらにオプションの `ALL` キーワードを追加できるため、`ALL RIGHT JOIN` と記述しても問題なく動作します。


## (LEFT / RIGHT) SEMI JOIN {#left--right-semi-join}

`LEFT SEMI JOIN` クエリは、右テーブルで少なくとも 1 つの結合キーが一致する左テーブルの各行について、そのカラム値を返します。
最初に見つかった一致のみが返されます（デカルト積は無効化されています）。

`RIGHT SEMI JOIN` クエリも同様で、左テーブルに少なくとも 1 つ一致する行が存在する右テーブルの各行の値を返しますが、やはり最初に見つかった一致のみが返されます。

<Image img={semi_join} alt="Semi Join" />

このクエリは、2023 年に映画に出演したすべての俳優／女優を検索します。
通常の（`INNER`）JOIN を使用した場合、2023 年に複数の役を持つ俳優／女優は複数回表示される点に注意してください。

```sql
SELECT
    a.first_name,
    a.last_name
FROM actors AS a
LEFT SEMI JOIN roles AS r ON a.id = r.actor_id
WHERE toYear(created_at) = '2023'
ORDER BY id ASC
LIMIT 10;
```

```response
┌─first_name─┬─last_name──────────────┐
│ Michael    │ 'babeepower' Viera     │
│ Eloy       │ 'Chincheta'            │
│ Dieguito   │ 'El Cigala'            │
│ Antonio    │ 'El de Chipiona'       │
│ José       │ 'El Francés'           │
│ Félix      │ 'El Gato'              │
│ Marcial    │ 'El Jalisco'           │
│ José       │ 'El Morito'            │
│ Francisco  │ 'El Niño de la Manola' │
│ Víctor     │ 'El Payaso'            │
└────────────┴────────────────────────┘
```


## (LEFT / RIGHT) ANTI JOIN {#left--right-anti-join}

`LEFT ANTI JOIN` は、左側のテーブルで結合条件に一致しないすべての行のカラム値を返します。

同様に、`RIGHT ANTI JOIN` は、右側のテーブルで結合条件に一致しないすべての行のカラム値を返します。

<Image img={anti_join} alt="Anti Join" />

前の外部結合の例クエリは、データセット内にジャンルを持たない映画を見つけるために `ANTI JOIN` を使用する形に書き換えることもできます。

```sql
SELECT m.name
FROM movies AS m
LEFT ANTI JOIN genres AS g ON m.id = g.movie_id
ORDER BY
    year DESC,
    name ASC
LIMIT 10;
```

```response
┌─name──────────────────────────────────────┐
│ """Pacific War, The"""                    │
│ """Turin 2006: XX Olympic Winter Games""" │
│ Arthur, the Movie                         │
│ Bridge to Terabithia                      │
│ Mars in Aries                             │
│ Master of Space and Time                  │
│ Ninth Life of Louis Drax, The             │
│ Paradox                                   │
│ Ratatouille                               │
│ """American Dad"""                        │
└───────────────────────────────────────────┘
```


## (LEFT / RIGHT / INNER) ANY JOIN {#left--right--inner-any-join}

`LEFT ANY JOIN` は、`LEFT OUTER JOIN` と `LEFT SEMI JOIN` を組み合わせたものであり、ClickHouse は左テーブルの各行に対してカラム値を返します。このとき、右テーブルにマッチする行が存在する場合はその行のカラム値と結合し、マッチする行が存在しない場合は右テーブルのデフォルトのカラム値と結合します。
左テーブルの 1 行に対して右テーブル側に複数のマッチが存在する場合、ClickHouse は最初に見つかったマッチからの結合されたカラム値のみを返します（デカルト積は無効化されます）。

同様に、`RIGHT ANY JOIN` は `RIGHT OUTER JOIN` と `RIGHT SEMI JOIN` を組み合わせたものです。

また、`INNER ANY JOIN` はデカルト積を無効化した `INNER JOIN` です。

<Image img={any_join} alt="Any Join" />

次の例では、2 つの一時テーブル（`left_table` と `right_table`）を使用した抽象的な例で `LEFT ANY JOIN` を示します。これらの一時テーブルは、[values](https://github.com/ClickHouse/ClickHouse/blob/23.2/src/TableFunctions/TableFunctionValues.h) [テーブル関数](/sql-reference/table-functions/) を使用して構築されています。

```sql
WITH
    left_table AS (SELECT * FROM VALUES('c UInt32', 1, 2, 3)),
    right_table AS (SELECT * FROM VALUES('c UInt32', 2, 2, 3, 3, 4))
SELECT
    l.c AS l_c,
    r.c AS r_c
FROM left_table AS l
LEFT ANY JOIN right_table AS r ON l.c = r.c;
```

```response
┌─l_c─┬─r_c─┐
│   1 │   0 │
│   2 │   2 │
│   3 │   3 │
└─────┴─────┘
```

これは、`RIGHT ANY JOIN` を使用した同じクエリです。

```sql
WITH
    left_table AS (SELECT * FROM VALUES('c UInt32', 1, 2, 3)),
    right_table AS (SELECT * FROM VALUES('c UInt32', 2, 2, 3, 3, 4))
SELECT
    l.c AS l_c,
    r.c AS r_c
FROM left_table AS l
RIGHT ANY JOIN right_table AS r ON l.c = r.c;
```

```response
┌─l_c─┬─r_c─┐
│   2 │   2 │
│   2 │   2 │
│   3 │   3 │
│   3 │   3 │
│   0 │   4 │
└─────┴─────┘
```

以下は `INNER ANY JOIN` を使用したクエリです：

```sql
WITH
    left_table AS (SELECT * FROM VALUES('c UInt32', 1, 2, 3)),
    right_table AS (SELECT * FROM VALUES('c UInt32', 2, 2, 3, 3, 4))
SELECT
    l.c AS l_c,
    r.c AS r_c
FROM left_table AS l
INNER ANY JOIN right_table AS r ON l.c = r.c;
```

```response
┌─l_c─┬─r_c─┐
│   2 │   2 │
│   3 │   3 │
└─────┴─────┘
```


## ASOF JOIN {#asof-join}

`ASOF JOIN` は、完全一致ではないマッチングを行うための機能です。
左側のテーブルの行が右側のテーブルに完全一致の行を持たない場合、右側のテーブルから最も近い値を持つ行が代わりにマッチとして使用されます。

これは特に時系列分析に有用であり、クエリの複雑さを大幅に削減できます。

<Image img={asof_join} alt="ASOF JOIN のイメージ" />

次の例では、株式市場データの時系列分析を行います。
`quotes` テーブルには、ある一日の特定の時刻における銘柄の株価が格納されています。
この例のデータでは、価格は 10 秒ごとに更新されます。
`trades` テーブルには銘柄の取引が一覧化されており、特定の銘柄が特定の時刻にどれだけの数量で売買されたかが記録されています:

<Image img={asof_example} alt="ASOF JOIN の例" />

各取引の正確なコストを計算するには、その取引に最も近い時間の株価と取引をマッチさせる必要があります。

これは `ASOF JOIN` を使うと簡潔に記述できます。`ON` 句で完全一致条件を指定し、`AND` 句で最も近い値の条件を指定します。つまり、特定の銘柄（完全一致）について、その銘柄の取引時刻と同じかそれ以前の時刻（非完全一致）で、`quotes` テーブルから「最も近い」時刻の行を探します。

```sql
SELECT
    t.symbol,
    t.volume,
    t.time AS trade_time,
    q.time AS closest_quote_time,
    q.price AS quote_price,
    t.volume * q.price AS final_price
FROM trades t
ASOF LEFT JOIN quotes q ON t.symbol = q.symbol AND t.time >= q.time
FORMAT Vertical;
```

```response
Row 1:
──────
symbol:             ABC
volume:             200
trade_time:         2023-02-22 14:09:05
closest_quote_time: 2023-02-22 14:09:00
quote_price:        32.11
final_price:        6422

Row 2:
──────
symbol:             ABC
volume:             300
trade_time:         2023-02-22 14:09:28
closest_quote_time: 2023-02-22 14:09:20
quote_price:        32.15
final_price:        9645
```

:::note
`ASOF JOIN` の `ON` 句は必須であり、`AND` 句の非厳密一致条件とは別に、厳密一致条件を指定します。
:::


## まとめ {#summary}

このガイドでは、ClickHouse がすべての標準的な SQL の JOIN 型に加え、分析クエリを強化するための特殊な JOIN もどのようにサポートしているかを説明します。
JOIN の詳細については、[JOIN](/sql-reference/statements/select/join) 文に関するドキュメントを参照してください。