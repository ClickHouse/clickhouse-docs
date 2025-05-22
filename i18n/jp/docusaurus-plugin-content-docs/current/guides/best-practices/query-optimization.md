---
'slug': '/optimize/query-optimization'
'sidebar_label': 'クエリ最適化'
'title': 'クエリ最適化ガイド'
'description': 'クエリパフォーマンスを向上させるための一般的な方法を説明したシンプルな最適化ガイド'
---

import queryOptimizationDiagram1 from '@site/static/images/guides/best-practices/query_optimization_diagram_1.png';
import Image from '@theme/IdealImage';

# クエリ最適化のためのシンプルなガイド

このセクションでは、[analyzer](/operations/analyzer)、[クエリプロファイリング](/operations/optimizing-performance/sampling-query-profiler)、または[Nullableカラムを避ける](/optimize/avoid-nullable-columns)などの異なるパフォーマンスおよび最適化技術を使用する方法を、一般的なシナリオを通じて説明し、ClickHouseのクエリパフォーマンスを改善します。
## クエリパフォーマンスの理解 {#understand-query-performance}

パフォーマンス最適化を考える最適なタイミングは、データをClickHouseに初めて取り込む前に[データスキーマ](/data-modeling/schema-design)をセットアップしているときです。

しかし、正直に言うと、データの成長量や実行されるクエリの種類を予測するのは難しいです。

既存のデプロイメントがあり、パフォーマンスを向上させたいクエリがいくつかある場合、最初のステップは、それらのクエリがどのように実行されているか、なぜ一部が数ミリ秒で実行され、他のものは時間がかかるのかを理解することです。

ClickHouseには、クエリがどのように実行され、実行するためにどのリソースが消費されるかを理解するのに役立つ豊富なツールセットがあります。

このセクションでは、それらのツールとその使用方法を見ていきます。
## 一般的な考慮事項 {#general-considerations}

クエリパフォーマンスを理解するために、クエリがClickHouseで実行されるときに何が起こるかを見てみましょう。

以下の部分は意図的に簡略化されており、いくつかの省略を行っています。ここでのアイデアは、詳細を詰め込みすぎず、基本的なコンセプトを速やかに把握できるようにすることです。詳細については、[クエリアナライザー](/operations/analyzer)について読んでください。

非常に高いレベルの視点から、ClickHouseがクエリを実行すると、以下のことが起こります：

  - **クエリの解析と分析**

クエリは解析され、分析され、一般的なクエリ実行計画が作成されます。

  - **クエリの最適化**

クエリ実行計画は最適化され、不必要なデータは剪定され、クエリ計画からクエリパイプラインが構築されます。

  - **クエリパイプラインの実行**

データは並行して読み取られ、処理されます。この段階では、ClickHouseがフィルタリング、集計、並べ替えなどのクエリ操作を実行します。

  - **最終処理**

結果はマージされ、並べ替えられ、クライアントに送信される前に最終結果にフォーマットされます。

実際には、多くの[最適化](/concepts/why-clickhouse-is-so-fast)が行われており、このガイドではそれらについてもう少し詳しく説明しますが、今のところ、これらの主要な概念は、ClickHouseがクエリを実行する際に何が裏で起こっているかを理解するのに役立ちます。

この高レベルの理解をもとに、ClickHouseが提供するツールとそれを使用してクエリパフォーマンスに影響を与えるメトリックを追跡する方法を検討してみましょう。
## データセット {#dataset}

クエリパフォーマンスにアプローチする方法を示すために、実際の例を使用します。

NYCのタクシーのデータセットを使用します。このデータセットには、NYCのタクシーの乗車データが含まれています。最初に、最適化なしでNYCタクシーデータセットを取り込みます。

以下は、テーブルを作成し、S3バケットからデータを挿入するためのコマンドです。データからスキーマを自動的に推測することに注意してください。これは最適化されていません。

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
## 遅いクエリを見つける {#spot-the-slow-queries}
### クエリログ {#query-logs}

デフォルトでは、ClickHouseは実行されたクエリに関する情報を[クエリログ](/operations/system-tables/query_log)に収集し、記録します。このデータはテーブル`system.query_log`に保存されます。

