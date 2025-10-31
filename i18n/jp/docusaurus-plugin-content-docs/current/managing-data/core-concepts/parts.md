---
'slug': '/parts'
'title': 'テーブルパーツ'
'description': 'ClickHouseのデータパーツとは何ですか'
'keywords':
- 'part'
'doc_type': 'reference'
---

import merges from '@site/static/images/managing-data/core-concepts/merges.png';
import part from '@site/static/images/managing-data/core-concepts/part.png';
import Image from '@theme/IdealImage';

## ClickHouseにおけるテーブルパーツとは何ですか？ {#what-are-table-parts-in-clickhouse}

<br />

ClickHouseの [MergeTreeエンジンファミリー](/engines/table-engines/mergetree-family) における各テーブルのデータは、不変の `data parts` のコレクションとしてディスク上に整理されています。

これを説明するために、[この](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGU&run_query=true&tab=results)テーブル（[UKの物件価格データセット](/getting-started/example-datasets/uk-price-paid)から適応）を使用しており、イギリスで販売された物件の日時、町、通り、価格を追跡しています。

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

このテーブルを[クエリ](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZTs&run_query=true&tab=results)して、私たちのClickHouse SQL Playgroundで実行できます。

データパートは、テーブルに行のセットが挿入されるたびに作成されます。次の図は、これを示しています。

<Image img={part} size="lg" />

<br />

ClickHouseサーバーが上記の図にスケッチされた4行の例の挿入を処理する際（例えば、[INSERT INTO文](/sql-reference/statements/insert-into)を介して）、いくつかのステップを実行します。

① **ソート**: 行はテーブルの^^ソートキー^^ `(town, street)` によってソートされ、ソートされた行のための [スパース主インデックス](/guides/best-practices/sparse-primary-indexes)が生成されます。

② **分割**: ソートされたデータはカラムに分割されます。

③ **圧縮**: 各カラムは [圧縮](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)されます。

④ **ディスクへの書き込み**: 圧縮されたカラムは新しいディレクトリ内にバイナリカラムファイルとして保存されます。このディレクトリは挿入のデータパートを表します。スパース主インデックスも圧縮され、同じディレクトリに保存されます。

テーブルの特定のエンジンによっては、ソートと並行して追加の変換 [が](/operations/settings/settings) 行われる場合があります。

データ^^パーツ^^は自己完結型であり、その内容を解釈するために必要なすべてのメタデータを中央カタログなしで含んでいます。スパース主インデックスの他に、^^パーツ^^はセカンダリ [データスキッピングインデックス](/optimize/skipping-indexes)、[カラム統計](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere)、チェックサム、最小-最大インデックス（[パーティショニング](/partitions)が使用される場合）、および[その他のもの](https://github.com/ClickHouse/ClickHouse/blob/a065b11d591f22b5dd50cb6224fab2ca557b4989/src/Storages/MergeTree/MergeTreeData.h#L104)を含みます。

## パーツのマージ {#part-merges}

テーブルごとの^^パーツ^^の数を管理するために、[バックグラウンドマージ](/merges)ジョブが定期的に小さい^^パーツ^^を大きいものに統合し、[設定可能な](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)圧縮サイズ（通常は約150 GB）に達するまで行います。マージされた^^パーツ^^は非アクティブとしてマークされ、[設定可能な](/operations/settings/merge-tree-settings#old_parts_lifetime)時間間隔の後に削除されます。時間が経つと、このプロセスはマージされた^^パーツ^^の階層構造を作成します。これが^^MergeTree^^テーブルと呼ばれる理由です：

<Image img={merges} size="lg" />

<br />

最初の^^パーツ^^の数とマージのオーバーヘッドを最小限に抑えるために、データベースクライアントは[推奨されている](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)方法として、例えば20,000行を一度にバルク挿入するか、[非同期挿入モード](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)を使用することが推奨されています。このモードでは、ClickHouseは同じテーブルへの複数の受信INSERTからの行をバッファリングし、バッファサイズが設定可能なしきい値を超えるかタイムアウトが発生するまで新しいパートは作成されません。

## テーブルパーツの監視 {#monitoring-table-parts}

現在存在するアクティブな^^パーツ^^のすべてのリストを、[仮想カラム](/engines/table-engines#table_engines-virtual_columns) `_part` を使用して[クエリ](https://sql.clickhouse.com/?query=U0VMRUNUIF9wYXJ0CkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKR1JPVVAgQlkgX3BhcnQKT1JERVIgQlkgX3BhcnQgQVNDOw&run_query=true&tab=results)できます：

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
上記のクエリは、ディスク上のディレクトリ名を取得し、それぞれのディレクトリがテーブルのアクティブデータパートを表します。これらのディレクトリ名の構成要素には特定の意味があり、詳細を探求したい方のために[ここ](https://github.com/ClickHouse/ClickHouse/blob/f90551824bb90ade2d8a1d8edd7b0a3c0a459617/src/Storages/MergeTree/MergeTreeData.h#L130)に記載されています。

また、ClickHouseは、すべてのテーブルのすべての^^パーツ^^に関する情報を[system.parts](/operations/system-tables/parts)システムテーブルで追跡しており、次のクエリは[返します](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results)上記の例のテーブルに対するすべての現在のアクティブ^^パーツ^^のリスト、マージレベル、およびこれらの^^パーツ^^に保存されている行数を示します：

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
マージレベルは、パーツに追加のマージが行われるたびに1ずつ増加します。レベル0は、まだマージされていない新しいパートであることを示します。
