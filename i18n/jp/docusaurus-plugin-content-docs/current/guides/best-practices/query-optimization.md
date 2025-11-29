---
slug: /optimize/query-optimization
sidebar_label: 'クエリ最適化'
title: 'クエリ最適化ガイド'
description: 'クエリのパフォーマンス向上に向けた一般的な手法を説明する、シンプルなクエリ最適化ガイド'
doc_type: 'guide'
keywords: ['クエリ最適化', 'パフォーマンス', 'ベストプラクティス', 'クエリチューニング', '効率化']
---

import queryOptimizationDiagram1 from '@site/static/images/guides/best-practices/query_optimization_diagram_1.png';
import Image from '@theme/IdealImage';


# クエリ最適化のためのシンプルガイド {#a-simple-guide-for-query-optimization}

このセクションでは、一般的なシナリオを通じて [analyzer](/operations/analyzer)、[query profiling](/operations/optimizing-performance/sampling-query-profiler)、[avoid nullable Columns](/optimize/avoid-nullable-columns) など、さまざまなパフォーマンス最適化手法の使い方を示し、ClickHouse のクエリ性能を向上させる方法を説明します。



## クエリのパフォーマンスを理解する {#understand-query-performance}

パフォーマンス最適化について考えるのに最適なタイミングは、初めてデータを ClickHouse に取り込む前に [データスキーマ](/data-modeling/schema-design) を設計しているときです。 

とはいえ、実際にはデータがどれだけ増加するか、どのような種類のクエリが実行されるかを正確に予測するのは困難です。 

すでに稼働しているデプロイメントがあり、改善したいクエリがいくつかある場合、最初のステップは、それらのクエリがどのように実行されているのか、なぜあるクエリは数ミリ秒で終わる一方で、別のクエリはより長い時間がかかるのかを理解することです。

ClickHouse には、クエリがどのように実行され、その実行にどの程度のリソースが消費されたかを理解するための豊富なツールセットがあります。 

このセクションでは、それらのツールとその使い方を見ていきます。 



## 全般的な考慮事項 {#general-considerations}

クエリパフォーマンスを理解するために、クエリが実行されるときに ClickHouse 内で何が起きているかを見ていきます。 

以下の説明は意図的に単純化しており、いくつかのステップを省略しています。目的は細部まですべてを説明することではなく、基本的な概念をすばやく理解してもらうことにあります。詳細については、[query analyzer](/operations/analyzer) を参照してください。 

ごく大まかに言えば、ClickHouse がクエリを実行する際には次のような処理が行われます。 

- **クエリの構文解析と解析処理**

クエリは構文解析および分析が行われ、汎用的なクエリ実行プランが作成されます。 

- **クエリの最適化**

クエリ実行プランが最適化され、不要なデータが除外され、クエリプランからクエリパイプラインが構築されます。 

- **クエリパイプラインの実行**

データは並列に読み取りおよび処理されます。この段階で、ClickHouse はフィルタリング、集約、ソートといったクエリの各種操作を実際に実行します。 

- **最終処理**

結果はマージおよびソートされ、クライアントに送信される前に最終的な結果として整形されます。

実際には多くの[最適化](/concepts/why-clickhouse-is-so-fast)が行われており、本ガイドの中でこれらの一部についてさらに説明しますが、現時点ではこれらの主要な概念を理解しておくことで、ClickHouse がクエリを実行する際に舞台裏で何が起こっているのかを十分に把握できます。 

このような高レベルの理解を踏まえて、ClickHouse が提供するツールと、それらを用いてクエリパフォーマンスに影響するメトリクスをどのように追跡できるかを見ていきましょう。 



## データセット {#dataset}

実際の例を用いて、クエリ性能へのアプローチを説明します。 

NYC Taxi データセット（NYC のタクシー乗車データを含む）を使用します。まず、最適化を一切行わずに NYC Taxi データセットを取り込みます。

以下は、テーブルを作成し、S3 バケットからデータを挿入するためのコマンドです。ここでは、あえてデータからスキーマを推論させており、これは最適化された方法ではない点に注意してください。