実行された各クエリについて、ClickHouseはクエリ実行時間、読み取った行数、CPUやメモリ使用量、ファイルシステムキャッシュヒットなどのリソース使用量などの統計を記録します。

したがって、クエリログは遅いクエリを調査する際の良い出発点です。実行に時間がかかるクエリを簡単に見つけ、それぞれに対するリソース使用情報を表示できます。

NYCタクシーデータセットで、上位5つの長時間実行されるクエリを見つけてみましょう。

```sql
-- 過去1時間のnyc_taxiデータベースから上位5つの長時間実行されるクエリを見つける
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

`query_duration_ms`フィールドは、その特定のクエリの実行にかかった時間を示します。クエリログの結果を見ると、最初のクエリが2967msの実行時間を要していることが分かります。これは改善可能です。

また、メモリやCPUを最も消費しているクエリを調べることで、システムに負荷をかけているクエリも知りたいかもしれません。

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

見つかった長時間実行されるクエリを隔離し、応答時間を理解するために数回再実行してみましょう。

この時点で、再現性を向上させるために、`enable_filesystem_cache`設定を0に設定してファイルシステムキャッシュをオフにすることが重要です。

```sql
-- ファイルシステムキャッシュを無効にする
set enable_filesystem_cache = 0;

-- クエリ 1を実行
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
1行の結果。経過時間: 1.699秒。329.04百万行、8.88 GBを処理、(193.72百万行/秒、5.23 GB/秒)
ピークメモリ使用量: 440.24 MiB。

-- クエリ 2を実行
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
4行の結果。経過時間: 1.419秒。329.04百万行、5.72 GBを処理、(231.86百万行/秒、4.03 GB/秒)
ピークメモリ使用量: 546.75 MiB。

-- クエリ 3を実行
SELECT
  avg(dateDiff('s', pickup_datetime, dropoff_datetime))
FROM nyc_taxi.trips_small_inferred
WHERE passenger_count = 1 or passenger_count = 2
FORMAT JSON

---
1行の結果。経過時間: 1.414秒。329.04百万行、8.88 GBを処理、(232.63百万行/秒、6.28 GB/秒)
ピークメモリ使用量: 451.53 MiB。
```

分かりやすくテーブルにまとめましょう。

| 名前     | 経過時間  | 処理された行数 | ピークメモリ |
| -------- | ---------- | -------------- | ------------ |
| クエリ1  | 1.699 秒   | 329.04百万行   | 440.24 MiB   |
| クエリ2  | 1.419 秒   | 329.04百万行   | 546.75 MiB   |
| クエリ3  | 1.414 秒   | 329.04百万行   | 451.53 MiB   |

それぞれのクエリの達成する目的をもう少し理解しましょう。

-   クエリ1は、平均速度が30マイルを超える乗車の距離分布を計算します。
-   クエリ2は、週ごとの乗車数と平均コストを見つけます。
-   クエリ3は、データセット内の各乗車の平均時間を計算します。

これらのクエリのいずれも非常に複雑な処理を行っているわけではなく、特に最初のクエリは、クエリが実行されるたびにトリップタイムをその場で計算しています。しかし、これらのクエリはいずれも実行に1秒以上かかっており、ClickHouseの世界では非常に長い時間です。また、これらのクエリのメモリ使用量には、各クエリで約400MBが消費されています。また、各クエリは同じ数の行（329.04百万行）を読み込んでいるようです。このテーブルに何行あるかをすぐに確認してみましょう。

```sql
-- テーブル内の行数を数える
SELECT count()
FROM nyc_taxi.trips_small_inferred

Query id: 733372c5-deaf-4719-94e3-261540933b23

   ┌───count()─┐
1. │ 329044175 │ -- 329.04百万行
   └───────────┘
