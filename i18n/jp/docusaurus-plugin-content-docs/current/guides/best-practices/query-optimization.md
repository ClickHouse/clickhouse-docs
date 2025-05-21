---
slug: /optimize/query-optimization
sidebar_label: 'クエリ最適化'
title: 'クエリ最適化に関するガイド'
description: 'クエリパフォーマンスを改善するための一般的な手法について説明するシンプルなガイド'
---

import queryOptimizationDiagram1 from '@site/static/images/guides/best-practices/query_optimization_diagram_1.png';
import Image from '@theme/IdealImage';

# クエリ最適化に関するシンプルなガイド

このセクションでは、さまざまなパフォーマンスと最適化技術、例えば [analyzer](/operations/analyzer)、[クエリプロファイリング](/operations/optimizing-performance/sampling-query-profiler) や [Nullable カラムを避けること](/optimize/avoid-nullable-columns) などを使用して、ClickHouseのクエリパフォーマンスを向上させる方法を一般的なシナリオを通じて示します。

## クエリパフォーマンスの理解 {#understand-query-performance}

パフォーマンス最適化について考える最適なタイミングは、データをClickHouseに初めて取り込む前に [データスキーマ](/data-modeling/schema-design) を設定しているときです。 

しかし、正直に言うと、データがどれだけ成長するか、どのようなクエリが実行されるかを予測するのは難しいです。 

既存のデプロイメントにいくつかのクエリがあり、それを改善したい場合、最初のステップはそのクエリがどのようにパフォーマンスしているか、なぜ数ミリ秒で実行されるものと、より長くかかるものがあるのかを理解することです。

ClickHouseには、クエリがどのように実行され、実行に消費されるリソースを理解するための豊富なツールセットがあります。 

このセクションでは、これらのツールと、それらをどのように使用するかを見ていきます。

## 一般的な考慮事項 {#general-considerations}

クエリパフォーマンスを理解するために、クエリがClickHouseで実行されるときに何が起こるかを見てみましょう。 

以下の部分は意図的に簡略化され、一部のショートカットが取られています。ここでのアイデアは詳細で溺れさせるのではなく、基本的な概念に素早く慣れることです。より詳しい情報については [クエリアナライザー](/operations/analyzer) を参照できます。 

非常に高いレベルで考えると、ClickHouseがクエリを実行するとき、以下のことが起こります：

  - **クエリの解析と分析**

クエリは解析され、分析され、一般的なクエリ実行計画が作成されます。 

  - **クエリ最適化**

クエリ実行計画は最適化され、不必要なデータがプルーニングされ、クエリ計画からクエリパイプラインが構築されます。 

  - **クエリパイプラインの実行**

データは並行して読み取られ、処理されます。これは、ClickHouseが実際にフィルタリング、集計、並べ替えといったクエリ操作を実行するステージです。 

  - **最終処理**

結果はマージされ、並べ替えられ、クライアントに送信される前に最終結果にフォーマットされます。

実際には、多くの [最適化](/concepts/why-clickhouse-is-so-fast) が行われており、これについてはこのガイドでさらに詳しく説明しますが、今のところ、これらの主要な概念は、ClickHouseがクエリを実行する際に裏で何が起こっているかを良く理解するのに役立ちます。 

この高レベルの理解を持って、ClickHouseが提供するツールを調査し、クエリパフォーマンスに影響を与えるメトリクスを追跡する方法を見てみましょう。

## データセット {#dataset}

実際の例を使用して、クエリパフォーマンスへのアプローチを示します。 

NYCのタクシーデータを含むNYCタクシーデータセットを使用します。最初に、最適化なしでNYCタクシーデータセットを取り込みます。

以下は、テーブルを作成し、S3バケットからデータを挿入するためのコマンドです。データからスキーマを推測することに注意してください。

```sql
-- 推論されたスキーマでテーブルを作成
CREATE TABLE trips_small_inferred
ORDER BY () EMPTY
AS SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/clickhouse-academy/nyc_taxi_2009-2010.parquet');

-- 推論されたスキーマでテーブルにデータを挿入
INSERT INTO trips_small_inferred
SELECT *
FROM s3Cluster
('default','https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/clickhouse-academy/nyc_taxi_2009-2010.parquet');
```

