---
slug: /optimize/query-optimization
sidebar_label: クエリ最適化
title: クエリ最適化のガイド
description: クエリ性能を改善するための一般的な手法を説明するシンプルなクエリ最適化ガイド
---

import queryOptimizationDiagram1 from '@site/static/images/guides/best-practices/query_optimization_diagram_1.png';

# クエリ最適化のシンプルなガイド

このセクションでは、異なるパフォーマンスと最適化技術を使用する方法を、一般的なシナリオを通じて示すことを目的としています。これには、[analyzer](/operations/analyzer)、[query profiling](/operations/optimizing-performance/sampling-query-profiler)、または[Nullable Columnsの回避](/optimize/avoid-nullable-columns)が含まれ、ClickHouseのクエリパフォーマンスを改善します。
## クエリパフォーマンスの理解 {#understand-query-performance}

パフォーマンスの最適化を考えるべき最良のタイミングは、ClickHouseにデータを初めて取り込む前に[データスキーマ](/data-modeling/schema-design)を設定しているときです。

しかし、正直に言うと、データがどれくらい増えるかや、どのようなクエリが実行されるかを予測するのは難しいです。

既存のデプロイメントがあり、改善したいクエリがいくつかある場合、最初のステップはそれらのクエリがどのように実行されるか、なぜ一部が数ミリ秒で実行され、他のクエリが長くかかるのかを理解することです。

ClickHouseは、クエリがどのように実行され、実行に必要なリソースを理解するのを助ける豊富なツールセットを提供しています。

このセクションでは、それらのツールとそれらをどのように使用するかを見ていきます。
## 一般的な考慮事項 {#general-considerations}

クエリパフォーマンスを理解するために、クエリが実行されるときにClickHouseで何が起こるかを見てみましょう。

以下の部分は意図的に簡略化されており、いくつかの手短な表現が含まれています。ここでの目的は、詳細に埋もれてしまうのではなく、基本的な概念に追いつくことです。詳細については、[クエリアナライザー](/operations/analyzer)に関する説明を読んでください。

非常に高レベルの観点から見ると、ClickHouseがクエリを実行すると、以下のことが起こります：

  - **クエリの解析と分析**

クエリが解析され、分析され、一般的なクエリ実行プランが作成されます。

  - **クエリの最適化**

クエリ実行プランが最適化され、不必要なデータが削除され、クエリプランからクエリパイプラインが構築されます。

  - **クエリパイプラインの実行**

データが並行して読み取られ、処理されます。この段階では、ClickHouseはフィルタリング、集約およびソートといったクエリ操作を実行します。

  - **最終処理**

結果がマージされ、ソートされて、クライアントに送信される前に最終結果としてフォーマットされます。

実際には、多くの[最適化](/concepts/why-clickhouse-is-so-fast)が行われています。このガイドではそれらについて少し詳しく説明しますが、今のところ、これらの主要な概念は、ClickHouseがクエリを実行するときに何が起こっているのかを理解するのに役立ちます。

この高レベルの理解を持って、ClickHouseが提供するツールを検討し、それをどのように使用してクエリパフォーマンスに影響を与えるメトリクスを追跡するかを見ていきましょう。
## データセット {#dataset}

クエリパフォーマンスへのアプローチを示すために、実際の例を使用します。

まず、NYCのタクシーデータセットを取り込み、最適化せずにフルデータを用います。

以下は、テーブルを作成し、S3バケットからデータを挿入するコマンドです。スキーマを意図的にデータから推測していることに注意してください。これは最適化されていません。

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

デフォルトでは、ClickHouseは実行された各クエリに関する情報を[クエリログ](/operations/system-tables/query_log)に収集し、ログを保存します。このデータは`system.query_log`テーブルに格納されます。

実行された各クエリに対して、ClickHouseはクエリの実行時間、読み取られた行の数、CPU、メモリ使用量、ファイルシステムキャッシュヒットなどのリソース使用状況といった統計をログに記録します。

したがって、クエリログは遅いクエリを調査する際の良い出発点です。実行に長時間かかるクエリを簡単に特定し、各クエリのリソース使用情報を表示できます。

NYCタクシーデータセットにおける実行に長時間かかっているトップ5のクエリを見てみましょう。

