---
'slug': '/data-modeling/projections'
'title': 'プロジェクション'
'description': 'プロジェクションが何であるか、クエリパフォーマンスを向上させるためにどのように使用できるか、そしてマテリアライズドビューとの違いについて説明するページ。'
'keywords':
- 'projection'
- 'projections'
- 'query optimization'
'sidebar_order': 1
'doc_type': 'guide'
---

import projections_1 from '@site/static/images/data-modeling/projections_1.png';
import projections_2 from '@site/static/images/data-modeling/projections_2.png';
import Image from '@theme/IdealImage';


# Projections

## Introduction {#introduction}

ClickHouseは、リアルタイムシナリオにおける大量のデータに対する分析クエリの高速化のためのさまざまなメカニズムを提供します。その中の1つが、_Projections_を使用することによってクエリを迅速化するメカニズムです。Projectionsは、関心のある属性によってデータの再配置を行うことでクエリを最適化します。これには以下のようなものがあります：

1. 完全な再配置
2. 元のテーブルの一部を異なる順序で
3. 集約の事前計算（マテリアライズドビューに似ていますが、集約に合わせた順序で）

<br/>
<iframe width="560" height="315" src="https://www.youtube.com/embed/6CdnUdZSEG0?si=1zUyrP-tCvn9tXse" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## How do Projections work? {#how-do-projections-work}

実際には、Projectionは元のテーブルに対する追加の隠れたテーブルと考えることができます。プロジェクションは異なる行の順序を持ち、したがって元のテーブルとは異なる主キーを持ち、集約値を自動的かつ段階的に事前計算することができます。その結果、Projectionsを使用することでクエリ実行を高速化するための2つの「調整ツマミ」が提供されます：

- **主インデックスを適切に使用する**
- **集約を事前計算する**

Projectionsは、複数の行順序を持ち、挿入時に集約を事前計算することも可能な[マテリアライズドビュー](/materialized-views)にいくぶん似ています。
Projectionsは元のテーブルと自動的に更新されて同期されますが、マテリアライズドビューは明示的に更新されます。元のテーブルをターゲットとしたクエリが実行されると、ClickHouseは自動的に主キーをサンプリングし、同じ正しい結果を生成できるテーブルを選択しますが、読み取るデータの量が最小限になるようにします。以下の図に示されています：

<Image img={projections_1} size="md" alt="Projections in ClickHouse"/>

### Smarter storage with `_part_offset` {#smarter_storage_with_part_offset}

バージョン25.5以降、ClickHouseはプロジェクション内で仮想カラム`_part_offset`をサポートし、プロジェクションの新しい定義方法を提供します。

プロジェクションを定義する方法は次の2つです：

- **フルカラムを保存する（元の動作）**：プロジェクションはフルデータを含み、直接読み取ることができ、フィルターがプロジェクションのソート順序に一致する場合、より高いパフォーマンスを提供します。

- **ソートキーと`_part_offset`のみを保存する**：プロジェクションはインデックスのように機能します。ClickHouseはプロジェクションの主インデックスを使用して一致する行を特定しますが、実際のデータはベーステーブルから読み取ります。これにより、クエリ時のI/Oはわずかに増えますが、ストレージオーバーヘッドが削減されます。

上記のアプローチはミックスされ、プロジェクションの一部のカラムを保存し、他のカラムは`_part_offset`を介して間接的に保存することもできます。

## When to use Projections? {#when-to-use-projections}

Projectionsは、新しいユーザーにとって魅力的な機能であり、データが挿入される際に自動的に管理されます。さらに、クエリは単一のテーブルに送信され、可能な場合にはプロジェクションが利用されてレスポンスタイムを短縮します。

これは、ユーザーが適切な最適化されたターゲットテーブルを選択したり、フィルターに応じてクエリを再記述しなければならないマテリアライズドビューとは対照的です。これにより、ユーザーアプリケーションに対してより大きな重視が置かれ、クライアント側の複雑さが増します。

