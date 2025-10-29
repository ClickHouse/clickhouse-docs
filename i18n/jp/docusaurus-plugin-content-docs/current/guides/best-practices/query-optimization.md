---
'slug': '/optimize/query-optimization'
'sidebar_label': 'クエリ最適化'
'title': 'クエリ最適化のガイド'
'description': 'クエリパフォーマンスを改善するための一般的な方法を説明したシンプルなガイド'
'doc_type': 'guide'
---

import queryOptimizationDiagram1 from '@site/static/images/guides/best-practices/query_optimization_diagram_1.png';
import Image from '@theme/IdealImage';



# クエリ最適化のための簡単ガイド

このセクションでは、さまざまなパフォーマンスと最適化手法を使用する方法を、一般的なシナリオを通じて説明します。これには、ClickHouseのクエリパフォーマンスを向上させるために、[analyzer](/operations/analyzer)、[クエリプロファイリング](/operations/optimizing-performance/sampling-query-profiler)、または[nullableカラムを避ける](/optimize/avoid-nullable-columns)などが含まれます。

## クエリパフォーマンスを理解する {#understand-query-performance}

パフォーマンス最適化について考える最良のタイミングは、データをClickHouseに初めて取り込む前に、[データスキーマ](/data-modeling/schema-design)を設定しているときです。

しかし正直に言うと、データがどのくらい成長するか、どのタイプのクエリが実行されるかを予測するのは難しいです。

既存のデプロイメントで改善したいクエリがいくつかある場合、最初のステップはそれらのクエリのパフォーマンスを理解し、なぜいくつかのクエリが数ミリ秒で実行されるのに対し、他は長くかかるかを理解することです。

ClickHouseには、クエリの実行方法と実行に必要なリソースを理解するのに役立つ豊富なツールセットがあります。

このセクションでは、これらのツールとその使用方法を見ていきます。

## 一般的な考慮事項 {#general-considerations}

クエリパフォーマンスを理解するために、ClickHouseでクエリが実行されるときに何が起こるかを見てみましょう。

以下の部分は意図的に単純化されており、いくつかのショートカットを取っています。このアイデアは、詳細に溺れるのではなく、基本的な概念を理解するためのものです。詳細については、[クエリアナライザー](/operations/analyzer)について読むことができます。

非常に高レベルの観点から、ClickHouseがクエリを実行すると、次のことが起こります：

- **クエリの解析と分析**

クエリが解析され、一般的なクエリ実行計画が作成されます。

- **クエリの最適化**

クエリ実行計画が最適化され、不必要なデータが剪定され、クエリプランからクエリパイプラインが構築されます。

- **クエリパイプラインの実行**

データが並行して読み込まれ、処理されます。ここがClickHouseがフィルタリング、集約、ソートなどのクエリ操作を実行する段階です。

- **最終処理**

結果が統合され、ソートされ、クライアントに送信する前に最終結果にフォーマットされます。

実際には、さまざまな[最適化](/concepts/why-clickhouse-is-so-fast)が行われており、このガイドではそれらについてもう少し詳しく説明しますが、現時点では、これらの主要な概念がClickHouseがクエリを実行する際にバックグラウンドで何が起こっているかの良い理解を提供します。

この高レベルの理解を持って、ClickHouseが提供するツールと、それを使用してクエリパフォーマンスに影響を与えるメトリクスを追跡する方法を見ていきましょう。

## データセット {#dataset}

クエリパフォーマンスにアプローチする方法を示すために、実際の例を使用します。

NYCのタクシーデータを含むNYC Taxiデータセットを使用しましょう。まず、最適化なしでNYCタクシーデータセットを取り込みます。

以下は、テーブルを作成し、S3バケットからデータを挿入するためのコマンドです。スキーマはデータから推測され、最適化されていないことに注意してください。

```sql
-- Create table with inferred schema
CREATE TABLE trips_small_inferred
ORDER BY () EMPTY
AS SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/clickhouse-academy/nyc_taxi_2009-2010.parquet');

-- Insert data into table with inferred schema
INSERT INTO trips_small_inferred
SELECT *
FROM s3Cluster
('default','https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/clickhouse-academy/nyc_taxi_2009-2010.parquet');
```

データから自動的に推測されたテーブルスキーマを見てみましょう。

