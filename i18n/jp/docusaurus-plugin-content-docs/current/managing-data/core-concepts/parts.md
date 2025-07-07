---
'slug': '/parts'
'title': 'テーブルのパーツ'
'description': 'ClickHouseにおけるデータパーツとは何か'
'keywords':
- 'part'
---

import merges from '@site/static/images/managing-data/core-concepts/merges.png';
import part from '@site/static/images/managing-data/core-concepts/part.png';
import Image from '@theme/IdealImage';

## ClickHouseにおけるテーブルパーツとは何ですか？ {#what-are-table-parts-in-clickhouse}

<br/>

ClickHouseの[MergeTreeエンジンファミリー](/engines/table-engines/mergetree-family)の各テーブルのデータは、変更不可能な`data parts`のコレクションとしてディスク上に整理されています。

例を示すために、イギリスで販売された不動産の販売日、町、通り、価格を記録する[この](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGU&run_query=true&tab=results)テーブルを使用します（[UK property prices dataset](/getting-started/example-datasets/uk-price-paid)から改変）。

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

このテーブルを[クエリすることができます](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZTs&run_query=true&tab=results)我々のClickHouse SQL Playgroundで。

データパートは、テーブルに行のセットが挿入されるたびに作成されます。以下の図はこれを示しています：

<Image img={part} size="lg"/>

<br/>

ClickHouseサーバーが上記の図に示されている4行の挿入を処理する際（例： [INSERT INTO文](/sql-reference/statements/insert-into)を介して）、いくつかのステップを実行します：

① **ソート**：行はテーブルのソートキー`(town, street)`によりソートされ、ソートされた行に対して[sparse primary index](/guides/best-practices/sparse-primary-indexes)が生成されます。

② **分割**：ソートされたデータがカラムに分割されます。

③ **圧縮**：各カラムは[圧縮](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)されます。

④ **ディスクへの書き込み**：圧縮されたカラムは、新しいディレクトリ内のバイナリカラムファイルとして保存され、これが挿入のデータパートを表します。スパースプライマリインデックスも圧縮され、同じディレクトリに保存されます。

テーブルの特定のエンジンに応じて、ソートに加えて追加の変換が[行われる場合があります](/operations/settings/settings)。

データパーツは自己完結型であり、内容を解釈するために必要なすべてのメタデータを中央カタログを必要とせずに含んでいます。スパースプライマリインデックスの他に、パーツは追加のメタデータ（例えば、セカンダリの[data skipping indexes](/optimize/skipping-indexes)、[カラム統計](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere)、チェックサム、最小-最大インデックス（[パーティショニング](/partitions)が使用されている場合）、および[その他](https://github.com/ClickHouse/ClickHouse/blob/a065b11d591f22b5dd50cb6224fab2ca557b4989/src/Storages/MergeTree/MergeTreeData.h#L104)）を含みます。

## パートのマージ {#part-merges}

テーブルあたりのパーツの数を管理するために、[バックグラウンドマージ](/merges)ジョブが定期的に小さいパーツを大きなパーツにまとめ、[設定可能な](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)圧縮サイズ（通常は約150 GB）に達するまで行います。マージされたパーツは非アクティブとしてマークされ、[設定可能な](/operations/settings/merge-tree-settings#old_parts_lifetime)時間間隔の後に削除されます。時間の経過とともに、このプロセスはマージされたパーツの階層構造を作成します。これがMergeTreeテーブルと呼ばれる理由です：

<Image img={merges} size="lg"/>

<br/>

初期パーツの数とマージのオーバーヘッドを最小限に抑えるために、データベースクライアントは、大量にタプルを挿入するか（例：20,000行を一度に）、[非同期挿入モード](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)を使用することが[推奨されています](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)。このモードでは、ClickHouseは複数の受信INSERTからの行を同じテーブルにバッファリングし、バッファサイズが設定可能なしきい値を超えるかタイムアウトが切れるまで新しいパートを作成しないようにします。

## テーブルパーツの監視 {#monitoring-table-parts}

我々の例のテーブルの現在存在するアクティブパーツのリストを[クエリ](https://sql.clickhouse.com/?query=U0VMRUNUIF9wYXJ0CkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKR1JPVVAgQlkgX3BhcnQKT1JERVIgQlkgX3BhcnQgQVNDOw&run_query=true&tab=results)するには、[仮想カラム](/engines/table-engines#table_engines-virtual_columns)`_part`を使用します：

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

上記のクエリは、ディスク上のディレクトリの名前を取得します。各ディレクトリはテーブルのアクティブなデータパートを表します。これらのディレクトリ名の要素には特定の意味があり、詳細を探求したい方のために[ここに文書化されています](https://github.com/ClickHouse/ClickHouse/blob/f90551824bb90ade2d8a1d8edd7b0a3c0a459617/src/Storages/MergeTree/MergeTreeData.h#L130)。

あるいは、ClickHouseはすべてのテーブルのすべてのパーツの情報を[system.parts](/operations/system-tables/parts)システムテーブルで追跡しており、以下のクエリは[返します](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results)我々の例のテーブルのすべての現在のアクティブパーツ、そのマージレベル、及びこれらのパーツに格納された行の数のリスト：

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

マージレベルは、パートに対するマージが追加されるごとに1ずつ増加します。レベル0は、まだマージされていない新しいパートであることを示します。
