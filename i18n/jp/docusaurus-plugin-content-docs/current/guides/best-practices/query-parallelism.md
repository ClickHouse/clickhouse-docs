---
'slug': '/optimize/query-parallelism'
'sidebar_label': 'Query Parallelism'
'sidebar_position': 20
'description': 'ClickHouseクエリ実行の並列化には、処理レーンとmax_threads設定が使用されます。'
'title': 'How ClickHouse executes a query in parallel'
---

import visual01 from '@site/static/images/guides/best-practices/query-parallelism_01.gif';
import visual02 from '@site/static/images/guides/best-practices/query-parallelism_02.gif';
import visual03 from '@site/static/images/guides/best-practices/query-parallelism_03.gif';
import visual04 from '@site/static/images/guides/best-practices/query-parallelism_04.gif';
import visual05 from '@site/static/images/guides/best-practices/query-parallelism_05.png';
import Image from '@theme/IdealImage';



# ClickHouseがクエリを並行して実行する方法

ClickHouseは[スピードのために構築されています](/concepts/why-clickhouse-is-so-fast)。それは、利用可能なすべてのCPUコアを使用し、処理レーンにデータを分散させ、しばしばハードウェアをその限界に近づけて、クエリを高度に並行して実行します。

このガイドでは、ClickHouseのクエリ並行性がどのように機能し、大規模なワークロードでのパフォーマンスを向上させるためにそれを調整または監視する方法について説明します。

主要な概念を説明するために、[uk_price_paid_simple](/parts)データセットに対する集約クエリを使用します。

## 手順: ClickHouseが集約クエリを並行化する方法 {#step-by-step-how-clickHouse-parallelizes-an-aggregation-query}

ClickHouseが ① プライマリキーにフィルタをかけた集約クエリを実行すると、② プライマリインデックスがメモリに読み込まれ、③ どのグラニュールを処理する必要があるか、どれを安全にスキップできるかを特定します：

<Image img={visual01} size="md" alt="インデックス分析"/>

### 処理レーンにまたがる作業の分散 {#distributing-work-across-processing-lanes}