```sql
--- Display inferred table schema
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

デフォルトでは、ClickHouseは実行された各クエリに関する情報を[クエリログ](/operations/system-tables/query_log)に収集し記録します。このデータは`system.query_log`テーブルに保存されます。

実行された各クエリに対して、ClickHouseはクエリ実行時間、読み込まれた行数、CPU、メモリ使用量、またはファイルシステムキャッシュヒットなどのリソース使用情報をログします。

そのため、クエリログは遅いクエリを調査する際の出発点として良い場所です。実行に長時間かかるクエリを簡単に特定し、各クエリのリソース使用情報を表示できます。

NYCタクシーデータセットでの上位5つの長時間実行クエリを見つけてみましょう。

```sql
-- Find top 5 long running queries from nyc_taxi database in the last 1 hour
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

フィールド`query_duration_ms`は、その特定のクエリを実行するのにかかった時間を示します。クエリログからの結果を見ると、最初のクエリは2967msかかって実行されており、改善の余地があります。

また、メモリまたはCPUを最も消費するクエリを調べて、どのクエリがシステムに負担をかけているかを知りたいかもしれません。

```sql
-- Top queries by memory usage
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

見つけた長時間実行クエリを隔離し、応答時間を理解するために数回再実行してみましょう。

この時点で、再現性を高めるために、`enable_filesystem_cache`設定を0に設定してファイルシステムキャッシュをオフにすることが重要です。

```sql
-- Disable filesystem cache
set enable_filesystem_cache = 0;

-- Run query 1
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

-- Run query 2
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

-- Run query 3
SELECT
  avg(dateDiff('s', pickup_datetime, dropoff_datetime))
FROM nyc_taxi.trips_small_inferred
WHERE passenger_count = 1 or passenger_count = 2
FORMAT JSON

---
1 row in set. Elapsed: 1.414 sec. Processed 329.04 million rows, 8.88 GB (232.63 million rows/s., 6.28 GB/s.)
Peak memory usage: 451.53 MiB.
```

読みやすいようにテーブルで要約します。

| 名前      | 経過時間   | 処理された行数 | ピークメモリ |
| --------- | ---------- | --------------- | ------------ |
| クエリ1   | 1.699 秒   | 3.2904百万      | 440.24 MiB   |
| クエリ2   | 1.419 秒   | 3.2904百万      | 546.75 MiB   |
| クエリ3   | 1.414 秒   | 3.2904百万      | 451.53 MiB   |

クエリが何を達成しているのかをもう少し理解しましょう。

- クエリ1は、平均時速30マイル以上のライドにおける距離分布を計算します。
- クエリ2は、週ごとのライド数と平均コストを見つけます。
- クエリ3は、データセット内の各旅行の平均時間を計算します。

これらのクエリは非常に複雑な処理を行っていません。最初のクエリは、クエリが実行されるたびに旅行時間をその場で計算しています。しかし、これらのクエリはすべて、実行に1秒以上かかり、ClickHouseの世界では非常に長い時間です。また、これらのクエリのメモリ使用量はかなり多く、各クエリで約400MBです。さらに、各クエリは同じ数の行（329.04百万）を読み取っているようです。このテーブルにいくつの行があるかを確認してみましょう。

```sql
-- Count number of rows in table
SELECT count()
FROM nyc_taxi.trips_small_inferred

Query id: 733372c5-deaf-4719-94e3-261540933b23

   ┌───count()─┐
1. │ 329044175 │ -- 329.04 million
   └───────────┘