これらの利点にもかかわらず、プロジェクションにはいくつかの固有の制限があり、ユーザーはこれを認識し、慎重に展開する必要があります。

- Projectionsはソーステーブルと（隠れた）ターゲットテーブルで異なるTTLを使用することを許可しませんが、マテリアライズドビューは異なるTTLを許可します。
- Lightweight updatesおよびdeletesはプロジェクションを持つテーブルではサポートされていません。
- マテリアライズドビューは連鎖させることができます：1つのマテリアライズドビューのターゲットテーブルが別のマテリアライズドビューのソーステーブルになり得ますが、これはプロジェクションでは不可能です。
- Projectionsは結合をサポートしていませんが、マテリアライズドビューはサポートしています。
- Projectionsはフィルタ（`WHERE`句）をサポートしていませんが、マテリアライズドビューはサポートしています。

次のような場合にプロジェクションを使用することをお勧めします：

- データの完全な再配置が必要です。プロジェクション内の式は理論的には`GROUP BY`を使用できますが、集約を維持するにはマテリアライズドビューがより効果的です。また、クエリ最適化は、単純な再配置を使用するプロジェクション（すなわち`SELECT * ORDER BY x`）をより好む可能性が高いです。ユーザーは、この式内でカラムのサブセットを選択して、ストレージフットプリントを削減できます。
- 主要なストレージのフットプリントの潜在的な増加とデータの二重書き込みのオーバーヘッドに対してユーザーが快適である場合。挿入速度への影響をテストし、[ストレージオーバーヘッドを評価する](/data-compression/compression-in-clickhouse)こと。

## Examples {#examples}

### Filtering on columns which aren't in the primary key {#filtering-without-using-primary-keys}

この例では、テーブルにプロジェクションを追加する方法を示します。また、プロジェクションがテーブルの主キーに含まれないカラムでフィルタリングするクエリを加速する方法を見ていきます。

