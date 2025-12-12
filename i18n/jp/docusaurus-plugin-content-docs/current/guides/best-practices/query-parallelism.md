---
slug: /optimize/query-parallelism
sidebar_label: 'クエリの並列処理'
sidebar_position: 20
description: 'ClickHouse は処理レーンおよび max_threads 設定を利用してクエリの実行を並列化します。'
title: 'ClickHouse におけるクエリの並列実行の仕組み'
doc_type: 'guide'
keywords: ['並列処理', 'クエリ最適化', 'パフォーマンス', 'スレッド処理', 'ベストプラクティス']
---

import visual01 from '@site/static/images/guides/best-practices/query-parallelism_01.gif';
import visual02 from '@site/static/images/guides/best-practices/query-parallelism_02.gif';
import visual03 from '@site/static/images/guides/best-practices/query-parallelism_03.gif';
import visual04 from '@site/static/images/guides/best-practices/query-parallelism_04.gif';
import visual05 from '@site/static/images/guides/best-practices/query-parallelism_05.png';

import Image from '@theme/IdealImage';

# ClickHouse がクエリを並列実行する仕組み {#how-clickhouse-executes-a-query-in-parallel}

ClickHouse は [高速に動作するよう設計されています](/concepts/why-clickhouse-is-so-fast)。利用可能なすべての CPU コアを使用し、データを複数の処理レーンに分散させることで、高い並列性でクエリを実行し、多くの場合ハードウェアを限界近くまで活用します。
 
このガイドでは、ClickHouse におけるクエリ並列実行の仕組みと、大規模ワークロードのパフォーマンスを向上させるために、どのようにチューニングおよび監視できるかを説明します。

ここでは、主要な概念を説明するために [uk_price_paid_simple](/parts) データセットに対する集計クエリを使用します。

## ステップごとに見る: ClickHouse が集計クエリをどのように並列化するか {#step-by-step-how-clickHouse-parallelizes-an-aggregation-query}

ClickHouse がテーブルの主キーに対するフィルタ付きの集計クエリを実行する際には、まず主キーインデックスをメモリに読み込み、どのグラニュールを処理する必要があり、どのグラニュールを安全にスキップできるかを特定します。

<Image img={visual01} size="md" alt="インデックス解析"/>

### 処理レーン間での処理分散 {#distributing-work-across-processing-lanes}

