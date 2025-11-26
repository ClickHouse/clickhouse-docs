---
slug: /data-modeling/projections
title: 'プロジェクション'
description: 'プロジェクションとは何か、クエリ性能の向上のための活用方法、マテリアライズドビューとの違いについて説明するページ。'
keywords: ['プロジェクション', 'プロジェクション', 'クエリ最適化']
sidebar_order: 1
doc_type: 'guide'
---

import projections_1 from '@site/static/images/data-modeling/projections_1.png';
import projections_2 from '@site/static/images/data-modeling/projections_2.png';
import Image from '@theme/IdealImage';


# プロジェクション



## はじめに {#introduction}

ClickHouse は、大量データに対するリアルタイムの分析クエリを高速化するための、さまざまな仕組みを提供しています。その 1 つが、_Projection_ を利用してクエリを高速化する方法です。Projection は、関心のある属性によってデータを並び替えることで、クエリを最適化します。これは次のいずれかになり得ます。

1. データの完全な並び替え
2. 元のテーブルの一部で、異なる並び順を持つもの
3. あらかじめ計算された集約（マテリアライズドビューに類似）であり、その集約に合わせて最適化された並び順を持つもの

<br/>
<iframe width="560" height="315" src="https://www.youtube.com/embed/6CdnUdZSEG0?si=1zUyrP-tCvn9tXse" title="YouTube 動画プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>



## Projections はどのように動作しますか？ {#how-do-projections-work}

実務的には、Projection は元のテーブルに対する追加の「非表示テーブル」と考えることができます。Projection は元のテーブルとは異なる行順序を持つことができ、その結果として異なるプライマリインデックスを持つことができ、さらに集約値を自動的かつ段階的に事前計算できます。その結果、Projections を使用すると、クエリ実行を高速化するための 2 つの「チューニング手段」を得られます:

- **プライマリインデックスを適切に利用する**
- **集約を事前計算する**

Projections は、複数の行順序を持つテーブルを用意でき、挿入時に集約を事前計算できるという点で [Materialized Views](/materialized-views) と似ています。
Projections は自動的に更新され、元のテーブルと同期された状態に保たれますが、Materialized Views は明示的に更新する必要があります。クエリが元のテーブルを対象とする場合、
ClickHouse はプライマリキーを自動的にサンプリングし、同じ正しい結果を生成でき、かつ読み取るデータ量が最も少なくて済むテーブルを選択します。これは次の図に示すとおりです:

<Image img={projections_1} size="md" alt="ClickHouse における Projections"/>

### `_part_offset` を使ったよりスマートなストレージ {#smarter_storage_with_part_offset}

バージョン 25.5 以降、ClickHouse は Projection 内で仮想カラム `_part_offset` をサポートしており、Projection を定義する新しい方法を提供します。

現在、Projection を定義する方法は 2 つあります:

- **全カラムを保存する（従来の動作）**: Projection には完全なデータが含まれ、直接読み取ることができます。そのため、フィルタが Projection のソート順と一致する場合に高速なパフォーマンスを提供します。

- **ソートキーと `_part_offset` のみを保存する**: Projection はインデックスのように動作します。
  ClickHouse は Projection のプライマリインデックスを使用して一致する行を特定しますが、実際のデータはベーステーブルから読み取ります。これにより、クエリ時の I/O がわずかに増える代わりに、ストレージのオーバーヘッドを削減できます。

上記のアプローチは組み合わせて使用することもでき、一部のカラムを Projection 内に保存し、その他を `_part_offset` を介して間接的に保存できます。



## プロジェクションをいつ使用すべきか {#when-to-use-projections}

プロジェクションは、新規ユーザーにとって魅力的な機能です。データの挿入に応じて自動的に
メンテナンスされるためです。さらに、クエリは単一のテーブルに対して送るだけでよく、可能な場合には
プロジェクションが活用されて応答時間を短縮できます。

これはマテリアライズドビューとは対照的です。マテリアライズドビューでは、ユーザーがフィルタ条件に
応じて適切に最適化されたターゲットテーブルを選択するか、クエリを書き換える必要があります。
そのためユーザーアプリケーション側への要求が大きくなり、クライアント側の複雑さが増加します。

