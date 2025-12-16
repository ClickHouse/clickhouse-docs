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

ClickHouse は標準 SQL の JOIN を完全にサポートしており、効率的なデータ分析が可能です。
このガイドでは、正規化された [IMDB](https://en.wikipedia.org/wiki/IMDb) データセット（[relational dataset repository](https://relational.fit.cvut.cz/dataset/IMDb) 由来）を用いた Venn 図とサンプルクエリを通じて、よく利用される代表的な JOIN の種類とその使い方を解説します。

## テストデータとリソース {#test-data-and-resources}

テーブルの作成とロード手順は[こちら](/integrations/dbt/guides)にあります。
テーブルをローカルで作成・ロードしたくない場合は、このデータセットは [playground](https://sql.clickhouse.com?query_id=AACTS8ZBT3G7SSGN8ZJBJY) からも利用できます。

以下のサンプルデータセット内の 4 つのテーブルを使用します。

<Image img={imdb_schema} alt="IMDB スキーマ" />

これら 4 つのテーブルのデータは、1 つ以上のジャンルを持つことができる映画を表しています。
映画の役は俳優によって演じられます。

上の図の矢印は[外部キーと主キーの関係](https://en.wikipedia.org/wiki/Foreign_key)を表しています。例えば、`genres` テーブルのある行の `movie_id` カラムには、`movies` テーブルの行の `id` の値が格納されています。

映画と俳優の間には[多対多の関係](https://en.wikipedia.org/wiki/Many-to-many_(data_model))があります。
この多対多の関係は、`roles` テーブルを使用して 2 つの[一対多の関係](https://en.wikipedia.org/wiki/One-to-many_(data_model))に正規化されています。
`roles` テーブルの各行には、`movies` テーブルと `actors` テーブルの `id` カラムの値が格納されています。

## ClickHouse でサポートされている結合の種類 {#join-types-supported-in-clickhouse}

ClickHouse は次の結合の種類をサポートしています：

- [INNER JOIN](#inner-join)
- [OUTER JOIN](#left--right--full-outer-join)
- [CROSS JOIN](#cross-join)
- [SEMI JOIN](#left--right-semi-join)
- [ANTI JOIN](#left--right-anti-join)
- [ANY JOIN](#left--right--inner-any-join)
- [ASOF JOIN](#asof-join)

次のセクションでは、上記それぞれの JOIN の種類に対するサンプルクエリを示します。

## INNER JOIN {#inner-join}

`INNER JOIN` は、結合キーでマッチする各行の組み合わせごとに、左側のテーブルの行のカラム値と右側のテーブルの行のカラム値を結合して返します。
ある行が複数回マッチする場合は、そのすべてのマッチが返されます（つまり、結合キーが一致する行に対して [デカルト積](https://en.wikipedia.org/wiki/Cartesian_product) が生成されます）。

<Image img={inner_join} alt="INNER JOIN のイメージ" />

このクエリは、`movies` テーブルと `genres` テーブルを結合することで、各映画のジャンル（1つまたは複数）を取得します。

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
│ ハリー・ポッターと謎のプリンス │ アクション    │
│ ハリー・ポッターと謎のプリンス │ アドベンチャー │
│ ハリー・ポッターと謎のプリンス │ ファミリー    │
│ ハリー・ポッターと謎のプリンス │ ファンタジー   │
│ ハリー・ポッターと謎のプリンス │ スリラー  │
│ ドラゴンボールZ                           │ アクション    │
│ ドラゴンボールZ                           │ アドベンチャー │
│ ドラゴンボールZ                           │ コメディ    │
│ ドラゴンボールZ                           │ ファンタジー   │
│ ドラゴンボールZ                           │ SF    │
└────────────────────────────────────────┴───────────┘
```

:::note
`INNER` キーワードは省略できます。
:::

`INNER JOIN` の挙動は、次のいずれかの他の結合タイプを使用することで拡張または変更できます。

## (LEFT / RIGHT / FULL) OUTER JOIN {#left--right--full-outer-join}

`LEFT OUTER JOIN` は `INNER JOIN` と同様に動作しますが、左テーブル側で結合条件に一致しない行については、右テーブルのカラムに対して ClickHouse が[デフォルト値](/sql-reference/statements/create/table#default_values)を返します。

`RIGHT OUTER JOIN` クエリも同様で、右テーブル側で結合条件に一致しない行の値とともに、左テーブルのカラムに対するデフォルト値を返します。

`FULL OUTER JOIN` クエリは `LEFT OUTER JOIN` と `RIGHT OUTER JOIN` を組み合わせたもので、左テーブルおよび右テーブルの結合条件に一致しない行の値と、それぞれ右および左テーブルのカラムに対するデフォルト値を返します。

<Image img={outer_join} alt="Outer Join" />

:::note
ClickHouse は、デフォルト値の代わりに [NULL](/sql-reference/syntax/#null) を返すように[設定](/operations/settings/settings#join_use_nulls)できます（ただし、[パフォーマンス上の理由](/sql-reference/data-types/nullable/#storage-features)から、あまり推奨されません）。
:::

次のクエリは、ジャンルを持たないすべての映画を検索します。`genres` テーブルに一致する行を持たない `movies` テーブルのすべての行を取得し、その結果として、クエリ実行時に `movie_id` カラムにはデフォルト値 0 が設定されます。

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
│ """太平洋戦争"""                          │
│ """トリノ2006:第20回オリンピック冬季競技大会""" │
│ アーサー・ザ・ムービー                    │
│ テラビシアにかける橋                      │
│ 牡羊座の火星                              │
│ 時空の支配者                              │
│ ルイス・ドラックスの9番目の人生          │
│ パラドックス                              │
│ レミーのおいしいレストラン                │
│ """アメリカン・ダッド"""                  │
└───────────────────────────────────────────┘
```

:::note
`OUTER` キーワードは省略可能です。
:::

## CROSS JOIN {#cross-join}

`CROSS JOIN` は、結合キーを考慮せずに 2 つのテーブルの完全な直積を生成します。
左側のテーブルの各行は、右側のテーブルの各行と組み合わされます。

<Image img={cross_join} alt="クロス結合" />

したがって、次のクエリでは、`movies` テーブルの各行が `genres` テーブルの各行と組み合わされます。

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

前の例のクエリ単体ではあまり意味がありませんでしたが、`WHERE` 句を追加して一致する行を関連付けることで、各映画のジャンルを特定するための `INNER JOIN` の動作を再現できます。

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

ClickHouse は、クエリの `WHERE` 句に結合条件となる式がある場合、`CROSS JOIN` を `INNER JOIN` に[書き換え](https://github.com/ClickHouse/ClickHouse/blob/23.2/src/Core/Settings.h#L896)ます。

この動作は、例のクエリに対して [EXPLAIN SYNTAX](/sql-reference/statements/explain/#explain-syntax) を使うことで確認できます（`EXPLAIN SYNTAX` は、クエリが[実行](https://youtu.be/hP6G2Nlz_cA)される前に書き換えられる、構文レベルで最適化されたクエリのバージョンを返します）：

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

構文上最適化された `CROSS JOIN` クエリ版では、`INNER JOIN` 句に `ALL` キーワードが明示的に追加されています。これは、`INNER JOIN` に書き換えた場合でも `CROSS JOIN` のデカルト積のセマンティクスを維持するためであり、`INNER JOIN` ではデカルト積が[無効化](/operations/settings/settings#join_default_strictness)される場合があるためです。

```sql
ALL
```

そして、上で述べたように、`RIGHT OUTER JOIN` では `OUTER` キーワードを省略でき、さらにオプションの `ALL` キーワードを追加できるので、`ALL RIGHT JOIN` と書いても問題なく動作します。

## (LEFT / RIGHT) SEMI JOIN {#left--right-semi-join}

`LEFT SEMI JOIN` クエリは、右テーブルに少なくとも 1 つの結合キーのマッチがある左テーブルの各行について、そのカラム値を返します。
最初に見つかったマッチだけが返されます（デカルト積は発生しません）。

`RIGHT SEMI JOIN` クエリも同様で、左テーブルに少なくとも 1 つのマッチがある右テーブルのすべての行について値を返しますが、やはり最初に見つかったマッチだけが返されます。

<Image img={semi_join} alt="Semi Join" />

このクエリは、2023 年に映画に出演したすべての俳優・女優を抽出します。
通常の（`INNER`）結合では、2023 年に複数の役を持っている場合、同じ俳優・女優が複数回表示される点に注意してください。

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

`LEFT ANTI JOIN` は、左側のテーブルで一致しない行のすべてのカラム値を返します。

同様に、`RIGHT ANTI JOIN` は、右側のテーブルで一致しない行のすべてのカラム値を返します。

<Image img={anti_join} alt="Anti Join" />

前の外部結合の例クエリは、データセット内でジャンルを持たない映画を見つけるために ANTI JOIN を使用する形で書き換えることもできます。

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
│ """太平洋戦争"""                          │
│ """トリノ2006:第20回オリンピック冬季競技大会""" │
│ アーサー・ザ・ムービー                    │
│ テラビシアにかける橋                      │
│ 牡羊座の火星                              │
│ 時空の支配者                              │
│ ルイス・ドラックスの9番目の人生          │
│ パラドックス                              │
│ レミーのおいしいレストラン                │
│ """アメリカン・ダッド"""                  │
└───────────────────────────────────────────┘
```

## (LEFT / RIGHT / INNER) ANY JOIN {#left--right--inner-any-join}

`LEFT ANY JOIN` は `LEFT OUTER JOIN` と `LEFT SEMI JOIN` を組み合わせたものであり、ClickHouse は左テーブルの各行に対して、右テーブルで一致する行が存在する場合はその行のカラム値と結合し、一致する行が存在しない場合は右テーブルのデフォルトのカラム値と結合したカラム値を返します。
左テーブルの 1 行に対して右テーブル側に複数の一致がある場合、ClickHouse は最初に見つかった一致からの結合後のカラム値のみを返し（カルテジアン積は無効化されます）、それ以外は返しません。

同様に、`RIGHT ANY JOIN` は `RIGHT OUTER JOIN` と `RIGHT SEMI JOIN` を組み合わせたものです。

また、`INNER ANY JOIN` はカルテジアン積を無効化した `INNER JOIN` です。

<Image img={any_join} alt="Any Join" />

次の例では、2 つの一時テーブル（`left_table` と `right_table`）を使用した抽象的な例を用いて、`LEFT ANY JOIN` を示します。これらのテーブルは [values](https://github.com/ClickHouse/ClickHouse/blob/23.2/src/TableFunctions/TableFunctionValues.h) [テーブル関数](/sql-reference/table-functions/) を使って構築されています。

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

こちらは、`RIGHT ANY JOIN` を使用した同じクエリです:

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

次は `INNER ANY JOIN` を使用したクエリです。

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

`ASOF JOIN` は、非完全一致のマッチングを行える機能を提供します。
左側のテーブルの行に右側のテーブルで完全一致する行が存在しない場合、右側のテーブルから「最も近い」行が代わりにマッチとして使用されます。

これは特に時系列分析で有用で、クエリの複雑さを大幅に削減できます。

<Image img={asof_join} alt="Asof Join" />

次の例では、株式市場データの時系列分析を行います。
`quotes` テーブルには、1 日の特定の時刻における銘柄の気配値が格納されています。
この例のデータでは、価格は 10 秒ごとに更新されます。
`trades` テーブルには銘柄の取引が一覧として格納されており、特定の時刻に特定の出来高でその銘柄が買われたことを表します:

<Image img={asof_example} alt="Asof Example" />

各取引の正確なコストを計算するには、その取引に最も近い時刻の気配値と対応付ける必要があります。

これは `ASOF JOIN` を使うと簡潔に表現できます。`ON` 句で完全一致の条件を指定し、`AND` 句で最も近いマッチ条件を指定します。つまり、特定のシンボル（完全一致）に対して、そのシンボルの取引が発生した時刻と同じかそれ以前の `quotes` テーブルの行のうち、「最も近い」時刻を持つ行（非完全一致）を探します。

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
行 1:
──────
symbol:             ABC
volume:             200
trade_time:         2023-02-22 14:09:05
closest_quote_time: 2023-02-22 14:09:00
quote_price:        32.11
final_price:        6422

行 2:
──────
symbol:             ABC
volume:             300
trade_time:         2023-02-22 14:09:28
closest_quote_time: 2023-02-22 14:09:20
quote_price:        32.15
final_price:        9645
```

:::note
`ASOF JOIN` では `ON` 句が必須であり、`AND` 句の非厳密な一致条件に加えて、厳密な一致条件を指定します。
:::

## まとめ {#summary}

このガイドでは、ClickHouseがすべての標準的な SQL の JOIN 型に加え、分析クエリを強化するための専用の JOIN もサポートしていることを説明します。
JOIN の詳細については、[JOIN](/sql-reference/statements/select/join) 文のドキュメントを参照してください。