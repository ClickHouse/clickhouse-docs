---
slug: '/merges'
title: 'パーツのマージ'
description: 'ClickHouseにおけるパーツのマージとは何ですか'
keywords:
- 'merges'
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

## ClickHouseにおけるパートマージとは何ですか？ {#what-are-part-merges-in-clickhouse}

<br/>

ClickHouse [は高速](/concepts/why-clickhouse-is-so-fast) で、クエリだけでなく挿入も高速です。これは、[ストレージ層](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf) のおかげで、[LSMツリー](https://en.wikipedia.org/wiki/Log-structured_merge-tree) に似た方法で運用されます：

① [MergeTreeエンジン](/engines/table-engines/mergetree-family) ファミリーのテーブルに対する挿入は、ソートされた不変の [データパート](/parts) を作成します。

② すべてのデータ処理は、**バックグラウンドパートマージ** にオフロードされます。

これにより、データの書き込みが軽量であり、[非常に効率的](/concepts/why-clickhouse-is-so-fast#storage-layer-concurrent-inserts-are-isolated-from-each-other) になります。

テーブルごとのパートの数を制御し、上記の②を実装するために、ClickHouseはバックグラウンドで小さいパートを大きなパートに連続してマージします（[パーティションごとに](/partitions#per-partition-merges)）。これを、圧縮サイズが約 [~150 GB](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) に達するまで行います。

次の図はこのバックグラウンドマージプロセスを概説しています：

<Image img={merges_01} size="lg" alt='PART MERGES'/>

<br/>

パートの `merge level` は、各追加マージとともに1ずつ増加します。レベルが `0` の場合、そのパートは新しく、まだマージされていないことを意味します。大きなパートにマージされたパートは [非アクティブ](/operations/system-tables/parts) としてマークされ、最終的に [構成可能な](/operations/settings/merge-tree-settings#old_parts_lifetime) 時間（デフォルトで8分）経過後に削除されます。時間が経つにつれて、マージされたパートの **ツリー** が作成されます。これが [マージツリー](/engines/table-engines/mergetree-family) テーブルの名前の由来です。

## マージの監視 {#monitoring-merges}

[テーブルパートとは何か](/parts) の例では、ClickHouse が [parts](/operations/system-tables/parts) システムテーブルでテーブルパートをすべて追跡していることを [示しました](/parts#monitoring-table-parts)。次のクエリを使用して、例のテーブルのアクティブなパートごとのマージレベルと保存された行数を取得しました：
```sql
SELECT
    name,
    level,
    rows
FROM system.parts
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple') AND active
ORDER BY name ASC;

[以前文書化された](/parts#monitoring-table-parts) クエリの結果は、例のテーブルには4つのアクティブなパートがあり、それぞれが最初に挿入されたパートからの単一のマージで作成されたことを示しています：
```response
   ┌─name────────┬─level─┬────rows─┐
1. │ all_0_5_1   │     1 │ 6368414 │
2. │ all_12_17_1 │     1 │ 6442494 │
3. │ all_18_23_1 │     1 │ 5977762 │
4. │ all_6_11_1  │     1 │ 6459763 │
   └─────────────┴───────┴─────────┘

[実行中](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results) のクエリは、4つのパートがテーブルに対するさらなる挿入がない限り、1つの最終的なパートにマージされていることを示しています：

```response
   ┌─name───────┬─level─┬─────rows─┐
1. │ all_0_23_2 │     2 │ 25248433 │
   └────────────┴───────┴──────────┘

ClickHouse 24.10では、内蔵の [監視ダッシュボード](https://clickhouse.com/blog/common-issues-you-can-solve-using-advanced-monitoring-dashboards) に新しい [マージダッシュボード](https://presentations.clickhouse.com/2024-release-24.10/index.html#17) が追加されました。OSSとCloudの両方で `/merges` HTTPハンドラーを介して利用でき、例のテーブルのすべてのパートマージを視覚化するために使用できます：

<Image img={merges_dashboard} size="lg" alt='PART MERGES'/>

<br/>

上記に記録されたダッシュボードは、初期データ挿入から単一パートへの最終マージまでの全プロセスをキャプチャしています：

① アクティブなパートの数。

② 視覚的にボックス（サイズはパートのサイズを反映）で表されるパートマージ。

③ [書き込み増幅](https://en.wikipedia.org/wiki/Write_amplification)。

## 同時マージ {#concurrent-merges}

単一のClickHouseサーバーは、同時のパートマージを実行するために複数のバックグラウンド [マージスレッド](/operations/server-configuration-parameters/settings#background_pool_size) を使用します：

<Image img={merges_02} size="lg" alt='PART MERGES'/>

<br/>

各マージスレッドはループを実行します：

① 次にマージするパートを決定し、これらのパートをメモリにロードします。

② メモリ内のパートを大きなパートにマージします。

③ マージされたパートをディスクに書き込みます。

①に進む

CPUコアの数とRAMのサイズを増やすことで、バックグラウンドマージのスループットを向上させることができます。

## メモリ最適化されたマージ {#memory-optimized-merges}

ClickHouseは、必ずしもすべてのマージされるパートを一度にメモリにロードするわけではなく、[前の例](/merges#concurrent-merges) のように実行されます。いくつかの [要因](https://github.com/ClickHouse/ClickHouse/blob/bf37120c925ed846ae5cd72cd51e6340bebd2918/src/Storages/MergeTree/MergeTreeSettings.cpp#L210) に基づき、メモリ消費を減らすために（マージ速度を犠牲にしつつ）、いわゆる [垂直マージ](https://github.com/ClickHouse/ClickHouse/blob/bf37120c925ed846ae5cd72cd51e6340bebd2918/src/Storages/MergeTree/MergeTreeSettings.cpp#L209) では、パートをブロックのチャンクごとにロードしてマージします。

## マージメカニクス {#merge-mechanics}

以下の図は、ClickHouseにおける単一のバックグラウンド [マージスレッド](/merges#concurrent-merges) がどのようにパートをマージするかを示しています（デフォルトでは、[垂直マージ](/merges#memory-optimized-merges) なしで）：

<Image img={merges_03} size="lg" alt='PART MERGES'/>

<br/>

パートマージは以下のステップで実行されます：

**① デコｍプレスとロード**：マージされるパートからの [圧縮バイナリカラムファイル](/parts#what-are-table-parts-in-clickhouse) がデコｍプレスされ、メモリにロードされます。

**② マージ**：データが大きなカラムファイルにマージされます。

**③ インデックス作成**：マージされたカラムファイルのために新しい [スパース主インデックス](/guides/best-practices/sparse-primary-indexes) が生成されます。

**④ 圧縮と保存**：新しいカラムファイルとインデックスが [圧縮](/sql-reference/statements/create/table#column_compression_codec) され、マージされたデータパートを表す新しい [ディレクトリ](/parts#what-are-table-parts-in-clickhouse) に保存されます。

追加の [メタデータがデータパートに](/parts)、予備のデータスキッピングインデックス、カラム統計、チェックサム、最小値・最大値インデックスなどもマージされたカラムファイルに基づいて再作成されます。簡略化のためにこれらの詳細は省略しました。

ステップ②のメカニクスは、使用する特定の [MergeTreeエンジン](/engines/table-engines/mergetree-family) に依存します。なぜなら、異なるエンジンはマージを異なった方法で処理するからです。たとえば、行は集約されたり、古い場合は置き換えられたりすることがあります。前述のように、このアプローチは **すべてのデータ処理をバックグラウンドマージにオフロードし**、書き込み操作を軽量かつ効率的に保つことにより **超高速挿入** を可能にします。

次に、MergeTreeファミリーの特定のエンジンにおけるマージメカニクスを簡単に概説します。

### 標準マージ {#standard-merges}

以下の図は、標準 [MergeTree](/engines/table-engines/mergetree-family/mergetree) テーブルでパートがどのようにマージされるかを示しています：

<Image img={merges_04} size="lg" alt='PART MERGES'/>

<br/>

上記の図のDDLステートメントは、ソートキー `(town, street)` を持つ `MergeTree` テーブルを作成します。これは、ディスク上のデータがこれらのカラムによってソートされ、対応するスパース主インデックスが生成されることを意味します。

① デコンプレスされた事前ソート済みテーブルカラムは、② テーブルのソートキーによって定義されたグローバルソーティング順序を保持しながらマージされ、③ 新しいスパース主インデックスが生成され、④ マージされたカラムファイルとインデックスは圧縮され、ディスク上に新しいデータパートとして保存されます。

### 置き換えマージ {#replacing-merges}

[ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) テーブル内のパートマージは、[標準マージ](/merges#standard-merges) と似た方法で動作しますが、各行の最新バージョンのみが保持され、古いバージョンは破棄されます：

<Image img={merges_05} size="lg" alt='PART MERGES'/>

<br/>

上記の図のDDLステートメントは、ソートキー `(town, street, id)` を持つ `ReplacingMergeTree` テーブルを作成します。これは、ディスク上のデータがこれらのカラムによってソートされ、対応するスパース主インデックスが生成されることを意味します。

② のマージは、デコンプレスされた事前ソート済みのカラムをグローバルソーティング順序を保持しながら結合します。

ただし、`ReplacingMergeTree` は同じソートキーを持つ重複行を削除し、そのパートの作成タイムスタンプに基づいて最新の行のみを保持します。

<br/>

### 合計マージ {#summing-merges}

数値データは、[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) テーブルからパートのマージ中に自動的に要約されます：

<Image img={merges_06} size="lg" alt='PART MERGES'/>

<br/>

上記の図のDDLステートメントは、`town` をソートキーとして持つ `SummingMergeTree` テーブルを定義しています。これは、ディスク上のデータがこのカラムによってソートされ、対応するスパース主インデックスが作成されることを意味します。

② のマージステップでは、ClickHouseは同じソートキーを持つすべての行を単一の行に置き換え、数値カラムの値を合計します。

### 集約マージ {#aggregating-merges}

上記の `SummingMergeTree` テーブルの例は、[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) テーブルの特殊なバリアントであり、パートマージの際に [90+](/sql-reference/aggregate-functions/reference) の集約関数を適用することによって [自動的なインクリメンタルデータ変換](https://www.youtube.com/watch?v=QDAJTKZT8y4) を可能にします：

<Image img={merges_07} size="lg" alt='PART MERGES'/>

<br/>

上記の図のDDLステートメントは、ソートキーとして `town` を持つ `AggregatingMergeTree` テーブルを作成し、ディスク上のデータがこのカラムによって順序付けされ、対応するスパース主インデックスが生成されるようにします。

② のマージ中に、ClickHouseは同じソートキーを持つすべての行を単一の行に置き換え、[部分集約状態](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization) （例えば、`avg()` のための `sum` と `count`）を格納します。これらの状態は、インクリメンタルなバックグラウンドマージを通じて正確な結果を保証します。