```sql
-- スキーマを推論してテーブルを作成
CREATE TABLE trips_small_inferred
ORDER BY () EMPTY
AS SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/clickhouse-academy/nyc_taxi_2009-2010.parquet');

-- スキーマを推論したテーブルにデータを挿入
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


## 遅いクエリを見つける {#spot-the-slow-queries}

### クエリログ {#query-logs}

デフォルトでは、ClickHouse は実行された各クエリに関する情報を収集し、[クエリログ](/operations/system-tables/query_log) に書き込みます。このデータはテーブル `system.query_log` に保存されます。 

各クエリごとに、ClickHouse はクエリの実行時間、読み取られた行数、CPU やメモリ使用量、ファイルシステムキャッシュヒット数などのリソース使用状況に関する統計情報をログに記録します。 

そのため、クエリログは遅いクエリを調査する際の起点として有用です。実行に長時間かかっているクエリを簡単に特定し、それぞれのリソース使用状況を確認できます。 

NYC タクシーデータセットに対して、長時間実行されているクエリの上位 5 件を探してみましょう。

```sql
-- 過去1時間でnyc_taxiデータベースから実行時間が長いクエリの上位5件を検索
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

フィールド `query_duration_ms` は、そのクエリの実行に要した時間を示します。クエリログの結果を見ると、最初のクエリは実行に 2967ms を要しており、改善の余地があります。 

また、どのクエリがシステムに負荷をかけているかを把握するために、最も多くのメモリや CPU を消費しているクエリを調べたくなる場合もあるでしょう。