この例では、`pickup_datetime`でソートされたNew York Taxi Dataデータセットを使用します。
```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

乗客がドライバーに$200以上のチップを渡したすべてのトリップIDを見つけるために、簡単なクエリを書きます：

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

`tip_amount`でフィルタリングしているため、`ORDER BY`に含まれていないため、ClickHouseがテーブル全体スキャンを行ったことに注意してください。このクエリを加速しましょう。

元のテーブルと結果を保持するために、新しいテーブルを作成し、`INSERT INTO SELECT`を使用してデータをコピーします：

```sql
CREATE TABLE nyc_taxi.trips_with_projection AS nyc_taxi.trips;
INSERT INTO nyc_taxi.trips_with_projection SELECT * FROM nyc_taxi.trips;
```

プロジェクションを追加するために、`ALTER TABLE`文と`ADD PROJECTION`文を使用します：

```sql
ALTER TABLE nyc_taxi.trips_with_projection
ADD PROJECTION prj_tip_amount
(
    SELECT *
    ORDER BY tip_amount, dateDiff('minutes', pickup_datetime, dropoff_datetime)
)
```

プロジェクションを追加した後、`MATERIALIZE PROJECTION`文を使用することが必要です。これにより、指定されたクエリに従って、その中のデータが物理的に順序されて書き換えられます：

```sql
ALTER TABLE nyc.trips_with_projection MATERIALIZE PROJECTION prj_tip_amount
```

プロジェクションを追加したので、もう一度クエリを実行しましょう：

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips_with_projection WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

クエリ時間が大幅に減少し、スキャンした行が少なくて済んだことに気付きます。

`system.query_log`テーブルをクエリして、上記のクエリが実際に我々が作成したプロジェクションを使用したことを確認できます：

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

プロジェクションがクエリパフォーマンスを速くするためにどのように使用できるかを示すために、実際のデータセットを使用した例を見てみましょう。この例では、30.03万行の[UK Property Price Paid](https://clickhouse.com/docs/getting-started/example-datasets/uk-price-paid)チュートリアルからのテーブルを使用します。このデータセットは、[sql.clickhouse.com](https://sql.clickhouse.com/?query_id=6IDMHK3OMR1C97J6M9EUQS)環境内でも利用可能です。

テーブルが作成され、データが挿入された方法を見たい場合は、["The UK property prices dataset"](/getting-started/example-datasets/uk-price-paid)ページを参照できます。

このデータセットで2つの簡単なクエリを実行できます。最初はロンドンのカウンティで最も高い価格が支払われた場所をリストし、2番目はカウンティの平均価格を計算します：

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

どちらのクエリでも、30.03万行のフルテーブルスキャンが行われたことに注意してください。これは、`town`も`price`もテーブル作成時の`ORDER BY`文に含まれていなかったためです：

```sql
CREATE TABLE uk.uk_price_paid
(
  ...
)
ENGINE = MergeTree
--highlight-next-line
ORDER BY (postcode1, postcode2, addr1, addr2);
```

プロジェクションを使用してこのクエリを加速できるか見てみましょう。

元のテーブルと結果を保持するために、再び`INSERT INTO SELECT`を使用してテーブルの新しいコピーを作成します：

```sql
CREATE TABLE uk.uk_price_paid_with_projections AS uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections SELECT * FROM uk.uk_price_paid;
```

投影`prj_oby_town_price`を作成し、町と価格でソートする追加の（隠れた）テーブルを生成します。これは特定の町の最高価格のカウンティをリストするクエリを最適化します。

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

[`mutations_sync`](/operations/settings/settings#mutations_sync)設定が同期的な実行を強制するために使用されます。

平均価格をすべての既存の130 UKカウンティについて事前計算する追加の（隠れた）テーブルであるプロジェクション`prj_gby_county`を作成し、人口を増やします：

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
もし`prj_gby_county`プロジェクションのようにプロジェクションに`GROUP BY`句が使用されると、その（隠れた）テーブルの基になるストレージエンジンは`AggregatingMergeTree`になり、すべての集約関数は`AggregateFunction`に変換されます。これにより、適切な段階的データ集約が保証されます。
:::

以下の図は、主テーブル`uk_price_paid_with_projections`とその2つのプロジェクションの視覚化です：

<Image img={projections_2} size="md" alt="Visualization of the main table uk_price_paid_with_projections and its two projections"/>

ロンドンの最高価格の3つのカウンティをリストするクエリを再度実行すると、クエリパフォーマンスが向上していることがわかります：

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

同様に、3つの最高平均支払い価格を持つ英国のカウンティをリストするクエリ：

```sql runnable
SELECT
    county,
    avg(price)
FROM uk.uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
```

どちらのクエリも元のテーブルをターゲットとしており、どちらのクエリもフルテーブルスキャンを伴いました（すべての30.03万行がディスクからストリーミングされました）プロジェクションの2つを作成する前。

また、ロンドンの3つの最高価格をリストするクエリは、2.17百万行をストリーミングしています。クエリ用に最適化された2番目のテーブルを直接使用した場合、ディスクからストリーミングされたのは81.92千行だけでした。

この差の理由は、現在、上記で言及した`optimize_read_in_order`の最適化はプロジェクションではサポートされていないためです。

`system.query_log`テーブルを調べて、ClickHouseが上記の2つのクエリで自動的に2つのプロジェクションを使用したことを確認します（以下のプロジェクション列を参照）。

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

### Further examples {#further-examples}

以下の例は、同じUK価格データセットを使用して、プロジェクション有りと無しのクエリを対比しています。

元のテーブル（およびパフォーマンス）を保持するために、再び`CREATE AS`と`INSERT INTO SELECT`を使用してテーブルのコピーを作成します。

```sql
CREATE TABLE uk.uk_price_paid_with_projections_v2 AS uk.uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections_v2 SELECT * FROM uk.uk_price_paid;
```

#### Build a Projection {#build-projection}

`toYear(date)`, `district`, および `town`の次元で集計プロジェクションを作成しましょう：

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

既存データのプロジェクションをポピュレートします。（物理的に形成することなく、プロジェクションは新しく挿入されたデータのためだけに作成されます）：

```sql
ALTER TABLE uk.uk_price_paid_with_projections_v2
    MATERIALIZE PROJECTION projection_by_year_district_town
