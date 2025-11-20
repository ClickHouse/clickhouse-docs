---
slug: /optimize/query-optimization
sidebar_label: 'クエリ最適化'
title: 'クエリ最適化ガイド'
description: 'クエリのパフォーマンスを向上させるための代表的な手法を解説する、シンプルなクエリ最適化ガイド'
doc_type: 'guide'
keywords: ['query optimization', 'performance', 'best practices', 'query tuning', 'efficiency']
---

import queryOptimizationDiagram1 from '@site/static/images/guides/best-practices/query_optimization_diagram_1.png';
import Image from '@theme/IdealImage';


# クエリ最適化のための簡易ガイド

このセクションでは、一般的なシナリオを通じて、[analyzer](/operations/analyzer)、[query profiling](/operations/optimizing-performance/sampling-query-profiler)、[avoid nullable Columns](/optimize/avoid-nullable-columns) などのさまざまなパフォーマンスおよび最適化手法をどのように活用し、ClickHouse におけるクエリのパフォーマンスを向上させるかを説明します。



## クエリパフォーマンスの理解 {#understand-query-performance}

パフォーマンス最適化について考える最適なタイミングは、初めてClickHouseにデータを取り込む前に[データスキーマ](/data-modeling/schema-design)を設定する段階です。

しかし、実際のところ、データがどの程度増加するか、またどのようなクエリが実行されるかを予測することは困難です。

改善したいクエリがいくつかある既存のデプロイメントをお持ちの場合、最初のステップは、それらのクエリがどのように実行されるか、そしてなぜ一部のクエリは数ミリ秒で実行されるのに対し、他のクエリは時間がかかるのかを理解することです。

ClickHouseには、クエリがどのように実行されるか、および実行時に消費されるリソースを理解するための豊富なツールが用意されています。

このセクションでは、これらのツールとその使用方法について説明します。 


## 一般的な考慮事項 {#general-considerations}

クエリのパフォーマンスを理解するために、ClickHouseでクエリが実行される際に何が起こるかを見ていきましょう。

以下の説明は意図的に簡略化されており、いくつかの省略を含んでいます。ここでの目的は、詳細に埋もれさせることではなく、基本的な概念を素早く理解していただくことです。詳細については、[クエリアナライザー](/operations/analyzer)をご参照ください。

非常に高レベルの観点から見ると、ClickHouseがクエリを実行する際には、以下のプロセスが発生します。

- **クエリの解析と分析**

クエリが解析および分析され、汎用的なクエリ実行計画が作成されます。

- **クエリの最適化**

クエリ実行計画が最適化され、不要なデータが削除され、クエリ計画からクエリパイプラインが構築されます。

- **クエリパイプラインの実行**

データが並列に読み取られ、処理されます。この段階で、ClickHouseはフィルタリング、集計、ソートなどのクエリ操作を実際に実行します。

- **最終処理**

結果がマージ、ソートされ、クライアントに送信される前に最終結果としてフォーマットされます。

実際には、多くの[最適化](/concepts/why-clickhouse-is-so-fast)が行われており、このガイドでそれらについてもう少し詳しく説明しますが、現時点では、これらの主要な概念により、ClickHouseがクエリを実行する際に内部で何が起こっているかについて十分な理解が得られます。

この高レベルの理解を踏まえて、ClickHouseが提供するツールと、クエリパフォーマンスに影響を与えるメトリクスを追跡するためにそれらをどのように活用できるかを見ていきましょう。 


## データセット {#dataset}

クエリパフォーマンスへのアプローチ方法を説明するために、実際の例を使用します。

NYC市内のタクシー乗車データを含むNYC Taxiデータセットを使用します。まず、最適化を行わずにNYC Taxiデータセットを取り込むことから始めます。

以下は、テーブルを作成しS3バケットからデータを挿入するコマンドです。意図的にデータからスキーマを推論していますが、これは最適化されていません。

```sql
-- 推論されたスキーマでテーブルを作成
CREATE TABLE trips_small_inferred
ORDER BY () EMPTY
AS SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/clickhouse-academy/nyc_taxi_2009-2010.parquet');

-- 推論されたスキーマのテーブルにデータを挿入
INSERT INTO trips_small_inferred
SELECT *
FROM s3Cluster
('default','https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/clickhouse-academy/nyc_taxi_2009-2010.parquet');
```

データから自動的に推論されたテーブルスキーマを確認してみましょう。

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

