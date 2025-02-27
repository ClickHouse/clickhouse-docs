---
slug: /merges
title: パーツのマージ
description: ClickHouseにおけるパーツのマージとは
keywords: [マージ]
---


import Merges_01 from '@site/static/images/managing-data/core-concepts/merges_01.png';
import Merges_02 from '@site/static/images/managing-data/core-concepts/merges_02.png';
import Merges_03 from '@site/static/images/managing-data/core-concepts/merges_03.png';
import Merges_04 from '@site/static/images/managing-data/core-concepts/merges_04.png';
import Merges_05 from '@site/static/images/managing-data/core-concepts/merges_05.png';
import Merges_06 from '@site/static/images/managing-data/core-concepts/merges_06.png';
import Merges_07 from '@site/static/images/managing-data/core-concepts/merges_07.png';
import MergesDashboard from '@site/static/images/managing-data/core-concepts/merges-dashboard.gif';


## ClickHouseにおけるパーツのマージとは？ {#what-are-part-merges-in-clickhouse}

<br/>

ClickHouseは、[クエリ](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf)だけでなく、[ストレージレイヤー](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf)のおかげで挿入でも高速です。このストレージレイヤーは、[LSMツリー](https://en.wikipedia.org/wiki/Log-structured_merge-tree)と似たような方法で動作します。

① MergeTreeエンジンファミリーのテーブルへの挿入は、ソートされた不変の[データパーツ](/parts)を作成します。

② すべてのデータ処理は、**バックグラウンドパーツマージ**にオフロードされます。

これにより、データの書き込みが軽量で、[非常に効率的](https://concepts/why-clickhouse-is-so-fast#storage-layer-concurrent-inserts-are-isolated-from-each-other)になります。

テーブルごとのパーツ数を制御し、上記の②を実施するために、ClickHouseはバックグラウンドで小さなパーツをより大きなパーツに継続的にマージします（[パーティションごとに](/partitions#per-partition-merges)） 、圧縮サイズが約[~150 GB](/operations/settings/merge-tree-settings#max-bytes-to-merge-at-max-space-in-pool)に達するまでです。

以下の図は、このバックグラウンドマージプロセスを概説しています：

<img src={Merges_01} alt='PART MERGES' class='image' />
<br/>

パーツの`merge level`は、各追加マージごとに1ずつ増加します。`0`のレベルは、パーツが新しいものであり、まだマージされていないことを意味します。より大きなパーツにマージされたパーツは[非アクティブ](/operations/system-tables/parts)としてマークされ、最終的に[設定可能](https://operations/settings/merge-tree-settings#old-parts-lifetime)な時間（デフォルトで8分）後に削除されます。これにより、時間の経過と共にマージされたパーツの**ツリー**が作成されます。これが[マージツリー](/engines/table-engines/mergetree-family)テーブルの名前の由来です。

## マージの監視 {#monitoring-merges}

[テーブルパーツとは](/parts)の例では、ClickHouseが[parts](/operations/system-tables/parts)システムテーブル内のすべてのテーブルパーツを追跡していることを[示しました](/parts#monitoring-table-parts)。以下のクエリを使用して、例のテーブルのアクティブな各パーツのマージレベルと保存された行数を取得しました：
```sql
SELECT
    name,
    level,
    rows
FROM system.parts
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple') AND active
ORDER BY name ASC;
```

[以前に文書化された](/parts#monitoring-table-parts)クエリの結果は、例のテーブルにアクティブなパーツが4つあり、それぞれが最初に挿入されたパーツの単一のマージから作成されたことを示しています：
```response
   ┌─name────────┬─level─┬────rows─┐
1. │ all_0_5_1   │     1 │ 6368414 │
2. │ all_12_17_1 │     1 │ 6442494 │
3. │ all_18_23_1 │     1 │ 5977762 │
4. │ all_6_11_1  │     1 │ 6459763 │
   └─────────────┴───────┴─────────┘
```

現在クエリを[実行](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results)すると、4つのパーツはすでに単一の最終パーツにマージされていることが示されます（テーブルに更なる挿入がない限り）：
```response
   ┌─name───────┬─level─┬─────rows─┐
1. │ all_0_23_2 │     2 │ 25248433 │
   └────────────┴───────┴──────────┘
```

ClickHouse 24.10では、新しい[マージダッシュボード](https://presentations.clickhouse.com/2024-release-24.10/index.html#17)が組み込みの[モニタリングダッシュボード](https://clickhouse.com/blog/common-issues-you-can-solve-using-advanced-monitoring-dashboards)に追加されました。OSSおよびクラウドの両方で使用可能で、`/merges`HTTPハンドラを通じて、例のテーブルのすべてのパーツマージを視覚化できます：

<img src={MergesDashboard} alt='PART MERGES' class='image' />
<br/>

上記の記録されたダッシュボードは、初期データの挿入から、単一のパーツへの最終的なマージまでの全プロセスを捉えています：

① アクティブパーツの数。

② パーツマージ、ボックスで視覚的に表現されており（サイズはパーツサイズを反映）。

③ [書き込み増幅](https://en.wikipedia.org/wiki/Write_amplification)。

## 同時マージ {#concurrent-merges}

単一のClickHouseサーバーは、同時のパーツマージを実行するために、いくつかのバックグラウンド[マージスレッド](/operations/server-configuration-parameters/settings#background_pool_size)を使用します：

<img src={Merges_02} alt='PART MERGES' class='image' />
<br/>

各マージスレッドはループを実行します：

① 次にマージするパーツを決定し、これらのパーツをメモリに読み込みます。

② メモリ内でパーツをマージして、より大きなパーツを作成します。

③ マージされたパーツをディスクに書き込みます。

①へ進む

CPUコアの数とRAMのサイズを増やすことで、バックグラウンドマージのスループットを向上させることができることに注意してください。

## メモリ最適化されたマージ {#memory-optimized-merges}

ClickHouseは、すべてのマージされるパーツを一度にメモリにロードするわけではありません。[以前の例](/merges#concurrent-merges)に概説されているように、複数の[要因](https://github.com/ClickHouse/ClickHouse/blob/bf37120c925ed846ae5cd72cd51e6340bebd2918/src/Storages/MergeTree/MergeTreeSettings.cpp#L210)に基づき、メモリ消費を減らすために（マージ速度を犠牲にして）、いわゆる[垂直マージ](https://github.com/ClickHouse/ClickHouse/blob/bf37120c925ed846ae5cd72cd51e6340bebd2918/src/Storages/MergeTree/MergeTreeSettings.cpp#L209)はパーツをチャンクブロックごとにロードしてマージします。

## マージメカニクス {#merge-mechanics}

以下の図は、ClickHouseにおける単一のバックグラウンド[マージスレッド](/merges#concurrent-merges)がどのようにパーツをマージするかを示しています（デフォルトでは[垂直マージ](/merges#memory-optimized-merges)なし）：

<img src={Merges_03} alt='PART MERGES' class='image' />
<br/>

パーツのマージは以下のいくつかのステップで実行されます：

**① 解凍とロード**: マージされるパーツから[圧縮されたバイナリカラムファイル](/parts#what-are-table-parts-in-clickhouse)が解凍され、メモリにロードされます。

**② マージ**: データがより大きなカラムファイルにマージされます。

**③ インデクシング**: マージされたカラムファイルに対して新しい[sparse primary index](/optimize/sparse-primary-indexes)が生成されます。

**④ 圧縮と保存**: 新しいカラムファイルとインデックスが[圧縮](/sql-reference/statements/create/table#column_compression_codec)され、マージされたデータパーツを表す新しい[ディレクトリ](/parts#what-are-table-parts-in-clickhouse)に保存されます。

追加の[データパーツ内のメタデータ](/parts)、例えば二次データスキッピングインデックス、カラム統計、チェックサム、および最小最大インデックスも、マージされたカラムファイルに基づいて再生成されます。簡潔さのためにこれらの詳細は省略しました。

ステップ②のメカニクスは、使用される特定の[MergeTreeエンジン](/engines/table-engines/mergetree-family)に依存します。異なるエンジンはマージの処理を異なって行います。たとえば、古い行は集約または置き換えられる場合があります。前述の通り、このアプローチは**すべてのデータ処理をバックグラウンドマージにオフロードし**、**スーパーファストな挿入**を可能にします。これにより、書き込み操作が軽量で効率的に保たれます。

次に、MergeTreeファミリー内の特定のエンジンのマージメカニクスを簡単に概説します。


### 標準マージ {#standard-merges}

以下の図は、標準の[MergeTree](/engines/table-engines/mergetree-family/mergetree)テーブルでのパーツのマージがどのように行われるかを示しています：

<img src={Merges_04} alt='PART MERGES' class='image' />
<br/>

上記の図のDDLステートメントは、ソートキー`(town, street)`を持つ`MergeTree`テーブルを作成します。[つまり](/parts#what-are-table-parts-in-clickhouse)ディスク上のデータはこれらのカラムでソートされ、その結果としてスパースプライマリインデックスが生成されます。

① 解凍された、事前にソートされたテーブルカラムは、② テーブルのソートキーによって定義されるテーブルのグローバルソート順を保持しながらマージされ、③ 新しいスパースプライマリインデックスが生成され、④ マージされたカラムファイルとインデックスが圧縮され、新しいデータパーツとしてディスクに保存されます。

### 置き換えマージ {#replacing-merges}

[ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)テーブルのパーツマージは[標準マージ](/merges#standard-merges)と同様に機能しますが、各行の最新のバージョンのみが保持され、古いバージョンは廃棄されます：

<img src={Merges_05} alt='PART MERGES' class='image' />
<br/>

上記の図のDDLステートメントは、ソートキー`(town, street, id)`を持つ`ReplacingMergeTree`テーブルを作成します。これは、ディスク上のデータがこれらのカラムでソートされ、その結果としてスパースプライマリインデックスが生成されることを意味します。

② マージは、解凍され事前にソートされたカラムを統合しながら、グローバルラリスト順を保持するように標準の`MergeTree`テーブルと同様に機能します。

ただし、`ReplacingMergeTree`は同じソートキーを持つ重複行を削除し、含まれるパーツの作成タイムスタンプに基づいて最新の行のみを保持します。

<br/>

### 合計マージ {#summing-merges}

数値データは、[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)テーブルのパーツのマージ中に自動的に要約されます：

<img src={Merges_06} alt='PART MERGES' class='image' />
<br/>

上記の図のDDLステートメントは、`town`をソートキーとする`SummingMergeTree`テーブルを定義します。これは、ディスク上のデータがこのカラムでソートされ、その結果としてスパースプライマリインデックスが作成されることを意味します。

② マージステップで、ClickHouseは同じソートキーを持つすべての行を単一の行に置き換え、数値カラムの値を合計します。

### 集約マージ {#aggregating-merges}

上記の`SummingMergeTree`テーブルの例は、[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)テーブルの専門的なバリアントであり、パーツマージ中に任意の[90+](/sql-reference/aggregate-functions/reference)集約関数を適用することにより、[自動的なインクリメンタルデータ変換](https://www.youtube.com/watch?v=QDAJTKZT8y4)を可能にします：

<img src={Merges_07} alt='PART MERGES' class='image' />
<br/>

上記の図のDDLステートメントは、`town`をソートキーとする`AggregatingMergeTree`テーブルを作成し、ディスク上のデータがこのカラムによって順序付けされ、対応するスパースプライマリインデックスが生成されることを保証します。

② マージ中に、ClickHouseは同じソートキーを持つすべての行を単一の行に置き換え、[部分的集約状態](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization)を格納します（例えば、`avg()`のための`sum`および`count`）。これらの状態は、インクリメンタルなバックグラウンドマージを通じて正確な結果を確保します。
