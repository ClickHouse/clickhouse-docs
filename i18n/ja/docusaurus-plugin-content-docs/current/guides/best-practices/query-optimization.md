```markdown
---
slug: /optimize/query-optimization
sidebar_label: クエリ最適化
title: クエリ最適化のガイド
description: クエリパフォーマンスを向上させるための一般的な手法を説明するクエリ最適化のシンプルなガイド
---

# クエリ最適化のシンプルなガイド

このセクションでは、[analyzer](/operations/analyzer)、[クエリプロファイリング](/operations/optimizing-performance/sampling-query-profiler)、または[Nullableカラムの回避](/optimize/avoid-nullable-columns)など、さまざまなパフォーマンスおよび最適化技術を使用して、ClickHouseクエリのパフォーマンスを向上させる方法を一般的なシナリオを通じて説明します。

## クエリパフォーマンスを理解する {#understand-query-performance}

パフォーマンス最適化を考える最適なタイミングは、初めてClickHouseにデータを取り込む前に[データスキーマ](/data-modeling/schema-design)を設定しているときです。

しかし、正直なところ、データがどれだけ成長するか、どのようなクエリが実行されるかを予測するのは難しいです。

既存のデプロイメントがあり、改善したいクエリがいくつかある場合は、まずそのクエリのパフォーマンスを理解し、なぜ一部は数ミリ秒で実行できるのに、他はより長くかかるのかを理解することが第一歩です。

ClickHouseには、クエリがどのように実行され、実行に際してどれだけリソースが消費されるかを理解するための豊富なツールセットがあります。

このセクションでは、それらのツールを見て、それらをどのように使用するかを学びます。

## 一般的な考慮事項 {#general-considerations}

クエリパフォーマンスを理解するためには、クエリがClickHouseで実行されるときに何が起こるのかを見てみましょう。

以下の内容は意図的に単純化されており、省略されている部分もあります。ここでは詳細に煩わされることなく、基本的な概念を把握することが目的です。詳細については、[クエリアナライザー](/operations/analyzer)を参照してください。

非常に高いレベルの視点から、ClickHouseがクエリを実行する際には以下のことが行われます：

- **クエリのパースと解析**

クエリはパースされ、分析され、一般的なクエリ実行プランが作成されます。

- **クエリ最適化**

クエリ実行プランが最適化され、不必要なデータが削除され、クエリプランからクエリパイプラインが構築されます。

- **クエリパイプラインの実行**

データが並行して読み取られ、処理されます。ここがClickHouseが実際にクエリ操作（フィルタリング、集計、ソートなど）を実行するステージです。

- **最終処理**

結果がマージされ、ソートされ、最終結果としてフォーマットされてクライアントに送信されます。

実際には、多くの[最適化](/concepts/why-clickhouse-is-so-fast)が行われており、このガイドでそれらについてさらに詳しく説明しますが、今のところはこれらの主要な概念がClickHouseがクエリを実行する際に裏で何が起こっているのかを理解するのに良い基盤を提供します。

高レベルの理解を持った上で、ClickHouseが提供するツールを調べ、クエリパフォーマンスに影響を与えるメトリクスを追跡するためにそれをどのように使用できるかを探ります。

## データセット {#dataset}

クエリのパフォーマンスへのアプローチを示すために実際の例を使用します。

NYCタクシーデータセットを使用します。これはNYCでのタクシーの乗車データを含んでいます。最初に、最適化なしでNYCタクシーデータセットを取り込むことから始めます。

以下は、テーブルを作成し、S3バケットからデータを挿入するためのコマンドです。スキーマはデータから意図的に推測されていることに注意してください。これは最適化されていません。

```sql
-- 推測されたスキーマでテーブルを作成
CREATE TABLE trips_small_inferred
ORDER BY () EMPTY
AS SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/clickhouse-academy/nyc_taxi_2009-2010.parquet');

-- 推測されたスキーマでテーブルにデータを挿入
INSERT INTO trips_small_inferred
SELECT * 
FROM s3Cluster
('default','https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/clickhouse-academy/nyc_taxi_2009-2010.parquet');
```

データから自動的に推測されたテーブルスキーマを見てみましょう。

```sql
--- 推測されたテーブルスキーマを表示
SHOW CREATE TABLE trips_small_inferred

Query id: d97361fd-c050-478e-b831-369469f0784d