これらの利点にもかかわらず、プロジェクションには本質的な制約がいくつか存在するため、ユーザーはそれらを
理解したうえで、慎重に使用する必要があります。

- プロジェクションでは、ソーステーブルと（非表示の）ターゲットテーブルで異なる TTL を使用できませんが、
  マテリアライズドビューでは異なる TTL を使用できます。
- プロジェクションを持つテーブルでは、軽量な更新および削除はサポートされていません。
- マテリアライズドビューは連鎖させることができます。1 つのマテリアライズドビューのターゲットテーブルを、
  別のマテリアライズドビューのソーステーブルとして利用することができます。しかし、プロジェクションでは
  これはできません。
- プロジェクションは JOIN をサポートしませんが、マテリアライズドビューはサポートします。
- プロジェクションはフィルタ（`WHERE` 句）をサポートしませんが、マテリアライズドビューはサポートします。

次のような場合にはプロジェクションの使用を推奨します。

- データの完全な並べ替えが必要な場合。理論上、プロジェクション内の式で `GROUP BY` を使用することも
  できますが、集計の維持にはマテリアライズドビューの方が効果的です。クエリオプティマイザも、
  `SELECT * ORDER BY x` のような単純な並べ替えを行うプロジェクションをより積極的に活用する傾向があります。
  この式では、ストレージ使用量を削減するために、一部の列のみを選択することもできます。
- ストレージ使用量の増加およびデータを 2 回書き込むことによるオーバーヘッドが発生する可能性を
  許容できる場合。挿入速度への影響をテストし、
  [ストレージオーバーヘッドを評価](/data-compression/compression-in-clickhouse)してください。



## 例

### プライマリキーに含まれていない列でのフィルタリング

この例では、テーブルに Projection を追加する方法を説明します。
また、テーブルのプライマリキーに含まれていない列を条件とするクエリを高速化するために、
Projection をどのように利用できるかも見ていきます。