```sql
-- 過去1時間のnyc_taxiデータベースからのトップ5の長時間実行クエリを見つける
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

Query id: e3d48c9f-32bb-49a4-8303-080f59ed1835

Row 1:
──────
type:              QueryFinish
event_time:        2024-11-27 11:12:36
query_duration_ms: 2967
query:             WITH
  dateDiff('s', pickup_datetime, dropoff_datetime) as trip_time,
  trip_distance / trip_time * 3600 AS speed_mph
SELECT
  quantiles(0.5, 0.75, 0.9, 0.99)(trip_distance)
FROM
  nyc_taxi.trips_small_inferred
WHERE
  speed_mph > 30
FORMAT JSON
read_rows:         329044175
tables:            ['nyc_taxi.trips_small_inferred']

Row 2:
──────
type:              QueryFinish
event_time:        2024-11-27 11:11:33
query_duration_ms: 2026
query:             SELECT 
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

read_rows:         329044175
tables:            ['nyc_taxi.trips_small_inferred']

Row 3:
──────
type:              QueryFinish
event_time:        2024-11-27 11:12:17
query_duration_ms: 1860
query:             SELECT
  avg(dateDiff('s', pickup_datetime, dropoff_datetime))
FROM nyc_taxi.trips_small_inferred
WHERE passenger_count = 1 or passenger_count = 2
FORMAT JSON
read_rows:         329044175
tables:            ['nyc_taxi.trips_small_inferred']

Row 4:
──────
type:              QueryFinish
event_time:        2024-11-27 11:12:31
query_duration_ms: 690
query:             SELECT avg(total_amount) FROM nyc_taxi.trips_small_inferred WHERE trip_distance > 5
FORMAT JSON
read_rows:         329044175
tables:            ['nyc_taxi.trips_small_inferred']

Row 5:
──────
type:              QueryFinish
event_time:        2024-11-27 11:12:44
query_duration_ms: 634
query:             SELECT
vendor_id,
avg(total_amount),
avg(trip_distance),
FROM
nyc_taxi.trips_small_inferred
GROUP BY vendor_id
ORDER BY 1 DESC
FORMAT JSON
read_rows:         329044175
tables:            ['nyc_taxi.trips_small_inferred']
```

`query_duration_ms`フィールドは、その特定のクエリが実行されるのにかかった時間を示します。クエリログの結果を見てみると、最初のクエリは2967msかかっており、改善できる可能性があります。

また、どのクエリがシステムに負荷をかけているかを確認するために、最もメモリまたはCPUを消費しているクエリを調べることもできます。

```sql
-- メモリ使用量でのトップクエリ 
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

見つけた長時間実行しているクエリを isol ゼーションし、何度か再実行して応答時間を理解します。

この時点で、`enable_filesystem_cache`設定を0にしてファイルシステムキャッシュをオフにすることが重要です。これにより、再現性を向上できます。

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

視覚的に読みやすくするためにテーブルで要約しましょう。

| 名称    | 経過時間 | 処理された行数 | ピークメモリ |
| ------- | --------- | -------------- | ----------- |
| クエリ1 | 1.699秒   | 329.04百万      | 440.24 MiB  |
| クエリ2 | 1.419秒   | 329.04百万      | 546.75 MiB  |
| クエリ3 | 1.414秒   | 329.04百万      | 451.53 MiB  |

クエリが達成する目的をもう少し理解しましょう。

- クエリ1は、時速30マイルを超える乗車の距離分布を計算します。
- クエリ2は、週ごとの乗車の合計数および平均コストを求めます。
- クエリ3は、データセット内の各旅行の平均時間を計算します。

これらのクエリはいずれも非常に複雑な処理を行っているわけではありませんが、最初のクエリは、クエリが実行されるたびにトリップタイムをその場で計算しています。しかし、これらの各クエリは1秒以上の実行時間を要しており、ClickHouseの世界では非常に長い時間です。また、これらのクエリのメモリ使用量も注意が必要です。各クエリのメモリ使用量は約400 MBであり、これはかなりの量です。また、各クエリは同じ行数（329.04百万）を読み取っているようです。このテーブルに行がいくつあるかを確認してみましょう。

```sql
-- テーブルの行数をカウント 
SELECT count()
FROM nyc_taxi.trips_small_inferred

Query id: 733372c5-deaf-4719-94e3-261540933b23

   ┌───count()─┐
1. │ 329044175 │ -- 329.04百万
   └───────────┘