CREATE TABLE nyc_taxi.trips_small_inferred
(
    `vendor_id` Nullable(String),
    `pickup_datetime` Nullable(DateTime64(6, 'UTC')),
    `dropoff_datetime` Nullable(DateTime64(6, 'UTC')),
    `passenger_count` Nullable(Int64),
    `trip_distance` Nullable(Float64),
    `ratecode_id` Nullable(String),
    `pickup_location_id` Nullable(String),
    `dropoff_location_id` Nullable(String),
    `payment_type` Nullable(Int64),
    `fare_amount` Nullable(Float64),
    `extra` Nullable(Float64),
    `mta_tax` Nullable(Float64),
    `tip_amount` Nullable(Float64),
    `tolls_amount` Nullable(Float64),
    `total_amount` Nullable(Float64)
)
ORDER BY tuple()
```

## 遅いクエリを特定する {#spot-the-slow-queries}

### クエリログ {#query-logs}

デフォルトでは、ClickHouseは実行された各クエリに関する情報を収集し、[クエリログ](/operations/system-tables/query_log)に記録します。このデータはテーブル`system.query_log`に保存されます。

実行された各クエリについて、ClickHouseはクエリ実行時間、読み取られた行数、CPU、メモリ使用量、ファイルキャッシュのヒットなどのリソース使用についての統計を記録します。

したがって、遅いクエリを調査する際にクエリログは良い出発点です。実行に長い時間かかるクエリを簡単に特定できるほか、各クエリのリソース使用情報を表示することができます。

まず、NYCタクシーデータセットにおけるトップ5つの長時間実行されたクエリを見つけてみましょう。

```sql
-- 過去1時間に実行されたnyc_taxiデータベースからのトップ5長時間クエリを見つける
SELECT
    type,
    event_time,
    query_duration_ms,
    query,
    read_rows,
    tables
FROM clusterAllReplicas(default, system.query_log)
WHERE has(databases, 'nyc_taxi') AND (event_time >= (now() - toIntervalMinute(60))) AND type='QueryFinish'
ORDER BY query_duration_ms DESC
LIMIT 5
FORMAT VERTICAL
```

`query_duration_ms`フィールドは、その特定のクエリが実行されるのにかかった時間を示します。クエリログの結果を見ると、最初のクエリが2967msかかっており、これは改善される可能性があります。

また、最もメモリまたはCPUを消費しているクエリを調べることによって、システムを圧迫しているクエリを知ることもできます。

```sql
-- メモリ使用量による上位クエリ 
SELECT
    type,
    event_time,
    query_id,
    formatReadableSize(memory_usage) AS memory,
    ProfileEvents.Values[indexOf(ProfileEvents.Names, 'UserTimeMicroseconds')] AS userCPU,
    ProfileEvents.Values[indexOf(ProfileEvents.Names, 'SystemTimeMicroseconds')] AS systemCPU,
    (ProfileEvents['CachedReadBufferReadFromCacheMicroseconds']) / 1000000 AS FromCacheSeconds,
    (ProfileEvents['CachedReadBufferReadFromSourceMicroseconds']) / 1000000 AS FromSourceSeconds,
    normalized_query_hash
FROM clusterAllReplicas(default, system.query_log)
WHERE has(databases, 'nyc_taxi') AND (type='QueryFinish') AND ((event_time >= (now() - toIntervalDay(2))) AND (event_time <= now())) AND (user NOT ILIKE '%internal%')
ORDER BY memory_usage DESC
LIMIT 30
```

見つかった長時間実行されるクエリを隔離し、数回再実行して応答時間を理解します。

この時点では、ファイルシステムキャッシュを無効にすることが重要です。これにより再現性が向上します。

```sql
-- ファイルシステムキャッシュを無効にする
set enable_filesystem_cache = 0;

-- クエリ1を実行
WITH
  dateDiff('s', pickup_datetime, dropoff_datetime) as trip_time,
  trip_distance / trip_time * 3600 AS speed_mph
SELECT
  quantiles(0.5, 0.75, 0.9, 0.99)(trip_distance)
FROM
  nyc_taxi.trips_small_inferred
WHERE
  speed_mph > 30
FORMAT JSON

----
1 row in set. Elapsed: 1.699 sec. Processed 329.04 million rows, 8.88 GB (193.72 million rows/s., 5.23 GB/s.)
Peak memory usage: 440.24 MiB.

