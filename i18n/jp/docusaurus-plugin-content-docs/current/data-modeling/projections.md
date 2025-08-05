---
slug: '/data-modeling/projections'
title: 'Projections'
description: 'Projectionsとは、クエリのパフォーマンスを向上させるためにどのように使用できるか、およびMaterialized Viewsとの違いについて説明するページです。'
keywords:
- 'projection'
- 'projections'
- 'query optimization'
---

import projections_1 from '@site/static/images/data-modeling/projections_1.png';
import projections_2 from '@site/static/images/data-modeling/projections_2.png';
import Image from '@theme/IdealImage';

# プロジェクション

## はじめに {#introduction}

ClickHouseは、大量のデータに対する分析クエリをリアルタイムで高速化するさまざまなメカニズムを提供しています。そのようなメカニズムの1つが、_プロジェクション_を使用することです。プロジェクションは、関心のある属性によってデータの並べ替えを行うことでクエリを最適化します。これには次のようなものが含まれます：

1. 完全な並べ替え
2. 元のテーブルのサブセットで別の順序
3. 事前に計算された集約（Materialized Viewに似ています）が、集約に沿った順序を持ちます。

## プロジェクションはどのように機能しますか？ {#how-do-projections-work}

実際には、プロジェクションは元のテーブルに対する追加の隠れたテーブルと考えることができます。プロジェクションは異なる行の順序を持つことができるため、元のテーブルとは異なる主キーを持ち、自動的に増分的に集約値を事前計算することができます。その結果、プロジェクションを利用することでクエリの実行を高速化するための2つの「調整ノブ」が提供されます：

- **主インデックスの適切な使用**
- **集約の事前計算**

プロジェクションは、複数の行の順序を持ち、挿入時に集約を事前計算できる[Materialized Views](/materialized-views)と、ある意味似ています。プロジェクションは自動的に更新され、元のテーブルと同期されます。一方、Materialized Viewsは明示的に更新されます。クエリが元のテーブルをターゲットにすると、ClickHouseは自動的に主キーをサンプリングし、同じ正しい結果を生成できるテーブルを選択しますが、読み取るデータの量が最も少ないものを選びます。以下の図に示すように：

<Image img={projections_1} size="lg" alt="ClickHouseのプロジェクション"/>

## プロジェクションを使用するタイミングは？ {#when-to-use-projections}

プロジェクションは、自動的にデータが挿入されるため、新しいユーザーにとって魅力的な機能です。さらに、クエリは単一のテーブルに送信され、可能な限りプロジェクションを利用して応答時間を短縮できます。

これは、ユーザーが適切な最適化されたターゲットテーブルを選択する必要があるMaterialized Viewsとは対照的です。この場合、フィルターに応じてクエリを再構築する必要があります。これにより、ユーザーアプリケーションへの重要性が増し、クライアントサイドの複雑性が増加します。

これらの利点にもかかわらず、プロジェクションにはいくつかの固有の制限があり、ユーザーはこれを認識し、したがって慎重に展開すべきです。

- プロジェクションは、ソーステーブルと（隠れた）ターゲットテーブルに対して異なるTTLを使用することを許可しませんが、Materialized Viewsは異なるTTLを許可します。
- プロジェクションは現在、（隠れた）ターゲットテーブルに対して `optimize_read_in_order` をサポートしていません。
- プロジェクションを持つテーブルに対しては、軽量更新と削除がサポートされていません。
- Materialized Viewsはチェーン化できます：1つのMaterialized Viewのターゲットテーブルは、別のMaterialized Viewのソーステーブルになり得ますが、これはプロジェクションでは不可能です。
- プロジェクションは結合をサポートしていませんが、Materialized Viewsはサポートしています。
- プロジェクションはフィルター（`WHERE`句）をサポートしていませんが、Materialized Viewsはサポートしています。

プロジェクションを使用することをお勧めするのは次のような場合です：

- データの完全な再構成が必要な場合。プロジェクションの式は理論上 `GROUP BY` を使用できますが、集約を維持するにはMaterialized Viewsがより効果的です。クエリオプティマイザーは、単純な並べ替えを使用するプロジェクションを利用する可能性が高いです。つまり、`SELECT * ORDER BY x` のようになります。この式で、ストレージフットプリントを減らすために列のサブセットを選択できます。
- ユーザーがストレージフットプリントの増加とデータの二重書き込みのオーバーヘッドに対して快適である場合。挿入速度に対する影響をテストし、[ストレージオーバーヘッドを評価する](/data-compression/compression-in-clickhouse)。