データから自動的に推論されたテーブルスキーマを見てみましょう。

```sql
--- 推論されたテーブルスキーマを表示
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

デフォルトでは、ClickHouseは実行された各クエリについての情報を収集し、[クエリログ](/operations/system-tables/query_log) に記録します。このデータは `system.query_log` テーブルに保存されます。 

実行された各クエリについて、ClickHouseはクエリ実行時間、読み取られた行数、CPU、メモリ使用量、またはファイルシステムキャッシュヒットなどのリソース使用状況をログに記録します。 

したがって、クエリログは遅いクエリを調査する際の良い出発点です。実行に時間がかかるクエリを簡単に特定し、それぞれのリソース使用情報を表示できます。 

NYCタクシーデータセットの上位5つの長時間実行されるクエリを見つけましょう。

```sql
-- 過去1時間のnyc_taxiデータベースからのトップ5の長時間実行されるクエリを見つける
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

フィールド `query_duration_ms` は、その特定のクエリの実行にかかった時間を示しています。クエリログの結果を見てみると、最初のクエリは2967msかかっており、改善が必要です。 

また、異常なメモリやCPUを消費しているクエリを調べることも重要です。 

```sql
-- メモリ使用量によるトップクエリ
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

見つけた長時間実行されるクエリを隔離し、数回再実行して応答時間を理解しましょう。 

この時点で、`enable_filesystem_cache` 設定を0に設定してファイルシステムキャッシュをオフにすることが、再現性を高めるために重要です。

```sql
-- ファイルシステムキャッシュを無効化
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

読みやすくするために表にまとめましょう。

| 名前    | 経過時間   | 処理された行数 | ピークメモリ |
| ------- | --------- | -------------- | ----------- |
| クエリ 1 | 1.699 sec | 329.04百万     | 440.24 MiB  |
| クエリ 2 | 1.419 sec | 329.04百万     | 546.75 MiB  |
| クエリ 3 | 1.414 sec | 329.04百万     | 451.53 MiB  |

クエリが何を達成しているのかをもう少し理解しましょう。 

- クエリ1は、平均時速30マイル以上の運転の距離分布を計算します。
- クエリ2は、週ごとの運転の数と平均コストを求めます。 
- クエリ3は、データセット内の各旅行の平均時間を計算します。

これらのクエリは非常に複雑な処理を行っているわけではなく、クエリ1はクエリを実行するたびに旅行時間をその場で計算している点が目立ちます。しかし、これらのクエリはすべて1秒以上かかっており、ClickHouseの世界では非常に長い時間です。また、これらのクエリのメモリ使用量はおおよそ400MBであり、それはかなりのメモリです。また、各クエリは同じ数の行（すなわち329.04百万行）を読み込んでいるようです。テーブル内の行数を確認しましょう。

```sql
-- テーブル内の行数をカウント
SELECT count()
FROM nyc_taxi.trips_small_inferred

Query id: 733372c5-deaf-4719-94e3-261540933b23

   ┌───count()─┐
1. │ 329044175 │ -- 329.04百万
   └───────────┘
```

テーブルには329.04百万行が含まれているため、各クエリはテーブル全体をスキャンしています。

### EXPLAIN文 {#explain-statement}