-- クエリ2を実行
SELECT 
    payment_type,
    COUNT() AS trip_count,
    formatReadableQuantity(SUM(trip_distance)) AS total_distance,
    AVG(total_amount) AS total_amount_avg,
    AVG(tip_amount) AS tip_amount_avg
FROM 
    nyc_taxi.trips_small_inferred
WHERE 
    pickup_datetime >= '2009-01-01' AND pickup_datetime < '2009-04-01'
GROUP BY 
    payment_type
ORDER BY 
    trip_count DESC;

--- 
4 rows in set. Elapsed: 1.419 sec. Processed 329.04 million rows, 5.72 GB (231.86 million rows/s., 4.03 GB/s.)
Peak memory usage: 546.75 MiB.

-- クエリ3を実行
SELECT
  avg(dateDiff('s', pickup_datetime, dropoff_datetime))
FROM nyc_taxi.trips_small_inferred
WHERE passenger_count = 1 or passenger_count = 2
FORMAT JSON

---
1 row in set. Elapsed: 1.414 sec. Processed 329.04 million rows, 8.88 GB (232.63 million rows/s., 6.28 GB/s.)
Peak memory usage: 451.53 MiB.
```

読みやすくするためにテーブルにまとめます。

| 名称    | 経過時間   | 処理された行数 | ピークメモリ |
| ------- | --------- | -------------- | ----------- |
| クエリ1 | 1.699 sec | 329.04百万    | 440.24 MiB  |
| クエリ2 | 1.419 sec | 329.04百万    | 546.75 MiB  |
| クエリ3 | 1.414 sec | 329.04百万    | 451.53 MiB  |

クエリが何を達成しているのかをもう少し理解しましょう。

- クエリ1は、30マイル毎時を超える平均速度の乗車での距離分布を計算します。
- クエリ2は、週ごとの乗車数と平均料金を見つけます。
- クエリ3は、データセット内の各旅の平均時間を計算します。

これらのクエリは非常に複雑な処理を行っているわけではありませんが、最初のクエリはクエリが実行されるたびに旅の時間を即座に計算しています。ただし、これらのクエリはどれも1秒以上実行に時間がかかり、ClickHouseの世界では非常に長い時間です。また、これらのクエリのメモリ使用量はおよそ400MBであり、これはかなりのメモリです。また、各クエリは同じ数の行（すなわち329.04百万行）を読み取っているようです。このテーブルにいくつの行があるかをすぐに確認しましょう。

```sql
-- テーブルの行数をカウント
SELECT count()
FROM nyc_taxi.trips_small_inferred

Query id: 733372c5-deaf-4719-94e3-261540933b23

   ┌───count()─┐
1. │ 329044175 │ -- 329.04百万
   └───────────┘
```

テーブルには329.04百万行が含まれているため、各クエリはテーブルのフルスキャンを行っていることになります。

### EXPLAINステートメント {#explain-statement}

長時間実行されるクエリがいくつかあるので、どのように実行されるかを理解しましょう。そのために、ClickHouseは[EXPLAINステートメントコマンド](/sql-reference/statements/explain)をサポートしています。これは、クエリが実行される各ステージの詳細なビューを提供する非常に便利なツールです。

ドキュメントでは、EXPLAINステートメントが何であるか、およびクエリ実行を分析するためにどのように使用するかについての詳細な[ガイド](/guides/developer/understanding-query-execution-with-the-analyzer)が提供されています。このガイドで説明されていることを繰り返すのではなく、クエリ実行パフォーマンスのボトルネックを特定するのに役立ついくつかのコマンドに焦点を当てましょう。

**Explain indexes = 1**

EXPLAIN indexes = 1を使用して、クエリプランを検査します。クエリプランは、クエリがどのように実行されるかを示すツリーです。ここで、クエリのクローズがどの順序で実行されるかを確認できます。EXPLAINステートメントによって返されるクエリプランは、下から上に読み取ります。

長時間実行される最初のクエリを試してみましょう。

```sql
EXPLAIN indexes = 1
WITH
    dateDiff('s', pickup_datetime, dropoff_datetime) AS trip_time,
    (trip_distance / trip_time) * 3600 AS speed_mph
SELECT quantiles(0.5, 0.75, 0.9, 0.99)(trip_distance)
FROM nyc_taxi.trips_small_inferred
WHERE speed_mph > 30

