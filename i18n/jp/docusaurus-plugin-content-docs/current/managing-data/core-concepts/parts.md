---
slug: /parts
title: テーブルのパーツ
description: ClickHouseにおけるデータパーツとは？
keywords: [part]
---

import merges from '@site/static/images/managing-data/core-concepts/merges.png';
import part from '@site/static/images/managing-data/core-concepts/part.png';

## ClickHouse におけるテーブルパーツとは？ {#what-are-table-parts-in-clickhouse}

<br/>

ClickHouse の [MergeTree エンジンファミリー](/engines/table-engines/mergetree-family) における各テーブルのデータは、変更不可能な `data parts` のコレクションとしてディスク上に整理されています。

これを示すために、イギリスの不動産価格データセットから適応した [この](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGU&run_query=true&tab=results) テーブルを使用します。このテーブルは、イギリスで販売された不動産の売買日、町、通り、価格を追跡しています：

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

このテーブルを [クエリ](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZTs&run_query=true&tab=results) することができます。

データパートは、行のセットがテーブルに挿入されるたびに作成されます。次の図はこれを概略しています：

<img src={part} alt='挿入処理' class='image' />
<br/>

ClickHouse サーバーが上記の図に描かれた4行の例の挿入を処理する際、以下のいくつかのステップを実行します：

① **ソート**: 行はテーブルのソートキー `(town, street)` でソートされ、ソートされた行に対して [スパース主キー](/guides/best-practices/sparse-primary-indexes) が生成されます。

② **分割**: ソートされたデータはカラムに分割されます。

③ **圧縮**: 各カラムは [圧縮されます](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。

④ **ディスクへの書き込み**: 圧縮されたカラムは、新しいディレクトリ内にバイナリカラムファイルとして保存されます。このディレクトリは挿入のデータパートを表します。スパース主キーも圧縮されて同じディレクトリに保存されます。

テーブルの特定のエンジンに応じて、ソートと共に追加の変換 [が行われる場合があります](/operations/settings/settings)。

データパートは自己完結型であり、その内容を解釈するために必要なすべてのメタデータを中央カタログなしで含みます。スパース主キーの他に、パートは追加のメタデータを含んでおり、例えば、セカンダリの [データスキッピングインデックス](/optimize/skipping-indexes)、[カラム統計](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere)、チェックサム、最小-最大インデックス（[パーティション](/partitions) が使用されている場合）、および [その他](https://github.com/ClickHouse/ClickHouse/blob/a065b11d591f22b5dd50cb6224fab2ca557b4989/src/Storages/MergeTree/MergeTreeData.h#L104) が含まれます。

## パートのマージ {#part-merges}

テーブルごとのパーツ数を管理するために、[バックグラウンドマージ](/merges) ジョブが定期的に小さなパーツを大きなものに結合し、[設定可能な](/operations/settings/merge-tree-settings#max-bytes-to-merge-at-max-space-in-pool)圧縮サイズ（通常は約150 GB）に達するまで行います。マージされたパーツは非アクティブとしてマークされ、[設定可能な](/operations/settings/merge-tree-settings#old-parts-lifetime) 時間間隔の後に削除されます。時間が経つにつれて、このプロセスはマージされたパーツの階層構造を生み出し、これが MergeTree テーブルと呼ばれる理由です：

<img src={merges} alt='パートマージ' class='image' />
<br/>

初期のパーツ数とマージのオーバーヘッドを最小限に抑えるために、データベースクライアントは [推奨されています](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance) 例えば、一度に20,000行のタプルを一括で挿入するか、[非同期挿入モード](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)を使用することです。このモードでは、ClickHouse は同じテーブルへの複数の受信挿入から行をバッファして、バッファサイズが設定可能な閾値を超えたとき、またはタイムアウトが切れたときにのみ新しいパートを作成します。

## テーブルパーツの監視 {#monitoring-table-parts}

[クエリ](https://sql.clickhouse.com/?query=U0VMRUNUIF9wYXJ0CkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKR1JPVVAgQlkgX3BhcnQKT1JERVIgQlkgX3BhcnQgQVNDOw&run_query=true&tab=results) を使用して、例のテーブルの現在存在するアクティブパーツのリストを取得することができます。ここでは [仮想カラム](/engines/table-engines#table_engines-virtual_columns) `_part` を使用します：

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
上記のクエリは、ディスク上のディレクトリ名を取得します。この各ディレクトリはテーブルのアクティブデータパートを表しています。これらのディレクトリ名の成分は特定の意味を持ち、詳細を探求したい方のために [こちら](https://github.com/ClickHouse/ClickHouse/blob/f90551824bb90ade2d8a1d8edd7b0a3c0a459617/src/Storages/MergeTree/MergeTreeData.h#L130) に文書化されています。

あるいは、ClickHouse はすべてのテーブルのすべてのパーツに関する情報を [system.parts](/operations/system-tables/parts) システムテーブルで追跡し、次のクエリは [返します](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results) 上記の例のテーブルのすべての現在のアクティブパーツ、そのマージレベル、これらのパーツに保存されている行数のリスト：

```sql
SELECT
    name,
    level,
    rows
FROM system.parts
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple') AND active
ORDER BY name ASC;


   ┌─name────────┬─level─┬────rows─┐
1. │ all_0_5_1   │     1 │ 6368414 │
2. │ all_12_17_1 │     1 │ 6442494 │
3. │ all_18_23_1 │     1 │ 5977762 │
4. │ all_6_11_1  │     1 │ 6459763 │
   └─────────────┴───────┴─────────┘
```
マージレベルは、パートに対する各追加のマージごとに1ずつ増加します。レベル0は、まだマージされていない新しいパートを示します。
