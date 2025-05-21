---
slug: /merges
title: 'パーツマージ'
description: 'ClickHouseにおけるパーツマージとは'
keywords: ['merges']
---

import merges_01 from '@site/static/images/managing-data/core-concepts/merges_01.png';
import merges_02 from '@site/static/images/managing-data/core-concepts/merges_02.png';
import merges_03 from '@site/static/images/managing-data/core-concepts/merges_03.png';
import merges_04 from '@site/static/images/managing-data/core-concepts/merges_04.png';
import merges_05 from '@site/static/images/managing-data/core-concepts/merges_05.png';
import merges_06 from '@site/static/images/managing-data/core-concepts/merges_06.png';
import merges_07 from '@site/static/images/managing-data/core-concepts/merges_07.png';
import merges_dashboard from '@site/static/images/managing-data/core-concepts/merges-dashboard.gif';
import Image from '@theme/IdealImage';


## ClickHouseにおけるパーツマージとは？ {#what-are-part-merges-in-clickhouse}

<br/>

ClickHouse [は高速です](/concepts/why-clickhouse-is-so-fast) クエリに対してだけでなく、挿入に対しても高速です。これは、[ストレージ層](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf) が [LSM木](https://en.wikipedia.org/wiki/Log-structured_merge-tree) と同様に動作するためです。

① [MergeTreeエンジン](/engines/table-engines/mergetree-family) ファミリーからのテーブルへの挿入は、ソートされた不変の [データパーツ](/parts) を作成します。

② すべてのデータ処理は **バックグラウンドパーツマージ** にオフロードされます。

これにより、データの書き込みが軽量かつ [非常に効率的](/concepts/why-clickhouse-is-so-fast#storage-layer-concurrent-inserts-are-isolated-from-each-other) になります。

テーブルごとのパーツ数を制御し、上記の②を実現するために、ClickHouseはバックグラウンドで小さなパーツを大きなパーツにマージし続け、最終的には約 [~150 GB](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) の圧縮サイズに到達します（[パーティションごと](/partitions#per-partition-merges)）。

以下の図は、バックグラウンドマージプロセスを示しています：

<Image img={merges_01} size="lg" alt='PART MERGES'/>

<br/>

パーツの `merge level` は、追加のマージごとに1ずつ増加します。レベル `0` は、そのパーツが新しく、まだマージされていないことを意味します。大きなパーツにマージされたパーツは [非アクティブ](/operations/system-tables/parts) としてマークされ、最終的に [設定可能な](/operations/settings/merge-tree-settings#old_parts_lifetime) 時間（デフォルトは8分）後に削除されます。時間が経つにつれて、これによりマージされたパーツの **木** が作成されます。したがって、[マージツリー](/engines/table-engines/mergetree-family) テーブルと呼ばれています。

## マージの監視 {#monitoring-merges}

[テーブルパーツとは](/parts) の例では、ClickHouseがすべてのテーブルパーツを [parts](/operations/system-tables/parts) システムテーブルで追跡していることを [示しました](/parts#monitoring-table-parts)。例のテーブルのアクティブパーツごとのマージレベルとストアされた行数を取得するために、以下のクエリを使用しました：
```sql
SELECT
    name,
    level,
    rows
FROM system.parts
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple') AND active
ORDER BY name ASC;
```

[以前文書化された](/parts#monitoring-table-parts) クエリの結果は、例のテーブルに4つのアクティブなパーツがあり、各々が元々挿入されたパーツからの単一のマージによって作成されたことを示しています：
```response
   ┌─name────────┬─level─┬────rows─┐
1. │ all_0_5_1   │     1 │ 6368414 │
2. │ all_12_17_1 │     1 │ 6442494 │
3. │ all_18_23_1 │     1 │ 5977762 │
4. │ all_6_11_1  │     1 │ 6459763 │
   └─────────────┴───────┴─────────┘
```

[クエリを実行する](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results) と、クエリが現在、4つのパーツが単一の最終パーツにマージされたことを示している（テーブルにさらに挿入がない限り）ことを示しています：

```response
   ┌─name───────┬─level─┬─────rows─┐
1. │ all_0_23_2 │     2 │ 25248433 │
   └────────────┴───────┴──────────┘
```

ClickHouse 24.10 では、新しい [マージダッシュボード](https://presentations.clickhouse.com/2024-release-24.10/index.html#17) が内蔵の [監視ダッシュボード](https://clickhouse.com/blog/common-issues-you-can-solve-using-advanced-monitoring-dashboards) に追加されました。OSS と Cloud の両方で、/merges HTTP ハンドラを使用して、例のテーブルのすべてのパーツマージを視覚化できます：

<Image img={merges_dashboard} size="lg" alt='PART MERGES'/>

<br/>

上記のダッシュボードは、初期データの挿入から単一パーツへの最終マージまでの全プロセスをキャプチャします。

① アクティブパーツの数。

② パーツマージは、視覚的にボックスで表現され（サイズはパーツサイズを反映）。

③ [書き込み増幅](https://en.wikipedia.org/wiki/Write_amplification)。

## 同時マージ {#concurrent-merges}

1つのClickHouseサーバーは、複数のバックグラウンドの [マージスレッド](/operations/server-configuration-parameters/settings#background_pool_size) を使用して、同時パーツマージを実行します：

<Image img={merges_02} size="lg" alt='PART MERGES'/>

<br/>

各マージスレッドはループを実行します。

① 次にどのパーツをマージするかを決定し、これらのパーツをメモリにロードします。

② メモリ内でパーツをマージして大きなパーツにします。

③ マージされたパーツをディスクに書き込みます。

①へ進む

CPUコアの数とRAMのサイズを増やすことで、バックグラウンドマージのスループットを増やすことができます。

## メモリ最適化マージ {#memory-optimized-merges}

ClickHouseは、[前の例](/merges#concurrent-merges) に示されているように、すべてのマージ対象パーツを一度にメモリにロードするわけではありません。いくつかの [要因](https://github.com/ClickHouse/ClickHouse/blob/bf37120c925ed846ae5cd72cd51e6340bebd2918/src/Storages/MergeTree/MergeTreeSettings.cpp#L210) に基づき、メモリ消費を減らすために（マージ速度を犠牲にして）、いわゆる [垂直マージ](https://github.com/ClickHouse/ClickHouse/blob/bf37120c925ed846ae5cd72cd51e6340bebd2918/src/Storages/MergeTree/MergeTreeSettings.cpp#L209) は、パーツを一度にマージするのではなく、ブロックのチャンクごとにロードしてマージします。

## マージメカニクス {#merge-mechanics}

以下の図は、ClickHouseの単一のバックグラウンド [マージスレッド](/merges#concurrent-merges) がパーツをマージする方法を示します（デフォルトでは、[垂直マージ](/merges#memory-optimized-merges) なしで）：

<Image img={merges_03} size="lg" alt='PART MERGES'/>

<br/>

パーツのマージは、いくつかのステップで実行されます。

**① 解凍とロード**: マージ対象パーツから [圧縮されたバイナリカラムファイル](/parts#what-are-table-parts-in-clickhouse) が解凍され、メモリにロードされます。

**② マージ**: データが大きなカラムファイルにマージされます。

**③ インデックス作成**: マージされたカラムファイルのための新しい [スパース主キー](/guides/best-practices/sparse-primary-indexes) が生成されます。

**④ 圧縮と保存**: 新しいカラムファイルとインデックスが [圧縮](/sql-reference/statements/create/table#column_compression_codec) され、マージされたデータパーツを表す新しい [ディレクトリ](/parts#what-are-table-parts-in-clickhouse) に保存されます。

追加の [メタデータ](https://clickhouse.com/docs/en/operations/system-tables/parts/#metadata-in-data-parts) は、マージされたカラムファイルに基づいて再作成されるため、スパース主キー、カラム統計、チェックサム、およびmin-maxインデックスも含まれます。これらの詳細は簡潔さのために省略しました。

ステップ②のメカニクスは、使用される特定の [MergeTreeエンジン](/engines/table-engines/mergetree-family) に依存します。異なるエンジンはマージ処理を異なる方法で処理します。たとえば行は集約または置き換えられることがあります。前述のように、このアプローチは **すべてのデータ処理をバックグラウンドマージにオフロードし** 、**超高速の挿入**を可能にします。これにより、書き込み操作が軽量かつ効率的に保たれます。

次に、MergeTreeファミリーの特定のエンジンのマージメカニクスについて簡単に説明します。

### 標準マージ {#standard-merges}

以下の図は、標準 [MergeTree](/engines/table-engines/mergetree-family/mergetree) テーブル内のパーツがどのようにマージされるかを示します：

<Image img={merges_04} size="lg" alt='PART MERGES'/>

<br/>

上の図のDDLステートメントは、ソートキー `(town, street)` を持つ `MergeTree` テーブルを作成します。この状態では、ディスク上のデータはこれらのカラムでソートされ、スパース主キーがそれに応じて生成されます。

① 解凍され、前もってソートされたテーブルカラムは、② テーブルのソートキーによって定義されたグローバルなソート順を保持しながらマージされ、③ 新しいスパース主キーが生成され、④ マージされたカラムファイルとインデックスは圧縮され、ディスク上の新しいデータパーツとして保存されます。

### 置き換えマージ {#replacing-merges}

[ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) テーブルにおけるパーツマージは、[標準マージ](/merges#standard-merges) と同様に動作しますが、各行の最新バージョンのみが保持され、古いバージョンは破棄されます：

<Image img={merges_05} size="lg" alt='PART MERGES'/>

<br/>

上の図のDDLステートメントは、ソートキー `(town, street, id)` を持つ `ReplacingMergeTree` テーブルを作成します。この状態では、ディスク上のデータはこれらのカラムでソートされ、スパース主キーがそれに応じて生成されます。

② マージ処理は、未圧縮かつ前もってソートされたカラムを、グローバルなソーティング順序を保持しながら結合するのと同様に機能します。

ただし、`ReplacingMergeTree` は同じソートキーを持つ重複行を削除し、その部分の作成時刻に基づいて最新の行のみを保持します。

<br/>

### 合計マージ {#summing-merges}

数値データは、[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) テーブルからのパーツのマージ中に自動的に集約されます：

<Image img={merges_06} size="lg" alt='PART MERGES'/>

<br/>

上の図のDDLステートメントは、`town` をソートキーとした `SummingMergeTree` テーブルを定義します。つまり、ディスク上のデータはこのカラムによってソートされ、スパース主キーがそれに応じて作成されます。

② マージのステップでは、ClickHouseは同じソートキーを持つすべての行を単一行に置き換え、数値カラムの値を合計します。

### 集約マージ {#aggregating-merges}

上記の `SummingMergeTree` テーブルの例は、[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) テーブルの専門的なバリアントであり、パーツマージ中に [90+](/sql-reference/aggregate-functions/reference) の集約関数を適用することにより、[自動増分データ変換](https://www.youtube.com/watch?v=QDAJTKZT8y4) を可能にします：

<Image img={merges_07} size="lg" alt='PART MERGES'/>

<br/>

上の図のDDLステートメントは、`town` をソートキーとした `AggregatingMergeTree` テーブルを作成し、データがディスク上でこのカラムによって順序付けされ、対応するスパース主キーが生成されます。

② マージ処理中に、ClickHouseは同じソートキーを持つすべての行を単一行に置き換え、[部分集約状態](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization)（例：`sum` と `count` を使って `avg()`）を格納します。これらの状態は、増分バックグラウンドマージを通じて正確な結果を保証します。