Query id: f35c412a-edda-4089-914b-fa1622d69868

   ┌─explain─────────────────────────────────────────────┐
1. │ Expression ((Projection + Before ORDER BY))         │
2. │   Aggregating                                       │
3. │     Expression (Before GROUP BY)                    │
4. │       Filter (WHERE)                                │
5. │         ReadFromMergeTree (nyc_taxi.trips_small_inferred) │
   └─────────────────────────────────────────────────────┘
```

出力は明確です。クエリはまず`nyc_taxi.trips_small_inferred`テーブルからデータを読み込みます。次に、WHERE句が適用されて計算された値に基づいて行をフィルタリングします。フィルタリングされたデータは集計用に準備され、分位数が計算されます。最後に、結果がソートされて出力されます。

ここで、プライマリキーが使用されていないことに注意できます。これは、テーブルを作成したときに定義しなかったため合理的な結果です。その結果、ClickHouseはクエリのためにテーブルのフルスキャンを行っています。

**Explain Pipeline**

EXPLAIN PIPELINEは、クエリの具体的な実行戦略を示します。ここでは、前述の一般的なクエリプランがどのように実行されたかを見ることができます。

```sql
EXPLAIN PIPELINE
WITH
    dateDiff('s', pickup_datetime, dropoff_datetime) AS trip_time,
    (trip_distance / trip_time) * 3600 AS speed_mph
SELECT quantiles(0.5, 0.75, 0.9, 0.99)(trip_distance)
FROM nyc_taxi.trips_small_inferred
WHERE speed_mph > 30

Query id: c7e11e7b-d970-4e35-936c-ecfc24e3b879

    ┌─explain─────────────────────────────────────────────────────────────────────────────┐
 1. │ (Expression)                                                                        │
 2. │ ExpressionTransform × 59                                                            │
 3. │   (Aggregating)                                                                     │
 4. │   Resize 59 → 59                                                                    │
 5. │     AggregatingTransform × 59                                                       │
 6. │       StrictResize 59 → 59                                                          │
 7. │         (Expression)                                                                │
 8. │         ExpressionTransform × 59                                                    │
 9. │           (Filter)                                                                  │