```sql
-- メモリ使用量上位のクエリ
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

見つかった実行時間の長いクエリを特定し、その応答時間を把握するために、何度か再実行してみましょう。 

この段階では、再現性を高めるために、`enable_filesystem_cache` 設定を 0 にしてファイルシステムキャッシュを無効化することが重要です。

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

読みやすいように表にまとめます。

| Name    | Elapsed   | Rows processed | Peak memory |
| ------- | --------- | -------------- | ----------- |
| Query 1 | 1.699 sec | 329.04 million | 440.24 MiB  |
| Query 2 | 1.419 sec | 329.04 million | 546.75 MiB  |
| Query 3 | 1.414 sec | 329.04 million | 451.53 MiB  |

これらのクエリが何をしているのか、もう少し詳しく見ていきましょう。 

* Query 1 は、平均速度が時速 30 マイルを超える乗車について、距離分布を計算します。
* Query 2 は、週ごとの乗車回数と平均コストを求めます。 
* Query 3 は、データセット内の各乗車の平均時間を計算します。

これらのクエリはいずれも非常に複雑な処理を行っているわけではありませんが、最初のクエリだけは、クエリが実行されるたびに乗車時間をオンザフライで計算しています。それにもかかわらず、これらのクエリはいずれも実行に 1 秒以上かかっており、ClickHouse の世界ではこれは非常に長い時間です。また、クエリのメモリ使用量にも注目できます。各クエリでおおよそ 400 MiB というのは、かなり多くのメモリです。さらに、各クエリは同じ行数（すなわち 3.2904 億行）を読み取っているように見えます。このテーブルに実際に何行あるのかを手短に確認してみましょう。

```sql
-- テーブル内の行数をカウント
SELECT count()
FROM nyc_taxi.trips_small_inferred
```


Query id: 733372c5-deaf-4719-94e3-261540933b23

┌───count()─┐

1. │ 329044175 │ -- 約3.29億
   └───────────┘

````

このテーブルには3億2904万行が含まれているため、各クエリはテーブル全体のスキャンを実行しています。

### EXPLAIN文 {#explain-statement}

実行時間の長いクエリがいくつか得られたので、それらがどのように実行されるかを理解しましょう。このために、ClickHouseは[EXPLAIN文コマンド](/sql-reference/statements/explain)をサポートしています。これは、クエリを実際に実行することなく、すべてのクエリ実行段階の非常に詳細なビューを提供する非常に有用なツールです。ClickHouseの専門家でない方にとっては圧倒的に感じられるかもしれませんが、クエリがどのように実行されるかを理解するための必須ツールです。

ドキュメントには、EXPLAIN文とは何か、およびクエリ実行の分析にどのように使用するかについての詳細な[ガイド](/guides/developer/understanding-query-execution-with-the-analyzer)が用意されています。このガイドの内容を繰り返すのではなく、クエリ実行パフォーマンスのボトルネックを見つけるのに役立ついくつかのコマンドに焦点を当てましょう。 

**EXPLAIN indexes = 1**

まず、EXPLAIN indexes = 1を使用してクエリプランを検査しましょう。クエリプランは、クエリがどのように実行されるかを示すツリー構造です。そこでは、クエリの句がどの順序で実行されるかを確認できます。EXPLAIN文によって返されるクエリプランは、下から上に読むことができます。

実行時間の長いクエリの最初のものを使用してみましょう。

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

出力はシンプルです。クエリはまず `nyc_taxi.trips_small_inferred` テーブルからデータを読み込みます。次に、WHERE 句が適用され、算出された値に基づいて行がフィルタリングされます。フィルタリングされたデータは集計のために準備され、分位数が計算されます。最後に、結果がソートされて出力されます。 

ここで注目すべき点は、プライマリキーが使用されていないことです。これは、テーブル作成時にプライマリキーを定義していなかったため、当然の結果です。そのため、このクエリでは ClickHouse はテーブル全体をフルスキャンしています。 

**Explain Pipeline**

`EXPLAIN PIPELINE` は、クエリに対する具体的な実行戦略を示します。ここでは、先ほど確認した汎用的なクエリプランが、ClickHouse によって実際にどのように実行されたかを確認できます。

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


ここでは、クエリの実行に使用されたスレッド数を確認できます。59 スレッドが使用されており、高い並列度で実行されていることを示しています。これにより、より小規模なマシンで実行した場合よりもクエリの実行が高速になります。同時に実行されるスレッド数が多いことが、クエリが大量のメモリを消費している理由になり得ます。

理想的には、すべての遅いクエリについて同じ手順で調査を行い、不要に複雑なクエリプランを特定するとともに、各クエリで読み取られる行数や消費されるリソースを把握することが望ましいです。



## 手法 {#methodology}

本番デプロイメント上で問題のあるクエリを特定するのは難しい場合があります。任意の時点で ClickHouse デプロイメント上では膨大な数のクエリが実行されている可能性が高いためです。 

問題が発生しているユーザー、データベース、あるいはテーブルが分かっている場合は、`system.query_logs` のフィールド `user`、`tables`、`databases` を使って検索対象を絞り込むことができます。 

最適化したいクエリを特定したら、そのクエリの最適化作業を開始できます。この段階で開発者がよく犯すミスは、複数の点を同時に変更してアドホックな実験を行い、その結果が入り混じってしまうことです。さらに重要なのは、どの変更がクエリを高速化したのかを正しく理解できなくなることです。 

クエリ最適化には体系立てた進め方が必要です。ここで言っているのは高度なベンチマークではなく、変更がクエリ性能にどう影響するかを把握するためのシンプルなプロセスを用意することです。これだけでも大きな効果があります。 

まずはクエリログから遅いクエリを特定し、その後に改善の可能性がある点を個別に調査します。クエリをテストする際には、必ずファイルシステムキャッシュを無効化してください。 

> ClickHouse は、さまざまな段階でクエリ性能を向上させるために [キャッシュ](/operations/caches) を活用します。これはクエリ性能にとって有益ですが、トラブルシューティングの際には、潜在的な I/O ボトルネックや不適切なテーブルスキーマを見えにくくしてしまう可能性があります。このため、テスト中はファイルシステムキャッシュをオフにすることをおすすめします。本番環境では必ず有効にしておいてください。

最適化の候補が特定できたら、それぞれが性能に与える影響をより正確に追跡できるよう、1つずつ順番に適用することを推奨します。以下に、この一般的なアプローチを示す図を挙げます。

<Image img={queryOptimizationDiagram1} size="lg" alt="最適化ワークフロー"/>

_最後に、外れ値には注意してください。ユーザーがアドホックで高コストなクエリを実行した場合や、別の理由でシステムに負荷がかかっていた場合など、クエリが遅く実行されることはよくあります。定期的に実行されている高コストなクエリを特定するには、フィールド normalized_query_hash でグルーピングすることができます。そうしたクエリこそ、優先的に調査すべき対象である可能性が高いです。_



## 基本的な最適化 {#basic-optimization}

テスト用のフレームワークが用意できたので、ここから最適化を始めていきます。

最初の着手ポイントとして最適なのは、データがどのように保存されているかを確認することです。どのデータベースにも言えることですが、読み取るデータ量が少ないほど、クエリの実行は速くなります。

データをどのように取り込んだかによっては、インジェストされたデータに基づいてテーブルスキーマを推論するために、ClickHouse の[機能](/interfaces/schema-inference)を利用しているかもしれません。これは使い始めるうえでは非常に便利ですが、クエリ性能を最適化したい場合は、ユースケースに最も適した形になるようテーブルスキーマを見直す必要があります。

### Nullable {#nullable}

[ベストプラクティスのドキュメント](/best-practices/select-data-types#avoid-nullable-columns)に記載されているとおり、可能な限り Nullable 列は避けてください。データのインジェスト機構を柔軟にできるため多用したくなりますが、そのたびに余分な列を処理する必要があるため、パフォーマンスに悪影響を与えます。

NULL 値を持つ行をカウントする SQL クエリを実行することで、実際に Nullable が必要なテーブル列を容易に特定できます。

```sql
-- NULL値を含まない列を検索
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

