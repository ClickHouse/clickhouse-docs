---
slug: /merges
title: 部分マージ
description: ClickHouseにおける部分マージとは何か
keywords: [merges]
---

import merges_01 from '@site/static/images/managing-data/core-concepts/merges_01.png';
import merges_02 from '@site/static/images/managing-data/core-concepts/merges_02.png';
import merges_03 from '@site/static/images/managing-data/core-concepts/merges_03.png';
import merges_04 from '@site/static/images/managing-data/core-concepts/merges_04.png';
import merges_05 from '@site/static/images/managing-data/core-concepts/merges_05.png';
import merges_06 from '@site/static/images/managing-data/core-concepts/merges_06.png';
import merges_07 from '@site/static/images/managing-data/core-concepts/merges_07.png';
import merges_dashboard from '@site/static/images/managing-data/core-concepts/merges-dashboard.gif';

## ClickHouseにおける部分マージとは何か？ {#what-are-part-merges-in-clickhouse}

<br/>

ClickHouse [は高速です](/concepts/why-clickhouse-is-so-fast) ただクエリだけでなく挿入にも、高速なストレージレイヤーのおかげで、[LSMツリー](https://en.wikipedia.org/wiki/Log-structured_merge-tree)に類似した動作をします:

① [MergeTreeエンジン](/engines/table-engines/mergetree-family)ファミリーのテーブルへの挿入は、ソートされた不変の[データパーツ](/parts)を作成します。

② すべてのデータ処理は**バックグラウンド部分マージ**にオフロードされます。

これにより、データの書き込みが軽量かつ[非常に効率的](/concepts/why-clickhouse-is-so-fast#storage-layer-concurrent-inserts-are-isolated-from-each-other)になります。

テーブルあたりのパーツの数を制御し、上記の②を実現するために、ClickHouseは常に([パーティションごと](/partitions#per-partition-merges))、小さなパーツをより大きなものにバックグラウンドでマージし、圧縮サイズが約[~150 GB](/operations/settings/merge-tree-settings#max-bytes-to-merge-at-max-space-in-pool)に達するまで続けます。

以下の図は、このバックグラウンドマージプロセスを概説しています:

<img src={merges_01} alt='PART MERGES' class='image' />
<br/>

パーツの`merge level`は、各追加のマージごとに1ずつ増加します。`0`のレベルは、パーツが新しく、まだマージされていないことを意味します。より大きなパーツにマージされたパーツは、[非アクティブ](/operations/system-tables/parts)としてマークされ、最終的には[設定可能な](/operations/settings/merge-tree-settings#old-parts-lifetime)時間（デフォルトで8分）後に削除されます。時間が経つにつれて、これは**マージされたパーツの木**を作成します。したがって、名前は[マージツリーテーブル](/engines/table-engines/mergetree-family)です。

## マージの監視 {#monitoring-merges}

[テーブルパーツとは何か](/parts)の例では、[テーブルパーツを監視する](/parts#monitoring-table-parts)ことを示しましたが、ClickHouseはすべてのテーブルパーツを[parts](/operations/system-tables/parts)システムテーブルで追跡します。次のクエリを使用して、例のテーブルのアクティブパーツごとのマージレベルと格納された行数を取得しました:
```sql
SELECT
    name,
    level,
    rows
FROM system.parts
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple') AND active
ORDER BY name ASC;
```

[以前に文書化された](/parts#monitoring-table-parts)クエリの結果は、例のテーブルには4つのアクティブパーツがあり、各パーツは最初に挿入されたパーツの単一のマージから作成されたことを示しています:
```response
   ┌─name────────┬─level─┬────rows─┐
1. │ all_0_5_1   │     1 │ 6368414 │
2. │ all_12_17_1 │     1 │ 6442494 │
3. │ all_18_23_1 │     1 │ 5977762 │
4. │ all_6_11_1  │     1 │ 6459763 │
   └─────────────┴───────┴─────────┘
```

[現在実行中](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results)のクエリは、4つのパーツが最終的な単一パーツにマージされたことを示しています（テーブルにさらなる挿入がなければ）:

```response
   ┌─name───────┬─level─┬─────rows─┐
1. │ all_0_23_2 │     2 │ 25248433 │
   └────────────┴───────┴──────────┘
```

ClickHouse 24.10では、組み込みの[監視ダッシュボード](https://clickhouse.com/blog/common-issues-you-can-solve-using-advanced-monitoring-dashboards)に新しい[マージダッシュボード](https://presentations.clickhouse.com/2024-release-24.10/index.html#17)が追加されました。OSSおよびCloudの両方で利用可能で、`/merges` HTTPハンドラーを介して、例のテーブルのすべての部分マージを視覚化できます:

<img src={merges_dashboard} alt='PART MERGES' class='image' />
<br/>

上記の記録されたダッシュボードは、初期データの挿入から最終的な単一パーツへのマージまでの全プロセスをキャッチします:

① アクティブパーツの数。

② パーツマージ、ボックスで視覚的に表現（サイズはパーツサイズを反映）。

③ [書き込み増幅](https://en.wikipedia.org/wiki/Write_amplification)。

## 同時マージ {#concurrent-merges}

単一のClickHouseサーバーは、同時にパーツマージを実行するためにいくつかのバックグラウンド[マージスレッド](/operations/server-configuration-parameters/settings#background_pool_size)を使用します:

<img src={merges_02} alt='PART MERGES' class='image' />
<br/>

各マージスレッドはループを実行します:

① 次にマージするパーツを決定し、これらのパーツをメモリにロードします。

② メモリ内のパーツをより大きなパーツにマージします。

③ マージされたパーツをディスクに書き込みます。

①に戻る

CPUコアの数とRAMのサイズを増やすことで、バックグラウンドマージのスループットを向上させることができます。

## メモリ最適化マージ {#memory-optimized-merges}

ClickHouseは、[前の例](/merges#concurrent-merges)のように、マージされるすべてのパーツを一度にメモリにロードするわけではありません。いくつかの[要因](https://github.com/ClickHouse/ClickHouse/blob/bf37120c925ed846ae5cd72cd51e6340bebd2918/src/Storages/MergeTree/MergeTreeSettings.cpp#L210)に基づき、メモリ消費を削減するため（マージ速度を犠牲にして）、いわゆる[垂直マージ](https://github.com/ClickHouse/ClickHouse/blob/bf37120c925ed846ae5cd72cd51e6340bebd2918/src/Storages/MergeTree/MergeTreeSettings.cpp#L209)は、ブロック単位でパーツをロードしてマージします。

## マージメカニクス {#merge-mechanics}

以下の図は、ClickHouseの単一バックグラウンド[マージスレッド](/merges#concurrent-merges)がパーツをどのようにマージするかを示しています（デフォルトでは[垂直マージ](/merges#memory-optimized-merges)なしで）:

<img src={merges_03} alt='PART MERGES' class='image' />
<br/>

パーツのマージは数段階で行われます:

**① デコンプレッション & ロード**: マージされるパーツからの[圧縮されたバイナリカラムファイル](/parts#what-are-table-parts-in-clickhouse)がデコンプレッションされ、メモリにロードされます。

**② マージ**: データはより大きなカラムファイルにマージされます。

**③ インデクシング**: マージされたカラムファイルのために新しい[sparse primary index](/guides/best-practices/sparse-primary-indexes)が生成されます。

**④ 圧縮 & ストレージ**: 新しいカラムファイルとインデックスが[圧縮](/sql-reference/statements/create/table#column_compression_codec)され、マージされたデータパーツを表す新しい[ディレクトリ](/parts#what-are-table-parts-in-clickhouse)に保存されます。

セカンダリデータスキッピングインデックス、カラム統計、チェックサム、最小最大インデックスなど、データパーツ内の追加[メタデータ](/parts)も、マージされたカラムファイルに基づいて再作成されます。簡潔にするために、これらの詳細は省略しました。

ステップ②のメカニクスは、使用される特定の[MergeTreeエンジン](/engines/table-engines/mergetree-family)に依存し、エンジンごとにマージ方法が異なります。たとえば、行は集約されたり、古い場合は置き換えられることがあります。先に述べたように、このアプローチはすべてのデータ処理をバックグラウンドマージにオフロードし、**軽量で効率的な書き込み操作を維持することにより、**超高速挿入**を可能にします。

次に、MergeTreeファミリーの特定のエンジンのマージメカニクスを簡単に概説します。

### 標準マージ {#standard-merges}

以下の図は、標準の[MergeTree](/engines/table-engines/mergetree-family/mergetree)テーブルでパーツがどのようにマージされるかを示しています:

<img src={merges_04} alt='PART MERGES' class='image' />
<br/>

上の図のDDLステートメントは、ソートキー`(town, street)`を持つ`MergeTree`テーブルを作成します。これは、ディスク上のデータがこれらのカラムでソートされ、対応するようにスパースプライマリインデックスが生成されることを意味します。

① デコンプレッションされ、事前にソートされたテーブルカラムが、② マージされながらテーブルのソートキーによって定義されたグローバルソート順序を保持します。③ 新しいスパースプライマリインデックスが生成され、④ マージされたカラムファイルとインデックスが圧縮されてディスク上に新しいデータパーツとして保存されます。

### 置換マージ {#replacing-merges}

[ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)テーブルの部分マージは、[標準マージ](/merges#standard-merges)と同様に機能しますが、各行の最も最近のバージョンのみが保持され、古いバージョンは破棄されます:

<img src={merges_05} alt='PART MERGES' class='image' />
<br/>

上の図のDDLステートメントは、ソートキー`(town, street, id)`を持つ`ReplacingMergeTree`テーブルを作成します。これは、ディスク上のデータがこれらのカラムでソートされ、対応するようにスパースプライマリインデックスが生成されることを意味します。

② マージは、標準の`MergeTree`テーブルと同様に作業し、デコンプレッションされ、事前にソートされたカラムを結合しながらグローバルソート順序を保持します。

ただし、`ReplacingMergeTree`は、同じソートキーを持つ重複行を削除し、そのパーツの生成タイムスタンプに基づいて最も最近の行のみを保持します。

<br/>

### 合計マージ {#summing-merges}

数値データは、[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)テーブルのパーツのマージ中に自動的に集約されます:

<img src={merges_06} alt='PART MERGES' class='image' />
<br/>

上の図のDDLステートメントは、ソートキーとして`town`を持つ`SummingMergeTree`テーブルを定義し、これはディスク上でこのカラムによってデータがソートされ、対応するようにスパースプライマリインデックスが作成されることを意味します。

② のマージステップでは、ClickHouseは同じソートキーを持つすべての行を単一の行と置き換え、数値カラムの値を合計します。

### 集約マージ {#aggregating-merges}

上記の`SummingMergeTree`テーブルの例は、[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)テーブルの専門的なバリアントであり、パーツのマージ中に[90+](/sql-reference/aggregate-functions/reference)の集約関数のいずれかを適用することによって、[自動的な増分データ変換](https://www.youtube.com/watch?v=QDAJTKZT8y4)を可能にします:

<img src={merges_07} alt='PART MERGES' class='image' />
<br/>

上の図のDDLステートメントは、ソートキーとして`town`を持つ`AggregatingMergeTree`テーブルを作成し、ディスク上でこのカラムによってデータが順序付けされ、対応するスパースプライマリインデックスが生成されることを保証します。

② のマージ中に、ClickHouseは同じソートキーを持つすべての行を単一の行に置き換え、[部分的集約状態](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization)（例: `sum`と`count`を`avg()`のために）を格納します。これらの状態は、増分バックグラウンドマージを通じて正確な結果を保証します。