10. │           FilterTransform × 59                                                      │
11. │             (ReadFromMergeTree)                                                     │
12. │             MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread) × 59 0 → 1 │
```

ここでは、クエリを実行する際に使用されるスレッドの数（59スレッド）が示されており、高い並列性が示されています。これにより、より小さなマシンで実行するよりもクエリの速度が向上します。並行に実行されるスレッドの数は、クエリが使用する高いメモリを説明できます。

理想的には、すべての遅いクエリを同じ方法で調査して、不要な複雑なクエリプランを特定し、各クエリが読み込む行数や消費するリソースを理解するべきです。

## 方法論 {#methodology}

本番環境のデプロイメントで問題のあるクエリを特定するのは困難な場合があります。なぜなら、ClickHouseデプロイメントでは、常に多くのクエリが実行されている可能性があるからです。

どのユーザー、データベース、またはテーブルに問題があるかを知っている場合は、`system.query_logs`の`user`、`tables`、または`databases`フィールドを使用して検索を絞り込むことができます。

最適化したいクエリを特定したら、それらに取り組み始めることができます。この段階で開発者がよくする間違いは、多くのことを同時に変更し、アドホックの実験を行い、通常は混合結果に終わり、最も重要なことは、クエリがどのように速くなったのかを理解しないことです。

クエリ最適化には構造が必要です。高度なベンチマークのことを言っているわけではなく、変更がクエリパフォーマンスにどのように影響するかを理解するためのシンプルなプロセスを持つことが大きな意味を持つと言えます。

最初にクエリログから遅いクエリを特定し、次に改善の可能性を個別に調査します。クエリをテストする際は、ファイルシステムキャッシュを無効にしていることを確認してください。

> ClickHouseは、さまざまなステージでクエリのパフォーマンスを向上させるために[caching](/operations/caches)を活用しています。これはクエリパフォーマンスには良いことですが、トラブルシューティングの際には、潜在的なI/Oボトルネックや不十分なテーブルスキーマを隠す可能性があります。このため、テスト中はファイルシステムキャッシュをオフにすることをお勧めします。生産環境では有効になっていることを確認してください。

潜在的な最適化を特定した後は、それを1つずつ実装することをお勧めします。これにより、パフォーマンスへの影響をより良く追跡できます。以下は一般的なアプローチを示したダイアグラムです。

<img src={require('./images/query_optimization_diagram_1.png').default} class="image" />

_最後に、外れ値に注意してください。クエリが遅く実行されることは、ユーザーがアドホックで高負荷のクエリを試みたり、他の理由でシステムがストレス下にあったりするためによく見られることです。フィールドnormalized_query_hashでグループ化して、定期的に実行される高負荷のクエリを特定できます。それらはおそらく調査したいクエリです。_

## 基本的な最適化 {#basic-optimization}

フレームワークが整ったので、最適化を開始できます。

開始するのに最適な場所は、データがどのように保存されているかを確認することです。あらゆるデータベースと同じように、読み取るデータが少ないほどクエリは速く実行されます。

データを取り込む方法によっては、ClickHouseの[機能](/interfaces/schema-inference)を利用して、取り込んだデータに基づいてテーブルスキーマを推測しているかもしれません。これはスタートするには非常に便利ですが、クエリパフォーマンスを最適化したい場合、データスキーマを見直して使用ケースに最適な形にする必要があります。

### Nullable {#nullable}

[ベストプラクティスドキュメント](/cloud/bestpractices/avoid-nullable-columns)で説明されているように、可能な限りNullableカラムを避けてください。それらはしばしば柔軟なデータ取り込みメカニズムを提供するために使用されますが、パフォーマンスに悪影響を与えます。なぜなら、毎回処理されなければならない追加のカラムが存在するからです。

NULL値を持つ行の数をカウントするSQLクエリを実行すると、実際にNullable値が必要なテーブルのカラムを容易に特定できます。

```sql
-- 非NULL値カラムを見つける 
SELECT
    countIf(vendor_id IS NULL) AS vendor_id_nulls,
    countIf(pickup_datetime IS NULL) AS pickup_datetime_nulls,
    countIf(dropoff_datetime IS NULL) AS dropoff_datetime_nulls,
    countIf(passenger_count IS NULL) AS passenger_count_nulls,
    countIf(trip_distance IS NULL) AS trip_distance_nulls,
    countIf(fare_amount IS NULL) AS fare_amount_nulls,
    countIf(mta_tax IS NULL) AS mta_tax_nulls,
    countIf(tip_amount IS NULL) AS tip_amount_nulls,
    countIf(tolls_amount IS NULL) AS tolls_amount_nulls,
    countIf(total_amount IS NULL) AS total_amount_nulls,
    countIf(payment_type IS NULL) AS payment_type_nulls,
    countIf(pickup_location_id IS NULL) AS pickup_location_id_nulls,
    countIf(dropoff_location_id IS NULL) AS dropoff_location_id_nulls
FROM trips_small_inferred
FORMAT VERTICAL

Query id: 4a70fc5b-2501-41c8-813c-45ce241d85ae

Row 1:
──────
vendor_id_nulls:           0
pickup_datetime_nulls:     0
dropoff_datetime_nulls:    0
passenger_count_nulls:     0
trip_distance_nulls:       0
fare_amount_nulls:         0
mta_tax_nulls:             137946731
tip_amount_nulls:          0
tolls_amount_nulls:        0
total_amount_nulls:        0
payment_type_nulls:        69305
pickup_location_id_nulls:  0
dropoff_location_id_nulls: 0
```

NULL値を持つカラムは2つだけで、`mta_tax`と`payment_type`です。残りのフィールドは`Nullable`カラムを使用する必要はありません。

### 低カーディナリティ {#low-cardinality}

文字列に適用できる簡単な最適化は、LowCardinalityデータ型を最大限に活用することです。低カーディナリティ[ドキュメント](/sql-reference/data-types/lowcardinality)で説明されているように、ClickHouseはLowCardinalityカラムに対して辞書コーディングを適用するため、クエリパフォーマンスが大幅に向上します。

LowCardinalityの良い候補を決定するための簡単なルールは、ユニークな値が1万未満のカラムが完璧な候補であるということです。

ユニークな値の少ないカラムを特定するために、以下のSQLクエリを使用できます。

```sql
-- 低カーディナリティカラムを特定
SELECT
    uniq(ratecode_id),
    uniq(pickup_location_id),
    uniq(dropoff_location_id),
    uniq(vendor_id)
