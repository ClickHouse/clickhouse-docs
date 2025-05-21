---
slug: /optimize/query-parallelism
sidebar_label: 'クエリの並列性'
sidebar_position: 20
description: 'ClickHouseは、処理レーンとmax_threads設定を使用してクエリ実行を並列化します。'
title: 'ClickHouseがクエリを並列に実行する方法'
---

import visual01 from '@site/static/images/guides/best-practices/query-parallelism_01.gif';
import visual02 from '@site/static/images/guides/best-practices/query-parallelism_02.gif';
import visual03 from '@site/static/images/guides/best-practices/query-parallelism_03.gif';
import visual04 from '@site/static/images/guides/best-practices/query-parallelism_04.gif';
import visual05 from '@site/static/images/guides/best-practices/query-parallelism_05.png';

import Image from '@theme/IdealImage';


# ClickHouseがクエリを並列に実行する方法

ClickHouseは、[スピードのために構築されています](/concepts/why-clickhouse-is-so-fast)。それは、高度に並列化された方法でクエリを実行し、すべての利用可能なCPUコアを使用し、データを処理レーンに分配し、しばしばハードウェアをその限界近くまで押し上げます。

このガイドでは、ClickHouseのクエリ並列性がどのように機能するか、また、大規模なワークロードのパフォーマンスを向上させるためにそれを調整または監視する方法を説明します。

[uk_price_paid_simple](/parts)データセットに対する集約クエリを使用して、主要な概念を説明します。

## ステップバイステップ: ClickHouseが集約クエリを並列化する方法 {#step-by-step-how-clickHouse-parallelizes-an-aggregation-query}

ClickHouseが①テーブルの主キーにフィルターをかけた集約クエリを実行すると、②主インデックスをメモリに読み込み、③処理が必要なグラニュールと安全にスキップできるものを特定します。

<Image img={visual01} size="md" alt="インデックス分析"/>

### 処理レーン間での作業分配 {#distributing-work-across-processing-lanes}