この例では、`pickup_datetime` でソートされている、
[sql.clickhouse.com](https://sql.clickhouse.com/) で利用可能な New York Taxi Data
というデータセットを使用します。

乗客がドライバーに 200 ドルを超えるチップを支払ったすべてのトリップ ID を検索する、
単純なクエリを書いてみましょう。

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

`ORDER BY` に含まれていない `tip_amount` でフィルタリングしているため、ClickHouse はテーブル全体をスキャンする必要がありました。クエリを高速化しましょう。

元のテーブルとその結果を保持するために、新しいテーブルを作成し、`INSERT INTO SELECT` を使ってデータをコピーします。

```sql
CREATE TABLE nyc_taxi.trips_with_projection AS nyc_taxi.trips;
INSERT INTO nyc_taxi.trips_with_projection SELECT * FROM nyc_taxi.trips;
```

プロジェクションを追加するには、`ALTER TABLE` ステートメントと `ADD PROJECTION` ステートメントを組み合わせて使用します。

```sql
ALTER TABLE nyc_taxi.trips_with_projection
ADD PROJECTION prj_tip_amount
(
    SELECT *
    ORDER BY tip_amount, dateDiff('minutes', pickup_datetime, dropoff_datetime)
)
```

プロジェクションを追加した後は、その中のデータを上記で指定したクエリに従って物理的に並び替えて書き換えるために、`MATERIALIZE PROJECTION` ステートメントを使用する必要があります。

```sql
ALTER TABLE nyc.trips_with_projection MATERIALIZE PROJECTION prj_tip_amount
```

プロジェクションを追加したので、改めてクエリを実行してみましょう。

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips_with_projection WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

クエリの実行時間を大幅に短縮できており、スキャンする行数も少なくなっていることに注目してください。

上記のクエリが実際に作成したプロジェクションを使用していることは、
`system.query_log` テーブルをクエリすることで確認できます。

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

### プロジェクションを使用した UK Price Paid クエリの高速化

プロジェクションを使用してクエリパフォーマンスを高速化できることを示すために、実際のデータセットを用いた例を見ていきます。この例では、チュートリアル [UK Property Price Paid](https://clickhouse.com/docs/getting-started/example-datasets/uk-price-paid) で使用している 3,003 万行のテーブルを使用します。このデータセットは
[sql.clickhouse.com](https://sql.clickhouse.com/?query_id=6IDMHK3OMR1C97J6M9EUQS)
環境内でも利用可能です。

テーブルの作成方法とデータの挿入方法を確認したい場合は、
[「The UK property prices dataset」](/getting-started/example-datasets/uk-price-paid)
ページを参照してください。

このデータセットに対して 2 つの簡単なクエリを実行してみます。1 つ目はロンドンにある郡を、支払われた価格が高い順に一覧表示するもので、2 つ目は各郡の平均価格を計算するものです。

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

クエリ自体は非常に高速ですが、どちらのクエリでも 3,003 万行すべてに対してフルテーブルスキャンが発生している点に注目してください。これは、テーブル作成時の `ORDER BY` 句に `town` と `price` のどちらも含めなかったためです。

```sql
CREATE TABLE uk.uk_price_paid
(
  ...
)
ENGINE = MergeTree
--highlight-next-line
ORDER BY (postcode1, postcode2, addr1, addr2);
```

プロジェクションを使ってこのクエリを高速化できるか確認してみましょう。

元のテーブルと結果を保持するために、新しいテーブルを作成し、`INSERT INTO SELECT` を使ってデータをコピーします。

```sql
CREATE TABLE uk.uk_price_paid_with_projections AS uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections SELECT * FROM uk.uk_price_paid;
```

ここでは、町と価格で並べ替えられたプライマリインデックスを持つ追加の（非表示の）テーブルを生成するプロジェクション `prj_oby_town_price` を作成し、データを投入します。これは、特定の町における最高支払額に対する郡の一覧を取得するクエリを最適化するためのものです。

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
同期実行を強制するために使用します。

投影 `prj_gby_county` を作成してデータを投入します。これは追加の（非表示の）テーブルで、
既存の英国 130 郡すべてについて avg(price) 集約値を増分的に前計算します。

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
上記の `prj_gby_county` プロジェクションのように、プロジェクション内で `GROUP BY` 句が使用されている場合、（非表示の）テーブルの基盤となるストレージエンジンは `AggregatingMergeTree` になり、すべての集約関数は `AggregateFunction` に変換されます。これにより、増分集約が適切に行われます。
:::

以下の図はメインテーブル `uk_price_paid_with_projections`
と、その 2 つのプロジェクションの可視化です。

<Image img={projections_2} size="md" alt="メインテーブル uk_price_paid_with_projections とその 2 つのプロジェクションの可視化" />

ロンドンにおける支払価格が最も高い上位 3 件の郡を列挙するクエリを再度実行すると、クエリパフォーマンスが向上していることが分かります。

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

同様に、平均支払価格が最も高い英国の郡を上位 3 件取得するクエリは次のとおりです。

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
いずれのクエリもフルテーブルスキャン（ディスクから 3,003 万行すべてがストリーミングされた）
になっていることに注意してください。

また、支払価格が最も高い上位 3 件についてロンドンのカウンティを列挙するクエリでは、
217 万行がストリーミングされていることにも注意してください。このクエリ用に最適化された
2 つ目のテーブルを直接使用した場合、ディスクからストリーミングされたのは 8.192 万行だけでした。

この違いが生じる理由は、前述の `optimize_read_in_order` 最適化が、現時点では
プロジェクションではサポートされていないためです。

`system.query_log` テーブルを調査して、上記 2 つのクエリに対して ClickHouse が
2 つのプロジェクションを自動的に使用していることを確認します（以下の projections 列を参照）:

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

2行のセット。経過時間: 0.006秒。
```

### さらに例を見てみましょう

次の例では、同じUKの価格データセットを使用し、プロジェクションあり／なしのクエリを比較します。

オリジナルのテーブル（およびそのパフォーマンス）を保持するため、再度 `CREATE AS` と `INSERT INTO SELECT` を使用してテーブルのコピーを作成します。

```sql
CREATE TABLE uk.uk_price_paid_with_projections_v2 AS uk.uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections_v2 SELECT * FROM uk.uk_price_paid;
```

#### プロジェクションを作成する

`toYear(date)`、`district`、`town` をディメンションとする集約プロジェクションを作成してみましょう。

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

既存データに対してプロジェクションを適用します。（マテリアライズしない場合、プロジェクションは新規に挿入されるデータに対してのみ作成されます）:

```sql
ALTER TABLE uk.uk_price_paid_with_projections_v2
    MATERIALIZE PROJECTION projection_by_year_district_town
SETTINGS mutations_sync = 1
```

以下のクエリでは、プロジェクションあり／なしの場合のパフォーマンスを比較します。プロジェクションを無効にするには、デフォルトで有効になっている設定 [`optimize_use_projections`](/operations/settings/settings#optimize_use_projections) を使用します。

#### クエリ 1. 年ごとの平均価格

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

結果は同じですが、後者の例の方がパフォーマンスに優れています。

#### クエリ 2. ロンドンの年別平均価格

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

#### クエリ 3. 最も高価な地区

条件 `(date &gt;= &#39;2020-01-01&#39;)` は、投影ディメンション（`toYear(date) >= 2020)`）に一致するように変更する必要があります。

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

同じ結果になりますが、2 番目のクエリではクエリ性能が向上している点に注目してください。

### 1 つのクエリでプロジェクションを組み合わせる

バージョン 25.6 からは、前のバージョンで導入された `_part_offset` サポートを基盤として、
ClickHouse は複数のプロジェクションを用いて、複数のフィルタ条件を持つ 1 つのクエリを高速化できるようになりました。

重要なのは、ClickHouse は依然として 1 つのプロジェクション（またはベーステーブル）からのみデータを読み取りますが、
読み取り前に不要なパーツを除外するために、他のプロジェクションのプライマリインデックスを利用できる点です。
これは、複数のカラムでフィルタし、それぞれが異なるプロジェクションに一致し得るようなクエリで特に有用です。

> 現在、この仕組みはパーツ全体のみを除外します。グラニュールレベルでの除外は
> まだサポートされていません。

これを示すために、`_part_offset` カラムを利用するプロジェクション付きのテーブルを定義し、
上記の図に対応する 5 行のサンプルデータを挿入します。

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
  index_granularity = 1, -- 1グラニュールあたり1行
  max_bytes_to_merge_at_max_space_in_pool = 1; -- マージを無効にする
```

次に、テーブルにデータを挿入します。

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
注意: このテーブルでは、説明用に 1 行単位のグラニュールやパーツマージの無効化などのカスタム設定を使用していますが、本番環境での使用は推奨されません。
:::

この構成により、次のような状態になります:

* 5 つの個別のパーツ（挿入された各行につき 1 パーツ）
* 各行に対して 1 つのプライマリインデックスエントリ（ベーステーブルおよび各プロジェクション）
* 各パーツにはちょうど 1 行のみが含まれる

この構成で、`region` と `user_id` の両方でフィルタするクエリを実行します。
ベーステーブルのプライマリインデックスは `event_date` と `id` から構築されているため、
ここでは有用ではなく、そのため ClickHouse は次を使用します:

* `region_proj` を使って region ごとにパーツを絞り込み
* `user_id_proj` を使ってさらに `user_id` で絞り込み

この挙動は `EXPLAIN projections = 1` を使うと確認でき、ClickHouse がプロジェクションをどのように選択し、適用しているかが分かります。

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

上に示した `EXPLAIN` の出力は、論理クエリプランを上から順に示しています:

| Row number | Description                                                                              |
| ---------- | ---------------------------------------------------------------------------------------- |
| 3          | `page_views` ベーステーブルから読み取るプラン                                                            |
| 5-13       | `region_proj` を使用して region = &#39;us&#95;west&#39; である 3 つのパーツを特定し、5 つのパーツのうち 2 つをプルーニング |
| 14-22      | `user_id = 107` である 1 つのパーツを特定するために `user_id_proj` を使用し、残り 3 つのパーツのうちさらに 2 つをプルーニング      |

最終的に、ベーステーブルから読み取られるのは **5 つのパーツのうち 1 つだけ** です。
複数のプロジェクションのインデックス分析を組み合わせることで、ClickHouse はスキャンするデータ量を大幅に削減し、
ストレージのオーバーヘッドを抑えつつパフォーマンスを向上させます。


## 関連コンテンツ {#related-content}
- [ClickHouse のプライマリインデックスに関する実践的入門](/guides/best-practices/sparse-primary-indexes#option-3-projections)
- [マテリアライズドビュー](/docs/materialized-views)
- [ALTER PROJECTION](/sql-reference/statements/alter/projection)