```

テーブルには329.04百万行が含まれているため、各クエリはテーブルのフルスキャンを行っています。
### EXPLAIN文 {#explain-statement}

長時間実行されるクエリをいくつか持ったので、これらがどのように実行されているのかを理解しましょう。そのために、ClickHouseは[EXPLAIN文コマンド](/sql-reference/statements/explain)をサポートしています。これは、実際にクエリを実行せずに、すべてのクエリ実行段階の詳細なビューを提供する非常に便利なツールです。ClickHouseのエキスパートでない場合には圧倒されるかもしれませんが、クエリがどのように実行されるかを理解するための重要なツールです。

文書では、EXPLAIN文が何であるか、そしてクエリ実行を分析するためにどのように使用するかに関する詳細な[ガイド](/guides/developer/understanding-query-execution-with-the-analyzer)を提供しています。このガイドの内容を繰り返すのではなく、クエリ実行パフォーマンスのボトルネックを見つけるのに役立ついくつかのコマンドに焦点を当ててみましょう。

**EXPLAIN indexes = 1**

まず、EXPLAIN indexes = 1を使用してクエリプランを検査します。クエリプランは、クエリがどのように実行されるかを示すツリーです。ここには、クエリの句がどの順序で実行されるかが表示されます。EXPLAIN文によって返されたクエリプランは、下から上に読み取ることができます。

最初の長時間実行されるクエリを使ってみましょう。

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

出力はわかりやすいです。クエリは`nyc_taxi.trips_small_inferred`テーブルからデータを読み取ることから始まります。次に、WHERE句が適用されて、計算された値に基づいて行がフィルタリングされます。フィルタリングされたデータは集約のために準備され、分位数が計算されます。最終的に、結果は並べ替えられ、出力されます。

ここでは、プライマリーキーが使用されていないことに注目できます。これは、テーブルを作成した際にプライマリーキーを定義しなかったためです。その結果、ClickHouseはクエリのためにテーブル全体をスキャンしています。

**EXPLAIN PIPELINE**

EXPLAIN PIPELINEは、クエリの具体的な実行戦略を示します。ここでは、以前に見た一般的なクエリプランがClickHouseによって実際にどのように実行されたかを見ることができます。

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

ここでは、クエリを実行するために使用されるスレッドの数に注目できます: 59スレッド。これは高い並列化を示しており、クエリを実行するのに、より小さなマシンでは時間がかかるでしょう。並行して実行されるスレッドの数が多いことは、このクエリが使用するメモリの多さを説明するかもしれません。

理想的には、すべての遅いクエリを同じように調査し、不必要に複雑なクエリプランを特定し、各クエリによって読み取られる行の数と消費されるリソースを理解する必要があります。
## 方法論 {#methodology}

本番デプロイメント上で問題のあるクエリを特定することは困難です。なぜなら、その時点でClickHouseデプロイメント上で実行されているクエリの数が多いためです。

どのユーザー、データベース、またはテーブルに問題があるかを知っていれば、`system.query_logs`の`user`、`tables`、または`databases`フィールドを使用して検索を絞り込むことができます。

最適化したいクエリを特定したら、それに対して最適化作業を開始できます。この段階で開発者がよく犯す一般的な間違いは、同時に複数のことを変更し、アドホックな実験を行うことです。通常、混合結果に終わり、より重要なこととしてクエリがなぜ速くなったのかの良い理解を欠いてしまいます。

クエリ最適化には構造が必要です。高度なベンチマークのことを言っているのではなく、変更がクエリパフォーマンスにどのように影響するかを理解するための単純なプロセスを持つことが重要です。

まず、クエリログから遅いクエリを特定し、その後、孤立した状態で改善の可能性を調査します。クエリをテストするときは、ファイルシステムキャッシュを無効にすることを忘れないでください。

> ClickHouseは、[キャッシング](/operations/caches)を活用して、クエリパフォーマンスをさまざまな段階で向上させます。これはクエリのパフォーマンスには良いですが、トラブルシューティング中には、潜在的なI/Oボトルネックや不良なテーブルスキーマを隠蔽する可能性があります。そのため、テスト中はファイルシステムキャッシュをオフにすることをお勧めします。プロダクション環境では有効にしてください。

潜在的な最適化を特定したら、それを一つずつ実装して、パフォーマンスに与える影響をより良く追跡することをお勧めします。以下は、一般的なアプローチを説明するダイアグラムです。

<Image img={queryOptimizationDiagram1} size="lg" alt="Optimization workflow"/>

_最後に、外れ値に注意してください; ユーザーがアドホックな高コストのクエリを試したり、システムが別の理由でストレスを受けている場合、クエリが遅くなることは非常に一般的です。フィールドnormalized_query_hashでグループ化して、定期的に実行されている高コストのクエリを特定できます。それらはおそらく、調査したいものです。_
## 基本的な最適化 {#basic-optimization}

フレームワークをテストする準備ができたので、最適化を始めましょう。

最適化の最初のステップは、データがどのように保存されているかを確認することです。どのデータベースでも同じですが、読み取るデータが少ないほど、クエリが早く実行されます。

データをどのように取り込んだかによって、ClickHouseの[機能](/interfaces/schema-inference)を利用して、取り込まれたデータに基づいてテーブルスキーマを推測しているかもしれません。これは始めるには非常に便利ですが、クエリパフォーマンスを最適化したい場合は、データスキーマを再評価して、ユースケースに最適になるよう調整する必要があります。
### Nullable {#nullable}

[ベストプラクティス文書](/best-practices/select-data-types#avoid-nullable-columns)で説明されているように、可能な限りNullableカラムは避けるべきです。これらはしばしば使いたくなりますが、データ取り込みメカニズムをより柔軟にする反面、追加のカラムが毎回処理されるため、パフォーマンスに悪影響を与えます。

NULL値を持つ行を数えるSQLクエリを実行すれば、実際にNullable値が必要なカラムを簡単に明らかにすることができます。

```sql
-- NULLでない値のカラムを見つける
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