長時間実行されるクエリをいくつか持ったので、どのように実行されるのかを理解しましょう。これを行うために、ClickHouseは [EXPLAIN文](https://clickhouse.com/docs/ja/ja/sql-reference/statements/explain) コマンド をサポートしています。これは、クエリを実行せずにすべてのクエリ実行段階についての非常に詳細なビューを提供する非常に便利なツールです。ClickHouseの専門家でないと見るのが圧倒されるかもしれませんが、クエリがどのように実行されるかを洞察するために必要なツールです。

ドキュメントには、EXPLAIN文が何であるか、そしてそれを使用してクエリ実行を分析する方法についての詳細な [ガイド](/guides/developer/understanding-query-execution-with-the-analyzer) があります。このガイドで繰り返すのではなく、クエリ実行パフォーマンスのボトルネックを見つけるのに役立ついくつかのコマンドに焦点を当てましょう。 

**Explain indexes = 1**

最初に、クエリ計画を検査するためにEXPLAIN indexes = 1を使用します。クエリ計画は、クエリがどのように実行されるかを示すツリーです。ここで、クエリの句がどの順序で実行されるかを確認できます。EXPLAIN文から返されたクエリ計画は、下から上に読むことができます。

長時間実行されるクエリの最初の1つを試してみましょう。

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

出力は分かりやすいです。クエリは最初に `nyc_taxi.trips_small_inferred` テーブルからデータを読み取ります。その後、WHERE句が適用され、計算された値に基づいて行がフィルタリングされます。フィルタリングされたデータは集計のために準備され、分位数が計算されます。最後に、結果がソートされて出力されます。 

ここで、主キーが使用されていないことに注意してください。テーブルを作成するときに定義していなかったため、ClickHouseはクエリのためにテーブル全体をスキャンしています。 

**Explain Pipeline**

EXPLAIN PIPELINEは、クエリの具体的な実行戦略を示します。ここで、前に見た一般的なクエリ計画がClickHouseでどのように実行されたかを見ることができます。

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

ここで、クエリを実行するために使用されるスレッドの数が59であることがわかります。これは、高い並列化を示しています。これによりクエリが高速化され、より小さなマシンで実行するよりも長い時間がかかる可能性があります。このクエリが使用する高いメモリ量は、並行して実行されているスレッドの数を説明できます。 

理想的には、すべての遅いクエリを同じように調べて、不要な複雑なクエリプランを特定し、各クエリで読み取られた行数や消費されたリソースを理解することをお勧めします。

## 方法論 {#methodology}

本番環境で問題のあるクエリを特定するのは難しいことがあります。なぜなら、現在のClickHouseのデプロイメントで実行されるクエリの数は非常に多いからです。 

どのユーザー、データベース、またはテーブルに問題があるかがわかっている場合、`system.query_logs` の `user`、`tables`、または `databases` フィールドを使用して検索を絞り込むことができます。 

最適化したいクエリを特定したら、それに取り組み始めることができます。この段階で開発者が犯しがちな一般的な間違いは、複数のことを同時に変更し、アドホックな実験を行い、通常混合結果に終わりますが、さらに重要なのはクエリがなぜ速くなったのかの良い理解を欠くことです。 

クエリ最適化には構造が必要です。私は、高度なベンチマークのことを言っているのではなく、変更がクエリパフォーマンスにどのように影響するかを理解するためのシンプルなプロセスを持つことが非常に重要です。 

最初にクエリログから遅いクエリを特定し、その後、潜在的な改善を個別に調査します。クエリをテストする際は、ファイルシステムキャッシュを無効にしてください。 

> ClickHouseは、異なるステージでクエリパフォーマンスを向上させるために [キャッシング](/operations/caches) を利用しています。これはクエリパフォーマンスには良いですが、トラブルシューティング中は潜在的なI/Oボトルネックや不十分なテーブルスキーマを隠す可能性があります。このため、テスト中はファイルシステムキャッシュをオフにすることをお勧めします。本番環境では有効にしてください。

潜在的な最適化を特定したら、パフォーマンスに与える影響をよりよく追跡できるように、それを一つずつ実装することをお勧めします。以下は、一般的アプローチを説明する図です。

<Image img={queryOptimizationDiagram1} size="lg" alt="最適化ワークフロー"/>

最終的に、外れ値に注意してください。クエリが遅く実行されることは非常に一般的で、ユーザーがアドホックな高コストのクエリを試したり、システムが他の理由でストレスを受けている場合です。フィールド `normalized_query_hash` でグループ化して、定期的に実行される高コストのクエリを特定できます。それらが調査すべきものかもしれません。

## 基本的な最適化 {#basic-optimization}

フレームワークをテストする準備が整ったので、最適化を開始できます。 

最初に見るべき場所は、データがどのように保存されているかです。すべてのデータベースと同様に、読み取るデータが少なければ少ないほど、クエリは速く実行されます。 

データを取り込む方法に応じて、ClickHouseの [機能](/interfaces/schema-inference) を使用して、取り込まれたデータに基づいてテーブルスキーマを推測したかもしれません。これは開始するためには非常に便利ですが、クエリパフォーマンスを最適化するには、使用ケースに最適なデータスキーマを見直す必要があります。

### Nullable {#nullable}

[ベストプラクティスドキュメント](/best-practices/select-data-types#avoid-nullable-columns) に記載されているように、可能な限りNullableカラムを避けるべきです。これらはデータ取り込みメカニズムをより柔軟にするためにありがちですが、パフォーマンスに悪影響を及ぼすため、毎回処理する必要があります。

NULL値を持つ行をカウントするSQLクエリを実行することで、実際にNullable値が必要なテーブルのカラムを簡単に特定できます。

```sql
-- NULLでない値のカラムを探す
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

NULL値を持つカラムは2つだけであり、`mta_tax` と `payment_type` です。他のカラムは`Nullable` カラムを使用すべきではありません。

### 低カーディナリティ {#low-cardinality}

文字列に適用できる簡単な最適化は、低カーディナリティのデータ型を最大限に活用することです。低カーディナリティの [ドキュメント](/sql-reference/data-types/lowcardinality) に記載されているように、ClickHouseは低カーディナリティカラムに辞書コーディングを適用し、クエリパフォーマンスを大幅に向上させます。 

低ユニーク値を持つカラムは、基本的に1万未満のユニークな値を持つカラムです。そのため、次のSQLクエリを使用してユニークな値が少ないカラムを見つけることができます。

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

低カーディナリティを持つこれらの4つのカラム、`ratecode_id`、`pickup_location_id`、`dropoff_location_id`、および `vendor_id` は、LowCardinalityフィールドタイプの良い候補です。

### データ型の最適化 {#optimize-data-type}

ClickHouseは多数のデータ型をサポートしています。パフォーマンスを最適化し、ディスクのデータストレージスペースを削減するために、使用ケースに適した最小のデータ型を選択することを確認してください。 

数字の場合、データセット内の最小値/最大値を確認して、現在の精度値がデータセットの現実に合っているかを確認することができます。

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

日付の場合、データセットに合った精度を選択し、実行予定のクエリに最適なものを選択する必要があります。

### 最適化を適用する {#apply-the-optimizations}

最適化されたスキーマを使用する新しいテーブルを作成し、データを再取り込みましょう。

```sql
-- 最適化データでテーブルを作成
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

新しいテーブルを使用して再びクエリを実行し、改善が見られるかどうかを確認します。 

| 名前    | 実行1 - 経過時間 | 経過時間   | 処理された行数 | ピークメモリ |
| ------- | --------------- | --------- | -------------- | ----------- |
| クエリ 1 | 1.699 sec       | 1.353 sec | 329.04百万     | 337.12 MiB  |
| クエリ 2 | 1.419 sec       | 1.171 sec | 329.04百万     | 531.09 MiB  |
| クエリ 3 | 1.414 sec       | 1.188 sec | 329.04百万     | 265.05 MiB  |

クエリ時間とメモリ使用量の改善が見られます。データスキーマの最適化によって、データの総ボリュームが減少し、メモリ消費が改善され、処理時間が短縮されました。 

テーブルのサイズを確認して差異を見てみましょう。 

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

新しいテーブルは、以前のものよりもかなり小さいです。テーブルのサイズが約34％減少しています（7.38 GiB対4.89 GiB）。

## 主キーの重要性 {#the-importance-of-primary-keys}

ClickHouseにおける主キーは、大多数の従来のデータベースシステムとは異なる動作をします。そのシステムでは、主キーは一意性とデータの整合性を強制します。重複した主キー値を挿入しようとすると拒否され、通常は高速ルックアップのためにBツリーまたはハッシュベースのインデックスが作成されます。 

ClickHouseでは、主キーの[目的](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key)は異なります。一意性を強制したり、データの整合性を支援したりするのではなく、クエリパフォーマンスを最適化するように設計されています。主キーは、ディスク上にデータが保存される順序を定義し、各グラニュールの最初の行へのポインタを格納するスパースインデックスとして実装されています。

> ClickHouseのグラニュールは、クエリ実行中に読み取られる最小のデータ単位です。これらは、`index_granularity` で決定された最大行数を含み、デフォルト値は8192行です。グラニュールは連続して保存され、主キーでソートされます。 

良い主キーセットを選定することはパフォーマンスにとって重要であり、特定のクエリセットを高速化するために同じデータを異なるテーブルに保存し、異なる主キーセットを使用することが一般的です。 

ClickHouseがサポートする他のオプション（プロジェクションやマテリアライズドビューなど）は、同じデータに異なる主キーセットを使用することを可能にします。このブログシリーズの後半では、これについて詳しく説明します。
```
```yaml
title: '主キーの選択'
sidebar_label: '主キーの選択'
keywords: ['ClickHouse', '主キー', 'クエリ', 'データベース']
description: '最適な主キーの組み合わせを見つけるための実践的なガイド。'
```

### 主キーの選択 {#choose-primary-keys}

正しい主キーのセットを選択することは複雑なトピックであり、最適な組み合わせを見つけるためにはトレードオフや実験が必要になるかもしれません。

今は、以下のシンプルなプラクティスに従いましょう：

-   ほとんどのクエリでフィルタリングに使用されるフィールドを使用する
-   低いカーディナリティのカラムを優先して選ぶ
-   主キーに時間に基づいたコンポーネントを考慮する。タイムスタンプデータセットでの時間によるフィルタリングは非常に一般的です。

私たちのケースでは、次の主キーで実験を行います：`passenger_count`、`pickup_datetime`、 `dropoff_datetime`。

`passenger_count`のカーディナリティは小さく（24のユニーク値）、遅いクエリで使用されています。また、頻繁にフィルタリングされる可能性があるため、タイムスタンプフィールド（`pickup_datetime`と`dropoff_datetime`）も追加します。

主キーを使用して新しいテーブルを作成し、データを再取り込みします。

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

次に、クエリを再実行します。3つの実験からの結果をまとめ、経過時間、処理された行、メモリ消費を確認します。

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
      <td>1.699 sec</td>
      <td>1.353 sec</td>
      <td>0.765 sec</td>
    </tr>
    <tr>
      <td>処理された行</td>
      <td>3.2904 億</td>
      <td>3.2904 億</td>
      <td>3.2904 億</td>
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
      <td>1.419 sec</td>
      <td>1.171 sec</td>
      <td>0.248 sec</td>
    </tr>
    <tr>
      <td>処理された行</td>
      <td>3.2904 億</td>
      <td>3.2904 億</td>
      <td>4146 万</td>
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
      <td>1.414 sec</td>
      <td>1.188 sec</td>
      <td>0.431 sec</td>
    </tr>
    <tr>
      <td>処理された行</td>
      <td>3.2904 億</td>
      <td>3.2904 億</td>
      <td>2.7699 億</td>
    </tr>
    <tr>
      <td>ピークメモリ</td>
      <td>451.53 MiB</td>
      <td>265.05 MiB</td>
      <td>197.38 MiB</td>
    </tr>
  </tbody>
</table>

実行時間とメモリ使用量の全体での大きな改善が見られます。

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

主キーのおかげで、テーブルのグラニュールのサブセットのみが選択されています。これにより、ClickHouseが処理しなければならないデータが大幅に減少するため、クエリのパフォーマンスが大幅に向上します。
## 次のステップ {#next-steps}

このガイドが ClickHouse での遅いクエリの調査方法と、それをより高速化する方法についての理解を得るのに役立つことを願っています。このトピックをさらに探求するには、[クエリアナライザー](/operations/analyzer)や、クエリがどのように実行されているかをよりよく理解するための[プロファイリング](/operations/optimizing-performance/sampling-query-profiler)についてさらに読むことをお勧めします。

ClickHouse の特性に慣れてきたら、[パーティションキー](/optimize/partitioning-key)や[データスキッピングインデックス](/optimize/skipping-indexes)について読むことをお勧めします。これにより、クエリを加速するために使用できるさらに高度な技術について学ぶことができます。
