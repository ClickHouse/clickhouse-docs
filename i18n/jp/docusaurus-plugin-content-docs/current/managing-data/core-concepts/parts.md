---
slug: /parts
title: 'テーブルパーツ'
description: 'ClickHouse のデータパーツとは'
keywords: ['part']
doc_type: 'reference'
---

import merges from '@site/static/images/managing-data/core-concepts/merges.png';
import part from '@site/static/images/managing-data/core-concepts/part.png';
import Image from '@theme/IdealImage';


## ClickHouse におけるテーブルパーツとは？

<br />

ClickHouse の [MergeTree engine family](/engines/table-engines/mergetree-family) に属する各テーブルのデータは、ディスク上では変更不可能な `data parts` の集合として構成されています。

これを説明するために、[この](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGU\&run_query=true\&tab=results) テーブル（[UK property prices dataset](/getting-started/example-datasets/uk-price-paid) を基にしたもの）を例として使用します。このテーブルには、英国で売却された不動産について、日付・町名・通り名・価格が記録されています。

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

このテーブルには、ClickHouse SQL Playground で[クエリを実行できます](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZTs\&run_query=true\&tab=results)。

データパーツは、行の集合がテーブルに挿入されるたびに作成されます。次の図はその概要を示しています。

<Image img={part} size="lg" />

<br />

ClickHouse サーバーが、上の図に示した 4 行の INSERT（[INSERT INTO 文](/sql-reference/statements/insert-into) などを通じて）を処理するとき、いくつかのステップを実行します。

① **ソート**: 行はテーブルの^^ソートキー^^ `(town, street)` でソートされ、ソート済みの行に対して [スパース主キーインデックス](/guides/best-practices/sparse-primary-indexes) が生成されます。

② **分割**: ソート済みデータは列ごとに分割されます。

③ **圧縮**: 各列は[圧縮されます](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。

④ **ディスクへの書き込み**: 圧縮された各列は、INSERT のデータパーツを表す新しいディレクトリ内にバイナリ列ファイルとして保存されます。スパース主キーインデックスも圧縮され、同じディレクトリに保存されます。

テーブルで使用しているエンジンに応じて、ソートと合わせて追加の変換が[行われる場合があります](/operations/settings/settings)。

データ^^パーツ^^は自己完結しており、中央のカタログを必要とせずにその内容を解釈するために必要な、すべてのメタデータを含みます。スパース主キーインデックスに加えて、^^パーツ^^には、副次的な [data skipping インデックス](/optimize/skipping-indexes)、[カラム統計](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere)、チェックサム、（[パーティション](/partitions) が使われている場合の）min-max インデックス、そして[その他の情報](https://github.com/ClickHouse/ClickHouse/blob/a065b11d591f22b5dd50cb6224fab2ca557b4989/src/Storages/MergeTree/MergeTreeData.h#L104)が含まれます。


## パーツのマージ {#part-merges}

テーブルごとの ^^パーツ^^ 数を管理するために、[バックグラウンドマージ](/merges) ジョブが一定間隔で小さな ^^パーツ^^ をより大きなものへと順次まとめ、[設定可能な](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) 圧縮サイズ（通常は約 150 GB）に達するまでマージを行います。マージされた ^^パーツ^^ は非アクティブとしてマークされ、[設定可能な](/operations/settings/merge-tree-settings#old_parts_lifetime) 時間が経過すると削除されます。時間の経過とともに、この処理によってマージ済み ^^パーツ^^ の階層構造が形成されるため、これを ^^MergeTree^^ テーブルと呼びます。

<Image img={merges} size="lg" />

<br />

初期 ^^パーツ^^ 数とマージ処理のオーバーヘッドを最小限に抑えるために、データベースクライアントは、20,000 行をまとめて挿入するといった形でタプルをバルク挿入するか、あるいは [非同期挿入モード](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) を使用することが[推奨されています](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)。非同期挿入モードでは、ClickHouse は同一テーブルに対する複数の INSERT リクエストから行をバッファリングし、バッファサイズが設定可能なしきい値を超えるか、タイムアウトが発生した時点でのみ新しいパーツを作成します。



## テーブルパーツの監視

[仮想列](/engines/table-engines#table_engines-virtual_columns) `_part` を使用して、サンプルテーブルに現在存在するすべてのアクティブな ^^parts^^ の一覧を[クエリ](https://sql.clickhouse.com/?query=U0VMRUNUIF9wYXJ0CkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKR1JPVVAgQlkgX3BhcnQKT1JERVIgQlkgX3BhcnQgQVNDOw\&run_query=true\&tab=results)できます。

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

上記のクエリは、ディスク上のディレクトリ名を取得します。各ディレクトリはテーブルのアクティブなデータ ^^parts^^ を表します。これらのディレクトリ名を構成する要素にはそれぞれ特定の意味があり、その詳細は、さらに深く調べたい方のために [こちら](https://github.com/ClickHouse/ClickHouse/blob/f90551824bb90ade2d8a1d8edd7b0a3c0a459617/src/Storages/MergeTree/MergeTreeData.h#L130) に記載されています。

別の方法として、ClickHouse はすべてのテーブルのすべての ^^parts^^ に関する情報を [system.parts](/operations/system-tables/parts) システムテーブルで保持しており、次のクエリは、先ほどのサンプルテーブルについて、現在アクティブなすべての ^^parts^^ とそのマージレベル、および各 ^^parts^^ に保存されている行数の一覧を[返します](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7\&run_query=true\&tab=results)。

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

マージレベルは、そのパーツに対してマージが追加で行われるたびに 1 ずつ増加します。レベル 0 は、まだマージされていない新しいパーツであることを示します。