選択されたデータは、`n`並行[処理レーン](/academic_overview#4-2-multi-core-parallelization)に[動的に](#load-balancing-across-processing-lanes)分散され、データは[ブロック](/development/architecture#block)ごとにストリームされ、処理され、最終結果にまとめられます：

<Image img={visual02} size="md" alt="4つの並行処理レーン"/>

<br/><br/>
`n`の並行処理レーンの数は、[max_threads](/operations/settings/settings#max_threads)設定によって制御され、デフォルトではサーバー上でClickHouseが利用できるCPUコアの数に一致します。上記の例では、`4`コアを仮定しています。

`8`コアのマシンでは、クエリ処理のスループットは概ね2倍になります（ただし、メモリ使用量もそれに応じて増加します）。より多くのレーンが並行してデータを処理するためです：

<Image img={visual03} size="md" alt="8つの並行処理レーン"/>

<br/><br/>
効率的なレーン分配は、CPUの利用率を最大化し、総クエリ時間を短縮するための鍵です。

### シャードテーブル上のクエリ処理 {#processing-queries-on-sharded-tables}

テーブルデータが複数のサーバーに[シャード](/shards)として分散されている場合、各サーバーはそのシャードを並行して処理します。各サーバー内では、ローカルデータが上記で説明したように並行処理レーンを使用して処理されます：

<Image img={visual04} size="md" alt="分散レーン"/>

<br/><br/>
最初にクエリを受信したサーバーは、シャードからすべてのサブ結果を集約し、最終的なグローバル結果に統合します。

シャード間でクエリ負荷を分散させることで、特に高スループット環境において並行性の水平スケーリングを可能にします。

:::note ClickHouse Cloudはシャードの代わりに並行レプリカを使用します
ClickHouse Cloudでは、同じ並行性が[並行レプリカ](https://clickhouse.com/docs/deployment-guides/parallel-replicas)を通じて実現されており、これはシャードが共有なしのクラスターで機能するのと類似しています。各ClickHouse Cloudレプリカは、ステートレスなコンピュートノードであり、並行してデータの一部を処理し、独立したシャードのように最終結果に貢献します。
:::

## クエリ並行性の監視 {#monitoring-query-parallelism}

これらのツールを使用して、クエリが利用可能なCPUリソースを完全に活用しているかどうかを確認し、そうでない場合に診断します。

私たちは59のCPUコアを持つテストサーバーでこれを実行しており、ClickHouseはそのクエリ並行性を完全に示すことができます。

例のクエリがどのように実行されるかを観察するために、ClickHouseサーバーに集約クエリ中にすべてのトレースレベルのログエントリを返すように指示できます。このデモのために、クエリの述語を削除しました—そうでなければ、3つのグラニュールしか処理されず、ClickHouseが複数の並行処理レーンを利用するには不十分なデータとなります：
```sql runnable=false
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
SETTINGS send_logs_level='trace';
```

```txt
① <Debug> ...: 3609マークを3つのレンジから読み取ります
② <Trace> ...: ストリーム間でマーク範囲を分散
② <Debug> ...: 約29,564,928行を59のストリームで読み取る
```

私たちは次のことがわかります



* ① ClickHouseは3,609グラニュール（トレースログにマークとして表示される）を3つのデータ範囲から読み取る必要があります。
* ② 59のCPUコアを使用して、これは59の並行処理ストリームに分配されます—レーンごとに1つです。

また、[EXPLAIN](/sql-reference/statements/explain#explain-pipeline)句を使用して集約クエリの[物理演算子プラン](/academic_overview#4-2-multi-core-parallelization)—通称「クエリパイプライン」を検査できます：
```sql runnable=false
EXPLAIN PIPELINE
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple;
```

```txt
    ┌─explain───────────────────────────────────────────────────────────────────────────┐
 1. │ (式)                                                                            │
 2. │ ExpressionTransform × 59                                                          │
 3. │   (集約)                                                                         │
 4. │   Resize 59 → 59                                                                  │
 5. │     AggregatingTransform × 59                                                     │
 6. │       StrictResize 59 → 59                                                        │
 7. │         (式)                                                                      │
 8. │         ExpressionTransform × 59                                                  │
 9. │           (ReadFromMergeTree)                                                     │
10. │           MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread) × 59 0 → 1 │
    └───────────────────────────────────────────────────────────────────────────────────┘
```

注意: 上記の演算子プランは、下から上へ読み取ってください。各行は、ストレージからデータを読み取るのを開始点とし、最終的な処理ステップで終了します。`× 59`でマークされた演算子は、59の並行処理レーンにわたって重複のないデータ領域で同時に実行されます。これは`max_threads`の値を反映し、クエリの各ステージがCPUコアにわたってどのように並行化されているかを示しています。

ClickHouseの[埋め込まれたWeb UI](/interfaces/http)（/playエンドポイントで利用可能）は、上記の物理プランをグラフィカルな視覚化としてレンダリングできます。この例では、視覚化をコンパクトに保つため、`max_threads`を`4`に設定し、4つの並行処理レーンのみを表示します：

<Image img={visual05} alt="クエリパイプライン"/>

注意: 視覚化を左から右に読み取ってください。各行は、データをブロックごとにストリーミングし、フィルタリング、集約、最終処理ステップなどの変換を適用する並行処理レーンを表しています。この例では、`max_threads = 4`設定に対応する4つの並行レーンを確認できます。

### 処理レーン間の負荷分散 {#load-balancing-across-processing-lanes}

上記の物理プランの`Resize`演算子は、処理レーン間でデータブロックストリームを[再分割し再配布](/academic_overview#4-2-multi-core-parallelization)して均等に活用されるようにします。この再バランス処理は、データ範囲がクエリ述語に一致する行数で異なる場合には特に重要です。さもなければ、一部のレーンが過負荷になり、他のレーンがアイドル状態になるかもしれません。作業を再分配することで、より早いレーンが遅いものを効果的に助け、全体のクエリ実行時間を最適化します。

## なぜmax_threadsは常に尊重されないのか {#why-max-threads-isnt-always-respected}

上記のように、`n`の並行処理レーンの数は、デフォルトでサーバー上でClickHouseが利用できるCPUコア数に一致する`max_threads`設定によって制御されます：
```sql runnable=false
SELECT getSetting('max_threads');
```

```txt
   ┌─getSetting('max_threads')─┐
1. │                        59 │
   └───────────────────────────┘
```

ただし、処理のために選択したデータ量に応じて`max_threads`値が無視される場合があります：
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

上記の演算子プランの抜粋に示されているように、`max_threads`が`59`に設定されているにもかかわらず、ClickHouseはデータのスキャンに**30**の同時ストリームしか使用していません。

それではクエリを実行してみましょう：
```sql runnable=false
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
WHERE town = 'LONDON';
```

```txt
   ┌─max(price)─┐
1. │  594300000 │ -- 594.30百万円
   └────────────┘
   
1行がセットにあります。経過時間: 0.013秒。処理された行: 2.31百万行、13.66 MB (173.12百万行/秒、1.02 GB/秒)。
ピークメモリ使用量: 27.24 MiB。   
```

出力で示されているように、クエリは2.31百万行を処理し、13.66MBのデータを読み取りました。これは、インデックス分析フェーズ中にClickHouseが**282グラニュール**を処理のために選択したためです。各グラニュールには8,192行が含まれ、合計で約2.31百万行となります：

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
 3. │     Expression (GROUP BYの前)                            │
 4. │       式                                                │
 5. │         ReadFromMergeTree (uk.uk_price_paid_simple)   │
 6. │         インデックス:                                  │
 7. │           主キー                                      │
 8. │             キー:                                     │
 9. │               town                                    │
10. │             条件: (town in ['LONDON', 'LONDON']) │
11. │             パーツ: 3/3                                │
12. │             グラニュール: 282/3609                    │
    └───────────────────────────────────────────────────────┘  
```

設定された`max_threads`値にかかわらず、ClickHouseは十分なデータがない場合追加の並行処理レーンを割り当てません。`max_threads`の「max」は上限を示すものであり、使用されるスレッド数が保証されるわけではありません。

「十分なデータ」とは何かは、主にそれぞれの処理レーンが処理すべき行数の最小限（デフォルトは163,840）と最小バイト数（デフォルトは2,097,152）で決定されます：

共有なしのクラスター用:
* [merge_tree_min_rows_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read)
* [merge_tree_min_bytes_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read)

共有ストレージがあるクラスター用（例：ClickHouse Cloud）:
* [merge_tree_min_rows_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem)
* [merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem)

さらに、読み取りタスクサイズには厳しい下限があり、以下で制御されています：
* [Merge_tree_min_read_task_size](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_read_task_size) + [merge_tree_min_bytes_per_task_for_remote_reading](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_per_task_for_remote_reading)

:::warning これらの設定を変更しないでください
これらの設定を本番環境で変更することはお勧めしません。これらは、`max_threads`が常に実際の並行性レベルを決定しない理由を示すためにのみここに示されています。
:::

デモ目的で、これらの設定を上書きして最大の同時実行性を強制するために物理プランを検査しましょう：
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

これでClickHouseはデータをスキャンするために59の同時ストリームを使用し、設定された`max_threads`に完全に従います。

これは、小さなデータセットに対するクエリにおいて、ClickHouseが意図的に同時実行性を制限することを示しています。設定の上書きはテスト用のみ使用し、本番環境では利用しないでください。このような変更は非効率的な実行やリソース競合を引き起こす可能性があります。

## 主なポイント {#key-takeaways}

* ClickHouseは`max_threads`に関連付けられた処理レーンを使用してクエリを並行化します。
* 実際のレーンの数は、処理のために選択されたデータのサイズに依存します。
* `EXPLAIN PIPELINE`とトレースログを使用してレーン使用状況を分析します。

## さらなる情報を見つけるには {#where-to-find-more-information}

ClickHouseがクエリを並行して実行する方法や、スケールアップ時に高性能を達成する方法についてさらに深く探求したい場合は、以下のリソースを参照してください：

* [クエリ処理層 – VLDB 2024 論文 (Web版)](/academic_overview#4-query-processing-layer) - ClickHouseの内部実行モデルに関する詳細な説明で、スケジューリング、パイプライン、演算子設計を含みます。

* [部分集約状態の説明](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization) - 部分集約状態が処理レーンの並行実行を効率的に可能にする方法に関する技術的な深掘り。

* ClickHouseのクエリ処理ステップを詳細に解説したビデオチュートリアル：
<iframe width="1024" height="576" src="https://www.youtube.com/embed/hP6G2Nlz_cA?si=Imd_i427J_kZOXHe" title="YouTube ビデオプレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
