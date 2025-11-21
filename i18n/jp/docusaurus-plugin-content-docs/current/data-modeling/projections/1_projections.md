---
slug: /data-modeling/projections
title: 'プロジェクション'
description: 'プロジェクションとは何か、それらをどのようにクエリ性能の向上に利用できるか、そしてマテリアライズドビューとの違いについて説明します。'
keywords: ['projection', 'projections', 'クエリ最適化']
sidebar_order: 1
doc_type: 'guide'
---

import projections_1 from '@site/static/images/data-modeling/projections_1.png';
import projections_2 from '@site/static/images/data-modeling/projections_2.png';
import Image from '@theme/IdealImage';


# プロジェクション



## はじめに {#introduction}

ClickHouseは、リアルタイムシナリオにおいて大量のデータに対する分析クエリを高速化するための様々なメカニズムを提供しています。クエリを高速化するメカニズムの一つが_プロジェクション_の使用です。プロジェクションは、対象となる属性によってデータを再配置することでクエリを最適化します。これには以下が含まれます:

1. 完全な再配置
2. 異なる順序を持つ元のテーブルのサブセット
3. 事前計算された集計(マテリアライズドビューに類似)ただし集計に合わせた順序を持つもの

<br />
<iframe
  width='560'
  height='315'
  src='https://www.youtube.com/embed/6CdnUdZSEG0?si=1zUyrP-tCvn9tXse'
  title='YouTubeビデオプレーヤー'
  frameborder='0'
  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
  referrerpolicy='strict-origin-when-cross-origin'
  allowfullscreen
></iframe>


## プロジェクションの仕組み {#how-do-projections-work}

実質的に、プロジェクションは元のテーブルに対する追加の隠しテーブルとして考えることができます。プロジェクションは元のテーブルとは異なる行順序を持つことができ、したがって異なるプライマリインデックスを持つことができます。また、集計値を自動的かつ増分的に事前計算することができます。その結果、プロジェクションを使用することで、クエリ実行を高速化するための2つの「調整手段」が提供されます:

- **プライマリインデックスの適切な使用**
- **集計の事前計算**

プロジェクションはいくつかの点で[マテリアライズドビュー](/materialized-views)に似ており、マテリアライズドビューも複数の行順序を持ち、挿入時に集計を事前計算することができます。
プロジェクションは自動的に更新され、元のテーブルと同期が保たれます。これは明示的に更新されるマテリアライズドビューとは異なります。クエリが元のテーブルを対象とする場合、ClickHouseは自動的にプライマリキーをサンプリングし、同じ正しい結果を生成できるが、読み取るデータ量が最小限で済むテーブルを選択します。これを以下の図に示します:

<Image img={projections_1} size='md' alt='Projections in ClickHouse' />

### `_part_offset`によるスマートなストレージ {#smarter_storage_with_part_offset}

バージョン25.5以降、ClickHouseはプロジェクション内で仮想カラム`_part_offset`をサポートしており、プロジェクションを定義する新しい方法を提供します。

プロジェクションを定義する方法は現在2つあります:

- **完全なカラムを保存する(従来の動作)**: プロジェクションは完全なデータを含み、直接読み取ることができます。フィルタがプロジェクションのソート順序と一致する場合、より高速なパフォーマンスを提供します。

- **ソートキー + `_part_offset`のみを保存する**: プロジェクションはインデックスのように機能します。ClickHouseはプロジェクションのプライマリインデックスを使用して一致する行を特定しますが、実際のデータはベーステーブルから読み取ります。これにより、クエリ時のI/Oがわずかに増加する代わりに、ストレージのオーバーヘッドが削減されます。

上記のアプローチは混在させることもでき、一部のカラムをプロジェクションに保存し、他のカラムは`_part_offset`を介して間接的に保存することができます。


## プロジェクションをいつ使用するか？ {#when-to-use-projections}

プロジェクションは、データ挿入時に自動的にメンテナンスされるため、新規ユーザーにとって魅力的な機能です。さらに、クエリを単一のテーブルに送信するだけで、プロジェクションが可能な限り活用され、応答時間が短縮されます。

これは、マテリアライズドビューとは対照的です。マテリアライズドビューでは、フィルタに応じて適切に最適化されたターゲットテーブルを選択するか、クエリを書き直す必要があります。これにより、ユーザーアプリケーションへの負担が増大し、クライアント側の複雑性が高まります。

これらの利点にもかかわらず、プロジェクションには固有の制限がいくつかあり、ユーザーはこれらを認識しておく必要があります。そのため、プロジェクションは慎重に使用すべきです。