```

テーブルには329.04百万行含まれているため、各クエリはテーブル全体をスキャンしています。
### EXPLAIN文 {#explain-statement}

長時間実行しているクエリがいくつかわかったので、これらがどのように実行されるかを理解しましょう。そのために、ClickHouseは[EXPLAIN文コマンド](/sql-reference/statements/explain)をサポートしています。これは、クエリの実行ステージごとの詳細なビューを提供する非常に便利なツールです。クエリを実行せずに全てのステージを確認できます。そのため、非ClickHouseの専門家には圧倒されるかもしれませんが、クエリがどのように実行されるかを洞察するための必須ツールです。

ドキュメントでは、EXPLAIN文が何であるか、クエリ実行を分析するためにどのように使用するかについての詳細な[ガイド](/guides/developer/understanding-query-execution-with-the-analyzer)が提供されています。このガイドに記載されている内容を繰り返すのではなく、クエリ実行パフォーマンスのボトルネックを見つけるのに役立ついくつかのコマンドに焦点を当ててみましょう。

**EXPLAIN indexes = 1**

クエリプランを検査するために、EXPLAIN indexes = 1から始めましょう。クエリプランは、クエリがどのように実行されるかを示すツリーです。クエリの句がどの順序で実行されるかを確認できます。EXPLAIN文によって返されるクエリプランは、下から上へ読むことができます。

まず、長時間実行されるクエリの最初のものを使ってみましょう。

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

出力はわかりやすいです。クエリは最初に`nyc_taxi.trips_small_inferred`テーブルからデータを読み取ります。次に、WHERE句が計算された値に基づいて行をフィルタリングするために適用されます。フィルタリングされたデータが集約の準備をして、分位数が計算されます。最後に、結果がソートされて出力されます。

ここでは、プライマリキーが使用されていないことに注意できます。テーブル作成時にプライマリキーを定義しなかったため、ClickHouseはクエリのためにテーブル全体のスキャンを実行しています。

**EXPLAIN PIPELINE**

EXPLAIN PIPELINEは、クエリの具体的な実行戦略を示します。そこで、ClickHouseが実際にどのように先ほど見た一般的なクエリプランを実行したかを見ることができます。

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

ここでは、クエリを実行するために使用されるスレッド数（59スレッド）に注目できます。これは高い並列性を示しており、これによりクエリが短時間で実行され、より小さなマシンでは時間がかかる可能性があります。クエリが並列して実行されるスレッドの数は、クエリが消費するメモリの大きさの説明になることがあります。

理想的には、すべての遅いクエリを同じ方法で調査して、不必要で複雑なクエリプランを特定し、各クエリによって読み取られる行数と消費されるリソースを理解することが重要です。
## 方法論 {#methodology}

本番環境で問題のあるクエリを特定するのは難しい場合があります。なぜなら、ClickHouseデプロイメントで同時に実行されているクエリが膨大な数に上る可能性があるからです。

問題が発生しているユーザー、データベース、またはテーブルを知っている場合は、`system.query_logs`からのフィールド`user`、`tables`、または`databases`を使用して検索を絞り込むことができます。

最適化したいクエリを特定したら、それらを最適化するための作業を開始できます。この段階で開発者が犯しがちな一般的な間違いは、同時に複数のことを変更し、アドホックな実験を行い、通常は混合結果になり、最も重要なことは、クエリを速くした要因を十分に理解しないことです。

クエリ最適化には構造が必要です。高度なベンチマーキングについてではなく、変更がクエリパフォーマンスにどのように影響するかを理解するためのシンプルなプロセスを持つことで、大きな成果を得ることができます。

まず、クエリログから遅いクエリを特定し、潜在的な改善を個別に調査します。クエリをテストする際は、必ずファイルシステムキャッシュを無効にします。

> ClickHouseは、異なる段階でクエリパフォーマンスを向上させるために[caching](/operations/caches)を活用しています。これはクエリパフォーマンスにとって良いですが、トラブルシューティング中には潜在的なI/Oボトルネックや不適切なテーブルスキーマを隠すことがあります。このため、テスト中はファイルシステムキャッシュをオフにすることをお勧めします。本番環境での設定では、キャッシュをオンにするようにしてください。

潜在的な最適化を特定したら、一つずつ実装することをお勧めします。これにより、パフォーマンスにどのように影響するかをよりよく追跡できます。以下は、一般的なアプローチを説明する図です。

<img src={queryOptimizationDiagram1} class="image" />

_最後に、アウトライヤーに注意してください。ユーザーがアドホックな高コストのクエリを試みたり、システムが他の理由でストレス下にあるためにクエリが遅く実行されることは非常に一般的です。field normalized_query_hashでグループ化して、定期的に実行される高コストのクエリを特定できます。これらは調査したいクエリである可能性が高いです。_
## 基本的な最適化 {#basic-optimization}

フレームワークが整ったので、最適化を始めることができます。

最初に見るべき場所は、データがどのように保存されるかです。あらゆるデータベースにおいて、読み取るデータが少ないほど、クエリは迅速に実行されます。

データを取り込む方法によっては、ClickHouseの[capabilities](/interfaces/schema-inference)を活用して、取り込んだデータに基づいてテーブルスキーマを推測しているかもしれません。これは非常に便利ですが、クエリパフォーマンスを最適化したい場合は、使用ケースに最適なようにデータスキーマを見直す必要があります。
### Nullable {#nullable}

[ベストプラクティスドキュメント](/cloud/bestpractices/avoid-nullable-columns)に記載されているように、可能な限りNullableカラムは避けてください。これらはデータ取り込み機構を柔軟にするために便利ですが、実行されるたびに追加のカラムを処理する必要があるため、性能に悪影響を及ぼします。

NULL値を持つ行をカウントするSQLクエリを実行すると、実際にNullable値が必要なテーブル内のカラムを簡単に発見できます。

```sql
-- NULL値を持たない値のカラムを見つける 
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

