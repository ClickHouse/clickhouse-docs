---
'slug': '/optimize/query-parallelism'
'sidebar_label': 'クエリの並行性'
'sidebar_position': 20
'description': 'ClickHouseは処理レーンとmax_threads設定を使用してクエリの実行を並行化します。'
'title': 'ClickHouseはクエリを並行して実行する方法'
'doc_type': 'guide'
---

import visual01 from '@site/static/images/guides/best-practices/query-parallelism_01.gif';
import visual02 from '@site/static/images/guides/best-practices/query-parallelism_02.gif';
import visual03 from '@site/static/images/guides/best-practices/query-parallelism_03.gif';
import visual04 from '@site/static/images/guides/best-practices/query-parallelism_04.gif';
import visual05 from '@site/static/images/guides/best-practices/query-parallelism_05.png';
import Image from '@theme/IdealImage';



# ClickHouseがクエリを並列で実行する方法

ClickHouseは[スピードのために設計されています](/concepts/why-clickhouse-is-so-fast)。それは、すべての利用可能なCPUコアを使用し、処理レーンにデータを分配し、しばしばハードウェアを限界までプッシュする非常に並列な方法でクエリを実行します。

このガイドでは、ClickHouseにおけるクエリの並列処理がどのように機能するか、また、大規模なワークロードのパフォーマンスを改善するためにそれをチューニングまたは監視する方法を説明します。

私たちは、[uk_price_paid_simple](/parts)データセットに対する集約クエリを使用して、主要な概念を説明します。

## ステップバイステップ: ClickHouseが集約クエリを並列化する方法 {#step-by-step-how-clickHouse-parallelizes-an-aggregation-query}

ClickHouseが①テーブルの主キーにフィルターをかけた集約クエリを実行すると、②主インデックスをメモリに読み込み、③どのグラニュールを処理する必要があるか、またどのグラニュールを安全にスキップできるかを特定します：

<Image img={visual01} size="md" alt="インデックス分析"/>

### 処理レーンに対する作業の分配 {#distributing-work-across-processing-lanes}