FROM trips_small_inferred
FORMAT VERTICAL

Query id: d502c6a1-c9bc-4415-9d86-5de74dd6d932

Row 1:
──────
uniq(ratecode_id):         6
uniq(pickup_location_id):  260
uniq(dropoff_location_id): 260
uniq(vendor_id):           3
```

低カーディナリティを持っているこれらの4つのカラム（`ratecode_id`、`pickup_location_id`、`dropoff_location_id`、`vendor_id`）は、LowCardinalityフィールド型の良い候補です。

### データ型の最適化 {#optimize-data-type}

Clickhouseは多数のデータ型をサポートしています。使用ケースに最適な小さいデータ型を選択することで、パフォーマンスを最適化し、ディスク上のデータストレージスペースを削減してください。

数値の場合、データセットの最小値と最大値を確認して、現在の精度がデータセットの現実と一致しているかどうかを確認できます。

```sql
-- payment_typeフィールドの最小/最大値を見つける
SELECT
    min(payment_type),max(payment_type),
    min(passenger_count), max(passenger_count)
FROM trips_small_inferred

Query id: 4306a8e1-2a9c-4b06-97b4-4d902d2233eb

   ┌─min(payment_type)─┬─max(payment_type)─┐
1. │                 1 │                 4 │
   └───────────────────┴───────────────────┘
```

日付については、データセットに一致する精度を選択する必要があり、実行する予定のクエリに最適な形であるべきです。

### 最適化を適用する {#apply-the-optimizations}

最適化されたスキーマを使用するために新しいテーブルを作成し、データを再取り込むことにしましょう。

```sql
-- 最適化されたデータでテーブルを作成 
CREATE TABLE trips_small_no_pk
(
    `vendor_id` LowCardinality(String),
    `pickup_datetime` DateTime,
    `dropoff_datetime` DateTime,
    `passenger_count` UInt8,
    `trip_distance` Float32,
    `ratecode_id` LowCardinality(String),
    `pickup_location_id` LowCardinality(String),
    `dropoff_location_id` LowCardinality(String),
    `payment_type` Nullable(UInt8),
    `fare_amount` Decimal32(2),
    `extra` Decimal32(2),
    `mta_tax` Nullable(Decimal32(2)),
    `tip_amount` Decimal32(2),
    `tolls_amount` Decimal32(2),
    `total_amount` Decimal32(2)
)
ORDER BY tuple();

-- データを挿入 
INSERT INTO trips_small_no_pk SELECT * FROM trips_small_inferred
```

新しいテーブルを使用して、クエリの改善を確認します。

| 名称    | 実行1 - 経過時間 | 経過時間   | 処理された行数 | ピークメモリ |
| ------- | --------------- | --------- | -------------- | ----------- |
| クエリ1 | 1.699 sec       | 1.353 sec | 329.04百万    | 337.12 MiB  |
| クエリ2 | 1.419 sec       | 1.171 sec | 329.04百万    | 531.09 MiB  |
| クエリ3 | 1.414 sec       | 1.188 sec | 329.04百万    | 265.05 MiB  |

クエリ時間とメモリ使用量の改善をいくつか確認しました。データスキーマの最適化により、データの総量が減少し、メモリ消費が改善され、処理時間が短縮されました。

テーブルのサイズを確認して、違いを確認しましょう。

```sql
SELECT
    `table`,
    formatReadableSize(sum(data_compressed_bytes) AS size) AS compressed,
    formatReadableSize(sum(data_uncompressed_bytes) AS usize) AS uncompressed,
    sum(rows) AS rows
FROM system.parts
WHERE (active = 1) AND ((`table` = 'trips_small_no_pk') OR (`table` = 'trips_small_inferred'))
GROUP BY
    database,
    `table`
ORDER BY size DESC

Query id: 72b5eb1c-ff33-4fdb-9d29-dd076ac6f532

   ┌─table────────────────┬─compressed─┬─uncompressed─┬──────rows─┐
1. │ trips_small_inferred │ 7.38 GiB   │ 37.41 GiB    │ 329044175 │
2. │ trips_small_no_pk    │ 4.89 GiB   │ 15.31 GiB    │ 329044175 │
   └──────────────────────┴────────────┴──────────────┴───────────┘
