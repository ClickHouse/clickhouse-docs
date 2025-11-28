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


# ClickHouse がクエリを並列実行する仕組み

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



## クエリの並列実行の監視

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

* ① ClickHouse は 3 つのデータ範囲にまたがって、トレースログ中では mark として表示される granule を 3,609 個読み取る必要があります。
* ② CPU コアが 59 個あるため、この処理は 59 本の並列処理ストリーム（各レーンにつき 1 本）に分散されます。

別の方法として、[EXPLAIN](/sql-reference/statements/explain#explain-pipeline) 句を使用して、集約クエリに対する [physical operator plan](/academic_overview#4-2-multi-core-parallelization)（「query pipeline」とも呼ばれる）を確認することもできます。

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

Note: 上記のオペレーター・プランは下から上へ読んでください。各行は物理実行プランのステージを表しており、下部のストレージからデータを読み込むところから始まり、上部の最終処理ステップで終わります。`× 59` とマークされたオペレーターは、59 本の並列処理レーン全体で互いに重複しないデータ領域に対して同時に実行されます。これは `max_threads` の値を反映しており、クエリの各ステージがどのように CPU コア間で並列化されるかを示しています。

ClickHouse の [組み込み Web UI](/interfaces/http)（`/play` エンドポイントで利用可能）は、上記の物理プランをグラフィカルに可視化して表示できます。この例では、可視化をコンパクトに保つために `max_threads` を `4` に設定し、4 本の並列処理レーンのみを表示しています。

<Image img={visual05} alt="クエリパイプライン" />

Note: 可視化は左から右へ読んでください。各行は、データをブロック単位でストリーミングし、フィルタリング、集約、最終処理ステージなどの変換を適用する並列処理レーンを表します。この例では、`max_threads = 4` の設定に対応する 4 本の並列レーンが確認できます。

### 処理レーン間での負荷分散

上記の物理プラン内の `Resize` オペレーターは、処理レーン間でデータブロックストリームを[再パーティションおよび再分配](/academic_overview#4-2-multi-core-parallelization)することで、各レーンの利用率を均等に保っている点に注意してください。この再バランシングは、データ範囲ごとにクエリ述語にマッチする行数が異なる場合に特に重要です。そうしないと、一部のレーンだけが過負荷になり、他のレーンがアイドル状態になる可能性があります。作業を再分配することで、速いレーンが遅いレーンを実質的に助ける形となり、クエリ全体の実行時間を最適化できます。


## なぜ max&#95;threads が常にそのとおりには動作しないのか

前述のとおり、並列処理レーンの数 `n` は `max_threads` 設定によって制御されます。デフォルトでは、この設定値はサーバー上で ClickHouse が利用可能な CPU コア数と同じになります。

```sql runnable=false
SELECT getSetting('max_threads');
```

```txt
   ┌─getSetting('max_threads')─┐
1. │                        59 │
   └───────────────────────────┘
```

ただし、処理対象として選択されたデータ量によっては、`max_threads` の値が無視される場合があります。

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

上のオペレータープランの抜粋に示されているように、`max_threads` が `59` に設定されていても、ClickHouse はデータをスキャンするために **30** 本の同時実行ストリームしか使用しません。

では、クエリを実行してみましょう。

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

上の出力に示されているように、このクエリは231万行を処理し、13.66MBのデータを読み取りました。これはインデックス解析フェーズにおいて、ClickHouseが処理対象として**282個のグラニュール**を選択し、それぞれに8,192行が含まれているためで、合計で約231万行になります。

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

設定された `max_threads` の値に関係なく、ClickHouse が追加の並列処理レーンを確保するのは、それを正当化できるだけの十分なデータがある場合に限られます。`max_threads` の「max」は上限値を指しており、実際に使用されるスレッド数がその数になることを保証するものではありません。

「十分なデータ」が何を意味するかは主に 2 つの設定によって決まり、それぞれの処理レーンが処理すべき最小行数（デフォルトで 163,840）と最小バイト数（デフォルトで 2,097,152）を定義します。

共有ナッシングクラスターの場合:

* [merge&#95;tree&#95;min&#95;rows&#95;for&#95;concurrent&#95;read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read)
* [merge&#95;tree&#95;min&#95;bytes&#95;for&#95;concurrent&#95;read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read)

共有ストレージを利用するクラスター（例: ClickHouse Cloud）の場合:

* [merge&#95;tree&#95;min&#95;rows&#95;for&#95;concurrent&#95;read&#95;for&#95;remote&#95;filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem)
* [merge&#95;tree&#95;min&#95;bytes&#95;for&#95;concurrent&#95;read&#95;for&#95;remote&#95;filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem)

さらに、読み取りタスクサイズには、次の設定で制御される厳格な下限値があります:

* [Merge&#95;tree&#95;min&#95;read&#95;task&#95;size](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_read_task_size) + [merge&#95;tree&#95;min&#95;bytes&#95;per&#95;task&#95;for&#95;remote&#95;reading](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_per_task_for_remote_reading)


:::warning これらの設定を変更しないでください
本番環境でこれらの設定を変更することは推奨しません。ここでは、`max_threads` が必ずしも実際の並列度を決定しない理由を示すためだけに掲載しています。
:::

デモンストレーションのために、これらの設定を一時的に上書きして並列度を最大まで引き上げた状態で、物理プランを確認してみましょう。

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