選択されたデータは、その後 `n` 本の並列な[処理レーン](/academic_overview#4-2-multi-core-parallelization)に[動的に](#load-balancing-across-processing-lanes)分散されます。各レーンはデータを[ブロック](/development/architecture#block)単位でストリーミングしながら処理し、最終結果を生成します。

<Image img={visual02} size="md" alt="4 本の並列処理レーン"/>

<br/><br/>
`n` 本の並列処理レーンの数は、[max_threads](/operations/settings/settings#max_threads) 設定によって制御されます。デフォルトでは、サーバー上で ClickHouse が利用可能な CPU コア数と同じ値になります。上の例では、`4` コアを想定しています。

`8` コアを持つマシンであれば、より多くのレーンが並列にデータを処理できるため、クエリ処理スループットはおおよそ 2 倍になります（ただし、それに応じてメモリ使用量も増加します）。

<Image img={visual03} size="md" alt="8 本の並列処理レーン"/>

<br/><br/>
レーンへの分散を効率的に行うことは、CPU 利用率を最大化し、クエリ全体の処理時間を短縮するうえで重要です。

### シャード化されたテーブルでのクエリ処理 {#processing-queries-on-sharded-tables}

テーブルデータが複数サーバーに [シャード](/shards) として分散されている場合、それぞれのサーバーは自分のシャードを並列に処理します。各サーバー内では、前述のとおりローカルデータが並列処理レーンを用いて処理されます。

<Image img={visual04} size="md" alt="分散されたレーン"/>

<br/><br/>
クエリを最初に受信したサーバーは、各シャードからすべての部分結果を収集し、それらを結合して最終的なグローバル結果を生成します。

クエリ負荷をシャード間に分散することで、とくに高スループットな環境において、並列性を水平方向にスケールさせることができます。

:::note ClickHouse Cloud はシャードの代わりにパラレルレプリカを使用します
ClickHouse Cloud では、同様の並列性を [parallel replicas](https://clickhouse.com/docs/deployment-guides/parallel-replicas) によって実現します。これは shared-nothing クラスタにおけるシャードと同様に動作します。各 ClickHouse Cloud レプリカ（ステートレスなコンピュートノード）がデータの一部を並列に処理して最終結果に貢献し、あたかも独立したシャードのように動作します。
:::

## クエリの並列実行の監視 {#monitoring-query-parallelism}

これらのツールを使用して、クエリが利用可能な CPU リソースを十分に活用しているかを確認し、そうでない場合の原因を診断します。

ここでは 59 コアの CPU を搭載したテストサーバー上で実行しており、ClickHouse のクエリ並列実行機能を十分に発揮できる構成になっています。

サンプルクエリがどのように実行されているかを観察するために、集約クエリの実行中にトレースレベルのログエントリをすべて返すよう ClickHouse サーバーに指示します。このデモでは、クエリの述語を削除しています。述語を残したままだと 3 グラニュールしか処理されず、ClickHouse が複数の並列処理レーンを十分に活用するにはデータ量が不十分だからです。

```sql runnable=false
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
SETTINGS send_logs_level='trace';
```

```txt
① <Debug> ...: 3つの範囲から3609個のマークを読み取り
② <Trace> ...: マーク範囲をストリーム間に分散中
② <Debug> ...: 59個のストリームで約29564928行を読み取り中
```

We can see that

* ① ClickHouse needs to read 3,609 granules (indicated as marks in the trace logs) across 3 data ranges.
* ② With 59 CPU cores, it distributes this work across 59 parallel processing streams—one per lane.

Alternatively, we can use the [EXPLAIN](/sql-reference/statements/explain#explain-pipeline) clause to inspect the [physical operator plan](/academic_overview#4-2-multi-core-parallelization)—also known as the "query pipeline"—for the aggregation query:
```sql runnable=false
EXPLAIN PIPELINE
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple;
```

```txt
    ┌─explain───────────────────────────────────────────────────────────────────────────┐
 1. │ (Expression)                                                                      │
 2. │ ExpressionTransform × 59                                                          │
 3. │   (Aggregating)                                                                   │
 4. │   Resize 59 → 59                                                                  │
 5. │     AggregatingTransform × 59                                                     │
 6. │       StrictResize 59 → 59                                                        │
 7. │         (Expression)                                                              │
 8. │         ExpressionTransform × 59                                                  │
 9. │           (ReadFromMergeTree)                                                     │
10. │           MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread) × 59 0 → 1 │
    └───────────────────────────────────────────────────────────────────────────────────┘
```

Note: Read the operator plan above from bottom to top. Each line represents a stage in the physical execution plan, starting with reading data from storage at the bottom and ending with the final processing steps at the top. Operators marked with `× 59` are executed concurrently on non-overlapping data regions across 59 parallel processing lanes. This reflects the value of `max_threads` and illustrates how each stage of the query is parallelized across CPU cores.

ClickHouse's [embedded web UI](/interfaces/http) (available at the `/play` endpoint) can render the physical plan from above as a graphical visualization. In this example, we set `max_threads` to `4` to keep the visualization compact, showing just 4 parallel processing lanes:

<Image img={visual05} alt="Query pipeline"/>

Note: Read the visualization from left to right. Each row represents a parallel processing lane that streams data block by block, applying transformations such as filtering, aggregation, and final processing stages. In this example, you can see four parallel lanes corresponding to the `max_threads = 4` setting.

### Load balancing across processing lanes {#load-balancing-across-processing-lanes}

Note that the `Resize` operators in the physical plan above [repartition and redistribute](/academic_overview#4-2-multi-core-parallelization) data block streams across processing lanes to keep them evenly utilized. This rebalancing is especially important when data ranges vary in how many rows match the query predicates, otherwise, some lanes may become overloaded while others sit idle. By redistributing the work, faster lanes effectively help out slower ones, optimizing overall query runtime.

## Why max_threads isn't always respected {#why-max-threads-isnt-always-respected}

As mentioned above, the number of `n` parallel processing lanes is controlled by the `max_threads` setting, which by default matches the number of CPU cores available to ClickHouse on the server:
```sql runnable=false
SELECT getSetting('max_threads');
```

```txt
   ┌─getSetting('max_threads')─┐
1. │                        59 │
   └───────────────────────────┘
```

However, the `max_threads` value may be ignored depending on the amount of data selected for processing:
```sql runnable=false
EXPLAIN PIPELINE
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
WHERE town = 'LONDON';
```

```txt
...   
(ReadFromMergeTree)
MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread) × 30
```

As shown in the operator plan extract above, even though `max_threads` is set to `59`, ClickHouse uses only **30** concurrent streams to scan the data.

Now let's run the query:
```sql runnable=false
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
WHERE town = 'LONDON';
```

```txt
   ┌─max(price)─┐
1. │  594300000 │ -- 5億9430万
   └────────────┘
   
1行が返されました。経過時間: 0.013秒。処理行数: 231万行、13.66 MB (173.12百万行/秒、1.02 GB/秒)
ピークメモリ使用量: 27.24 MiB。   
```

As shown in the output above, the query processed 2.31 million rows and read 13.66MB of data. This is because, during the index analysis phase, ClickHouse selected **282 granules** for processing, each containing 8,192 rows, totaling approximately 2.31 million rows:

```sql runnable=false
EXPLAIN indexes = 1
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
WHERE town = 'LONDON';
```

```txt
    ┌─explain───────────────────────────────────────────────┐
 1. │ Expression ((Project names + Projection))             │
 2. │   Aggregating                                         │
 3. │     Expression (Before GROUP BY)                      │
 4. │       Expression                                      │
 5. │         ReadFromMergeTree (uk.uk_price_paid_simple)   │
 6. │         Indexes:                                      │
 7. │           PrimaryKey                                  │
 8. │             Keys:                                     │
 9. │               town                                    │
10. │             Condition: (town in ['LONDON', 'LONDON']) │
11. │             Parts: 3/3                                │
12. │             Granules: 282/3609                        │
    └───────────────────────────────────────────────────────┘  
```

Regardless of the configured `max_threads` value, ClickHouse only allocates additional parallel processing lanes when there's enough data to justify them. The "max" in `max_threads` refers to an upper limit, not a guaranteed number of threads used.

What "enough data" means is primarily determined by two settings, which define the minimum number of rows (163,840 by default) and the minimum number of bytes (2,097,152 by default) that each processing lane should handle:

For shared-nothing clusters:
* [merge_tree_min_rows_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read)
* [merge_tree_min_bytes_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read)

For clusters with shared storage (e.g. ClickHouse Cloud):
* [merge_tree_min_rows_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem)
* [merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem)

Additionally, there's a hard lower limit for read task size, controlled by:
* [Merge_tree_min_read_task_size](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_read_task_size) + [merge_tree_min_bytes_per_task_for_remote_reading](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_per_task_for_remote_reading)

:::warning Don't modify these settings
We don't recommend modifying these settings in production. They're shown here solely to illustrate why `max_threads` doesn't always determine the actual level of parallelism.
:::

For demonstration purposes, let's inspect the physical plan with these settings overridden to force maximum concurrency:
```sql runnable=false
EXPLAIN PIPELINE
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
WHERE town = 'LONDON'
SETTINGS
  max_threads = 59,
  merge_tree_min_read_task_size = 0,
  merge_tree_min_rows_for_concurrent_read_for_remote_filesystem = 0, 
  merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem = 0;
```

```txt
...   
(ReadFromMergeTree)
MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread) × 59
```

この結果、ClickHouse は 59 個の同時ストリームを使ってデータをスキャンし、設定された `max_threads` を厳密に守っています。

これは、小さなデータセットに対するクエリでは、ClickHouse が意図的に並行度を制限することを示しています。設定の上書きはテスト目的のみにとどめ、本番環境では使用しないでください。実行の非効率化やリソース競合を招くおそれがあります。

## 重要なポイント {#key-takeaways}

* ClickHouse は、`max_threads` に対応する処理レーンを使ってクエリを並列実行します。
* 実際のレーン数は、処理対象として選択されたデータ量に依存します。
* レーンの利用状況を分析するには、`EXPLAIN PIPELINE` とトレースログを使用します。

## さらなる情報の入手先  {#where-to-find-more-information}

ClickHouse がどのようにクエリを並列実行し、大規模環境で高いパフォーマンスを実現しているかをさらに深く理解したい場合は、次のリソースを参照してください。

* [Query Processing Layer – VLDB 2024 Paper (Web Edition)](/academic_overview#4-query-processing-layer) - スケジューリング、パイプライン処理、オペレーター設計を含む、ClickHouse の内部実行モデルの詳細な解説。

* [Partial aggregation states explained](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization) - 部分集約状態が処理レーン全体で効率的な並列実行をどのように可能にするかについての技術的な詳細解説。

* ClickHouse のすべてのクエリ処理ステップを詳細に解説する動画チュートリアル:
<iframe width="1024" height="576" src="https://www.youtube.com/embed/hP6G2Nlz_cA?si=Imd_i427J_kZOXHe" title="YouTube 動画プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