- プロジェクションでは、ソーステーブルと（隠された）ターゲットテーブルに異なるTTLを使用できません。マテリアライズドビューでは異なるTTLが使用可能です。
- プロジェクションを持つテーブルでは、軽量な更新と削除はサポートされていません。
- マテリアライズドビューは連鎖可能です。あるマテリアライズドビューのターゲットテーブルを別のマテリアライズドビューのソーステーブルとして使用できます。プロジェクションではこれは不可能です。
- プロジェクションは結合をサポートしていませんが、マテリアライズドビューはサポートしています。
- プロジェクションはフィルタ（`WHERE`句）をサポートしていませんが、マテリアライズドビューはサポートしています。

以下の場合にプロジェクションの使用を推奨します：

- データの完全な並べ替えが必要な場合。プロジェクション内の式は理論的には`GROUP BY`を使用できますが、集計の維持にはマテリアライズドビューの方が効果的です。また、クエリオプティマイザは、単純な並べ替えを使用するプロジェクション（例：`SELECT * ORDER BY x`）を活用する可能性が高くなります。ユーザーはこの式で列のサブセットを選択することで、ストレージ使用量を削減できます。
- ストレージ使用量の増加とデータを2回書き込むオーバーヘッドを許容できる場合。挿入速度への影響をテストし、[ストレージオーバーヘッドを評価](/data-compression/compression-in-clickhouse)してください。


## Examples {#examples}

### プライマリキーに含まれないカラムでのフィルタリング {#filtering-without-using-primary-keys}

この例では、テーブルにプロジェクションを追加する方法を示します。
また、テーブルのプライマリキーに含まれないカラムでフィルタリングするクエリを高速化するために、プロジェクションをどのように活用できるかについても見ていきます。