NULL値を持つカラムは`mta_tax`と`payment_type`の2つだけであり、残りのフィールドは`Nullable`カラムを使用する必要はありません。
### 低いカーディナリティ {#low-cardinality}

文字列に適用する簡単な最適化は、LowCardinalityデータ型を最大限に利用することです。低カーディナリティの[ドキュメント](/sql-reference/data-types/lowcardinality)に記載されているように、ClickHouseはLowCardinalityカラムに辞書コーディングを適用し、クエリパフォーマンスを大幅に向上させます。

LowCardinalityの適用が良いカラムを判断するための簡単なルールは、ユニークな値が1万未満のカラムが理想的な候補です。

ユニークな値が少ないカラムを見つけるための以下のSQLクエリを使用できます。 

```sql
-- 低カーディナリティのカラムを特定
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

低カーディナリティを持つこれらの4つのカラム`ratecode_id`、`pickup_location_id`、`dropoff_location_id`、および`vendor_id`は、LowCardinalityフィールドタイプに最適です。
### データ型の最適化 {#optimize-data-type}

ClickHouseは、多数のデータ型をサポートしています。パフォーマンスを最適化し、ディスク上のデータストレージスペースを削減するために、使用ケースに最適な最小のデータ型を選択してください。

数値については、データセット内の最小および最大値を確認して、現在の精度値がデータセットの実態に合っているかを確認できます。

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

日付の場合、データセットに応じた精度を選択し、実行予定のクエリに最も適した精度を選択する必要があります。
### 最適化の適用 {#apply-the-optimizations}

最適化スキーマを使用する新しいテーブルを作成し、データを再取り込みましょう。

```sql
-- 最適化されたデータのテーブルを作成 
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

新しいテーブルを使用してクエリを再実行し、改善を確認します。

| 名称    | Run 1 - 経過時間 | 経過時間 | 処理された行数 | ピークメモリ |
| ------- | --------------- | --------- | -------------- | ----------- |
| クエリ1 | 1.699秒         | 1.353秒   | 329.04百万      | 337.12 MiB  |
| クエリ2 | 1.419秒         | 1.171秒   | 329.04百万      | 531.09 MiB  |
| クエリ3 | 1.414秒         | 1.188秒   | 329.04百万      | 265.05 MiB  |

クエリ時間とメモリ使用量に改善が見られます。データスキーマの最適化により、データの総ボリュームが減少し、メモリの消費が改善され、処理時間が短縮されました。

テーブルのサイズを確認して違いを見てみましょう。

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

新しいテーブルは、前のテーブルに比べてかなり小さいです。テーブルのディスクスペースが約34％削減されています（7.38 GiB対4.89 GiB）。
## プライマリキーの重要性 {#the-importance-of-primary-keys}

ClickHouseのプライマリキーは、ほとんどの伝統的なデータベースシステムとは異なる働きをします。そのシステムでは、プライマリキーが一意性とデータ整合性を強制します。重複するプライマリキー値を挿入しようとすると拒否され、通常、高速な検索のためにBツリーまたはハッシュベースのインデックスが作成されます。

ClickHouseでは、プライマリキーの[目的](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key)が異なります。ユニーク性を強制したり、データ整合性に貢献するのではなく、クエリパフォーマンスの最適化を目的としています。プライマリキーは、データがディスクに保存される順序を定義し、各グラニュールの最初の行へのポインタを保存するスパースインデックスとして実装されます。

> ClickHouseにおけるグラニュールは、クエリ実行中に読み取られる最小のデータ単位です。これには、index_granularityによって決定される固定数の行が含まれ、デフォルト値は8192行です。グラニュールは連続して格納され、プライマリキーによってソートされます。

良いプライマリキーのセットを選択することはパフォーマンスにとって重要であり、特定のクエリセットを高速化するために、同じデータを異なるテーブルに格納し、異なるプライマリキーのセットを使用することは一般的です。