クエリID: 4a70fc5b-2501-41c8-813c-45ce241d85ae

行 1:
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

`null` 値を含む列は `mta_tax` と `payment_type` の 2 つだけです。その他のフィールドは `Nullable` 列にする必要はありません。

### 低カーディナリティ {#low-cardinality}

String 型に対して簡単に適用できる最適化として、LowCardinality データ型を有効活用する方法があります。低カーディナリティに関しては [ドキュメント](/sql-reference/data-types/lowcardinality) に記載されているとおり、ClickHouse は LowCardinality 型の列に辞書エンコーディングを適用し、クエリ性能を大きく向上させます。 

どの列が LowCardinality の良い候補かを判断する簡単な経験則として、一意な値が 10,000 未満の列はすべて理想的な候補とみなせます。

一意な値の数が少ない列を見つけるには、次の SQL クエリを使用できます。

```sql
-- 低カーディナリティ列の特定
SELECT
    uniq(ratecode_id),
    uniq(pickup_location_id),
    uniq(dropoff_location_id),
    uniq(vendor_id)
FROM trips_small_inferred
FORMAT VERTICAL

クエリ ID: d502c6a1-c9bc-4415-9d86-5de74dd6d932

行 1:
──────
uniq(ratecode_id):         6
uniq(pickup_location_id):  260
uniq(dropoff_location_id): 260
uniq(vendor_id):           3
```

カーディナリティが低い場合、これら 4 つのカラム `ratecode_id`、`pickup_location_id`、`dropoff_location_id`、`vendor_id` は、LowCardinality データ型の有力な候補となります。

### データ型の最適化 {#optimize-data-type}

ClickHouse は多数のデータ型をサポートしています。パフォーマンスを最適化し、ディスク上のデータ保存容量を削減するために、ユースケースに適合する範囲で可能な限り小さいデータ型を選択してください。 

数値については、データセット内の最小値と最大値を確認し、現在使用している型の精度（桁数やビット幅など）が、データセットの実際の値の範囲に見合っているかどうかを検証できます。


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

日付の精度は、データセットに合致し、実行する予定のクエリに最も適したものを選択してください。

### 最適化を適用する {#apply-the-optimizations}

最適化済みのスキーマを使用する新しいテーブルを作成し、データを再取り込みします。

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

新しいテーブルを使って再度クエリを実行し、改善があるか確認します。 

| Name    | Run 1 - Elapsed | Elapsed   | Rows processed | Peak memory |
| ------- | --------------- | --------- | -------------- | ----------- |
| Query 1 | 1.699 sec       | 1.353 sec | 329.04 million | 337.12 MiB  |
| Query 2 | 1.419 sec       | 1.171 sec | 329.04 million | 531.09 MiB  |
| Query 3 | 1.414 sec       | 1.188 sec | 329.04 million | 265.05 MiB  |

クエリ時間とメモリ使用量の両方に改善が見られます。データスキーマを最適化したことで、同じデータを表現するのに必要なデータ量を削減でき、その結果としてメモリ消費が改善され、処理時間も短縮されました。 

違いを確認するために、テーブルのサイズを比較してみましょう。

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

新しいテーブルは、以前のテーブルと比べてかなり小さくなっています。テーブル全体のディスク使用量は約 34% 削減されており、7.38 GiB から 4.89 GiB になっています。


## 主キーの重要性 {#the-importance-of-primary-keys}

ClickHouse における主キーは、多くの従来型データベースシステムとは異なる動作をします。従来のシステムでは、主キーは一意性とデータ整合性を保証します。重複した主キー値を挿入しようとすると拒否され、通常、高速な検索のために B-tree またはハッシュベースのインデックスが作成されます。 

ClickHouse では、主キーの[目的](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key)は異なり、一意性やデータ整合性を保証するものではありません。その代わりに、クエリパフォーマンスを最適化するよう設計されています。主キーは、データがディスク上に保存される順序を定義し、疎インデックスとして実装されており、各グラニュールの最初の行へのポインタを格納します。

> ClickHouse におけるグラニュールは、クエリ実行中に読み取られる最小単位のデータです。`index_granularity` によって決まる固定の行数（デフォルト値は 8192 行）までを含みます。グラニュールは連続して格納され、主キーでソートされます。 

適切な主キーのセットを選択することは性能面で重要であり、同じデータを異なるテーブルに保存し、異なる主キーのセットを使って特定のクエリ群を高速化することは、実際によく行われます。 

ClickHouse がサポートしている他のオプション（Projection やマテリアライズドビューなど）を使うことで、同じデータに対して異なる主キーのセットを利用することもできます。このブログシリーズの第 2 部では、この点についてさらに詳しく説明します。 

