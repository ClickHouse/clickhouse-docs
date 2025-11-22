---
description: 'サーバーが把握している各テーブルのメタデータを含むシステムテーブル。'
keywords: ['system table', 'テーブル']
slug: /operations/system-tables/tables
title: 'system.tables'
doc_type: 'reference'
---

# system.tables

サーバーが把握している各テーブルのメタデータを含みます。

[デタッチされた](../../sql-reference/statements/detach.md) テーブルは `system.tables` には表示されません。

[一時テーブル](../../sql-reference/statements/create/table.md#temporary-tables) は、作成されたセッション内でのみ `system.tables` に表示されます。これらは空の `database` フィールドと、有効になっている `is_temporary` フラグとともに表示されます。

カラム:

* `database` ([String](../../sql-reference/data-types/string.md)) — テーブルが属するデータベース名。

* `name` ([String](../../sql-reference/data-types/string.md)) — テーブルの名前。

* `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — Atomic データベースの uuid テーブル。

* `engine` ([String](../../sql-reference/data-types/string.md)) — テーブルエンジンの名前（パラメータを除く）。

* `is_temporary` ([UInt8](../../sql-reference/data-types/int-uint.md)) - テーブルが一時テーブルであるかどうかを示すフラグ。

* `data_paths` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - ファイルシステム上のテーブルデータへのパス。

* `metadata_path` ([String](../../sql-reference/data-types/string.md)) - ファイルシステム上のテーブルメタデータへのパス。

* `metadata_modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) - テーブルのメタデータが最後に変更された時刻。

* `metadata_version` ([Int32](../../sql-reference/data-types/int-uint.md)) - ReplicatedMergeTree テーブルのメタデータバージョン。ReplicatedMergeTree 以外のテーブルでは 0。

* `dependencies_database` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 依存しているデータベース。

