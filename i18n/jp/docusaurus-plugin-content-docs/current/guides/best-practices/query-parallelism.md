---
slug: /optimize/query-parallelism
sidebar_label: 'クエリの並列実行'
sidebar_position: 20
description: 'ClickHouse は処理レーンと max_threads 設定を使ってクエリ実行を並列化します。'
title: 'ClickHouse によるクエリの並列実行の仕組み'
doc_type: 'guide'
keywords: ['parallel processing', 'query optimization', 'performance', 'threading', 'best practices']
---

import visual01 from '@site/static/images/guides/best-practices/query-parallelism_01.gif';
import visual02 from '@site/static/images/guides/best-practices/query-parallelism_02.gif';
import visual03 from '@site/static/images/guides/best-practices/query-parallelism_03.gif';
import visual04 from '@site/static/images/guides/best-practices/query-parallelism_04.gif';
import visual05 from '@site/static/images/guides/best-practices/query-parallelism_05.png';

import Image from '@theme/IdealImage';


# ClickHouseがクエリを並列実行する仕組み

ClickHouseは[高速性を重視して構築](/concepts/why-clickhouse-is-so-fast)されています。利用可能なすべてのCPUコアを使用し、処理レーン全体にデータを分散させ、ハードウェアを限界近くまで活用することで、クエリを高度に並列化して実行します。
 
本ガイドでは、ClickHouseにおけるクエリ並列処理の仕組みと、大規模ワークロードのパフォーマンスを向上させるための調整・監視方法について解説します。

主要な概念の説明には、[uk_price_paid_simple](/parts)データセットに対する集計クエリを使用します。



## ステップバイステップ: ClickHouseが集約クエリを並列化する仕組み {#step-by-step-how-clickHouse-parallelizes-an-aggregation-query}

ClickHouseがテーブルのプライマリキーに対するフィルタを含む集約クエリを①実行すると、②プライマリインデックスをメモリにロードし、③処理が必要なグラニュールとスキップ可能なグラニュールを識別します:

<Image img={visual01} size='md' alt='インデックス解析' />

### 処理レーン間での作業の分散 {#distributing-work-across-processing-lanes}

