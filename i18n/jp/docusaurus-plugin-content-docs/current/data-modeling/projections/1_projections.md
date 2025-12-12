---
slug: /data-modeling/projections
title: 'プロジェクション'
description: 'このページでは、プロジェクションとは何か、クエリパフォーマンスの改善にどのように活用できるか、そしてマテリアライズドビューとの違いについて説明します。'
keywords: ['プロジェクション', 'プロジェクション', 'クエリ最適化']
sidebar_order: 1
doc_type: 'guide'
---

import projections_1 from '@site/static/images/data-modeling/projections_1.png';
import projections_2 from '@site/static/images/data-modeling/projections_2.png';
import Image from '@theme/IdealImage';

# プロジェクション {#projections}

## はじめに {#introduction}

ClickHouse は、リアルタイムなシナリオで大規模なデータに対する分析クエリを高速化するための、さまざまなメカニズムを提供します。その 1 つが、_Projection_ を利用してクエリを高速化する方法です。Projection は、関心のある属性でデータを並べ替えることでクエリを最適化します。これは次のような形を取ることができます。

1. テーブル全体の並べ替え
2. 元のテーブルの一部を、異なる順序で保持したもの
3. 事前計算された集計（マテリアライズドビューに類似）であり、集計に合わせた並び順を持つもの

<br/>

