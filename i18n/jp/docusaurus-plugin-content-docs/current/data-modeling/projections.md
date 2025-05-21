---
slug: /data-modeling/projections
title: 'プロジェクション'
description: 'プロジェクションとは何か、クエリパフォーマンスを向上させるためにどのように使用できるか、マテリアライズドビューとの違いについて説明するページ。'
keywords: ['projection', 'projections', 'query optimization']
---

import projections_1 from '@site/static/images/data-modeling/projections_1.png';
import projections_2 from '@site/static/images/data-modeling/projections_2.png';
import Image from '@theme/IdealImage';


# プロジェクション

## はじめに {#introduction}

ClickHouseは、大量のデータに対する分析クエリをリアルタイムで高速化するためのさまざまなメカニズムを提供しています。そのうちの1つが _プロジェクション_ を使用することです。プロジェクションは、関心のある属性によってデータを再配置することでクエリを最適化します。これには次のようなものがあります：

1. 完全な再配置
2. 異なる順序の元のテーブルのサブセット
3. 集約を事前計算したもの（マテリアライズドビューに似ていますが、集約に合わせた順序を持っています）

## プロジェクションはどのように機能しますか？ {#how-do-projections-work}

実際には、プロジェクションは元のテーブルに対する追加の隠れたテーブルと考えることができます。プロジェクションは異なる行の順序を持ち、それによって元のテーブルとは異なる主キーを持つことができ、集約値を自動的かつ増分的に事前計算することができます。この結果、プロジェクションを使用することで、クエリの実行速度を速めるための2つの「調整ノブ」が提供されます：

- **主インデックスの適切な使用**
- **集約の事前計算**

プロジェクションは、[マテリアライズドビュー](/materialized-views)に似た部分もあり、これも複数の行の順序を持ち、挿入時に集約を事前計算することができます。プロジェクションは自動的に更新され、元のテーブルと同期されますが、マテリアライズドビューは明示的に更新される必要があります。クエリが元のテーブルをターゲットにすると、ClickHouseは自動的に主キーをサンプリングし、同じ正しい結果を生成しながら、読み取るデータが最も少なく済むテーブルを選択します。以下の図に示されている通りです。

<Image img={projections_1} size="lg" alt="ClickHouseにおけるプロジェクション"/>

## プロジェクションはいつ使用すべきですか？ {#when-to-use-projections}

プロジェクションは新しいユーザーにとって魅力的な機能です。なぜならデータが挿入されると自動的に維持されるからです。さらに、クエリはプロジェクションが利用可能な単一のテーブルに送信され、その結果応答時間が速くなります。

これは、ユーザーが適切な最適化されたターゲットテーブルを選択する必要があるマテリアライズドビューとは対照的であり、フィルタに応じてクエリを再記述しなければならないことから、ユーザーアプリケーションにより大きな負担をかけ、クライアント側の複雑さを増す要因となります。

これらの利点にもかかわらず、プロジェクションにはいくつかの固有の制限があり、ユーザーはこれを認識して利用する際には注意が必要です。

- プロジェクションは、ソーステーブルと（隠れた）ターゲットテーブルで異なるTTLを使用することを許可していませんが、マテリアライズドビューは異なるTTLを許可します。
- プロジェクションは現在、（隠れた）ターゲットテーブルに対して `optimize_read_in_order` をサポートしていません。
- プロジェクションを持つテーブルでは、軽量更新や削除がサポートされていません。
- マテリアライズドビューは連鎖的に使用できます。1つのマテリアライズドビューのターゲットテーブルが別のマテリアライズドビューのソーステーブルになることができますが、プロジェクションでは不可能です。
- プロジェクションは結合をサポートしていませんが、マテリアライズドビューはサポートしています。
- プロジェクションはフィルタ (`WHERE` 句) をサポートしていませんが、マテリアライズドビューはサポートしています。

プロジェクションを使用することを推奨する場合は次のとおりです：

- データの完全な再整理が必要な場合。プロジェクション内の式は理論的には `GROUP BY` を使用できますが、集約を維持するにはマテリアライズドビューの方が効果的です。クエリオプティマイザはまた、単純な再配置、つまり `SELECT * ORDER BY x` を使用するプロジェクションをより活用する可能性が高いです。ユーザーはこの式でストレージのフットプリントを削減するためにカラムのサブセットを選択できます。
- ユーザーが関連するストレージのフットプリントの増加とデータを2回書き込むオーバーヘッドに快適である時。挿入速度の影響をテストし、[ストレージオーバーヘッドを評価する](/data-compression/compression-in-clickhouse)ことをお勧めします。