選択されたデータは、`n`個の並列[処理レーン](/academic_overview#4-2-multi-core-parallelization)に[動的に](#load-balancing-across-processing-lanes)分散され、データを[ブロック](/development/architecture#block)単位でストリーミングおよび処理して最終結果を生成します:

<Image img={visual02} size='md' alt='4つの並列処理レーン' />

<br />
<br />
`n`個の並列処理レーンの数は、[max_threads](/operations/settings/settings#max_threads)設定によって制御され、デフォルトではサーバー上でClickHouseが利用可能なCPUコア数と一致します。上記の例では、`4`コアを想定しています。

`8`コアのマシンでは、より多くのレーンがデータを並列処理するため、クエリ処理のスループットはおよそ2倍になります(ただし、メモリ使用量もそれに応じて増加します):

<Image img={visual03} size='md' alt='8つの並列処理レーン' />

<br />
<br />
効率的なレーン分散は、CPU使用率を最大化し、クエリの総実行時間を短縮するための鍵となります。

### シャードテーブルでのクエリ処理 {#processing-queries-on-sharded-tables}

テーブルデータが[シャード](/shards)として複数のサーバーに分散されている場合、各サーバーは自身のシャードを並列に処理します。各サーバー内では、上記で説明したように、並列処理レーンを使用してローカルデータが処理されます:

<Image img={visual04} size='md' alt='分散レーン' />

<br />
<br />
クエリを最初に受信したサーバーは、各シャードからすべてのサブ結果を収集し、それらを最終的なグローバル結果に統合します。

シャード間でクエリ負荷を分散することで、特に高スループット環境において、並列処理の水平スケーリングが可能になります。

:::note ClickHouse Cloudではシャードの代わりに並列レプリカを使用
ClickHouse Cloudでは、この同じ並列処理が[並列レプリカ](https://clickhouse.com/docs/deployment-guides/parallel-replicas)によって実現されます。これは、シェアードナッシングクラスタにおけるシャードと同様に機能します。各ClickHouse Cloudレプリカ(ステートレスなコンピュートノード)は、データの一部を並列に処理し、独立したシャードと同様に最終結果に貢献します。
:::


## クエリの並列処理の監視 {#monitoring-query-parallelism}

これらのツールを使用して、クエリが利用可能なCPUリソースを完全に活用しているかを確認し、活用できていない場合の診断を行います。

ここでは59個のCPUコアを持つテストサーバー上で実行しており、ClickHouseのクエリ並列処理能力を十分に示すことができます。

サンプルクエリがどのように実行されるかを観察するために、集計クエリの実行中にすべてのトレースレベルのログエントリを返すようClickHouseサーバーに指示できます。このデモンストレーションでは、クエリの述語を削除しました。そうしないと、3つのグラニュールのみが処理され、ClickHouseが複数の並列処理レーンを活用するには不十分なデータ量となるためです:

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

以下のことがわかります:

- ① ClickHouseは3つのデータ範囲にわたって3,609個のグラニュール(トレースログではmarksとして表示)を読み取る必要があります。
- ② 59個のCPUコアを使用して、この作業を59個の並列処理ストリーム(レーンごとに1つ)に分散します。

あるいは、[EXPLAIN](/sql-reference/statements/explain#explain-pipeline)句を使用して、集計クエリの[物理オペレータプラン](/academic_overview#4-2-multi-core-parallelization)(「クエリパイプライン」とも呼ばれます)を検査できます:

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

注意: 上記のオペレータプランは下から上に読みます。各行は物理実行プランのステージを表しており、下部のストレージからのデータ読み取りから始まり、上部の最終処理ステップで終わります。`× 59`とマークされたオペレータは、59個の並列処理レーンにわたって重複しないデータ領域で同時に実行されます。これは`max_threads`の値を反映しており、クエリの各ステージがCPUコア間でどのように並列化されるかを示しています。

ClickHouseの[組み込みWeb UI](/interfaces/http)(`/play`エンドポイントで利用可能)は、上記の物理プランをグラフィカルな視覚化としてレンダリングできます。この例では、視覚化をコンパクトに保つために`max_threads`を`4`に設定し、4つの並列処理レーンのみを表示しています:

<Image img={visual05} alt='Query pipeline' />

注意: 視覚化は左から右に読みます。各行は、ブロックごとにデータをストリーミングし、フィルタリング、集計、最終処理ステージなどの変換を適用する並列処理レーンを表しています。この例では、`max_threads = 4`設定に対応する4つの並列レーンを確認できます。

### 処理レーン間の負荷分散 {#load-balancing-across-processing-lanes}

上記の物理プランの`Resize`オペレータは、処理レーン間でデータブロックストリームを[再分割および再分配](/academic_overview#4-2-multi-core-parallelization)し、均等に利用されるようにします。この再バランシングは、クエリ述語に一致する行数がデータ範囲によって異なる場合に特に重要です。そうしないと、一部のレーンが過負荷になり、他のレーンがアイドル状態になる可能性があります。作業を再分配することで、高速なレーンが低速なレーンを効果的に支援し、全体的なクエリ実行時間を最適化します。


## max_threadsが常に尊重されるとは限らない理由 {#why-max-threads-isnt-always-respected}

前述のとおり、`n`個の並列処理レーンの数は`max_threads`設定によって制御され、デフォルトではサーバー上でClickHouseが利用可能なCPUコア数と一致します:

```sql runnable=false
SELECT getSetting('max_threads');
```

```txt
   ┌─getSetting('max_threads')─┐
1. │                        59 │
   └───────────────────────────┘
```

ただし、`max_threads`の値は、処理対象として選択されたデータ量によっては無視される場合があります:

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

上記のオペレータプラン抽出結果に示されているように、`max_threads`が`59`に設定されているにもかかわらず、ClickHouseはデータをスキャンするために**30**個の同時ストリームのみを使用しています。

それでは、クエリを実行してみましょう:

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

1行が返されました。経過時間: 0.013秒。処理された行数: 231万行、13.66 MB (1億7312万行/秒、1.02 GB/秒)
ピークメモリ使用量: 27.24 MiB。
```

上記の出力に示されているように、クエリは231万行を処理し、13.66MBのデータを読み取りました。これは、インデックス解析フェーズにおいて、ClickHouseが処理対象として**282個のグラニュール**を選択し、各グラニュールには8,192行が含まれており、合計で約231万行になるためです:

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

設定された`max_threads`の値に関係なく、ClickHouseは、それを正当化するのに十分なデータがある場合にのみ、追加の並列処理レーンを割り当てます。`max_threads`の「max」は上限を指しており、使用されるスレッド数の保証値ではありません。

「十分なデータ」が何を意味するかは、主に2つの設定によって決定されます。これらの設定は、各処理レーンが処理すべき最小行数(デフォルトで163,840)と最小バイト数(デフォルトで2,097,152)を定義します:

シェアードナッシングクラスタの場合:

- [merge_tree_min_rows_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read)
- [merge_tree_min_bytes_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read)

共有ストレージを持つクラスタの場合(例: ClickHouse Cloud):

- [merge_tree_min_rows_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem)
- [merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem)

さらに、読み取りタスクサイズには厳格な下限があり、以下によって制御されます:

- [Merge_tree_min_read_task_size](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_read_task_size) + [merge_tree_min_bytes_per_task_for_remote_reading](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_per_task_for_remote_reading)


:::warning これらの設定は変更しないでください
本番環境でこれらの設定を変更することは推奨しません。ここでは、`max_threads` が常に実際の並列度を決定するわけではないことを示すためだけに掲載しています。
:::

デモンストレーション目的で、最大同時実行数を強制するためにこれらの設定を上書きした物理プランを確認してみましょう:

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

これで ClickHouse はデータをスキャンするために 59 本の同時ストリームを使用し、設定された `max_threads` が完全に順守されています。

これは、小さなデータセットに対するクエリでは、ClickHouse が意図的に並行度を制限することを示しています。設定のオーバーライドはテスト目的に限定して使用し、本番環境では使用しないでください。非効率な実行やリソース競合を引き起こす可能性があります。


## 重要なポイント {#key-takeaways}

- ClickHouseは`max_threads`に関連付けられた処理レーンを使用してクエリを並列化します。
- 実際のレーン数は、処理対象として選択されるデータのサイズに依存します。
- レーンの使用状況を分析するには、`EXPLAIN PIPELINE`とトレースログを使用します。


## 詳細情報の参照先 {#where-to-find-more-information}

ClickHouseがクエリを並列実行する仕組みや、大規模環境で高性能を実現する方法についてさらに深く理解したい場合は、以下のリソースをご参照ください:

- [Query Processing Layer – VLDB 2024 Paper (Web Edition)](/academic_overview#4-query-processing-layer) - スケジューリング、パイプライン処理、オペレータ設計を含む、ClickHouseの内部実行モデルの詳細な解説。

- [Partial aggregation states explained](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization) - 部分集約状態が処理レーン間での効率的な並列実行を可能にする仕組みについての技術的な詳細解説。

- ClickHouseのクエリ処理の全ステップを詳細に解説した動画チュートリアル:
  <iframe
    width='1024'
    height='576'
    src='https://www.youtube.com/embed/hP6G2Nlz_cA?si=Imd_i427J_kZOXHe'
    title='YouTube video player'
    frameborder='0'
    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
    referrerpolicy='strict-origin-when-cross-origin'
    allowfullscreen
  ></iframe>