```

新しいテーブルは以前のテーブルより大幅に小さく、テーブルサイズが約34%削減されていることが確認できます（7.38 GiB対4.89 GiB）。

## プライマリキーの重要性 {#the-importance-of-primary-keys}

ClickHouseにおけるプライマリキーは、ほとんどの従来のデータベースシステムとは異なる動作をします。従来のシステムでは、プライマリキーは一意性とデータ整合性を強制します。重複プライマリキー値の挿入を試みると拒否され、Bツリーまたはハッシュベースのインデックスが通常、迅速な検索のために作成されます。

ClickHouseでは、プライマリキーの[目的](/optimize/sparse-primary-indexes#a-table-with-a-primary-key)は異なり、一意性やデータ整合性を強制するのではなく、クエリパフォーマンスを最適化することを目的としています。プライマリキーは、ディスク上にデータが保存される順序を定義し、スパースインデックスとして実装され、各グラニュールの最初の行へのポインタを格納します。

> ClickHouseにおけるグラニュールは、クエリ実行時に読み取られる最小のデータ単位です。これらは、デフォルトで8192行の固定行数に基づいて成型され、連続して格納され、プライマリキーによってソートされます。

良いプライマリキーのセットを選択することはパフォーマンスにとって重要であり、特定のクエリセットを迅速に処理するために、異なるテーブルに同じデータを保存し、異なるプライマリキーのセットを使用することが一般的です。

ClickHouseがサポートする他のオプション（ProjectionやMaterialized viewなど）を用いることで、同じデータに対して異なるプライマリキーのセットを使用することができます。このブログシリーズの第2部では、これについてさらに詳しく説明します。

### プライマリキーの選択 {#choose-primary-keys}

正しいプライマリキーのセットを選択することは複雑な話題であり、最適な組み合わせを見つけるためにはトレードオフや実験が必要になるかもしれません。

今は次のシンプルな実践に従うことにしましょう：

-   大多数のクエリでフィルタリングに使用されるフィールドを使用する
-   最初に低カーディナリティを持つカラムを選択する
-   プライマリキー内にタイムスタンプフィールドを考慮する。タイムスタンプデータセットでの時間によるフィルタリングは非常に一般的です。

私たちの場合、次のプライマリキーを試してみます：`passenger_count`、`pickup_datetime`、および`dropoff_datetime`。

passenger_countのカーディナリティは小さく（24のユニークな値）、遅いクエリで使用されています。また、タイムスタンプフィールド（`pickup_datetime`と`dropoff_datetime`）を追加します。なぜなら、これらは頻繁にフィルタリングされるからです。

新しいテーブルを作成し、プライマリキーを設定してデータを再取り込むことにします。

```sql
CREATE TABLE trips_small_pk
(
    `vendor_id` UInt8,
    `pickup_datetime` DateTime,
    `dropoff_datetime` DateTime,
    `passenger_count` UInt8,
    `trip_distance` Float32,
    `ratecode_id` LowCardinality(String),
    `pickup_location_id` UInt16,
    `dropoff_location_id` UInt16,
    `payment_type` Nullable(UInt8),
    `fare_amount` Decimal32(2),
    `extra` Decimal32(2),
    `mta_tax` Nullable(Decimal32(2)),
    `tip_amount` Decimal32(2),
    `tolls_amount` Decimal32(2),
    `total_amount` Decimal32(2)
)
PRIMARY KEY (passenger_count, pickup_datetime, dropoff_datetime);