選択されたデータは、その後、`n`並列の[処理レーン](/academic_overview#4-2-multi-core-parallelization)に[動的に](#load-balancing-across-processing-lanes)分配され、それぞれがブロック単位でデータを処理し、最終結果にします。

<Image img={visual02} size="md" alt="4つの並列処理レーン"/>

<br/><br/>
`n`の並列処理レーンの数は、[max_threads](/operations/settings/settings#max_threads)設定によって制御され、デフォルトではサーバー上のClickHouseに利用可能なCPUコアの数と一致します。上記の例では、`4`コアを想定しています。

`8`コアのマシンでは、クエリ処理のスループットはほぼ倍増します（ただし、メモリ使用量もそれに応じて増加します）、より多くのレーンがデータを並列に処理するためです：

<Image img={visual03} size="md" alt="8つの並列処理レーン"/>

<br/><br/>
効率的なレーン分配は、CPU使用率の最大化と総クエリ時間の短縮にとって重要です。

### シャードテーブル上でのクエリ処理 {#processing-queries-on-sharded-tables}

テーブルデータが複数のサーバーに[シャード](/shards)として分散されると、各サーバーはそのシャードを並列に処理します。各サーバー内では、ローカルデータは上記で説明したように並列処理レーンを使用して処理されます：

<Image img={visual04} size="md" alt="分散レーン"/>

<br/><br/>
最初にクエリを受け取ったサーバーは、シャードからすべてのサブ結果を収集し、それらを最終的なグローバル結果に結合します。

シャード間でクエリ負荷を分散させることで、並列性の水平スケーリングが可能になり、特に高スループット環境で有効です。

:::note ClickHouse Cloudはシャードの代わりに並列レプリカを使用します
ClickHouse Cloudでは、同じ並列性が[並列レプリカ](https://clickhouse.com/docs/deployment-guides/parallel-replicas)を通じて達成され、これは共有ナッシングクラスターのシャードのように機能します。各ClickHouse Cloudレプリカは、状態を持たない計算ノードであり、データの一部を並列に処理し、最終結果に寄与します。これは、独立したシャードと同様です。
:::

## クエリ並列性の監視 {#monitoring-query-parallelism}

これらのツールを使用して、クエリが利用可能なCPUリソースを完全に活用しているかを確認し、そうでない場合を診断します。

私たちは、59 CPUコアを持つテストサーバーでこれを実行しており、ClickHouseはそのクエリの並列性を十分に示すことができます。

例のクエリがどのように実行されるかを観察するために、ClickHouseサーバーに集約クエリ中のすべてのトレースレベルのログエントリを返すよう指示できます。このデモのために、私たちはクエリの述語を削除しました。そうしないと、処理されるグラニュールは3つだけになり、データが不十分でClickHouseがより多くの並列処理レーンを利用できません：
```sql runnable=false
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
SETTINGS send_logs_level='trace';
```

```txt
① <Debug> ...: 3609のマークを3つの範囲から読み取る必要があります
② <Trace> ...: ストリーム間でマーク範囲を分散しています
② <Debug> ...: 約29564928行を59のストリームで読み取っています
```

私たちは以下を見ることができます



* ① ClickHouseは、3つのデータ範囲にわたって3,609グラニュール（トレースログでマークとして示されています）を読み取る必要があります。
* ② 59のCPUコアを用いて、この作業を59の並列処理ストリームに分配しています—1レーンごとに1つです。

あるいは、[EXPLAIN](/sql-reference/statements/explain#explain-pipeline)句を使用して、集約クエリの[物理オペレータープラン](/academic_overview#4-2-multi-core-parallelization)を調査できます。このプランは「クエリパイプライン」としても知られています：
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

注: 上記のオペレータープランを下から上へ読んでください。各行は物理実行プランのステージを表し、下からはストレージからのデータ読み取りが始まり、上で最終処理ステップが終了します。`× 59`とマークされたオペレーターは、59の並列処理レーンで非重複のデータ領域に対して同時に実行されます。これは`max_threads`の値を反映し、クエリの各段階がCPUコア間でどのように並列化されているかを示しています。

ClickHouseの[組み込みWeb UI](/interfaces/http)（`/play`エンドポイントで利用可能）は、上記の物理プランをグラフィカルな可視化としてレンダリングできます。この例では、ビジュアライゼーションをコンパクトに保つために、`max_threads`を`4`に設定し、4つの並列処理レーンのみを表示しています：

<Image img={visual05} alt="クエリパイプライン"/>

注: このビジュアライゼーションは左から右に読んでください。各行は、データをブロック単位でストリーミングし、フィルタリング、集約、最終処理ステップなどの変換を適用する並列処理レーンを表します。この例では、`max_threads = 4`設定に対応する4つの並列レーンが表示されています。

### 処理レーン間での負荷分散 {#load-balancing-across-processing-lanes}

注意事項として、上記の物理プランにある`Resize`オペレーターは、データブロックストリームを処理レーン間で[再分配および再配分](/academic_overview#4-2-multi-core-parallelization)し、均等に利用されるように保ちます。この再バランスは、データ範囲がクエリの述語に一致する行数が異なる場合に特に重要で、さもなければ一部のレーンが過負荷になり、他のレーンがアイドル状態になる可能性があります。作業を再配分することで、より速いレーンが効果的に遅いレーンをサポートし、全体的なクエリ実行時間を最適化します。

## なぜmax_threadsが常に尊重されるわけではないのか {#why-max-threads-isnt-always-respected}

上記のように、`n`の並列処理レーンの数は、`max_threads`設定によって制御され、デフォルトではサーバー上のClickHouseに利用可能なCPUコアの数と一致します：
```sql runnable=false
SELECT getSetting('max_threads');
```

```txt
   ┌─getSetting('max_threads')─┐
1. │                        59 │
   └───────────────────────────┘
```

しかし、処理のために選択されたデータの量によっては、`max_threads`の値が無視されることがあります：
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

上記のオペレータープランの抜粋に示されるように、`max_threads`が`59`に設定されていても、ClickHouseはデータをスキャンするために**30**の同時ストリームしか使用しません。

さあ、クエリを実行してみましょう：
```sql runnable=false
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
WHERE town = 'LONDON';
```

```txt
   ┌─max(price)─┐
1. │  594300000 │ -- 594.30百万
   └────────────┘
   
1行がセットされました。経過時間: 0.013秒。 2.31百万行が処理され、13.66 MBが読み取られました（173.12百万行/秒、1.02 GB/秒）。
ピークメモリ使用量: 27.24 MiB。   
```

上記の出力に示されるように、クエリは2.31百万行を処理し、13.66 MBのデータを読み取りました。これは、インデックス分析フェーズ中にClickHouseが処理のために**282グラニュール**を選択したためで、各グラニュールは8,192行を含んでおり、合計で約2.31百万行になります：

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
 3. │     Expression (GROUP BYの前)                          │
 4. │       Expression                                      │
 5. │         ReadFromMergeTree (uk.uk_price_paid_simple)   │
 6. │         インデックス:                                  │
 7. │           主キー                                      │
 8. │             キー:                                     │
 9. │               town                                    │
10. │             条件: (town in ['LONDON', 'LONDON'])     │
11. │             パーツ: 3/3                                │
12. │             グラニュール: 282/3609                     │
    └───────────────────────────────────────────────────────┘  
```

設定された`max_threads`の値に関係なく、ClickHouseは、追加の並列処理レーンが割り当てられるのは、十分なデータがある場合のみです。`max_threads`の「max」は上限を指し、使用されるスレッドの数を保証するものではありません。

「十分なデータ」とは、主に2つの設定によって決定されます。これらの設定は、各処理レーンが処理すべき最小行数（デフォルトでは163,840行）および最小バイト数（デフォルトでは2,097,152バイト）を定義します：

共有ナッシングクラスターの場合：
* [merge_tree_min_rows_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read)
* [merge_tree_min_bytes_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read)

共有ストレージを持つクラスターの場合（例：ClickHouse Cloud）：
* [merge_tree_min_rows_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem)
* [merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem)

さらに、読み取りタスクサイズのハードな下限があり、次の設定によって制御されます：
* [Merge_tree_min_read_task_size](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_read_task_size) + [merge_tree_min_bytes_per_task_for_remote_reading](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_per_task_for_remote_reading)

:::warning これらの設定を変更しないでください
本番環境でこれらの設定を変更することはお勧めしません。これらは、`max_threads`が常に実際の並列性レベルを決定しない理由を示すために表示されています。
:::


デモンストレーションの目的で、これらの設定をオーバーライドして最大の同時性を強制するための物理プランを調査してみましょう：
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

今、ClickHouseはデータをスキャンするために59の同時ストリームを使用しており、設定された`max_threads`を完全に尊重しています。

これは、小規模データセットのクエリに対して、ClickHouseが意図的に同時性を制限することを示しています。設定のオーバーライドは、テストのためにのみ使用し、本番環境では使用しないでください。効率の悪い実行やリソースの競合を引き起こす可能性があります。

## 主なポイント {#key-takeaways}

* ClickHouseは、`max_threads`に紐づいた処理レーンを使用してクエリを並列化します。
* 実際のレーンの数は、処理のために選択されたデータのサイズに依存します。
* `EXPLAIN PIPELINE`とトレースログを使用してレーンの使用状況を分析します。

## さらに情報を探すには {#where-to-find-more-information}

ClickHouseがクエリを並列に実行する方法や、スケールで高パフォーマンスを達成する方法について詳しく知りたい場合は、以下のリソースを探索してください：

* [クエリ処理レイヤー – VLDB 2024論文（Web版）](/academic_overview#4-query-processing-layer) - ClickHouseの内部実行モデルの詳細なブレイクダウン。スケジューリング、パイプライン、オペレーターデザインを含む。

* [部分的な集約状態を説明する](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization) - 部分的な集約状態がどのように処理レーン間で効率的な並列実行を可能にするかについての技術的な詳細。

* ClickHouseのクエリ処理ステップを詳細に説明するビデオチュートリアル：
<iframe width="1024" height="576" src="https://www.youtube.com/embed/hP6G2Nlz_cA?si=Imd_i427J_kZOXHe" title="YouTubeビデオプレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
