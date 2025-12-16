---
slug: /optimize/query-parallelism
sidebar_label: 'クエリの並列処理'
sidebar_position: 20
description: 'ClickHouseは処理レーンとmax_threads設定を使用してクエリ実行を並列化します。'
title: 'ClickHouseがクエリを並列実行する方法'
doc_type: 'guide'
keywords: ['並列処理', 'クエリ最適化', 'パフォーマンス', 'スレッディング', 'ベストプラクティス']
---

import visual01 from '@site/static/images/guides/best-practices/query-parallelism_01.gif';
import visual02 from '@site/static/images/guides/best-practices/query-parallelism_02.gif';
import visual03 from '@site/static/images/guides/best-practices/query-parallelism_03.gif';
import visual04 from '@site/static/images/guides/best-practices/query-parallelism_04.gif';
import visual05 from '@site/static/images/guides/best-practices/query-parallelism_05.png';

import Image from '@theme/IdealImage';

# ClickHouseがクエリを並列実行する方法 {#how-clickhouse-executes-a-query-in-parallel}

ClickHouseは[速度のために構築](/concepts/why-clickhouse-is-so-fast)されています。利用可能なすべてのCPUコアを使用し、処理レーン全体にデータを分散し、しばしばハードウェアを限界近くまで押し上げることで、高度に並列な方法でクエリを実行します。

このガイドでは、ClickHouseでクエリの並列処理がどのように機能するか、そして大規模なワークロードでパフォーマンスを向上させるためにそれをどのように調整または監視できるかを説明します。

主要な概念を説明するために、[uk_price_paid_simple](/parts)データセットに対する集計クエリを使用します。

## ステップバイステップ：ClickHouseが集計クエリを並列化する方法 {#step-by-step-how-clickHouse-parallelizes-an-aggregation-query}

ClickHouseが①テーブルのプライマリキーにフィルタを持つ集計クエリを実行する際、②プライマリインデックスをメモリにロードして、③どのグラニュールを処理する必要があり、どれを安全にスキップできるかを識別します：

<Image img={visual01} size="md" alt="インデックス分析"/>

### 処理レーン全体への作業の分散 {#distributing-work-across-processing-lanes}