ClickHouseがサポートする他のオプション、たとえばProjectionやMaterialized Viewにより、同じデータに異なるプライマリキーのセットを使用できます。このブログシリーズの第2部で、これについてさらに詳しく説明します。
### 主キーの選択 {#choose-primary-keys}

正しい主キーのセットを選択することは複雑なトピックであり、最適な組み合わせを見つけるためにはトレードオフや実験が必要になることがあります。

今のところ、次の簡単な実践に従います：

-   ほとんどのクエリでフィルタリングに使用されるフィールドを使用する
-   最初にカーディナリティの低いカラムを選択する
-   主キーに時間ベースの要素を考慮する。タイムスタンプデータセットで時間によるフィルタリングが非常に一般的だからです。

私たちのケースでは、次の主キーを使用して実験します: `passenger_count`, `pickup_datetime`, および `dropoff_datetime`。

`passenger_count` のカーディナリティは小さく（24のユニークな値）、遅いクエリで使用されています。また、よくフィルタリングされるため、タイムスタンプフィールド（`pickup_datetime` と `dropoff_datetime`）も追加します。

主キーを使用して新しいテーブルを作成し、データを再取得します。

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

その後、クエリを再実行します。3つの実験からの結果をまとめ、経過時間、処理された行数、およびメモリ消費量の改善を確認します。

<table>
  <thead>
    <tr>
      <th colspan="4">クエリ 1</th>
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
      <td>1.699 秒</td>
      <td>1.353 秒</td>
      <td>0.765 秒</td>
    </tr>
    <tr>
      <td>処理された行数</td>
      <td>3.2904 百万</td>
      <td>3.2904 百万</td>
      <td>3.2904 百万</td>
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
      <th colspan="4">クエリ 2</th>
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
      <td>1.419 秒</td>
      <td>1.171 秒</td>
      <td>0.248 秒</td>
    </tr>
    <tr>
      <td>処理された行数</td>
      <td>3.2904 百万</td>
      <td>3.2904 百万</td>
      <td>41.46 百万</td>
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
      <td>3.2904 百万</td>
      <td>3.2904 百万</td>
      <td>276.99 百万</td>
    </tr>
    <tr>
      <td>ピークメモリ</td>
      <td>451.53 MiB</td>
      <td>265.05 MiB</td>
      <td>197.38 MiB</td>
    </tr>
  </tbody>
</table>

実行時間と使用されたメモリにおいて、全体的に顕著な改善が見られます。

クエリ 2 は主キーの恩恵を最も受けています。生成されたクエリプランが以前とはどのように異なるかを見てみましょう。

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

Query id: 30116a77-ba86-4e9f-a9a2-a01670ad2e15

    ┌─explain──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 1. │ Expression ((Projection + Before ORDER BY [lifted up part]))                                                     │
 2. │   Sorting (Sorting for ORDER BY)                                                                                 │
 3. │     Expression (Before ORDER BY)                                                                                 │
 4. │       Aggregating                                                                                                │
 5. │         Expression (Before GROUP BY)                                                                             │
 6. │           Expression                                                                                             │
 7. │             ReadFromMergeTree (nyc_taxi.trips_small_pk)                                                          │
 8. │             Indexes:                                                                                             │
 9. │               PrimaryKey                                                                                         │
10. │                 Keys:                                                                                            │
11. │                   pickup_datetime                                                                                │
12. │                 Condition: and((pickup_datetime in (-Inf, 1238543999]), (pickup_datetime in [1230768000, +Inf))) │
13. │                 Parts: 9/9                                                                                       │
14. │                 Granules: 5061/40167                                                                             │
    └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

主キーのおかげで、テーブルのグラニュールのサブセットのみが選択されました。これだけで、ClickHouseが処理するデータが大幅に少なくなるため、クエリパフォーマンスが大幅に向上します。
## 次のステップ {#next-steps}

このガイドが、ClickHouseで遅いクエリを調査する方法や、それを速くする方法について良い理解を得るのに役立つことを願っています。このトピックについてさらに探求したい場合は、[クエリアナライザー](/operations/analyzer)や[プロファイリング](/operations/optimizing-performance/sampling-query-profiler)についてさらに読むことで、ClickHouseがどのようにあなたのクエリを実行しているかをより良く理解できます。

ClickHouseの特性に慣れていくにつれて、[パーティショニングキー](/optimize/partitioning-key)や[データスキッピングインデックス](/optimize/skipping-indexes)について読むことをお勧めします。これにより、クエリを加速させるために使用できるより高度な技術について学ぶことができます。