この例では、[sql.clickhouse.com](https://sql.clickhouse.com/)で利用可能なNew York Taxi Dataデータセットを使用します。このデータセットは`pickup_datetime`で順序付けられています。

乗客がドライバーに200ドルを超えるチップを支払ったすべての乗車IDを検索する簡単なクエリを書いてみましょう:

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

`ORDER BY`に含まれていない`tip_amount`でフィルタリングしているため、ClickHouseはフルテーブルスキャンを実行する必要があることに注意してください。このクエリを高速化しましょう。

元のテーブルと結果を保持するために、新しいテーブルを作成し、`INSERT INTO SELECT`を使用してデータをコピーします:

```sql
CREATE TABLE nyc_taxi.trips_with_projection AS nyc_taxi.trips;
INSERT INTO nyc_taxi.trips_with_projection SELECT * FROM nyc_taxi.trips;
```

プロジェクションを追加するには、`ALTER TABLE`文と`ADD PROJECTION`文を組み合わせて使用します:

```sql
ALTER TABLE nyc_taxi.trips_with_projection
ADD PROJECTION prj_tip_amount
(
    SELECT *
    ORDER BY tip_amount, dateDiff('minutes', pickup_datetime, dropoff_datetime)
)
```

プロジェクションを追加した後、`MATERIALIZE PROJECTION`文を使用して、上記で指定したクエリに従ってデータが物理的に順序付けられ、書き換えられるようにする必要があります:

```sql
ALTER TABLE nyc.trips_with_projection MATERIALIZE PROJECTION prj_tip_amount
```

プロジェクションを追加したので、もう一度クエリを実行してみましょう:

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips_with_projection WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

クエリ時間を大幅に短縮でき、スキャンする行数も少なくなったことに注目してください。

`system.query_log`テーブルをクエリすることで、上記のクエリが実際に作成したプロジェクションを使用したことを確認できます:

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

### プロジェクションを使用してUK不動産価格クエリを高速化する {#using-projections-to-speed-up-UK-price-paid}

プロジェクションがクエリパフォーマンスの高速化にどのように使用できるかを実証するために、実際のデータセットを使用した例を見てみましょう。この例では、3,003万行を含む[UK Property Price Paid](https://clickhouse.com/docs/getting-started/example-datasets/uk-price-paid)チュートリアルのテーブルを使用します。このデータセットは、[sql.clickhouse.com](https://sql.clickhouse.com/?query_id=6IDMHK3OMR1C97J6M9EUQS)環境でも利用可能です。

テーブルの作成方法とデータの挿入方法を確認したい場合は、["The UK property prices dataset"](/getting-started/example-datasets/uk-price-paid)ページを参照してください。

このデータセットに対して2つの簡単なクエリを実行できます。最初のクエリは、支払われた価格が最も高いロンドンの郡をリストし、2番目のクエリは郡の平均価格を計算します:

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

非常に高速ではありますが、どちらのクエリでも 3,003 万行すべてに対するテーブルのフルスキャンが発生していることに注目してください。これは、テーブル作成時の `ORDER BY` 句に `town` も `price` も含まれていなかったためです。

```sql
CREATE TABLE uk.uk_price_paid
(
  ...
)
ENGINE = MergeTree
--highlight-next-line
ORDER BY (postcode1, postcode2, addr1, addr2);
```

このクエリがプロジェクションを使って高速化できるか確認してみましょう。

元のテーブルと結果を保持するために、新しいテーブルを作成し、`INSERT INTO SELECT` を使ってデータをコピーします。

```sql
CREATE TABLE uk.uk_price_paid_with_projections AS uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections SELECT * FROM uk.uk_price_paid;
```

`prj_oby_town_price` というプロジェクションを作成してデータを投入します。このプロジェクションは、町と価格でソートされたプライマリインデックス付きの追加（非表示）テーブルを生成し、特定の町において支払額が最も高い価格に対する郡の一覧を取得するクエリを最適化します。

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

[`mutations_sync`](/operations/settings/settings#mutations_sync) 設定は、
同期実行を強制するために使用されます。

`prj_gby_county` という Projection を作成してデータを投入します。これは追加の（非表示の）テーブルであり、
既存の 130 の UK county すべてについて avg(price) 集約値を段階的に事前計算します。

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
`prj_gby_county` プロジェクションのように、プロジェクション内で `GROUP BY` 句が使用されている場合、（非表示の）テーブルの基盤となるストレージエンジンは `AggregatingMergeTree` となり、すべての集約関数は `AggregateFunction` に変換されます。これにより、適切な増分データ集約が保証されます。
:::

以下の図は、メインテーブル `uk_price_paid_with_projections`
とその 2 つのプロジェクションを可視化したものです:

<Image img={projections_2} size="md" alt="メインテーブル uk_price_paid_with_projections とその 2 つのプロジェクションの可視化" />

ロンドンにおける、支払価格が最も高い上位 3 件の郡を列挙するクエリを
あらためて実行すると、クエリのパフォーマンスが向上していることが分かります:

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

同様に、平均支払価格が最も高い英国の郡を上位 3 つまで列挙するクエリは次のとおりです。

```sql runnable
SELECT
    county,
    avg(price)
FROM uk.uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
```

両方のクエリが元のテーブルを対象としており、2 つのプロジェクションを作成する前は、
どちらのクエリでもフルテーブルスキャン（3,003 万行すべてがディスクからストリーミングされた）
が発生している点に注意してください。

また、ロンドンの郡で最も高い価格のトップ 3 を列挙するクエリでは、
217 万行がストリーミングされている点にも注意してください。
このクエリ向けに最適化された別のテーブルを直接利用した場合は、
ディスクからストリーミングされたのは 8.192 万行のみでした。

この差が生じる理由は、前述の `optimize_read_in_order`
最適化が、現時点ではプロジェクションに対してサポートされていないためです。

ClickHouse が上記 2 つのクエリに対して自動的に 2 つのプロジェクションを
利用していることを確認するため、`system.query_log` テーブルを確認します
（以下の projections 列を参照）：

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

以下の例では、同じ英国価格データセットを使用し、プロジェクションありとなしのクエリを対比します。

元のテーブル(およびパフォーマンス)を保持するため、`CREATE AS`と`INSERT INTO SELECT`を使用してテーブルのコピーを再度作成します。

```sql
CREATE TABLE uk.uk_price_paid_with_projections_v2 AS uk.uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections_v2 SELECT * FROM uk.uk_price_paid;
```

#### プロジェクションの構築 {#build-projection}

`toYear(date)`、`district`、`town`のディメンションによる集約プロジェクションを作成しましょう:

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

既存データに対してプロジェクションを実体化します。(実体化しない場合、プロジェクションは新しく挿入されたデータに対してのみ作成されます):

```sql
ALTER TABLE uk.uk_price_paid_with_projections_v2
    MATERIALIZE PROJECTION projection_by_year_district_town
SETTINGS mutations_sync = 1
```

以下のクエリは、プロジェクションありとなしのパフォーマンスを対比します。プロジェクションの使用を無効にするには、デフォルトで有効になっている設定[`optimize_use_projections`](/operations/settings/settings#optimize_use_projections)を使用します。

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

結果は同じですが、後者の例ではパフォーマンスが向上します!

#### クエリ2. ロンドンにおける年ごとの平均価格 {#average-price-london-projections}

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

#### クエリ3. 最も高額な地域 {#most-expensive-neighborhoods-projections}

条件(date >= '2020-01-01')は、プロジェクションのディメンション(`toYear(date) >= 2020`)に一致するように変更する必要があります:

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

結果は同じですが、2番目のクエリのパフォーマンス向上に注目してください。

### 1つのクエリで複数のプロジェクションを組み合わせる {#combining-projections}

バージョン25.6以降、前バージョンで導入された`_part_offset`サポートを基盤として、ClickHouseは複数のフィルタを持つ単一のクエリを高速化するために複数のプロジェクションを使用できるようになりました。

重要な点として、ClickHouseは依然として1つのプロジェクション(またはベーステーブル)からのみデータを読み取りますが、読み取り前に他のプロジェクションのプライマリインデックスを使用して不要なパートを削除できます。
これは、複数のカラムでフィルタリングするクエリに特に有用であり、各カラムが異なるプロジェクションに一致する可能性があります。

> 現在、このメカニズムはパート全体のみを削除します。グラニュールレベルの削除はまだサポートされていません。

これを実証するために、テーブル(`_part_offset`カラムを使用したプロジェクション付き)を定義し、上記の図に対応する5つのサンプル行を挿入します。

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

次に、テーブルにデータを挿入します:

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
注意: このテーブルは、1行グラニュールやパートマージの無効化など、説明のためのカスタム設定を使用しており、本番環境での使用は推奨されません。
:::

このセットアップにより以下が生成されます:

- 5つの個別のパート(挿入された行ごとに1つ)
- 行ごとに1つのプライマリインデックスエントリ(ベーステーブルと各プロジェクション内)
- 各パートには正確に1行が含まれる

このセットアップで、`region`と`user_id`の両方でフィルタリングするクエリを実行します。
ベーステーブルのプライマリインデックスは`event_date`と`id`から構築されているため、ここでは役に立ちません。そのため、ClickHouseは以下を使用します:

- `region_proj`でリージョンによってパートを削除
- `user_id_proj`で`user_id`によってさらに削除

この動作は`EXPLAIN projections = 1`を使用することで確認でき、ClickHouseがプロジェクションをどのように選択して適用するかが表示されます。

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
 6. │         Description: プロジェクションが解析され、パートレベルのフィルタリングに使用されます │
 7. │         Condition: (region in ['us_west', 'us_west'])                                  │
 8. │         Search Algorithm: binary search                                                │
 9. │         Parts: 3                                                                       │
10. │         Marks: 3                                                                       │
11. │         Ranges: 3                                                                      │
12. │         Rows: 3                                                                        │
13. │         Filtered Parts: 2                                                              │
14. │       Name: user_id_proj                                                               │
15. │         Description: プロジェクションが解析され、パートレベルのフィルタリングに使用されます │
16. │         Condition: (user_id in [107, 107])                                             │
17. │         Search Algorithm: binary search                                                │
18. │         Parts: 1                                                                       │
19. │         Marks: 1                                                                       │
20. │         Ranges: 1                                                                      │
21. │         Rows: 1                                                                        │
22. │         Filtered Parts: 2                                                              │
    └────────────────────────────────────────────────────────────────────────────────────────┘
```

`EXPLAIN` の出力（上に示したもの）は、論理クエリプランを上から下へと示しています。

| Row number | Description                                                                                  |
| ---------- | -------------------------------------------------------------------------------------------- |
| 3          | `page_views` ベーステーブルから読み取る計画                                                                 |
| 5-13       | `region_proj` を使用して region = &#39;us&#95;west&#39; である 3 つのパーツを特定し、5 つのパーツのうち 2 つをスキャン対象から外す |
| 14-22      | `user_id_proj` を使用して `user_id = 107` である 1 つのパーツを特定し、残り 3 つのパーツのうちさらに 2 つをスキャン対象から外す         |

最終的に、ベーステーブルから読み取られるのは **5 つのパーツのうち 1 つだけ** です。
複数のプロジェクションに対するインデックス解析を組み合わせることで、ClickHouse はスキャンするデータ量を大幅に削減し、
ストレージのオーバーヘッドを抑えつつ性能を向上させます。


## 関連コンテンツ {#related-content}

- [ClickHouseのプライマリインデックス実践入門](/guides/best-practices/sparse-primary-indexes#option-3-projections)
- [マテリアライズドビュー](/docs/materialized-views)
- [ALTER PROJECTION](/sql-reference/statements/alter/projection)