SETTINGS mutations_sync = 1
```

以下のクエリは、プロジェクション有りと無しのパフォーマンスを対比しています。プロジェクションの使用を無効にするためには、[`optimize_use_projections`](/operations/settings/settings#optimize_use_projections)設定を使用し、デフォルトでは有効になっています。

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
結果は同じであるべきですが、後者の例の方がパフォーマンスが優れています！

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

条件（date >= '2020-01-01'）を変更してプロジェクションの次元（`toYear(date) >= 2020`）に一致させる必要があります：

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

再び、結果は同じですが、2番目のクエリでのクエリパフォーマンスの改善に注意してください。

### Combining projections in one query {#combining-projections}

バージョン25.6から、前のバージョンで紹介された`_part_offset`サポートに基づき、ClickHouseは、複数のフィルターで単一のクエリを加速するために複数のプロジェクションを使用できるようになりました。

重要なことに、ClickHouseは依然として1つのプロジェクション（またはベーステーブル）からのみデータを読み取りますが、他のプロジェクションの主インデックスを使用して読み取り前に不必要なパーツを削減することができます。これは、異なるプロジェクションにそれぞれ一致する可能性のある複数のカラムでフィルタリングされるクエリに特に便利です。

> 現在、このメカニズムは完全なパーツのみを削減します。グラニュールレベルの削減はまだサポートされていません。

これを示すために、テーブルを定義し（`_part_offset`カラムを持つプロジェクションを使用）、上記の図に一致する5つの例行を挿入します。

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
  index_granularity = 1, -- one row per granule
  max_bytes_to_merge_at_max_space_in_pool = 1; -- disable merge
```

その後、テーブルにデータを挿入します：

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
注意：テーブルは、プロダクション使用には推奨されない、1行グラニュールやパーツのマージを無効にするカスタム設定を使用します。
:::

このセットアップでは：
- 5つの独立したパーツ（挿入された各行に1つ）
- 各行ごとに1つの主インデックスエントリ（ベーステーブルおよび各プロジェクション）
- 各パーツには正確に1行が含まれます。

このセットアップで、`region`および`user_id`の両方でフィルタリングするクエリを実行します。ベーステーブルの主インデックスは`event_date`と`id`から構築されているため、ここでは役に立たないため、ClickHouseは次のものを使用します：

- `region_proj`で地域に基づいてパーツを削減し、
- `user_id_proj`で`user_id`によってさらに削減します。

この動作は`EXPLAIN projections = 1`を使用して可視化できます。これにより、ClickHouseがどのようにプロジェクションを選択し適用するかが表示されます。

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

`EXPLAIN`出力（上記に示された通り）は論理的なクエリプランを明らかにします：

| 行番号 | 説明                                                                                                |
|--------|-----------------------------------------------------------------------------------------------------|
| 3      | `page_views`ベーステーブルから読む予定                                                             |
| 5-13   | `region_proj`を使用して地域が'us_west'である3つのパーツを特定し、5つのパーツのうち2つを削除します |
| 14-22  | `user_id_proj`を使用して`user_id = 107`の1つのパーツを特定し、残りの3つのパーツのうち2つを削除します |

結局のところ、**5つのパーツのうち1つ**がベーステーブルから読み取られます。
複数のプロジェクションのインデックス分析を組み合わせることで、ClickHouseはスキャンするデータ量を大幅に削減し、ストレージオーバーヘッドを低く保ちながらパフォーマンスを向上させます。

## Related content {#related-content}
- [A Practical Introduction to Primary Indexes in ClickHouse](/guides/best-practices/sparse-primary-indexes#option-3-projections)
- [Materialized Views](/docs/materialized-views)
- [ALTER PROJECTION](/sql-reference/statements/alter/projection)
