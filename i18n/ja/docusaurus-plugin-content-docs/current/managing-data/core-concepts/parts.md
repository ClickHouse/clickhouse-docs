---
slug: /parts
title: テーブルのパーツ
description: ClickHouseにおけるデータパーツとは
keywords: [part]
---

## ClickHouseにおけるテーブルパーツとは何ですか？ {#what-are-table-parts-in-clickhouse}

<br/>

ClickHouseの[MergeTreeエンジンファミリー](/engines/table-engines/mergetree-family)からの各テーブルのデータは、イミュータブルな`データパーツ`のコレクションとしてディスク上に整理されています。

これを説明するために、イギリスで販売された不動産の日時、町、通り、価格を追跡する[この](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGU&run_query=true&tab=results)テーブル（[UKプロパティ価格データセット](/getting-started/example-datasets/uk-price-paid)から適応）を使用します：

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

このテーブルを[クエリする](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZTs&run_query=true&tab=results)ことができます弊社のClickHouse SQL Playgroundで。

データパートは、行のセットがテーブルに挿入されるたびに作成されます。以下の図はこれを概略的に示しています：

<img src={require('./images/part.png').default} alt='INSERT PROCESSING' class='image' />
<br/>

ClickHouseサーバーが、上記の図に示された4行（例えば、[INSERT INTOステートメント](/sql-reference/statements/insert-into)を介して）を処理する際、いくつかのステップが実行されます：

① **ソーティング**: 行はテーブルのソーティングキー`(town, street)`によってソートされ、ソートされた行のための[スパース主インデックス](/optimize/sparse-primary-indexes)が生成されます。

② **スプリッティング**: ソートされたデータはカラムに分割されます。

③ **圧縮**: 各カラムは[圧縮](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)されます。

④ **ディスクへの書き込み**: 圧縮されたカラムは、新しいディレクトリ内にバイナリカラムファイルとして保存され、これが挿入のデータパートを表します。スパース主インデックスも圧縮され、同じディレクトリに保存されます。

テーブルの特定のエンジンによっては、ソーティングに加えて、追加の変換が[行われることがあります](/operations/settings/settings)。

データパーツは自己完結型であり、その内容を解釈するために必要なすべてのメタデータを含んでおり、中央カタログは不要です。スパース主インデックスの他に、パーツには追加のメタデータが含まれており、例えば、セカンダリの[データスキッピングインデックス](/optimize/skipping-indexes)、[カラム統計](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere)、チェックサム、min-maxインデックス（[パーティショニング](/partitions)が使用される場合）、および[その他](https://github.com/ClickHouse/ClickHouse/blob/a065b11d591f22b5dd50cb6224fab2ca557b4989/src/Storages/MergeTree/MergeTreeData.h#L104)があります。

## パートのマージ {#part-merges}

テーブルごとのパーツ数を管理するために、[バックグラウンドマージ](/merges)ジョブが定期的に小さなパーツを大きなものに統合し、[構成可能な](https://operations/settings/merge-tree-settings#max-bytes-to-merge-at-max-space-in-pool)圧縮サイズ（通常は約150GB）に達するまで続けます。マージされたパーツは非アクティブとしてマークされ、[構成可能な](https://operations/settings/merge-tree-settings#old-parts-lifetime)時間間隔の後に削除されます。時間が経つにつれて、このプロセスはマージされたパーツの階層構造を生成します。これがMergeTreeテーブルと呼ばれる所以です：

<img src={require('./images/merges.png').default} alt='PART MERGES' class='image' />
<br/>

初期パーツの数とマージのオーバーヘッドを最小限に抑えるために、データベースクライアントは、例えば一度に20,000行をバルク挿入することや、[非同期挿入モード](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)の使用が[推奨されています](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。このモードでは、ClickHouseが複数の入ってくるINSERTからの行を同じテーブルにバッファし、バッファサイズが構成可能な閾値を超えるか、タイムアウトが切れるまで新しいパートを作成しません。

## テーブルパーツの監視 {#monitoring-table-parts}

[クエリする](https://sql.clickhouse.com/?query=U0VMRUNUIF9wYXJ0CkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKR1JPVVAgQlkgX3BhcnQKT1JERVIgQlkgX3BhcnQgQVNDOw&run_query=true&tab=results)ことで、例のテーブルの現在存在するすべてのアクティブなパーツのリストを使用して、[仮想カラム](/engines/table-engines#table_engines-virtual_columns) `_part`を取得できます：

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
上記のクエリは、ディスク上のディレクトリ名を取得します。各ディレクトリはテーブルのアクティブなデータパートを表します。これらのディレクトリ名の構成要素には特定の意味があり、興味のある方は[こちら](https://github.com/ClickHouse/ClickHouse/blob/f90551824bb90ade2d8a1d8edd7b0a3c0a459617/src/Storages/MergeTree/MergeTreeData.h#L130)で文書化されています。

また、ClickHouseは、[system.parts](/operations/system-tables/parts)システムテーブル内のすべてのテーブルのすべてのパーツの情報を追跡しており、次のクエリが我々の例のテーブルに対し、現在のアクティブなパーツのリスト、そのマージレベル、およびこれらのパーツに保存されている行数を[返します](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results)：

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
マージレベルは、パートごとに追加のマージが行われるたびに1ずつ増加します。レベル0は、これはまだマージされていない新しいパートであることを示します。