```

テーブルには329.04百万行があり、したがって各クエリはテーブルの完全スキャンを行っています。

### EXPLAINステートメント {#explain-statement}

長時間実行されているクエリがいくつかあるので、どのように実行されているかを理解しましょう。これには、ClickHouseが[EXPLAINステートメントコマンド](/sql-reference/statements/explain)をサポートしています。これは、実際にクエリを実行せずにすべてのクエリ実行段階の詳細なビューを提供する非常に便利なツールです。ClickHouseの専門家でない方には圧倒されるかもしれませんが、クエリがどのように実行されているかを理解するための重要なツールです。

ドキュメントでは、EXPLAINステートメントが何であるか、クエリ実行を分析するためにそれを使用する方法についての詳細な[ガイド](/guides/developer/understanding-query-execution-with-the-analyzer)を提供しています。このガイドの内容を繰り返すのではなく、クエリ実行パフォーマンスのボトルネックを見つけるのに役立ついくつかのコマンドに焦点を当てましょう。

**Explain indexes = 1**

まず、EXPLAIN indexes = 1を使用してクエリプランを検査します。クエリプランは、クエリがどのように実行されるかを示すツリーです。ここでは、クエリの句がどの順序で実行されるかを確認できます。EXPLAINステートメントが返すクエリプランは、下から上に読み取ることができます。

長時間実行されるクエリの最初のクエリを試してみましょう。

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

出力は明確です。クエリは`nyc_taxi.trips_small_inferred`テーブルからデータを読み込むところから始まります。その後、WHERE句が適用されて計算された値に基づいて行がフィルタリングされます。フィルタリングされたデータが集約のために準備され、分位数が計算されます。最後に、結果がソートされ出力されます。

ここで注意すべきは、プライマリキーが使用されていないことです。テーブルを作成する際に定義しなかったため、ClickHouseはクエリのためにテーブル全体のフルスキャンを行っています。

**Explain Pipeline**

EXPLAIN Pipelineは、クエリの具体的な実行戦略を示します。ここでは、ClickHouseが実際に以前に見た一般的なクエリプランをどのように実行したかを確認できます。

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

ここで注意すべきは、クエリを実行するために使用されるスレッドの数です：59スレッドであり、高い並列化を示します。これにより、クエリが小さなマシンで実行するよりも速くなります。並行して実行されるスレッドの数は、クエリが使用するメモリの量を説明できます。

理想的には、すべての遅いクエリをこのように調査して、不必要に複雑なクエリプランを特定し、各クエリが読み取った行数と消費されたリソースを理解する必要があります。

## 方法論 {#methodology}

本番デプロイで問題のあるクエリを特定するのは難しいことがあります。なぜなら、ClickHouseデプロイで同時に実行されているクエリの数が多い可能性があるからです。

どのユーザー、データベース、またはテーブルに問題があるかを知っている場合は、`system.query_logs`の`user`、`tables`、または`databases`フィールドを使用して検索を絞り込むことができます。

最適化したいクエリを特定したら、最適化を始めることができます。この段階で開発者が犯しがちな一般的な間違いは、同時に複数のことを変更したり、アドホックな実験を行ったりすることがあり、通常は混合結果に終わりますが、より重要なのは、クエリが速くなる要因を十分に理解できなくなることです。

クエリの最適化には構造が必要です。これは高度なベンチマーキングのことを言っているのではなく、変更がクエリパフォーマンスにどのように影響するかを理解するためのシンプルなプロセスを整備しておくことが重要です。

最初に、クエリログから遅いクエリを特定し、その後に個別に潜在的な改善点を調査します。クエリをテストする際は、ファイルシステムキャッシュを無効にすることを忘れないでください。

> ClickHouseは、[キャッシング](/operations/caches)を活用して、さまざまな段階でクエリ性能を高速化します。これはクエリ性能にとって良いことですが、トラブルシューティング中に潜在的なI/Oボトルネックや不適切なテーブルスキーマを隠す可能性があります。そのため、テスト中はファイルシステムキャッシュをオフにすることをお勧めします。プロダクション環境では有効にしておいてください。

潜在的な最適化を特定したら、それを1つずつ実装して、パフォーマンスへの影響をよりよく追跡することをお勧めします。以下は一般的なアプローチを説明した図です。

<Image img={queryOptimizationDiagram1} size="lg" alt="Optimization workflow"/>

最終的に、外れ値に注意してください。ユーザーがアドホックな高コストクエリを試したり、別の理由でシステムがストレス下にあったりするために、クエリが遅くなるのはかなり一般的です。フィールドnormalized_query_hashでグループ化することで、定期的に実行される高コストのクエリを特定できます。これらは調査すべきクエリの可能性があります。

## 基本的最適化 {#basic-optimization}

フレームワークを整えたので、最適化を始めましょう。

最初に見るべきは、データがどのように保存されているかです。すべてのデータベース同様、読み込むデータが少ないほど、クエリの実行は速くなります。

データを取り込む方法に応じて、ClickHouseの[能力](/interfaces/schema-inference)を活用して、取り込んだデータに基づいてテーブルスキーマを推測したかもしれません。これは開始するためには非常に実用的ですが、クエリパフォーマンスを最適化したい場合は、データスキーマを見直し、使用ケースに最適な形にする必要があります。

### Nullable {#nullable}

[ベストプラクティスドキュメント](/best-practices/select-data-types#avoid-nullable-columns)で説明されているように、可能な限りnullableカラムを避けてください。これらはデータ取り込みメカニズムをより柔軟にするために頻繁に使用されることがありますが、毎回追加のカラムを処理する必要があるため、パフォーマンスに悪影響を及ぼします。

NULL値を持つ行をカウントするSQLクエリを実行することで、実際にNullable値が必要なテーブル内のカラムを簡単に明らかにできます。

```sql
-- Find non-null values columns
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