NULL値を持つカラムは`mta_tax`と`payment_type`の2つだけです。残りのフィールドは`Nullable`カラムを使用すべきではありません。
### 低いカーディナリティ {#low-cardinality}

文字列に対する簡単な最適化は、LowCardinalityデータ型を最大限に活用することです。LowCardinalityに関する[文書](/sql-reference/data-types/lowcardinality)で説明されているように、ClickHouseはLowCardinalityカラムに辞書コーディングを適用し、クエリパフォーマンスを大幅に向上させます。

LowCardinalityに適したカラムを判断する簡単なルールは、ユニークな値が10,000未満のカラムは理想的な候補です。

以下のSQLクエリを使用して、ユニークな値が少ないカラムを見つけることができます。

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

低いカーディナリティを持つこれらの4つのカラム、`ratecode_id`、`pickup_location_id`、`dropoff_location_id`、および`vendor_id`は、LowCardinalityフィールドタイプの良い候補です。
### データ型の最適化 {#optimize-data-type}

ClickHouseは、多くのデータ型をサポートしています。ユースケースに適合する、できるだけ小さなデータ型を選択してパフォーマンスを最適化し、ディスク上のデータストレージスペースを削減してください。

数値の場合は、データセット内の最小/最大値を確認して、現在の精度がデータセットの実際の値に合っているかを確認することができます。

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

日付の場合は、データセットにマッチする精度を選択し、実行予定のクエリに最適なものを選びましょう。
### 最適化を適用 {#apply-the-optimizations}

最適化されたスキーマを使用するために新しいテーブルを作成し、データを再取り込みましょう。

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

新しいテーブルを使用してクエリを再実行して、改善されたかどうかを確認します。

| 名前     | 初回実行 - 経過時間 | 経過時間  | 処理された行数 | ピークメモリ |
| -------- | ------------------- | ---------- | -------------- | ------------ |
| クエリ1  | 1.699 秒            | 1.353 秒   | 329.04百万行   | 337.12 MiB   |
| クエリ2  | 1.419 秒            | 1.171 秒   | 329.04百万行   | 531.09 MiB   |
| クエリ3  | 1.414 秒            | 1.188 秒   | 329.04百万行   | 265.05 MiB   |

クエリ処理時間とメモリ使用量の改善が見られます。データスキーマの最適化により、データの全体量が減少し、メモリ消費が改善され、処理時間が短縮されました。