デフォルトでは、ClickHouseは実行された各クエリに関する情報を[クエリログ](/operations/system-tables/query_log)に収集・記録します。このデータは`system.query_log`テーブルに保存されます。 

実行された各クエリについて、ClickHouseはクエリ実行時間、読み取り行数、およびCPU、メモリ使用量、ファイルシステムキャッシュヒット数などのリソース使用状況といった統計情報を記録します。 

そのため、クエリログは遅いクエリを調査する際の最適な出発点となります。実行に時間がかかるクエリを簡単に特定し、それぞれのリソース使用状況を確認できます。 

NYCタクシーデータセットで実行時間が長い上位5つのクエリを見つけてみましょう。

```sql
-- 過去1時間のnyc_taxiデータベースから実行時間が長い上位5つのクエリを検索
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

`query_duration_ms`フィールドは、その特定のクエリの実行にかかった時間を示します。クエリログの結果を見ると、最初のクエリは実行に2967msかかっており、改善の余地があることがわかります。 

また、最もメモリやCPUを消費するクエリを調べることで、システムに負荷をかけているクエリを特定することもできます。 


```sql
-- メモリ使用量の多いクエリ上位
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

見つかった長時間実行クエリを切り出し、レスポンス時間を把握するために数回再実行してみましょう。 

この時点では、再現性を高めるために `enable_filesystem_cache` 設定を 0 にしてファイルシステムキャッシュを無効にしておくことが重要です。

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
1行のセット。経過時間: 1.699秒。処理済み: 3億2904万行、8.88 GB (1億9372万行/秒、5.23 GB/秒)
ピークメモリ使用量: 440.24 MiB

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
4行のセット。経過時間: 1.419秒。処理済み: 3億2904万行、5.72 GB (2億3186万行/秒、4.03 GB/秒)
ピークメモリ使用量: 546.75 MiB

-- クエリ3を実行
SELECT
  avg(dateDiff('s', pickup_datetime, dropoff_datetime))
FROM nyc_taxi.trips_small_inferred
WHERE passenger_count = 1 or passenger_count = 2
FORMAT JSON

---
1行のセット。経過時間: 1.414秒。処理済み: 3億2904万行、8.88 GB (2億3263万行/秒、6.28 GB/秒)
ピークメモリ使用量: 451.53 MiB
```

読みやすくするために、表にまとめます。

| Name    | Elapsed   | Rows processed | Peak memory |
| ------- | --------- | -------------- | ----------- |
| Query 1 | 1.699 sec | 329.04 million | 440.24 MiB  |
| Query 2 | 1.419 sec | 329.04 million | 546.75 MiB  |
| Query 3 | 1.414 sec | 329.04 million | 451.53 MiB  |

これらのクエリが何をしているのか、もう少し詳しく見ていきましょう。

* Query 1 は、平均速度が時速 30 マイルを超える乗車について、距離の分布を計算します。
* Query 2 は、週ごとの乗車回数と平均料金を算出します。
* Query 3 は、データセット内の各乗車の平均時間を計算します。

これらのクエリはいずれも非常に複雑な処理を行っているわけではありませんが、1 つ目のクエリだけは、クエリが実行されるたびに乗車時間をその場で計算しています。それにもかかわらず、どのクエリも実行に 1 秒以上かかっており、ClickHouse の世界ではこれはかなり長い時間です。また、これらのクエリのメモリ使用量にも注目しましょう。各クエリで約 400 MiB というのは、かなり大きなメモリ使用量です。さらに、どのクエリも同じ行数（すなわち 3.2904 億行）を読み取っているように見えます。このテーブルに実際に何行あるのか、さっと確認してみましょう。

```sql
-- テーブルの行数をカウント
SELECT count()
FROM nyc_taxi.trips_small_inferred
```


Query id: 733372c5-deaf-4719-94e3-261540933b23

┌───count()─┐

1. │ 329044175 │ -- 約 3.29 億
   └───────────┘

````

このテーブルには3億2904万行が含まれているため、各クエリはテーブルの全スキャンを実行しています。

### EXPLAIN文 {#explain-statement}

実行時間の長いクエリがいくつか得られたので、それらがどのように実行されるかを理解しましょう。このために、ClickHouseは[EXPLAIN文コマンド](/sql-reference/statements/explain)をサポートしています。これは、クエリを実際に実行することなく、すべてのクエリ実行ステージの詳細なビューを提供する非常に便利なツールです。ClickHouseの専門家でない方にとっては圧倒されるかもしれませんが、クエリがどのように実行されるかを理解するための必須ツールです。

ドキュメントには、EXPLAIN文とは何か、およびクエリ実行の分析にどのように使用するかについての詳細な[ガイド](/guides/developer/understanding-query-execution-with-the-analyzer)が用意されています。このガイドの内容を繰り返すのではなく、クエリ実行パフォーマンスのボトルネックを見つけるのに役立ついくつかのコマンドに焦点を当てましょう。 

**EXPLAIN indexes = 1**

まず、EXPLAIN indexes = 1を使用してクエリプランを検査しましょう。クエリプランは、クエリがどのように実行されるかを示すツリー構造です。そこでは、クエリの句がどの順序で実行されるかを確認できます。EXPLAIN文によって返されるクエリプランは、下から上に読むことができます。

最初の実行時間の長いクエリを使用してみましょう。

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
````

出力はシンプルです。クエリはまず `nyc_taxi.trips_small_inferred` テーブルからデータを読み込みます。次に、計算された値に基づいて行をフィルタリングするために WHERE 句が適用されます。フィルタリングされたデータは集計のために準備され、分位数が計算されます。最後に、結果がソートされて出力されます。 

ここで、プライマリキーが使用されていないことに気づきます。これは、テーブル作成時にプライマリキーを定義していなかったため、理にかなっています。その結果、このクエリに対して ClickHouse はテーブルのフルスキャンを実行しています。 

**Explain Pipeline**

`EXPLAIN PIPELINE` は、クエリに対する具体的な実行戦略を表示します。ここでは、先ほど確認した汎用的なクエリプランを、ClickHouse が実際にどのように実行したかを確認できます。

```sql
EXPLAIN PIPELINE
WITH
    dateDiff('s', pickup_datetime, dropoff_datetime) AS trip_time,
    (trip_distance / trip_time) * 3600 AS speed_mph