選択されたデータは、`n`個の並列[処理レーン](/academic_overview#4-2-multi-core-parallelization)全体に[動的に](#load-balancing-across-processing-lanes)分散され、データを[ブロック](/development/architecture#block)ごとにストリーミングして最終結果に処理します：

<Image img={visual02} size="md" alt="4つの並列処理レーン"/>

<br/><br/>
`n`個の並列処理レーンの数は[max_threads](/operations/settings/settings#max_threads)設定によって制御され、デフォルトではサーバー上のClickHouseで利用可能なCPUコアの数と一致します。上記の例では、`4`コアを想定しています。

`8`コアを持つマシンでは、より多くのレーンが並列にデータを処理するため、クエリ処理のスループットはほぼ2倍になります（ただし、メモリ使用量もそれに応じて増加します）：

<Image img={visual03} size="md" alt="8つの並列処理レーン"/>

<br/><br/>
効率的なレーン分散は、CPU使用率を最大化し、総クエリ時間を短縮するために重要です。

### シャーディングされたテーブルでのクエリ処理 {#processing-queries-on-sharded-tables}

テーブルデータが[シャード](/shards)として複数のサーバーに分散されている場合、各サーバーは並列にそのシャードを処理します。各サーバー内では、上記で説明したように、並列処理レーンを使用してローカルデータが処理されます：

<Image img={visual04} size="md" alt="分散レーン"/>

<br/><br/>
最初にクエリを受信したサーバーは、シャードからのすべてのサブ結果を収集し、それらを最終的なグローバル結果に結合します。

シャード全体にクエリ負荷を分散することで、特に高スループット環境での並列処理の水平スケーリングが可能になります。

:::note ClickHouse Cloudはシャードの代わりに並列レプリカを使用
ClickHouse Cloudでは、この同じ並列処理が[並列レプリカ](https://clickhouse.com/docs/deployment-guides/parallel-replicas)を通じて実現されます。これは、シェアードナッシングクラスターのシャードと同様に機能します。各ClickHouse Cloudレプリカ（ステートレスコンピュートノード）は、データの一部を並列に処理し、独立したシャードと同じように最終結果に貢献します。
:::

## クエリの並列処理の監視 {#monitoring-query-parallelism}

これらのツールを使用して、クエリが利用可能なCPUリソースを完全に活用していることを確認し、そうでない場合に診断します。

これは59個のCPUコアを持つテストサーバーで実行しており、ClickHouseがクエリの並列処理を完全に示すことができます。

例のクエリがどのように実行されるかを観察するために、集計クエリ中にすべてのトレースレベルのログエントリを返すようにClickHouseサーバーに指示できます。このデモンストレーションでは、クエリの述語を削除しました。そうでなければ、3つのグラニュールしか処理されず、ClickHouseが複数の並列処理レーンを使用するのに十分なデータではありません：

```sql runnable=false
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
SETTINGS send_logs_level='trace';
```

```txt
① <Debug> ...: 3609 marks to read from 3 ranges
② <Trace> ...: Spreading mark ranges among streams
② <Debug> ...: Reading approx. 29564928 rows with 59 streams
```

以下のことがわかります：

* ① ClickHouseは3つのデータ範囲にわたって3,609個のグラニュール（トレースログでマークとして示される）を読み取る必要があります。
* ② 59個のCPUコアで、この作業を59個の並列処理ストリーム（レーンごとに1つ）に分散します。

あるいは、[EXPLAIN](/sql-reference/statements/explain#explain-pipeline)句を使用して、集計クエリの[物理演算子プラン](/academic_overview#4-2-multi-core-parallelization)（「クエリパイプライン」とも呼ばれる）を検査できます：

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

注：上記の演算子プランを下から上に読んでください。各行は物理実行プランのステージを表し、下部のストレージからのデータ読み取りから始まり、上部の最終処理ステップで終わります。`× 59`でマークされた演算子は、59個の並列処理レーン全体で重複しないデータ領域で同時に実行されます。これは`max_threads`の値を反映しており、クエリの各ステージがCPUコア全体でどのように並列化されているかを示しています。

ClickHouseの[埋め込みWeb UI](/interfaces/http)（`/play`エンドポイントで利用可能）は、上記の物理プランをグラフィカル視覚化としてレンダリングできます。この例では、`max_threads`を`4`に設定して視覚化をコンパクトに保ち、4つの並列処理レーンのみを表示しています：

<Image img={visual05} alt="クエリパイプライン"/>

注：視覚化を左から右に読んでください。各行は、フィルタリング、集計、最終処理ステージなどの変換を適用しながら、データをブロックごとにストリーミングする並列処理レーンを表します。この例では、`max_threads = 4`設定に対応する4つの並列レーンを確認できます。

### 処理レーン全体の負荷分散 {#load-balancing-across-processing-lanes}

上記の物理プランの`Resize`演算子は、処理レーン全体でデータブロックストリームを[再パーティション化して再分散](/academic_overview#4-2-multi-core-parallelization)し、均等に活用されるようにすることに注意してください。この再バランシングは、データ範囲がクエリ述語に一致する行数が異なる場合に特に重要です。そうでなければ、一部のレーンが過負荷になり、他のレーンがアイドル状態になる可能性があります。作業を再分散することで、高速なレーンが効果的に低速なレーンを支援し、全体的なクエリランタイムを最適化します。

## max_threadsが常に尊重されない理由 {#why-max-threads-isnt-always-respected}

上記で述べたように、`n`個の並列処理レーンの数は`max_threads`設定によって制御され、デフォルトではサーバー上のClickHouseで利用可能なCPUコアの数と一致します：

```sql runnable=false
SELECT getSetting('max_threads');
```

```txt
   ┌─getSetting('max_threads')─┐
1. │                        59 │
   └───────────────────────────┘
```

ただし、`max_threads`値は、処理用に選択されたデータの量に応じて無視される場合があります：

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

上記の演算子プラン抽出に示されているように、`max_threads`が`59`に設定されていても、ClickHouseはデータをスキャンするために**30**個の同時ストリームのみを使用します。

次にクエリを実行してみましょう：

```sql runnable=false
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
WHERE town = 'LONDON';
```

```txt
   ┌─max(price)─┐
1. │  594300000 │ -- 594.30 million
   └────────────┘

1 row in set. Elapsed: 0.013 sec. Processed 2.31 million rows, 13.66 MB (173.12 million rows/s., 1.02 GB/s.)
Peak memory usage: 27.24 MiB.
```

上記の出力に示されているように、クエリは2.31百万行を処理し、13.66MBのデータを読み取りました。これは、インデックス分析フェーズ中に、ClickHouseが処理用に**282個のグラニュール**を選択し、各グラニュールには8,192行が含まれ、合計で約2.31百万行になるためです：

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

設定された`max_threads`値に関係なく、ClickHouseは、それらを正当化するのに十分なデータがある場合にのみ、追加の並列処理レーンを割り当てます。`max_threads`の「max」は上限を指し、使用されるスレッドの保証された数ではありません。

「十分なデータ」が何を意味するかは、主に2つの設定によって決定されます。これらは、各処理レーンが処理すべき最小行数（デフォルトで163,840）と最小バイト数（デフォルトで2,097,152）を定義します：

シェアードナッシングクラスターの場合：
* [merge_tree_min_rows_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read)
* [merge_tree_min_bytes_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read)

共有ストレージを持つクラスター（例：ClickHouse Cloud）の場合：
* [merge_tree_min_rows_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem)
* [merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem)

さらに、読み取りタスクサイズの厳格な下限があり、次によって制御されます：
* [Merge_tree_min_read_task_size](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_read_task_size) + [merge_tree_min_bytes_per_task_for_remote_reading](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_per_task_for_remote_reading)

:::warning これらの設定を変更しないでください
本番環境でこれらの設定を変更することはお勧めしません。これらは、`max_threads`が常に実際の並列処理レベルを決定しない理由を説明するためにのみここに示されています。
:::

デモンストレーション目的で、最大同時実行性を強制するためにこれらの設定をオーバーライドした物理プランを検査してみましょう：

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

現在、ClickHouseはデータをスキャンするために59個の同時ストリームを使用し、設定された`max_threads`を完全に尊重しています。

これは、小さなデータセットでのクエリに対して、ClickHouseが意図的に同時実行性を制限することを示しています。設定のオーバーライドは、テスト専用に使用してください。本番環境では使用しないでください。非効率的な実行やリソース競合につながる可能性があります。

## 重要なポイント {#key-takeaways}

* ClickHouseは`max_threads`に結び付けられた処理レーンを使用してクエリを並列化します。
* 実際のレーン数は、処理用に選択されたデータのサイズに依存します。
* `EXPLAIN PIPELINE`とトレースログを使用して、レーン使用を分析します。

## 詳細情報の入手先 {#where-to-find-more-information}

ClickHouseがクエリを並列に実行する方法と、大規模でどのように高いパフォーマンスを実現するかについてさらに深く掘り下げたい場合は、次のリソースを探索してください：

* [クエリ処理レイヤー – VLDB 2024論文（Web版）](/academic_overview#4-query-processing-layer) - スケジューリング、パイプライニング、演算子設計を含む、ClickHouseの内部実行モデルの詳細な分解。

* [部分集計状態の説明](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization) - 部分集計状態が処理レーン全体で効率的な並列実行を可能にする方法についての技術的な詳細。

* すべてのClickHouseクエリ処理ステップを詳細に説明するビデオチュートリアル：
<iframe width="1024" height="576" src="https://www.youtube.com/embed/hP6G2Nlz_cA?si=Imd_i427J_kZOXHe" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