### 主キーを選択する {#choose-primary-keys}

正しい主キーのセットを選択することは複雑なテーマであり、最適な組み合わせを見つけるにはトレードオフや試行錯誤が必要になる場合があります。 

ここでは、次のようなシンプルな指針に従います。 

* ほとんどのクエリでフィルタに使われるフィールドを使用する
* カーディナリティ（種類数）の低いカラムを先に選択する 
* タイムスタンプデータセットでは時間でフィルタすることが一般的なため、主キーに時間ベースの要素を含めることを検討する 

今回の例では、次の主キーを使って実験します: `passenger_count`、`pickup_datetime`、`dropoff_datetime`。 

`passenger_count` のカーディナリティは小さく（24 個の一意な値）、遅いクエリでも使用されています。また、タイムスタンプフィールド（`pickup_datetime` と `dropoff_datetime`）も、頻繁にフィルタされる可能性があるため追加します。

主キーを指定した新しいテーブルを作成し、データを再度取り込みます。

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

次にクエリを再実行します。3 回の実験結果を集約し、経過時間、処理行数、メモリ消費量の改善状況を確認します。

<table>
  <thead>
    <tr>
      <th colspan="4">クエリ 1</th>
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
      <td>1.699 秒</td>
      <td>1.353 秒</td>
      <td>0.765 秒</td>
    </tr>

    <tr>
      <td>処理行数</td>
      <td>3.2904 億行</td>
      <td>3.2904 億行</td>
      <td>3.2904 億行</td>
    </tr>

    <tr>
      <td>ピークメモリ使用量</td>
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
      <td>1.419 秒</td>
      <td>1.171 秒</td>
      <td>0.248 秒</td>
    </tr>

    <tr>
      <td>処理行数</td>
      <td>329.04 百万行</td>
      <td>329.04 百万行</td>
      <td>41.46 百万行</td>
    </tr>

    <tr>
      <td>最大メモリ使用量</td>
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
      <td>1.414 秒</td>
      <td>1.188 秒</td>
      <td>0.431 秒</td>
    </tr>

    <tr>
      <td>処理行数</td>
      <td>329.04 百万行</td>
      <td>329.04 百万行</td>
      <td>276.99 百万行</td>
    </tr>

    <tr>
      <td>最大メモリ使用量</td>
      <td>451.53 MiB</td>
      <td>265.05 MiB</td>
      <td>197.38 MiB</td>
    </tr>
  </tbody>
</table>

実行時間と使用メモリの両方について、全体として大きな改善が見られます。

クエリ 2 はプライマリキーから最も大きな恩恵を受けています。生成されるクエリプランが以前とどのように異なるかを見てみましょう。

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

クエリID: 30116a77-ba86-4e9f-a9a2-a01670ad2e15

    ┌─explain──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 1. │ Expression ((射影 + ORDER BY前 [引き上げ部分]))                                                                    │
 2. │   Sorting (ORDER BYのソート)                                                                                      │
 3. │     Expression (ORDER BY前)                                                                                       │
 4. │       Aggregating                                                                                                │
 5. │         Expression (GROUP BY前)                                                                                   │
 6. │           Expression                                                                                             │
 7. │             ReadFromMergeTree (nyc_taxi.trips_small_pk)                                                          │
 8. │             インデックス:                                                                                          │
 9. │               PrimaryKey                                                                                         │
10. │                 キー:                                                                                             │
11. │                   pickup_datetime                                                                                │
12. │                 条件: and((pickup_datetime in (-Inf, 1238543999]), (pickup_datetime in [1230768000, +Inf)))      │
13. │                 パート: 9/9                                                                                        │
14. │                 グラニュール: 5061/40167                                                                            │
    └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

主キーにより、テーブル内のグラニュールの一部だけが選択されました。これだけでも ClickHouse が処理するデータ量が大幅に減るため、クエリのパフォーマンスは大きく向上します。


## 次のステップ {#next-steps}

このガイドを通じて、ClickHouse で遅いクエリを調査する方法と、それらを高速化する方法の理解に役立っていれば幸いです。このトピックをさらに深く学ぶには、ClickHouse が実際にどのようにクエリを実行しているかをよりよく理解するために、[query analyzer](/operations/analyzer) や [profiling](/operations/optimizing-performance/sampling-query-profiler) に関するドキュメントを参照してください。

ClickHouse 固有の挙動に慣れてきたら、クエリをさらに高速化するための高度なテクニックとして、[partitioning keys](/optimize/partitioning-key) や [data skipping indexes](/optimize/skipping-indexes) について読むことをお勧めします。