テーブルのサイズを確認してみましょう。違いがあるか見てみます。

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

新しいテーブルは以前のものよりかなり小さくなっています。テーブルのディスクスペースが約34％削減（7.38 GiB対4.89 GiB）されていることが分かります。
## プライマリーキーの重要性 {#the-importance-of-primary-keys}

ClickHouseにおけるプライマリーキーは、ほとんどの従来のデータベースシステムとは異なる動作をします。これらのシステムでは、プライマリーキーは一意性とデータの整合性を強制します。重複するプライマリーキー値を挿入しようとすれば、拒否され、通常は高速検索のためにBツリーまたはハッシュベースのインデックスが作成されます。

ClickHouseでは、プライマリーキーの[目的](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key)が異なり、一意性を強制したり、データの整合性を助けるものではありません。代わりに、クエリパフォーマンスを最適化することを目的としています。プライマリーキーは、ディスク上のデータが保存される順序を定義し、各グラニュールの最初の行へのポインタを保存するスパースインデックスとして実装されます。

> ClickHouseのグラニュールは、クエリ実行中に読み取られる最小のデータ単位です。これらは最大で固定数の行を含み、index_granularityによって決定され、デフォルト値は8192行です。グラニュールは連続的に保存され、プライマリキーによってソートされます。

良いプライマリーキーのセットを選択することはパフォーマンスに重要であり、特定のクエリセットを加速するために、異なるテーブルに同じデータを保存し、異なるプライマリーキーを使用することは一般的です。

他にも、ClickHouseがサポートするオプション、プロジェクションやマテリアライズドビューなどは、同じデータに異なるプライマリーキーのセットを使用することを可能にします。このブログシリーズの後半では、これをさらに詳しく説明します。
```
### Choose primary keys {#choose-primary-keys}

正しい主キーのセットを選択することは複雑なテーマであり、最適な組み合わせを見つけるためにはトレードオフや実験が必要になることがあります。 

今のところ、以下のシンプルなプラクティスに従うことにします: 

-   ほとんどのクエリでフィルタリングに使用されるフィールドを使用する
-   まず低いカーディナリティのカラムを選択する 
-   主キーに時間ベースのコンポーネントを考慮する。タイムスタンプデータセットの時間によるフィルタリングは非常に一般的です。 

私たちの場合、以下の主キーで実験を行います: `passenger_count`, `pickup_datetime`, `dropoff_datetime`。 

`passenger_count`のカーディナリティは少なく（24のユニークな値）、遅いクエリで使用されます。また、フィルタリングされることが多いタイムスタンプフィールド（`pickup_datetime`および`dropoff_datetime`）を追加します。

主キーを持つ新しいテーブルを作成し、データを再インジェストします。

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

その後、クエリを再実行します。3つの実験からの結果をまとめて、経過時間、処理された行数、およびメモリ使用量の改善を確認します。 

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
      <td>処理された行数</td>
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
      <td>処理された行数</td>
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
      <td>処理された行数</td>
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

実行時間と使用メモリの両方で大きな改善が見られます。 

クエリ 2 は主キーの恩恵を最も受けています。クエリプランが以前とどう異なるか見てみましょう。

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

主キーのおかげで、テーブルのグラニュールのサブセットのみが選択されています。これにより、ClickHouseが処理しなければならないデータ量が著しく減少し、クエリ性能が大幅に向上します。
## Next steps {#next-steps}

このガイドが、ClickHouseを使用して遅いクエリを調査し、それらをより高速にする方法についての良い理解を得る助けになることを願っています。このトピックについてさらに探求するには、[クエリアナライザー](/operations/analyzer)や[プロファイリング](/operations/optimizing-performance/sampling-query-profiler)について読み、ClickHouseがいかにしてクエリを実行しているかをより深く理解してください。

ClickHouse特有の機能に慣れてきたら、[パーティショニングキー](/optimize/partitioning-key)や[データスキッピングインデックス](/optimize/skipping-indexes)についても読んで、クエリを加速するために使用できるより高度なテクニックについて学ぶことをお勧めします。