選択されたデータは、`n` 並列 [処理レーン](/academic_overview#4-2-multi-core-parallelization) に[動的に](#load-balancing-across-processing-lanes)分配され、データを[ブロック](/development/architecture#block)単位でストリーミングしながら最終結果に処理します：

<Image img={visual02} size="md" alt="4つの並列処理レーン"/>

<br/><br/>
この`n` 並列処理レーンの数は、[max_threads](/operations/settings/settings#max_threads)設定によって制御され、デフォルトではClickHouseがサーバー上で使用可能なCPUコアの数と同じになります。上記の例では、`4` コアを仮定しています。

`8` コアを持つマシンであれば、クエリ処理のスループットは大体2倍になります（ただし、メモリの使用量もそれに応じて増加します）。より多くのレーンが並列にデータを処理するためです：

<Image img={visual03} size="md" alt="8つの並列処理レーン"/>

<br/><br/>
効率的なレーン分配は、CPUの利用率を最大化し、総クエリ時間を短縮するための鍵です。

### シャーディングされたテーブルでのクエリ処理 {#processing-queries-on-sharded-tables}

テーブルデータが複数のサーバーに[シャード](/shards)として分散されている場合、各サーバーはそのシャードを並列に処理します。各サーバー内では、上記と同様に地元のデータが並列処理レーンを使用して処理されます：

<Image img={visual04} size="md" alt="分散レーン"/>

<br/><br/>
クエリを最初に受け取るサーバーは、シャードからすべてのサブ結果を収集し、最終的なグローバル結果に結合します。

シャード間でのクエリ負荷の分散は、特に高スループット環境において、並列処理の水平スケーリングを可能にします。

:::note ClickHouse Cloudはシャードの代わりに並列レプリカを使用します
ClickHouse Cloudでは、シャードと同様に機能する[並列レプリカ](https://clickhouse.com/docs/deployment-guides/parallel-replicas)を通じてこの同じ並列性が実現されます。各ClickHouse Cloudレプリカは、ステートレスの計算ノードであり、データの一部を並列に処理し、独立したシャードのように最終結果に貢献します。
:::

## クエリ並列性の監視 {#monitoring-query-parallelism}

これらのツールを使用して、クエリが利用可能なCPUリソースを完全に活用していることを確認し、活用していない場合は診断します。

私たちは、59のCPUコアを持つテストサーバーでこれを実行しています。これにより、ClickHouseはそのクエリ並列性を完全に示すことができます。

例のクエリがどのように実行されるかを観察するために、ClickHouseサーバーに集約クエリ中のすべてのトレースレベルのログエントリを返すよう指示できます。このデモでは、クエリの述語を削除しました—そうしないと、3つのグラニュールしか処理されず、それ以上の並列処理レーンをClickHouseが充分に利用することができません：
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

以下のことが確認できます。

* ① ClickHouseは、トレースログにマークとして示された3,609のグラニュールを3つのデータ範囲にわたって読み取る必要があります。
* ② 59のCPUコアを使用することで、この作業は59の並列処理ストリームに分配されます—レーンごとに1つです。

あるいは、[EXPLAIN](/sql-reference/statements/explain#explain-pipeline)句を使用して、集約クエリの[物理オペレータープラン](/academic_overview#4-2-multi-core-parallelization)（クエリパイプラインとも呼ばれます）を検査できます：
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

注意: 上記のオペレータープランを下から上に読んでください。各行は、底からストレージからデータを読み取ることから始まり、上部の最終処理ステップで終了します。`× 59`とマークされたオペレーターは、59の並列処理レーンにわたって重ならないデータ領域で同時に実行されます。これは、`max_threads`の値を反映しており、クエリの各ステージがCPUコアにわたってどのように並列化されているかを示しています。

ClickHouseの[埋め込みWeb UI](/interfaces/http)（`/play`エンドポイントで利用可能）は、上記の物理プランをグラフィカルなビジュアライゼーションとしてレンダリングできます。この例では、視覚化をコンパクトに保つために`max_threads`を`4`に設定し、4つの並列処理レーンのみを表示します：

<Image img={visual05} alt="クエリパイプライン"/>

注意: ビジュアルを左から右に読んでください。各行は、データをブロック単位でストリーミングし、フィルタリング、集約、最終処理ステージなどの変換を適用する並列処理レーンを表しています。この例では、`max_threads = 4`設定に対応する4つの並列レーンを見ることができます。

### 処理レーン間の負荷分散 {#load-balancing-across-processing-lanes}

物理プランの上記の`Resize`オペレーターは、処理レーン間でデータブロックストリームを[再配分し再分配](/academic_overview#4-2-multi-core-parallelization)して、均等に使用されるように保ちます。この再バランスは、データ範囲がクエリ述語に一致する行の数が異なる場合に特に重要です。そうでなければ、一部のレーンは過負荷になり、他はアイドルになる可能性があります。作業を再分配することによって、より速いレーンが遅いレーンを助け、全体のクエリ実行時間を最適化します。

## なぜmax_threadsが常に尊重されないのか {#why-max-threads-isnt-always-respected}

上記のように、`n` 並列処理レーンの数は、デフォルトではClickHouseがサーバー上で使用可能なCPUコアの数と同じである`max_threads`設定によって制御されます：
```sql runnable=false
SELECT getSetting('max_threads');
```

```txt
   ┌─getSetting('max_threads')─┐
1. │                        59 │
   └───────────────────────────┘
```

ただし、処理のために選択されたデータの量によって、`max_threads`の値が無視されることがあります：
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

上記のオペレータープランの抜粋に示されているように、`max_threads`が`59`に設定されているにもかかわらず、ClickHouseはデータをスキャンするためにわずか**30**の同時ストリームを使用しています。

では、クエリを実行してみましょう：
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

上記の出力で示されたように、クエリは231万行を処理し、13.66MBのデータを読み込みました。これは、インデックス分析フェーズ中に、ClickHouseが処理のために**282のグラニュール**を選択し、それぞれが8,192行を含み、合計で約231万行になったためです：

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

構成された`max_threads`値にかかわらず、ClickHouseは十分なデータがある場合にのみ追加の並列処理レーンを割り当てます。`max_threads`の「max」は上限を指し、使用されるスレッドの保証された数ではありません。

「十分なデータ」とは、主に、各処理レーンが処理すべき最小行数（デフォルトは163,840行）と、最小バイト数（デフォルトは2,097,152バイト）を定義する2つの設定によって決まります：

共有ナシクラスタ向け：
* [merge_tree_min_rows_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read)
* [merge_tree_min_bytes_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read)

共有ストレージを持つクラスタ向け（例: ClickHouse Cloud）：
* [merge_tree_min_rows_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem)
* [merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem)

さらに、読み取りタスクサイズの硬い下限もあり、次の設定によって制御されます：
* [Merge_tree_min_read_task_size](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_read_task_size) + [merge_tree_min_bytes_per_task_for_remote_reading](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_per_task_for_remote_reading)

:::warning これらの設定を変更しないでください
運用環境でこれらの設定を変更することは推奨されません。ここに表示されているのは、`max_threads`が常に実際の並列性レベルを決定しない理由を示すためだけです。
:::

デモ目的で、これらの設定をオーバーライドして最大の同時実行性を強制する物理プランを検査してみましょう：
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

これでClickHouseはデータをスキャンするために59の同時ストリームを使用し、設定された`max_threads`を完全に尊重しています。

これは、小さなデータセットに対するクエリの場合、ClickHouseが意図的に同時実行を制限することを示しています。設定のオーバーライドはテストのためだけに使用し、運用環境では使用しないでください。効率的な実行やリソースの競合を引き起こす可能性があるためです。

## 主なポイント {#key-takeaways}

* ClickHouseは、`max_threads`に結びついた処理レーンを使用してクエリを並列化します。
* 実際のレーンの数は、処理のために選択されたデータのサイズに依存します。
* `EXPLAIN PIPELINE`とトレースログを使用してレーン使用状況を分析します。

## 詳細情報を見つける場所  {#where-to-find-more-information}

ClickHouseがクエリを並列で実行する方法や、高スケーラビリティでの高パフォーマンスの実現方法についてさらに深く理解したい場合は、以下のリソースを調べてみてください：

* [クエリ処理レイヤー – VLDB 2024 論文 (Web版)](/academic_overview#4-query-processing-layer) - ClickHouseの内部実行モデルの詳細な分析、スケジューリング、パイプライン処理、およびオペレータ設計を含む。

* [部分的集約状態の解説](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization) - 部分的集約状態が処理レーン全体で効率的な並列実行を可能にする方法についての技術的な深掘り。

* ClickHouseのクエリ処理のすべてのステップを詳細に説明するビデオチュートリアル：
<iframe width="1024" height="576" src="https://www.youtube.com/embed/hP6G2Nlz_cA?si=Imd_i427J_kZOXHe" title="YouTube動画プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
