---
slug: /parts
title: 'テーブルパーツ'
description: 'ClickHouse におけるデータパーツとは何か'
keywords: ['part']
doc_type: 'reference'
---

import merges from '@site/static/images/managing-data/core-concepts/merges.png';
import part from '@site/static/images/managing-data/core-concepts/part.png';
import Image from '@theme/IdealImage';


## ClickHouseにおけるテーブルパーツとは？ {#what-are-table-parts-in-clickhouse}

<br />

ClickHouseの[MergeTreeエンジンファミリー](/engines/table-engines/mergetree-family)における各テーブルのデータは、不変の`データパーツ`の集合としてディスク上に構成されます。

これを説明するために、英国で販売された不動産の日付、町、通り、価格を記録する[このテーブル](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGU&run_query=true&tab=results)（[英国不動産価格データセット](/getting-started/example-datasets/uk-price-paid)から改変）を使用します：

```sql
CREATE TABLE uk.uk_price_paid_simple
(
    date Date,
    town LowCardinality(String),
    street LowCardinality(String),
    price UInt32
)
ENGINE = MergeTree
ORDER BY (town, street);
```

このテーブルは、ClickHouse SQLプレイグラウンドで[クエリを実行](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZTs&run_query=true&tab=results)できます。

データパーツは、テーブルに行のセットが挿入されるたびに作成されます。次の図はこれを示しています：

<Image img={part} size='lg' />

<br />

ClickHouseサーバーが上図に示された4行の挿入例（例：[INSERT INTO文](/sql-reference/statements/insert-into)経由）を処理する際、以下のステップを実行します：

① **ソート**: 行はテーブルの^^ソートキー^^ `(town, street)`によってソートされ、ソートされた行に対して[スパースプライマリインデックス](/guides/best-practices/sparse-primary-indexes)が生成されます。

② **分割**: ソートされたデータは列に分割されます。

③ **圧縮**: 各列は[圧縮](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)されます。

④ **ディスクへの書き込み**: 圧縮された列は、挿入のデータパーツを表す新しいディレクトリ内にバイナリ列ファイルとして保存されます。スパースプライマリインデックスも圧縮され、同じディレクトリに格納されます。

テーブルの特定のエンジンに応じて、ソートと並行して追加の変換が[行われる場合があります](/operations/settings/settings)。

データ^^パーツ^^は自己完結型であり、中央カタログを必要とせずにその内容を解釈するために必要なすべてのメタデータを含んでいます。スパースプライマリインデックスに加えて、^^パーツ^^にはセカンダリ[データスキッピングインデックス](/optimize/skipping-indexes)、[列統計](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere)、チェックサム、最小最大インデックス（[パーティショニング](/partitions)が使用されている場合）、および[その他](https://github.com/ClickHouse/ClickHouse/blob/a065b11d591f22b5dd50cb6224fab2ca557b4989/src/Storages/MergeTree/MergeTreeData.h#L104)の追加メタデータが含まれています。


## パートのマージ {#part-merges}

テーブルごとの^^パート^^数を管理するため、[バックグラウンドマージ](/merges)ジョブが定期的に小さな^^パート^^を大きなものに結合し、[設定可能な](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)圧縮サイズ(通常は約150 GB)に達するまで処理を行います。マージされた^^パート^^は非アクティブとしてマークされ、[設定可能な](/operations/settings/merge-tree-settings#old_parts_lifetime)時間間隔の後に削除されます。時間の経過とともに、このプロセスはマージされた^^パート^^の階層構造を作成します。これが^^MergeTree^^テーブルと呼ばれる理由です:

<Image img={merges} size='lg' />

<br />

初期^^パート^^数とマージのオーバーヘッドを最小限に抑えるため、データベースクライアントは、タプルを一括挿入する(例: 一度に20,000行)か、[非同期挿入モード](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)を使用することが[推奨](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)されています。非同期挿入モードでは、ClickHouseが同じテーブルへの複数の受信INSERT文から行をバッファリングし、バッファサイズが設定可能な閾値を超えるか、タイムアウトが発生した後にのみ新しいパートを作成します。


## テーブルパートの監視 {#monitoring-table-パート}

[仮想カラム](/engines/table-engines#table_engines-virtual_columns) `_part` を使用することで、サンプルテーブルの現在存在するすべてのアクティブな^^パート^^のリストを[クエリ](https://sql.clickhouse.com/?query=U0VMRUNUIF9wYXJ0CkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKR1JPVVAgQlkgX3BhcnQKT1JERVIgQlkgX3BhcnQgQVNDOw&run_query=true&tab=results)できます:

```sql
SELECT _part
FROM uk.uk_price_paid_simple
GROUP BY _part
ORDER BY _part ASC;

   ┌─_part───────┐
1. │ all_0_5_1   │
2. │ all_12_17_1 │
3. │ all_18_23_1 │
4. │ all_6_11_1  │
   └─────────────┘
```

上記のクエリは、ディスク上のディレクトリ名を取得します。各ディレクトリはテーブルのアクティブなデータパートを表しています。これらのディレクトリ名の構成要素には特定の意味があり、詳細については[こちら](https://github.com/ClickHouse/ClickHouse/blob/f90551824bb90ade2d8a1d8edd7b0a3c0a459617/src/Storages/MergeTree/MergeTreeData.h#L130)に文書化されています。

また、ClickHouseは[system.パート](/operations/system-tables/パート)システムテーブルですべてのテーブルのすべての^^パート^^の情報を追跡しており、以下のクエリは上記のサンプルテーブルについて、現在アクティブなすべての^^パート^^のリスト、それらのマージレベル、およびこれらの^^パート^^に格納されている行数を[返します](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results):

```sql
SELECT
    name,
    level,
    rows
FROM system.パート
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple') AND active
ORDER BY name ASC;

   ┌─name────────┬─level─┬────rows─┐
1. │ all_0_5_1   │     1 │ 6368414 │
2. │ all_12_17_1 │     1 │ 6442494 │
3. │ all_18_23_1 │     1 │ 5977762 │
4. │ all_6_11_1  │     1 │ 6459763 │
   └─────────────┴───────┴─────────┘
```

マージレベルは、パートに対する追加のマージごとに1ずつ増加します。レベル0は、まだマージされていない新しいパートであることを示します。