## 例 {#examples}

### 主キーに含まれていないカラムでのフィルタリング {#filtering-without-using-primary-keys}

この例では、テーブルにプロジェクションを追加する方法を示します。また、主キーに含まれていないカラムでフィルターを行うクエリを高速化するためにプロジェクションを使用できる方法も見ていきます。

この例では、`pickup_datetime` の順序で整理された New York Taxi Data データセットを使用します。このデータセットは [sql.clickhouse.com](https://sql.clickhouse.com/) で利用可能です。

では、$200以上チップを渡した乗客の全旅行IDを見つける簡単なクエリを書いてみましょう：

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

`ORDER BY` に含まれていない `tip_amount` でフィルタリングしているため、ClickHouseは全行スキャンを行う必要があったことに注意してください。このクエリを高速化しましょう。

元のテーブルと結果を保持するために、新しいテーブルを作成し、`INSERT INTO SELECT` を使用してデータをコピーします：

```sql
CREATE TABLE nyc_taxi.trips_with_projection AS nyc_taxi.trips;
INSERT INTO nyc_taxi.trips_with_projection SELECT * FROM nyc_taxi.trips;
```

プロジェクションを追加するには、`ALTER TABLE` ステートメントと `ADD PROJECTION` ステートメントを使用します：

```sql
ALTER TABLE nyc_taxi.trips_with_projection
ADD PROJECTION prj_tip_amount
(
    SELECT *
    ORDER BY tip_amount, dateDiff('minutes', pickup_datetime, dropoff_datetime)
)
```

プロジェクションを追加した後、`MATERIALIZE PROJECTION` ステートメントを使用して、指定されたクエリに従って物理的にデータが順序づけられて書き直される必要があります：

```sql
ALTER TABLE nyc.trips_with_projection MATERIALIZE PROJECTION prj_tip_amount
```

プロジェクションを追加したので、クエリを再度実行しましょう：

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips_with_projection WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

クエリ時間を大幅に短縮でき、スキャンする行数が少なくて済んだことに気づくでしょう。

上記のクエリが実際に作成したプロジェクションを使用したことを確認するために、`system.query_log` テーブルをクエリします：

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

### UKの支払額クエリを高速化するためのプロジェクションの使用 {#using-projections-to-speed-up-UK-price-paid}

プロジェクションがクエリパフォーマンスを高速化するためにどのように使用できるかを示すために、実際のデータセットを使用した例を見てみましょう。この例では、私たちの[UK Property Price Paid](https://clickhouse.com/docs/getting-started/example-datasets/uk-price-paid) チュートリアルのテーブルを使用します。これは3003万行のデータセットです。このデータセットは、私たちの[sql.clickhouse.com](https://sql.clickhouse.com/?query_id=6IDMHK3OMR1C97J6M9EUQS)環境内でも利用できます。

テーブルが作成され、データが挿入される方法を確認したい場合は、["UK不動産価格データセット"](/getting-started/example-datasets/uk-price-paid) ページを参照してください。

このデータセットに対して2つの簡単なクエリを実行できます。最初のクエリはロンドン内の支払いが最も高い郡をリストし、2番目は郡の平均価格を計算します：

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

注意してください。両方のクエリの結果、30.03百万行全体のフルテーブルスキャンが発生しました。これは、テーブルを作成したときに `town` および `price` が `ORDER BY` ステートメントに含まれていなかったためです：

```sql
CREATE TABLE uk.uk_price_paid
(
  ...
)
ENGINE = MergeTree
--highlight-next-line
ORDER BY (postcode1, postcode2, addr1, addr2);
```

プロジェクションを使用してこのクエリを高速化できるか見てみましょう。

元のテーブルと結果を保持するために、新しいテーブルを作成し、`INSERT INTO SELECT` を使用してデータをコピーします：

```sql
CREATE TABLE uk.uk_price_paid_with_projections AS uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections SELECT * FROM uk.uk_price_paid;
```

`prj_obj_town_price`というプロジェクションを作成し、町と価格で並べ替えた主キーを持つ追加の（隠れた）テーブルを生成します。これにより、特定の町での支払額が最も高い郡をリスト化するクエリを最適化します：

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

[`mutations_sync`](/operations/settings/settings#mutations_sync) 設定は、同期実行を強制するために使用されます。

`prj_gby_county`という別のプロジェクションを作成し、既存の130のイギリスの郡のaverage(price)集約値を段階的に事前計算する追加の（隠れた）テーブルを構築します：

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
プロジェクションに `GROUP BY` 句が使用されている場合（上記の `prj_gby_county` プロジェクションのように）、その隠れたテーブルの基になるストレージエンジンは `AggregatingMergeTree` となり、すべての集約関数が `AggregateFunction` に変換されます。これは、適切な増分データ集約を保証します。
:::

下の図は、主テーブル `uk_price_paid_with_projections` とその2つのプロジェクションの可視化です：

<Image img={projections_2} size="lg" alt="主テーブルuk_price_paid_with_projectionsとその2つのプロジェクションの可視化"/>

ロンドンの支払いが最も高い価格の郡をリスト化するクエリを再度実行すると、クエリパフォーマンスに改善が見られます：

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

同様に、イギリスの郡での平均支払額が最も高い3つをリスト화するクエリについても：

```sql runnable
SELECT
    county,
    avg(price)
FROM uk.uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
```

両方のクエリは元のテーブルをターゲットにし、また両方のクエリはフルテーブルスキャンを行ったことに注意してください（30.03百万行すべてがディスクからストリーミングされました）。プロジェクションを2つ作成する前に。

また、ロンドンの支払いが最も高い価格の郡をリスト化するクエリは2.17百万行をストリーミングしています。直接、最適化された2つ目のテーブルを使用した場合、ディスクからストリーミングされたのはわずか81.92千行でした。

この差の理由は、現在、上記の `optimize_read_in_order` 最適化がプロジェクションにはサポートされていないためです。

`system.query_log` テーブルを調べると、ClickHouseが上記の2つのクエリに対して自動的に2つのプロジェクションを使用したことがわかります（下のプロジェクション列を参照）：

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
Row 1:
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

Row 2:
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

2 rows in set. Elapsed: 0.006 sec.
```

### さらなる例 {#further-examples}

以下の例では、同じUK価格データセットを使用して、プロジェクションありとなしのクエリを対比させます。

オリジナルテーブル（およびパフォーマンス）を保存するために、再度 `CREATE AS` と `INSERT INTO SELECT` を使用してテーブルのコピーを作成します。

```sql
CREATE TABLE uk.uk_price_paid_with_projections_v2 AS uk.uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections_v2 SELECT * FROM uk.uk_price_paid;
```

#### プロジェクションを構築 {#build-projection}

`toYear(date)`、`district`、`town` の次元ごとに集約プロジェクションを作成します：

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

既存のデータに対してプロジェクションをポピュレートします。（物理的に指定された順序でデータは書き直されません。これにより、新たに挿入されたデータのみに対してプロジェクションが作成されます）：

```sql
ALTER TABLE uk.uk_price_paid_with_projections_v2
    MATERIALIZE PROJECTION projection_by_year_district_town
SETTINGS mutations_sync = 1
```

以下のクエリは、プロジェクションの有無によるパフォーマンスの対比です。プロジェクションを強制的に無効にするには、設定 [`optimize_use_projections`](/operations/settings/settings#optimize_use_projections) を使用します。これはデフォルトで有効になっています。

#### クエリ1. 年ごとの平均価格 {#average-price-projections}

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
結果は同様であるべきですが、後者の例の方がパフォーマンスが向上します！


#### クエリ2. ロンドン年ごとの平均価格 {#average-price-london-projections}

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

#### クエリ3. 最も高価な地区 {#most-expensive-neighborhoods-projections}

条件 (date >= '2020-01-01') は、プロジェクションの次元 (toYear(date) >= 2020) に一致するように変更する必要があります：

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

再び、結果は同じですが、2番目のクエリのクエリパフォーマンスの改善に気づいてください。

## 関連コンテンツ {#related-content}
- [ClickHouseにおける主インデックスの実用的な導入](/guides/best-practices/sparse-primary-indexes#option-3-projections)
- [Materialized Views](/materialized-views)
- [ALTER PROJECTION](/sql-reference/statements/alter/projection)