* `dependencies_table` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - テーブルの依存関係（現在のテーブルに依存する [materialized views](/sql-reference/statements/create/view#materialized-view)）。

* `create_table_query` ([String](../../sql-reference/data-types/string.md)) - テーブルの作成に用いられたクエリ。

* `engine_full` ([String](../../sql-reference/data-types/string.md)) - テーブルエンジンのパラメーター。

* `as_select` ([String](../../sql-reference/data-types/string.md)) - ビューの `SELECT` クエリ。

* `parameterized_view_parameters` ([Array](../../sql-reference/data-types/array.md) of [Tuple](../../sql-reference/data-types/tuple.md)) — パラメータ化されたビューのパラメータ。

* `partition_key` ([String](../../sql-reference/data-types/string.md)) - テーブルで指定されたパーティションキーの式。

* `sorting_key` ([String](../../sql-reference/data-types/string.md)) - テーブルで指定されたソートキー式。

* `primary_key` ([String](../../sql-reference/data-types/string.md)) - テーブルで指定された主キーの式。

* `sampling_key` ([String](../../sql-reference/data-types/string.md)) - テーブルで指定されたサンプリングキーの式。

* `storage_policy` ([String](../../sql-reference/data-types/string.md)) - ストレージポリシー：

  * [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes)
  * [Distributed](/engines/table-engines/special/distributed)

* `total_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - テーブル内の行数を正確に高速に取得できる場合はテーブル内の総行数、それができない場合は `NULL`（基礎となる `Buffer` テーブルを含む）。

* `total_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - ストレージ上のテーブルについて、バイト数をすばやく正確に算出できる場合は、インデックスおよびプロジェクションを含む総バイト数。そうでない場合は `NULL`（基盤となるストレージは含まれない）。

  * テーブルがディスク上にデータを保存している場合、ディスク上の使用領域（圧縮後のサイズ）を返します。
  * テーブルがメモリ内にデータを保存している場合、メモリ内で使用されているバイト数のおおよその値を返します。

* `total_bytes_uncompressed` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - 非圧縮バイト数の合計（インデックスおよびプロジェクションを含む）。ストレージ上のテーブルについて、パーツのチェックサムから正確なバイト数を素早く算出できる場合はその値、それ以外の場合は `NULL` を返す（下位ストレージが存在する場合でも、それは考慮しない）。

* `lifetime_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - サーバー起動以降に INSERT された総行数（`Buffer` テーブルに対してのみ）。

* `lifetime_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - サーバー起動以降にINSERTされた総バイト数（`Buffer` テーブルに対してのみ）。

* `comment` ([String](../../sql-reference/data-types/string.md)) - テーブルに関するコメント。

* `has_own_data` ([UInt8](../../sql-reference/data-types/int-uint.md)) — テーブル自体がディスク上にデータを保持しているか、あるいは他のソースにのみアクセスしているかを示すフラグです。

* `loading_dependencies_database` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - データベース読み込みの依存関係（現在のオブジェクトを読み込む前に読み込む必要があるオブジェクトのリスト）。

* `loading_dependencies_table` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - テーブル読み込み時の依存関係（現在のオブジェクトより先に読み込む必要があるオブジェクトの一覧）。

* `loading_dependent_database` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 依存先のデータベース。

* `loading_dependent_table` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 依存関係のあるロードテーブル。

`system.tables` テーブルは、`SHOW TABLES` クエリの実装に使用されます。

**例**

```sql
SELECT * FROM system.tables LIMIT 2 FORMAT Vertical;
```

```text
Row 1:
──────
database:                   base
name:                       t1
uuid:                       81b1c20a-b7c6-4116-a2ce-7583fb6b6736
engine:                     MergeTree
is_temporary:               0
data_paths:                 ['/var/lib/clickhouse/store/81b/81b1c20a-b7c6-4116-a2ce-7583fb6b6736/']
metadata_path:              /var/lib/clickhouse/store/461/461cf698-fd0b-406d-8c01-5d8fd5748a91/t1.sql
metadata_modification_time: 2021-01-25 19:14:32
dependencies_database:      []
dependencies_table:         []
create_table_query:         CREATE TABLE base.t1 (`n` UInt64) ENGINE = MergeTree ORDER BY n SETTINGS index_granularity = 8192
engine_full:                MergeTree ORDER BY n SETTINGS index_granularity = 8192
as_select:                  SELECT database AS table_catalog
partition_key:
sorting_key:                n
primary_key:                n
sampling_key:
storage_policy:             default
total_rows:                 1
total_bytes:                99
lifetime_rows:              ᴺᵁᴸᴸ
lifetime_bytes:             ᴺᵁᴸᴸ
comment:
has_own_data:               0
loading_dependencies_database: []
loading_dependencies_table:    []
loading_dependent_database:    []
loading_dependent_table:       []

Row 2:
──────
database:                   default
name:                       53r93yleapyears
uuid:                       00000000-0000-0000-0000-000000000000
engine:                     MergeTree
is_temporary:               0
data_paths:                 ['/var/lib/clickhouse/data/default/53r93yleapyears/']
metadata_path:              /var/lib/clickhouse/metadata/default/53r93yleapyears.sql
metadata_modification_time: 2020-09-23 09:05:36
dependencies_database:      []
dependencies_table:         []
create_table_query:         CREATE TABLE default.`53r93yleapyears` (`id` Int8, `febdays` Int8) ENGINE = MergeTree ORDER BY id SETTINGS index_granularity = 8192
engine_full:                MergeTree ORDER BY id SETTINGS index_granularity = 8192
as_select:                  SELECT name AS catalog_name
partition_key:
sorting_key:                id
primary_key:                id
sampling_key:
storage_policy:             default
total_rows:                 2
total_bytes:                155
lifetime_rows:              ᴺᵁᴸᴸ
lifetime_bytes:             ᴺᵁᴸᴸ
comment:
has_own_data:               0
loading_dependencies_database: []
loading_dependencies_table:    []
loading_dependent_database:    []
loading_dependent_table:       []
```