NULL値を持つカラムは`mta_tax`と`payment_type`の2つだけです。他のフィールドは`Nullable`カラムを使用するべきではありません。

### 低いカーディナリティ {#low-cardinality}

文字列に適用できる簡単な最適化は、LowCardinalityデータ型を最大限に活用することです。低カーディナリティに関する[ドキュメント](/sql-reference/data-types/lowcardinality)に説明されているように、ClickHouseはLowCardinalityカラムに辞書コーディングを適用し、クエリパフォーマンスを大幅に向上させます。

LowCardinalityの良好な候補を見つけるための簡単なルールは、ユニークな値が10,000未満のカラムは理想的な候補です。

以下のSQLクエリを使用して、ユニークな値が少ないカラムを見つけることができます。

```sql
-- Identify low cardinality columns
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

低いカーディナリティを持つこれらの4つのカラム、`ratecode_id`、`pickup_location_id`、`dropoff_location_id`、`vendor_id`は、LowCardinalityフィールドタイプの良好な候補です。

### データ型の最適化 {#optimize-data-type}

ClickHouseは多くのデータ型をサポートしています。パフォーマンスを最適化し、ディスク上のデータストレージスペースを削減するために、使用ケースにフィットする最小限のデータ型を選択するようにしてください。

数字については、データセット内のmin/max値を確認して、現在の精度値がデータセットの実際に一致しているかをチェックできます。

```sql
-- Find min/max values for the payment_type field
SELECT
    min(payment_type),max(payment_type),
    min(passenger_count), max(passenger_count)
FROM trips_small_inferred

Query id: 4306a8e1-2a9c-4b06-97b4-4d902d2233eb

   ┌─min(payment_type)─┬─max(payment_type)─┐
1. │                 1 │                 4 │
   └───────────────────┴───────────────────┘
```

日付については、データセットに一致し、実行予定のクエリに最適な精度を選択する必要があります。

### 最適化を適用する {#apply-the-optimizations}

最適化されたスキーマを使用するための新しいテーブルを作成し、データを再取り込みましょう。

```sql
-- Create table with optimized data
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