<iframe width="560" height="315" src="https://www.youtube.com/embed/6CdnUdZSEG0?si=1zUyrP-tCvn9tXse" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Projection はどのように動作しますか？ {#how-do-projections-work}

実際には、Projection は元のテーブルに付随する追加の「不可視なテーブル」のようなものと考えることができます。Projection は元のテーブルとは異なる行の順序を持つことができ、その結果として異なるプライマリインデックスを持つことができ、さらに集約値を自動的かつインクリメンタルに事前計算できます。その結果、Projection を使用すると、クエリ実行を高速化するための 2 つの「チューニング手段」を得られます:

- **プライマリインデックスを適切に活用すること**
- **集約を事前計算すること**

Projection は、複数の行順序を持ち、挿入時に集約を事前計算できるという点で [Materialized Views](/materialized-views)
（マテリアライズドビュー）と似ています。
Projection は自動的に更新され、元のテーブルと同期が維持されますが、マテリアライズドビューは明示的に更新する必要があります。クエリが元のテーブルを対象とする場合、
ClickHouse はプライマリキーを自動的にサンプリングし、同じ正しい結果を生成でき、かつ読み取る必要があるデータ量が最も少ないテーブルを、以下の図のように選択します:

<Image img={projections_1} size="md" alt="ClickHouse における Projection"/>

### `_part_offset` を用いたよりスマートなストレージ {#smarter_storage_with_part_offset}

バージョン 25.5 以降、ClickHouse はプロジェクション内で仮想カラム `_part_offset` を
サポートしており、プロジェクションの新しい定義方法を提供します。

現在、プロジェクションを定義する方法は 2 通りあります。

- **全カラムを保存する（従来の動作）**: プロジェクションには完全なデータが含まれ、
  プロジェクションのソート順とフィルタが一致する場合は、プロジェクションから直接読み取ることで
  高速に処理できます。

- **ソートキー + `_part_offset` のみを保存する**: プロジェクションはインデックスのように動作します。
  ClickHouse はプロジェクションのプライマリインデックスを使って一致する行を特定しますが、
  実際のデータはベーステーブルから読み取ります。これにより、クエリ時の I/O がやや増える
  代わりにストレージのオーバーヘッドを削減できます。

上記のアプローチは組み合わせることもでき、プロジェクションに一部のカラムを直接保存し、
その他のカラムを `_part_offset` を介して間接的に保存できます。

## プロジェクションを使用するタイミング {#when-to-use-projections}

プロジェクションは、新しいユーザーにとって魅力的な機能です。というのも、データ挿入時に自動的に
維持されるためです。さらに、クエリは 1 つのテーブルに対して送信するだけでよく、可能な場合には
プロジェクションが利用されて応答時間が短縮されます。

これはマテリアライズドビューとは対照的であり、マテリアライズドビューでは、ユーザーはフィルタに
応じて適切に最適化されたターゲットテーブルを選択するか、クエリを書き換える必要があります。
これにより、ユーザーアプリケーションへの依存度が高まり、クライアント側の複雑さが増します。

これらの利点にもかかわらず、プロジェクションには本質的な制約がいくつか存在するため、
ユーザーはその点を理解したうえで、必要最小限の利用にとどめるべきです。

- プロジェクションでは、ソーステーブルと（非表示の）ターゲットテーブルで異なる TTL を
  使用することはできませんが、マテリアライズドビューでは異なる TTL を使用できます。
- プロジェクションを持つテーブルでは、軽量な更新および削除はサポートされていません。
- マテリアライズドビューはチェーン化できます。1 つのマテリアライズドビューのターゲットテーブルを、
  別のマテリアライズドビューのソーステーブルとして利用することができます。このようなことは
  プロジェクションでは不可能です。
- プロジェクション定義では JOIN はサポートされませんが、マテリアライズドビューではサポートされます。
  ただし、プロジェクションを持つテーブルに対するクエリでは、自由に JOIN を使用できます。
- プロジェクション定義ではフィルタ（`WHERE` 句）はサポートされませんが、マテリアライズドビューでは
  サポートされます。とはいえ、プロジェクションを持つテーブルに対するクエリでは、自由にフィルタできます。

プロジェクションの使用を推奨するのは、次のような場合です。

- データの完全な並べ替えが必要な場合。理論上は、プロジェクション内の式で `GROUP BY` を
  使用することも可能ですが、集計の維持にはマテリアライズドビューの方が効果的です。
  クエリオプティマイザも、単純な並べ替え、すなわち `SELECT * ORDER BY x` を使用する
  プロジェクションの方をより活用しやすくなります。
  ユーザーは、この式内で列のサブセットを選択することで、ストレージフットプリントを削減できます。
- ストレージフットプリントの増加や、データを書き込む処理が 2 回になることに伴うオーバーヘッドを
  許容できる場合。挿入速度への影響をテストし、
  [ストレージオーバーヘッドを評価](/data-compression/compression-in-clickhouse)してください。

## 例 {#examples}

### プライマリキーに含まれないカラムでのフィルタリング {#filtering-without-using-primary-keys}

この例では、テーブルに Projection を追加する方法を説明します。
また、この Projection を使用して、テーブルのプライマリキーに含まれない
カラムでフィルタリングを行うクエリを高速化する方法も見ていきます。

この例では、`pickup_datetime` で並べ替えられている、
[sql.clickhouse.com](https://sql.clickhouse.com/) で利用可能な New York Taxi Data
データセットを使用します。

乗客が運転手に 200 ドルを超える額のチップを支払った
すべてのトリップ ID を検索する、簡単なクエリを書いてみましょう。

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

Notice that because we are filtering on `tip_amount` which is not in the `ORDER BY`, ClickHouse 
had to do a full table scan. Let's speed this query up.

So as to preserve the original table and results, we'll create a new table and copy the data using an `INSERT INTO SELECT`:

```sql
CREATE TABLE nyc_taxi.trips_with_projection AS nyc_taxi.trips;
INSERT INTO nyc_taxi.trips_with_projection SELECT * FROM nyc_taxi.trips;
```

To add a projection we use the `ALTER TABLE` statement together with the `ADD PROJECTION`
statement:

```sql
ALTER TABLE nyc_taxi.trips_with_projection
ADD PROJECTION prj_tip_amount
(
    SELECT *
    ORDER BY tip_amount, dateDiff('minutes', pickup_datetime, dropoff_datetime)
)
```

It is necessary after adding a projection to use the `MATERIALIZE PROJECTION` 
statement so that the data in it is physically ordered and rewritten according
to the specified query above:

```sql
ALTER TABLE nyc.trips_with_projection MATERIALIZE PROJECTION prj_tip_amount
```

Let's run the query again now that we've added the projection:

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips_with_projection WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

Notice how we were able to decrease the query time substantially, and needed to scan
less rows.

We can confirm that our query above did indeed use the projection we made by
querying the `system.query_log` table:

```sql
SELECT query, projections 
FROM system.query_log 
WHERE query_id='<query_id>'
```

```response
   ┌─query─────────────────────────────────────────────────────────────────────────┬─projections──────────────────────┐
   │ SELECT                                                                       ↴│ ['default.trips.prj_tip_amount'] │
   │↳  tip_amount,                                                                ↴│                                  │
   │↳  trip_id,                                                                   ↴│                                  │
   │↳  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min↴│                                  │
   │↳FROM trips WHERE tip_amount > 200 AND trip_duration_min > 0                   │                                  │
   └───────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────┘
```

### Using projections to speed up UK price paid queries {#using-projections-to-speed-up-UK-price-paid}

To demonstrate how projections can be used to speed up query performance, let's
take a look at an example using a real life dataset. For this example we'll be 
using the table from our [UK Property Price Paid](https://clickhouse.com/docs/getting-started/example-datasets/uk-price-paid)
tutorial with 30.03 million rows. This dataset is also available within our 
[sql.clickhouse.com](https://sql.clickhouse.com/?query_id=6IDMHK3OMR1C97J6M9EUQS)
environment.

If you would like to see how the table was created and data inserted, you can
refer to ["The UK property prices dataset"](/getting-started/example-datasets/uk-price-paid)
page.

We can run two simple queries on this dataset. The first lists the counties in London which
have the highest prices paid, and the second calculates the average price for the counties:

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

```sql runnable
SELECT
    county,
    avg(price)
FROM uk.uk_price_paid
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
```

Notice that despite being very fast how a full table scan of all 30.03 million rows occurred for both queries, due 
to the fact that neither `town` nor `price` were in our `ORDER BY` statement when we
created the table:

```sql
CREATE TABLE uk.uk_price_paid
(
  ...
)
ENGINE = MergeTree
--highlight-next-line
ORDER BY (postcode1, postcode2, addr1, addr2);
```

Let's see if we can speed this query up using projections.

To preserve the original table and results, we'll create a new table and copy the data using an `INSERT INTO SELECT`:

```sql
CREATE TABLE uk.uk_price_paid_with_projections AS uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections SELECT * FROM uk.uk_price_paid;
```

We create and populate projection `prj_oby_town_price` which produces an 
additional (hidden) table with a primary index, ordering by town and price, to 
optimize the query that lists the counties in a specific town for the highest 
paid prices:

```sql
ALTER TABLE uk.uk_price_paid_with_projections
  (ADD PROJECTION prj_obj_town_price
  (
    SELECT *
    ORDER BY
        town,
        price
  ))
```

```sql
ALTER TABLE uk.uk_price_paid_with_projections
  (MATERIALIZE PROJECTION prj_obj_town_price)
SETTINGS mutations_sync = 1
```

The [`mutations_sync`](/operations/settings/settings#mutations_sync) setting is
used to force synchronous execution.

We create and populate projection `prj_gby_county` – an additional (hidden) table
that incrementally pre-computes the avg(price) aggregate values for all existing
130 UK counties:

```sql
ALTER TABLE uk.uk_price_paid_with_projections
  (ADD PROJECTION prj_gby_county
  (
    SELECT
        county,
        avg(price)
    GROUP BY county
  ))
```
```sql
ALTER TABLE uk.uk_price_paid_with_projections
  (MATERIALIZE PROJECTION prj_gby_county)
SETTINGS mutations_sync = 1
```

:::note
If there is a `GROUP BY` clause used in a projection like in the `prj_gby_county`
projection above, then the underlying storage engine for the (hidden) table 
becomes `AggregatingMergeTree`, and all aggregate functions are converted to 
`AggregateFunction`. This ensures proper incremental data aggregation.
:::

The figure below is a visualization of the main table `uk_price_paid_with_projections`
and its two projections:

<Image img={projections_2} size="md" alt="Visualization of the main table uk_price_paid_with_projections and its two projections"/>

If we now run the query that lists the counties in London for the three highest 
paid prices again, we see an improvement in query performance:

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

Likewise, for the query that lists the U.K. counties with the three highest 
average-paid prices:

```sql runnable
SELECT
    county,
    avg(price)
FROM uk.uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
```

Note that both queries target the original table, and that both queries resulted
in a full table scan (all 30.03 million rows got streamed from disk) before we 
created the two projections.

Also, note that the query that lists the counties in London for the three highest
paid prices is streaming 2.17 million rows. When we directly used a second table
optimized for this query, only 81.92 thousand rows were streamed from disk.

The reason for the difference is that currently, the `optimize_read_in_order` 
optimization mentioned above isn't supported for projections.

We inspect the `system.query_log` table to see that ClickHouse 
automatically used the two projections for the two queries above (see the 
projections column below):

```sql
SELECT
  tables,
  query,
  query_duration_ms::String ||  ' ms' AS query_duration,
        formatReadableQuantity(read_rows) AS read_rows,
  projections
FROM clusterAllReplicas(default, system.query_log)
WHERE (type = 'QueryFinish') AND (tables = ['default.uk_price_paid_with_projections'])
ORDER BY initial_query_start_time DESC
  LIMIT 2
FORMAT Vertical
```

```response
行 1:
──────
tables:         ['uk.uk_price_paid_with_projections']
query:          SELECT
    county,
    avg(price)
FROM uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
query_duration: 5 ms
read_rows:      132.00
projections:    ['uk.uk_price_paid_with_projections.prj_gby_county']

行 2:
──────
tables:         ['uk.uk_price_paid_with_projections']
query:          SELECT
  county,
  price
FROM uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
SETTINGS log_queries=1
query_duration: 11 ms
read_rows:      2.29 million
projections:    ['uk.uk_price_paid_with_projections.prj_obj_town_price']

2行のセット。経過時間: 0.006秒
```

### Further examples {#further-examples}

The following examples use the same UK price dataset, contrasting queries with and without projections.

In order to preserve our original table (and performance), we again create a copy of the table using `CREATE AS` and `INSERT INTO SELECT`.

```sql
CREATE TABLE uk.uk_price_paid_with_projections_v2 AS uk.uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections_v2 SELECT * FROM uk.uk_price_paid;
```

#### Build a Projection {#build-projection}

Let's create an aggregate projection by the dimensions `toYear(date)`, `district`, and `town`:

```sql
ALTER TABLE uk.uk_price_paid_with_projections_v2
    ADD PROJECTION projection_by_year_district_town
    (
        SELECT
            toYear(date),
            district,
            town,
            avg(price),
            sum(price),
            count()
        GROUP BY
            toYear(date),
            district,
            town
    )
```

Populate the projection for existing data. (Without materializing it, the projection will be created for only newly inserted data):

```sql
ALTER TABLE uk.uk_price_paid_with_projections_v2
    MATERIALIZE PROJECTION projection_by_year_district_town
SETTINGS mutations_sync = 1
```

The following queries contrast performance with and without projections. To disable projection use we use the setting [`optimize_use_projections`](/operations/settings/settings#optimize_use_projections), which is enabled by default.

#### Query 1. Average price per year {#average-price-projections}

```sql runnable
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 1000000, 80)
FROM uk.uk_price_paid_with_projections_v2
GROUP BY year
ORDER BY year ASC
SETTINGS optimize_use_projections=0
```

```sql runnable
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 1000000, 80)
FROM uk.uk_price_paid_with_projections_v2
GROUP BY year
ORDER BY year ASC

```
The results should be the same, but the performance better on the latter example!

#### Query 2. Average price per year in London {#average-price-london-projections}

```sql runnable
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 2000000, 100)
FROM uk.uk_price_paid_with_projections_v2
WHERE town = 'LONDON'
GROUP BY year
ORDER BY year ASC
SETTINGS optimize_use_projections=0
```

```sql runnable
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 2000000, 100)
FROM uk.uk_price_paid_with_projections_v2
WHERE town = 'LONDON'
GROUP BY year
ORDER BY year ASC
```

#### Query 3. The most expensive neighborhoods {#most-expensive-neighborhoods-projections}

The condition (date >= '2020-01-01') needs to be modified so that it matches the projection dimension (`toYear(date) >= 2020)`:

```sql runnable
SELECT
    town,
    district,
    count() AS c,
    round(avg(price)) AS price,
    bar(price, 0, 5000000, 100)
FROM uk.uk_price_paid_with_projections_v2
WHERE toYear(date) >= 2020
GROUP BY
    town,
    district
HAVING c >= 100
ORDER BY price DESC
LIMIT 100
SETTINGS optimize_use_projections=0
```

```sql runnable
SELECT
    town,
    district,
    count() AS c,
    round(avg(price)) AS price,
    bar(price, 0, 5000000, 100)
FROM uk.uk_price_paid_with_projections_v2
WHERE toYear(date) >= 2020
GROUP BY
    town,
    district
HAVING c >= 100
ORDER BY price DESC
LIMIT 100
```

Again, the result is the same but notice the improvement in query performance for the 2nd query.

### Combining projections in one query {#combining-projections}

Starting in version 25.6, building on the `_part_offset` support introduced in 
the previous version, ClickHouse can now use multiple projections to accelerate 
a single query with multiple filters.

Importantly, ClickHouse still reads data from only one projection (or the base table), 
but can use other projections' primary indexes to prune unnecessary parts before reading.
This is especially useful for queries that filter on multiple columns, each 
potentially matching a different projection.

> Currently, this mechanism only prunes entire parts. Granule-level pruning is 
  not yet supported.

To demonstrate this, we define the table (with projections using `_part_offset` columns)
and insert five example rows matching the diagrams above.

```sql
CREATE TABLE page_views
(
    id UInt64,
    event_date Date,
    user_id UInt32,
    url String,
    region String,
    PROJECTION region_proj
    (
        SELECT _part_offset ORDER BY region
    ),
    PROJECTION user_id_proj
    (
        SELECT _part_offset ORDER BY user_id
    )
)
ENGINE = MergeTree
ORDER BY (event_date, id)
SETTINGS
  index_granularity = 1, -- グラニュールあたり1行
  max_bytes_to_merge_at_max_space_in_pool = 1; -- マージを無効化
```

Then we insert data into the table:

```sql
INSERT INTO page_views VALUES (
1, '2025-07-01', 101, 'https://example.com/page1', 'europe');
INSERT INTO page_views VALUES (
2, '2025-07-01', 102, 'https://example.com/page2', 'us_west');
INSERT INTO page_views VALUES (
3, '2025-07-02', 106, 'https://example.com/page3', 'us_west');
INSERT INTO page_views VALUES (
4, '2025-07-02', 107, 'https://example.com/page4', 'us_west');
INSERT INTO page_views VALUES (
5, '2025-07-03', 104, 'https://example.com/page5', 'asia');
```

:::note
Note: The table uses custom settings for illustration, such as one-row granules 
and disabled part merges, which are not recommended for production use.
:::

This setup produces:
- Five separate parts (one per inserted row)
- One primary index entry per row (in the base table and each projection)
- Each part contains exactly one row

With this setup, we run a query filtering on both `region` and `user_id`. 
Since the base table’s primary index is built from `event_date` and `id`, it
is unhelpful here, ClickHouse therefore uses:

- `region_proj` to prune parts by region
- `user_id_proj` to further prune by `user_id`

This behavior is visible using `EXPLAIN projections = 1`, which shows how 
ClickHouse selects and applies projections.

```sql
EXPLAIN projections=1
SELECT * FROM page_views WHERE region = 'us_west' AND user_id = 107;
```

```response
    ┌─explain────────────────────────────────────────────────────────────────────────────────┐
 1. │ Expression ((Project names + Projection))                                              │
 2. │   Expression                                                                           │                                                                        
 3. │     ReadFromMergeTree (default.page_views)                                             │
 4. │     Projections:                                                                       │
 5. │       Name: region_proj                                                                │
 6. │         Description: Projection has been analyzed and is used for part-level filtering │
 7. │         Condition: (region in ['us_west', 'us_west'])                                  │
 8. │         Search Algorithm: binary search                                                │
 9. │         Parts: 3                                                                       │
10. │         Marks: 3                                                                       │
11. │         Ranges: 3                                                                      │
12. │         Rows: 3                                                                        │
13. │         Filtered Parts: 2                                                              │
14. │       Name: user_id_proj                                                               │
15. │         Description: Projection has been analyzed and is used for part-level filtering │
16. │         Condition: (user_id in [107, 107])                                             │
17. │         Search Algorithm: binary search                                                │
18. │         Parts: 1                                                                       │
19. │         Marks: 1                                                                       │
20. │         Ranges: 1                                                                      │
21. │         Rows: 1                                                                        │
22. │         Filtered Parts: 2                                                              │
    └────────────────────────────────────────────────────────────────────────────────────────┘
```

上に示した `EXPLAIN` の出力は、論理クエリプランを上から下へと示しています。

| 行番号 | 説明                                                                                                         |
|--------|--------------------------------------------------------------------------------------------------------------|
| 3      | `page_views` ベーステーブルから読み取りを行う                                                               |
| 5-13   | `region_proj` を使用して region = 'us_west' である 3 つのパーツを特定し、5 つのパーツのうち 2 つを除外      |
| 14-22  | `user_id_proj` を使用して `user_id = 107` である 1 つのパーツを特定し、残り 3 つのパーツのうちさらに 2 つを除外 |

最終的に、ベーステーブルから読み取られるのは **5 つのパーツのうち 1 つだけ** です。
複数の Projection に対するインデックス解析を組み合わせることで、ClickHouse はスキャンするデータ量を大幅に削減し、
ストレージのオーバーヘッドを抑えつつパフォーマンスを向上させます。

## 関連コンテンツ {#related-content}

- [ClickHouse のプライマリインデックス実践入門](/guides/best-practices/sparse-primary-indexes#option-3-projections)
- [マテリアライズドビュー](/docs/materialized-views)
- [ALTER PROJECTION](/sql-reference/statements/alter/projection)