-- データを挿入 
INSERT INTO trips_small_pk SELECT * FROM trips_small_inferred
```

その後、クエリを再実行します。3つの実験から結果をまとめて、経過時間、処理された行数、メモリ消費の改善を確認します。

<table>
  <thead>
    <tr>
      <th colspan="4">クエリ1</th>
    </tr>
    <tr>
      <th></th>
      <th>実行1</th>
      <th>実行2</th>
      <th>実行3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>経過時間</td>
      <td>1.699 sec</td>
      <td>1.353 sec</td>
      <td>0.765 sec</td>
    </tr>
    <tr>
      <td>処理された行数</td>
      <td>329.04百万</td>
      <td>329.04百万</td>
      <td>329.04百万</td>
    </tr>
    <tr>
      <td>ピークメモリ</td>
      <td>440.24 MiB</td>
      <td>337.12 MiB</td>
      <td>444.19 MiB</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th colspan="4">クエリ2</th>
    </tr>
    <tr>
      <th></th>
      <th>実行1</th>
      <th>実行2</th>
      <th>実行3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>経過時間</td>
      <td>1.419 sec</td>
      <td>1.171 sec</td>
      <td>0.248 sec</td>
    </tr>
    <tr>
      <td>処理された行数</td>
      <td>329.04百万</td>
      <td>329.04百万</td>
      <td>329.04百万</td>
    </tr>
    <tr>
      <td>ピークメモリ</td>
      <td>546.75 MiB</td>
      <td>531.09 MiB</td>
      <td>284.92 MiB</td>
    </tr>
  </tbody>
</table>
```
```html
    </tr>
    <tr>
      <td>処理された行数</td>
      <td>3.2904億</td>
      <td>3.2904億</td>
      <td>4146万</td>
    </tr>
    <tr>
      <td>ピークメモリ</td>
      <td>546.75 MiB</td>
      <td>531.09 MiB</td>
      <td>173.50 MiB</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th colspan="4">クエリ 3</th>
    </tr>
    <tr>
      <th></th>
      <th>実行 1</th>
      <th>実行 2</th>
      <th>実行 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>経過時間</td>
      <td>1.414 秒</td>
      <td>1.188 秒</td>
      <td>0.431 秒</td>
    </tr>
    <tr>
      <td>処理された行数</td>
      <td>3.2904億</td>
      <td>3.2904億</td>
      <td>2.7699億</td>
    </tr>
    <tr>
      <td>ピークメモリ</td>
      <td>451.53 MiB</td>
      <td>265.05 MiB</td>
      <td>197.38 MiB</td>
    </tr>
  </tbody>
</table>

実行時間と使用メモリ全体で大きな改善が見られます。

クエリ 2 は主キーの恩恵を最も受けています。生成されたクエリプランが以前とどのように異なるか見てみましょう。

```sql
EXPLAIN indexes = 1
SELECT
    payment_type,
    COUNT() AS trip_count,
    formatReadableQuantity(SUM(trip_distance)) AS total_distance,
    AVG(total_amount) AS total_amount_avg,
    AVG(tip_amount) AS tip_amount_avg
FROM nyc_taxi.trips_small_pk
WHERE (pickup_datetime >= '2009-01-01') AND (pickup_datetime < '2009-04-01')
GROUP BY payment_type
ORDER BY trip_count DESC

クエリ ID: 30116a77-ba86-4e9f-a9a2-a01670ad2e15

    ┌─explain──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 1. │ 式 ((プロジェクション + ORDER BY の前のパート))                                                                                               │
 2. │   ソーティング (ORDER BY のためのソーティング)                                                                                                   │
 3. │     式 (ORDER BY の前)                                                                                                                               │
 4. │       集計                                                                                                                                       │
 5. │         式 (GROUP BY の前)                                                                                                                       │
 6. │           式                                                                                                                                     │
 7. │             ReadFromMergeTree (nyc_taxi.trips_small_pk)                                                                                        │
 8. │             インデックス:                                                                                                                       │
 9. │               主キー                                                                                                                              │
10. │                 キー:                                                                                                                            │
11. │                   pickup_datetime                                                                                                                │
12. │                 条件: and((pickup_datetime in (-Inf, 1238543999]), (pickup_datetime in [1230768000, +Inf)))                                     │
13. │                 パーツ: 9/9                                                                                                                     │
14. │                 グラニュール: 5061/40167                                                                                                        │
    └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

主キーのおかげで、テーブルのグラニュールのサブセットのみが選択されました。これだけでクエリのパフォーマンスが大幅に向上します。なぜなら、ClickHouse が処理するデータ量が大幅に減るためです。

## 次のステップ {#next-steps}

このガイドが ClickHouse の遅いクエリを調査する方法と、それを速くする方法を理解する手助けになることを願っています。このトピックについてさらに探求したい場合は、[クエリアナライザー](/operations/analyzer) および [プロファイリング](/operations/optimizing-performance/sampling-query-profiler)について詳しく読んで、ClickHouse がどのようにクエリを実行しているかをよりよく理解してください。

ClickHouseの特性に慣れてきたら、[パーティショニングキー](/optimize/partitioning-key) や [データスキッピングインデックス](/optimize/skipping-indexes)について読み、クエリを加速するために使用できるより高度な技術について学ぶことをお勧めします。
```