SELECT quantiles(0.5, 0.75, 0.9, 0.99)(trip_distance)
FROM nyc_taxi.trips_small_inferred
WHERE speed_mph > 30

クエリID: c7e11e7b-d970-4e35-936c-ecfc24e3b879

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


ここでは、クエリの実行に使用されたスレッド数に注目できます。スレッド数は 59 であり、高い並列化が行われていることを示しています。これによりクエリの実行が高速化され、より小さいマシンであれば時間がかかる処理も短時間で完了します。このように多くのスレッドが並列で動作していることが、クエリが大量のメモリを消費している理由として考えられます。 

理想的には、すべての遅いクエリについて同様の調査を行い、不必要に複雑なクエリプランを特定し、各クエリが読み取る行数や消費するリソースを把握すべきです。



## 方法論 {#methodology}

本番環境のデプロイメントでは、ClickHouseデプロイメント上で常に大量のクエリが実行されているため、問題のあるクエリを特定することが困難な場合があります。 

どのユーザー、データベース、またはテーブルに問題があるかが分かっている場合は、`system.query_logs`の`user`、`tables`、または`databases`フィールドを使用して検索範囲を絞り込むことができます。 

最適化したいクエリを特定したら、最適化作業を開始できます。この段階で開発者がよく犯す誤りは、複数の変更を同時に行い、場当たり的な実験を実行することです。その結果、通常は一貫性のない結果に終わりますが、より重要なのは、何がクエリを高速化したのかについての適切な理解が得られないことです。 

クエリ最適化には体系的なアプローチが必要です。高度なベンチマークについて述べているのではなく、変更がクエリパフォーマンスにどのように影響するかを理解するためのシンプルなプロセスを整備することが、大きな効果をもたらします。 

まず、クエリログから低速なクエリを特定し、次に潜在的な改善策を個別に調査します。クエリをテストする際は、必ずファイルシステムキャッシュを無効にしてください。 

> ClickHouseは、さまざまな段階でクエリパフォーマンスを高速化するために[キャッシング](/operations/caches)を活用しています。これはクエリパフォーマンスには有益ですが、トラブルシューティング中には、潜在的なI/Oボトルネックや不適切なテーブルスキーマを隠してしまう可能性があります。このため、テスト中はファイルシステムキャッシュを無効にすることを推奨します。本番環境では必ず有効にしてください。

潜在的な最適化を特定したら、パフォーマンスへの影響をより適切に追跡するために、それらを一つずつ実装することを推奨します。以下は、一般的なアプローチを説明する図です。

<Image img={queryOptimizationDiagram1} size='lg' alt='最適化ワークフロー' />

