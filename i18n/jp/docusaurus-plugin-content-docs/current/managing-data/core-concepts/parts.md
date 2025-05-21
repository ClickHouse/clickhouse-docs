---
slug: /parts
title: 'テーブルパーツ'
description: 'ClickHouseにおけるデータパーツとは'
keywords: ['part']
---


import merges from '@site/static/images/managing-data/core-concepts/merges.png';
import part from '@site/static/images/managing-data/core-concepts/part.png';
import Image from '@theme/IdealImage';

## ClickHouseにおけるテーブルパーツとは？ {#what-are-table-parts-in-clickhouse}

<br/>

ClickHouseの [MergeTreeエンジンファミリー](/engines/table-engines/mergetree-family) における各テーブルのデータは、不変の `data parts` の集合としてディスク上に整理されています。

これを説明するために、イギリスの不動産の売却価格、町、通り、日付を追跡する、[この](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGU&run_query=true&tab=results) テーブル（[UKの物件価格データセット](/getting-started/example-datasets/uk-price-paid)を基にした）を使用します：

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

このテーブルを[クエリ](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZTs&run_query=true&tab=results)することができます。

データパートは、行のセットがテーブルに挿入されるたびに作成されます。次の図はこれを概略的に示しています：

<Image img={part} size="lg"/>

<br/>

ClickHouseサーバーが上記の図で示された4行の例の挿入を処理する際（例： [INSERT INTOステートメント](/sql-reference/statements/insert-into) を使用）、いくつかの手順が実行されます。

① **ソート**: 行はテーブルのソートキー `(town, street)` によってソートされ、ソートされた行に対して[スパース主キーインデックス](/guides/best-practices/sparse-primary-indexes)が生成されます。

② **分割**: ソートされたデータはカラムに分割されます。

③ **圧縮**: 各カラムは[圧縮](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)されます。

④ **ディスクへの書き込み**: 圧縮されたカラムは、新しいディレクトリ内のバイナリカラムファイルとして保存され、挿入のデータパートを表します。スパース主キーインデックスも圧縮され、同じディレクトリに保存されます。

テーブルの特定のエンジンに応じて、ソートとともに他の変換[が行われる場合があります](/operations/settings/settings)。

データパーツは自己完結型であり、その内容を解釈するために必要なすべてのメタデータを含んでおり、中央カタログを必要としません。スパース主キーインデックスの他にも、パーツには追加のメタデータ（副次的な[データスキッピングインデックス](/optimize/skipping-indexes)、[カラム統計](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere)、チェックサム、最小-最大インデックス（[パーティショニング](/partitions)を使用している場合）、および[その他](https://github.com/ClickHouse/ClickHouse/blob/a065b11d591f22b5dd50cb6224fab2ca557b4989/src/Storages/MergeTree/MergeTreeData.h#L104)）が含まれています。

## パートのマージ {#part-merges}

テーブルごとのパーツ数を管理するために、[バックグラウンドマージ](/merges)ジョブが定期的に小さなパーツを大きなパーツに結合し、[設定可能な](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)圧縮サイズ（通常は約150 GB）に達するまで続けます。マージされたパーツは非アクティブとしてマークされ、[設定可能な](/operations/settings/merge-tree-settings#old_parts_lifetime)時間経過後に削除されます。時間が経つにつれて、このプロセスはマージされたパーツの階層構造を生成し、これがMergeTreeテーブルと呼ばれる理由です：

<Image img={merges} size="lg"/>

<br/>

初期パーツの数とマージのオーバーヘッドを最小限に抑えるために、データベースクライアントは[推奨されています](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance) 一度に例えば20,000行をバルク挿入したり、[非同期挿入モード](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)を使用することです。このモードでは、ClickHouseは複数の入ってくるINSERTからの行を同じテーブルにバッファし、バッファサイズが設定可能なしきい値を超えたとき、もしくはタイムアウトが切れたときにのみ新しいパートを作成します。

## テーブルパーツの監視 {#monitoring-table-parts}

現在存在するすべてのアクティブパーツのリストを[クエリ](https://sql.clickhouse.com/?query=U0VMRUNUIF9wYXJ0CkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKR1JPVVAgQlkgX3BhcnQKT1JERVIgQlkgX3BhcnQgQVNDOw&run_query=true&tab=results)するには、[仮想カラム](/engines/table-engines#table_engines-virtual_columns) `_part` を使用します：

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
上記のクエリは、ディスク上のディレクトリ名を取得し、各ディレクトリはテーブルのアクティブなデータパートを表しています。これらのディレクトリ名の構成要素には特定の意味があり、興味のある方は[こちら](https://github.com/ClickHouse/ClickHouse/blob/f90551824bb90ade2d8a1d8edd7b0a3c0a459617/src/Storages/MergeTree/MergeTreeData.h#L130)に記載されています。

もしくは、ClickHouseはすべてのテーブルのすべてのパーツに関する情報を[system.parts](/operations/system-tables/parts)システムテーブルで追跡しており、以下のクエリは[こちら](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results)で、上記の例のテーブルのすべての現在のアクティブパーツ、そのマージレベル、およびこれらのパーツに格納されている行数を返します：

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
マージレベルは、パーツでの追加のマージごとに1ずつ増加します。レベル0は、このパートがまだマージされていない新しいパートであることを示します。