-- Insert the data
INSERT INTO trips_small_no_pk SELECT * FROM trips_small_inferred
```

新しいテーブルを使用して、改善があるかどうかを確認するために再度クエリを実行します。

| 名前      | 実行1 - 経過時間 | 経過時間   | 処理された行数 | ピークメモリ |
| --------- | ----------------- | ---------- | --------------- | ------------ |
| クエリ1   | 1.699 秒          | 1.353 秒   | 3.2904百万      | 337.12 MiB   |
| クエリ2   | 1.419 秒          | 1.171 秒   | 3.2904百万      | 531.09 MiB   |
| クエリ3   | 1.414 秒          | 1.188 秒   | 3.2904百万      | 265.05 MiB   |

クエリ時間とメモリ使用量が改善されたことに気付きます。データスキーマの最適化のおかげで、データを表すための総データ量が減少し、メモリ消費が改善され、処理時間が短縮されました。

テーブルのサイズを確認して、その違いを見てみましょう。

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

新しいテーブルは、以前のものよりかなり小さくなっています。テーブルのディスクスペースが約34%削減されたことが分かります（7.38 GiB対4.89 GiB）。

## 主キーの重要性 {#the-importance-of-primary-keys}

ClickHouseの主キーは、ほとんどの従来のデータベースシステムとは異なります。これらのシステムでは、主キーは一意性とデータの整合性を強制します。重複した主キー値を挿入しようとすると拒否され、通常は迅速なルックアップのためにBツリーまたはハッシュベースのインデックスが作成されます。

ClickHouseにおける主キーの[目的](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key)は異なります；それは一意性を強制するものでも、データの整合性を助けるものでもありません。その代わり、クエリ性能を最適化するために設計されています。主キーは、データがディスク上に保存される順序を定義し、各グラニュールの最初の行へのポインタを格納するスパースインデックスとして実装されます。

> ClickHouseにおけるグラニュールは、クエリ実行中に読み込まれる最小単位のデータです。これらは、index_granularityで決定される固定値の行数（デフォルト値は8192行）を含んでいます。グラニュールは連続して保存され、主キーでソートされます。

良い主キーセットを選択することはパフォーマンスにとって重要で、特定のクエリセットを高速化するために、同じデータを異なるテーブルに保存し、異なる主キーセットを使用することが一般的です。

ClickHouseがサポートする他のオプションとしては、ProjectionやMaterialized Viewがあり、同じデータに対して異なる主キーセットを使用できます。このブログシリーズの第二部では、これについて詳しく説明します。

### 主キーを選択する {#choose-primary-keys}

適切な主キーセットを選択することは複雑なトピックであり、最適な組み合わせを見つけるためにはトレードオフや実験が必要な場合があります。

今のところ、以下のシンプルなプラクティスに従うことにします：

-   大多数のクエリでフィルタリングに使用されるフィールドを使用する
-   まずカーディナリティの低いカラムを選択する
-   時間ベースのコンポーネントを主キーに含めることを考慮する。これは、タイムスタンプデータセットで時間でフィルタリングするのが一般的だからです。

我々のケースでは、`passenger_count`、`pickup_datetime`、`dropoff_datetime`という主キーで実験を行います。

passenger_countのカーディナリティは小さい（ユニークな値が24）で、遅いクエリで使用されています。また、頻繁にフィルタリングできるため、タイムスタンプフィールド（`pickup_datetime`、`dropoff_datetime`）も追加します。

主キーを持つ新しいテーブルを作成し、データを再取り込みます。

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

-- Insert the data
INSERT INTO trips_small_pk SELECT * FROM trips_small_inferred
```

その後、クエリを再実行します。経過時間、処理された行数、メモリ消費の改善を見るために、3つの実験の結果をまとめます。

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
      <td>1.699秒</td>
      <td>1.353秒</td>
      <td>0.765秒</td>
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
      <td>1.419秒</td>
      <td>1.171秒</td>
      <td>0.248秒</td>
    </tr>
    <tr>
      <td>処理された行数</td>
      <td>329.04百万</td>
      <td>329.04百万</td>
      <td>41.46百万</td>
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
      <th colspan="4">クエリ3</th>
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
      <td>1.414秒</td>
      <td>1.188秒</td>
      <td>0.431秒</td>
    </tr>
    <tr>
      <td>処理された行数</td>
      <td>329.04百万</td>
      <td>329.04百万</td>
      <td>276.99百万</td>
    </tr>
    <tr>
      <td>ピークメモリ</td>
      <td>451.53 MiB</td>
      <td>265.05 MiB</td>
      <td>197.38 MiB</td>
    </tr>
  </tbody>
</table>

実行時間と使用メモリ全体で大幅な改善が見られます。

クエリ2は特に主キーからの利益を受けています。このクエリプランが以前とどのように異なるか見てみましょう。

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

主キーのおかげで、テーブルグラニュールのサブセットのみが選択されています。これによりClickHouseは処理するデータが大幅に減るため、クエリパフォーマンスが大いに改善されます。

## 次のステップ {#next-steps}

このガイドが、ClickHouseで遅いクエリを調査し、それをより速くする方法を理解する手助けとなれば幸いです。このトピックについてさらに探索したい場合は、[クエリアナライザー](/operations/analyzer)や[プロファイリング](/operations/optimizing-performance/sampling-query-profiler)についてさらに読むことで、ClickHouseがどのようにクエリを実行しているかをよりよく理解できます。

ClickHouseの特性に慣れてきたら、[パーティショニングキー](/optimize/partitioning-key)や[データスキッピングインデックス](/optimize/skipping-indexes)について読むことをお勧めします。これにより、クエリを加速するために使用できるより高度なテクニックについて学ぶことができます。