_最後に、外れ値には注意してください。ユーザーが場当たり的に高コストなクエリを試したり、システムが別の理由で負荷を受けていたりするために、クエリが低速で実行されることはよくあります。`normalized_query_hash`フィールドでグループ化することで、定期的に実行されている高コストなクエリを特定できます。これらが、おそらく調査すべきクエリです。_


## 基本的な最適化 {#basic-optimization}

テスト用のフレームワークが整ったので、最適化を開始できます。

まず着手すべきは、データの保存方法を確認することです。あらゆるデータベースと同様に、読み取るデータ量が少ないほど、クエリの実行速度は向上します。

データの取り込み方法によっては、取り込んだデータに基づいてテーブルスキーマを推論するClickHouseの[機能](/interfaces/schema-inference)を活用している可能性があります。これは開始時には非常に実用的ですが、クエリパフォーマンスを最適化したい場合は、ユースケースに最適なデータスキーマを見直す必要があります。

### Nullable {#nullable}

[ベストプラクティスドキュメント](/best-practices/select-data-types#avoid-nullable-columns)に記載されているように、可能な限りNullableカラムは避けてください。データ取り込みメカニズムをより柔軟にするため、頻繁に使用したくなりますが、毎回追加のカラムを処理する必要があるため、パフォーマンスに悪影響を及ぼします。

NULL値を持つ行をカウントするSQLクエリを実行することで、テーブル内で実際にNullable値が必要なカラムを簡単に特定できます。

```sql
-- 非NULL値のカラムを検出
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

NULL値を持つカラムは`mta_tax`と`payment_type`の2つのみです。残りのフィールドは`Nullable`カラムを使用すべきではありません。

### 低カーディナリティ {#low-cardinality}

文字列に適用できる簡単な最適化は、LowCardinalityデータ型を最大限に活用することです。低カーディナリティの[ドキュメント](/sql-reference/data-types/lowcardinality)に記載されているように、ClickHouseはLowCardinalityカラムに辞書エンコーディングを適用し、クエリパフォーマンスを大幅に向上させます。

LowCardinalityの適用候補となるカラムを判断する簡単な目安は、ユニーク値が10,000未満のカラムであれば最適な候補であるということです。

以下のSQLクエリを使用して、ユニーク値の数が少ないカラムを見つけることができます。

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

カーディナリティが低いため、これら4つのカラム、`ratecode_id`、`pickup_location_id`、`dropoff_location_id`、`vendor_id`は、LowCardinalityフィールド型の適用候補として適しています。

### データ型の最適化 {#optimize-data-type}

ClickHouseは多数のデータ型をサポートしています。パフォーマンスを最適化し、ディスク上のデータストレージ容量を削減するために、ユースケースに適合する最小のデータ型を選択してください。

数値の場合、データセット内の最小値/最大値を確認して、現在の精度値がデータセットの実態と一致しているかを確認できます。 


```sql
-- payment_type フィールドの最小値/最大値を取得
SELECT
    min(payment_type),max(payment_type),
    min(passenger_count), max(passenger_count)
FROM trips_small_inferred

Query id: 4306a8e1-2a9c-4b06-97b4-4d902d2233eb

   ┌─min(payment_type)─┬─max(payment_type)─┐
1. │                 1 │                 4 │
   └───────────────────┴───────────────────┘
```

日付については、データセットに適合し、実行予定のクエリに最も適した精度を選択してください。

### 最適化の適用 {#apply-the-optimizations}

最適化されたスキーマを使用する新しいテーブルを作成し、データを再投入します。

```sql
-- 最適化されたテーブルを作成
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

| Name    | Run 1 - 経過時間 | 経過時間   | 処理行数 | ピークメモリ |
| ------- | --------------- | --------- | -------------- | ----------- |
| Query 1 | 1.699 sec       | 1.353 sec | 329.04 million | 337.12 MiB  |
| Query 2 | 1.419 sec       | 1.171 sec | 329.04 million | 531.09 MiB  |
| Query 3 | 1.414 sec       | 1.188 sec | 329.04 million | 265.05 MiB  |

クエリ時間とメモリ使用量の両方で改善が見られます。データスキーマの最適化により、データの総容量が削減され、メモリ消費の改善と処理時間の短縮につながります。 

テーブルのサイズを確認して、違いを見てみましょう。 

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

新しいテーブルは以前のものよりもかなり小さくなっています。テーブルのディスク使用量が約34%削減されています（7.38 GiB から 4.89 GiB）。


## プライマリキーの重要性 {#the-importance-of-primary-keys}

ClickHouseのプライマリキーは、従来のデータベースシステムとは異なる動作をします。従来のシステムでは、プライマリキーは一意性とデータ整合性を保証します。重複するプライマリキー値の挿入は拒否され、通常はB-treeまたはハッシュベースのインデックスが高速検索のために作成されます。 

ClickHouseでは、プライマリキーの[目的](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key)が異なります。一意性を保証したり、データ整合性を支援したりすることはありません。代わりに、クエリパフォーマンスの最適化を目的として設計されています。プライマリキーは、データがディスクに保存される順序を定義し、各グラニュールの最初の行へのポインタを格納するスパースインデックスとして実装されています。

> ClickHouseのグラニュールは、クエリ実行時に読み取られるデータの最小単位です。index_granularityによって決定される固定行数まで含まれ、デフォルト値は8192行です。グラニュールは連続して保存され、プライマリキーでソートされます。 

適切なプライマリキーのセットを選択することはパフォーマンスにとって重要であり、実際には同じデータを異なるテーブルに保存し、特定のクエリセットを高速化するために異なるプライマリキーのセットを使用することが一般的です。 

ProjectionやMaterialized viewなど、ClickHouseがサポートする他のオプションを使用すると、同じデータに対して異なるプライマリキーのセットを使用できます。このブログシリーズの第2部では、これについてより詳しく説明します。 

### プライマリキーの選択 {#choose-primary-keys}

適切なプライマリキーのセットを選択することは複雑なトピックであり、最適な組み合わせを見つけるにはトレードオフと実験が必要になる場合があります。 

ここでは、以下のシンプルなプラクティスに従います: 

- ほとんどのクエリでフィルタリングに使用されるフィールドを使用する
- カーディナリティの低いカラムを最初に選択する
- タイムスタンプデータセットで時間によるフィルタリングは非常に一般的であるため、プライマリキーに時間ベースのコンポーネントを含めることを検討する 

今回のケースでは、次のプライマリキーを試します:`passenger_count`、`pickup_datetime`、`dropoff_datetime`。 

passenger_countのカーディナリティは小さく(24個のユニーク値)、遅いクエリで使用されています。また、頻繁にフィルタリングされる可能性があるため、タイムスタンプフィールド(`pickup_datetime`と`dropoff_datetime`)も追加します。

プライマリキーを持つ新しいテーブルを作成し、データを再投入します。

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

次に、クエリを再実行します。3つの実験結果をまとめて、経過時間、処理行数、メモリ消費量の改善を確認します。 

<table>
  <thead>
    <tr>
      <th colspan='4'>クエリ1</th>
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
      <td>処理行数</td>
      <td>329.04 million</td>
      <td>329.04 million</td>
      <td>329.04 million</td>
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
      <th />

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
      <td>処理行数</td>
      <td>329.04 million</td>
      <td>329.04 million</td>
      <td>41.46 million</td>
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
      <th />

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
      <td>処理行数</td>
      <td>329.04 million</td>
      <td>329.04 million</td>
      <td>276.99 million</td>
    </tr>

    <tr>
      <td>ピークメモリ</td>
      <td>451.53 MiB</td>
      <td>265.05 MiB</td>
      <td>197.38 MiB</td>
    </tr>
  </tbody>
</table>

実行時間とメモリ使用量の両方で、全体的に大きな改善が見られます。

クエリ 2 はプライマリキーの恩恵を最も受けています。クエリプランが以前と比べてどのように変化しているかを見ていきましょう。

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

主キーによって、テーブルグラニュールの一部だけが選択されました。これだけでも、ClickHouse が処理しなければならないデータ量が大幅に減るため、クエリ性能は大きく向上します。


## 次のステップ {#next-steps}

このガイドを通じて、ClickHouseで低速なクエリを調査し、高速化する方法について理解を深めていただけたことと思います。このトピックをさらに探求するには、[クエリアナライザー](/operations/analyzer)と[プロファイリング](/operations/optimizing-performance/sampling-query-profiler)について詳しく読むことで、ClickHouseがクエリをどのように実行しているかをより深く理解できます。

ClickHouseの特性に慣れてきたら、[パーティショニングキー](/optimize/partitioning-key)と[データスキッピングインデックス](/optimize/skipping-indexes)について学ぶことをお勧めします。これらは、クエリを高速化するために使用できるより高度な技術です。