## 例 {#examples}

### 主キーにないカラムでのフィルタリング {#filtering-without-using-primary-keys}

この例では、テーブルにプロジェクションを追加する方法を示します。また、主キーに含まれていないカラムでフィルタリングするクエリを高速化するためにプロジェクションをどのように使用できるかを見ていきます。

この例では、`pickup_datetime` の順で整理されたニューヨークタクシーデータセットを使用します。データセットは [sql.clickhouse.com](https://sql.clickhouse.com/) で入手可能です。

では、乗客が運転手に対してチップを $200 より多く支払ったすべてのトリップIDを見つけるための単純なクエリを書いてみます：

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

`tip_amount` でフィルタリングしているため、`ORDER BY` に含まれていないにも関わらず、ClickHouse がフルテーブルスキャンを行ったという点に注意してください。では、このクエリを速くしてみましょう。

元のテーブルと結果を保持するために、新しいテーブルを作成し、`INSERT INTO SELECT`を使用してデータをコピーします：

```sql
CREATE TABLE nyc_taxi.trips_with_projection AS nyc_taxi.trips;
INSERT INTO nyc_taxi.trips_with_projection SELECT * FROM nyc_taxi.trips;
```

プロジェクションを追加するには、`ALTER TABLE`文を使用して`ADD PROJECTION`文を共同で使用します：

```sql
ALTER TABLE nyc_taxi.trips_with_projection
ADD PROJECTION prj_tip_amount
(
    SELECT *
    ORDER BY tip_amount, dateDiff('minutes', pickup_datetime, dropoff_datetime)
)
```

プロジェクションを追加した後、データが物理的に順序付けされ、上記の指定クエリに従って書き換えられるように、`MATERIALIZE PROJECTION`文を使用する必要があります：

```sql
ALTER TABLE nyc.trips_with_projection MATERIALIZE PROJECTION prj_tip_amount
```

プロジェクションを追加したので、再度クエリを実行してみましょう：

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips_with_projection WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

クエリ時間が大幅に減少し、スキャンする行数が少なくて済んだことに注意してください。

上記のクエリが確かにプロジェクションを使用したものであることを確認するには、`system.query_log`テーブルをクエリします：

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

### プロジェクションを使用してUKの支払い価格クエリを高速化する {#using-projections-to-speed-up-UK-price-paid}

プロジェクションがクエリパフォーマンスを高速化するために使用できる方法を実証するために、実際のデータセットを使用した例を見てみましょう。この例では、30.03百万行を持つ[UK Property Price Paid](https://clickhouse.com/docs/getting-started/example-datasets/uk-price-paid) テーブルを使用します。このデータセットは、私たちの [sql.clickhouse.com](https://sql.clickhouse.com/?query_id=6IDMHK3OMR1C97J6M9EUQS) 環境でも入手可能です。

テーブルの作成およびデータ挿入方法を確認したい場合は、 ["UK不動産価格データセット"](/getting-started/example-datasets/uk-price-paid) ページを参照してください。

このデータセットに対して2つの単純なクエリを実行できます。最初のクエリはロンドンの郡を最も高い価格の順にリストアップし、2番目のクエリは郡の平均価格を計算します：

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

両方のクエリが非常に迅速であったにもかかわらず、30.03百万行のフルテーブルスキャンが発生したことに注意してください。これは、テーブルを作成したときに `town` や `price` が `ORDER BY` 句に含まれていなかったためです：

```sql
CREATE TABLE uk.uk_price_paid
(
  ...
)
ENGINE = MergeTree
--highlight-next-line
ORDER BY (postcode1, postcode2, addr1, addr2);
```

そこで、プロジェクションを使用してこのクエリを速くできるか見てみましょう。

元のテーブルと結果を保持するために、新しいテーブルを作成し、`INSERT INTO SELECT`を使用してデータをコピーします：

```sql
CREATE TABLE uk.uk_price_paid_with_projections AS uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections SELECT * FROM uk.uk_price_paid;
```

`town` と `price` で順序を付けた（隠れた）テーブルの一次インデックスを持つプロジェクション`prj_obj_town_price`を作成して、特定の町で最も高い価格を記録するクエリを最適化します：

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

[`mutations_sync`](/operations/settings/settings#mutations_sync)設定は、同期実行を強制するために使用されます。

次に、すべての既存の130のUK郡のavg(price)集計値を増分的に事前計算する追加の（隠れた）テーブル`prj_gby_county`を作成して人口統計を計算するために必要なプロジェクションを作成します：

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
プロジェクション内に `GROUP BY` 句が使用されている場合（上記の `prj_gby_county` プロジェクションのように）、（隠れた）テーブルのストレージエンジンが `AggregatingMergeTree` になり、すべての集計関数が `AggregateFunction` に変換されます。これにより、適切な増分データ集約が保証されます。
:::

以下の図は、主要なテーブル`uk_price_paid_with_projections`とその2つのプロジェクションの視覚化です：

<Image img={projections_2} size="lg" alt="主テーブル uk_price_paid_with_projections とその2つのプロジェクションの視覚化"/>

再度、ロンドンでの3つの最高支払価格の郡をリストするクエリを実行すると、クエリパフォーマンスの改善が見られます：

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

同様に、U.K.の郡のうち3つの最高平均支払価格をリストするクエリも実行します：

```sql runnable
SELECT
    county,
    avg(price)
FROM uk.uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
```

両方のクエリは元のテーブルをターゲットにしており、両方のクエリはフルテーブルスキャンを行ったことに注意してください（30.03百万行がディスクからストリーミングされました）。また、ロンドンの3つの最高支払価格の郡をリストするクエリは2.17百万行をストリーミングしました。直接最適化された二次テーブルを使用した場合、ディスクからストリーミングされたのは81.92千行だけでした。

その違いの理由は、現在、上記で言及した `optimize_read_in_order` の最適化がプロジェクションでサポートされていないためです。

`system.query_log` テーブルを調査して、ClickHouseが上記の2つのクエリに対して自動的に2つのプロジェクションを使用したことを確認します（以下のプロジェクション列を参照）：

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

以下の例では、同じUK価格データセットを使用し、プロジェクションを使用したクエリと使用しないクエリを対比します。

元のテーブル（およびパフォーマンス）を保持するために、`CREATE AS` と `INSERT INTO SELECT`を使用してテーブルのコピーを作成します。

```sql
CREATE TABLE uk.uk_price_paid_with_projections_v2 AS uk.uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections_v2 SELECT * FROM uk.uk_price_paid;
```

#### プロジェクションの構築 {#build-projection}

`toYear(date)`, `district`, `town` による集計プロジェクションを作成しましょう：

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

既存のデータに対してプロジェクションをポピュレートします。（マテリアライズしない場合、プロジェクションは新しく挿入されたデータのみに作成されます）：

```sql
ALTER TABLE uk.uk_price_paid_with_projections_v2
    MATERIALIZE PROJECTION projection_by_year_district_town
SETTINGS mutations_sync = 1
```

以下のクエリは、プロジェクションを使用した場合と使用しない場合のパフォーマンスを対比します。プロジェクション使用を無効にするには、デフォルトで有効な設定 [`optimize_use_projections`](/operations/settings/settings#optimize_use_projections) を使用します。

#### クエリ 1. 年ごとの平均価格 {#average-price-projections}

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
結果は同じであるべきですが、後者の例の方がパフォーマンスが良くなります！


#### クエリ 2. ロンドンの年ごとの平均価格 {#average-price-london-projections}

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

#### クエリ 3. 最も高価な地区 {#most-expensive-neighborhoods-projections}

条件（date >= '2020-01-01'）を変更して、プロジェクションの次元に一致させる必要があります（`toYear(date) >= 2020`）：

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

結果は再び同じですが、2番目のクエリのクエリパフォーマンスの改善に注意してください。


## 関連コンテンツ {#related-content}
- [ClickHouseにおける主インデックスの実用的な紹介](/guides/best-practices/sparse-primary-indexes#option-3-projections)
- [マテリアライズドビュー](/docs/materialized-views)
- [ALTER PROJECTION](/sql-reference/statements/alter/projection)
