---
description: 'サーバーが認識している各テーブルのメタデータを含む system テーブルです。'
keywords: ['system テーブル', 'テーブル']
slug: /operations/system-tables/tables
title: 'system.tables'
doc_type: 'reference'
---

# system.tables

サーバーが把握している各テーブルのメタデータを含みます。

[Detached](../../sql-reference/statements/detach.md) テーブルは `system.tables` には表示されません。

[Temporary tables](../../sql-reference/statements/create/table.md#temporary-tables) は、それらが作成されたセッション内でのみ `system.tables` に表示されます。これらは、`database` フィールドが空で、`is_temporary` フラグが有効になっている状態で表示されます。

列:

* `database` ([String](../../sql-reference/data-types/string.md)) — テーブルが属するデータベース名。

* `name` ([String](../../sql-reference/data-types/string.md)) — テーブルの名前。

* `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — テーブル uuid（Atomic データベース）。

* `engine` ([String](../../sql-reference/data-types/string.md)) — テーブルエンジンの名前（パラメータを含まない）。

* `is_temporary` ([UInt8](../../sql-reference/data-types/int-uint.md)) - テーブルが一時テーブルであるかどうかを示すフラグ。

* `data_paths` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - ファイルシステム上のテーブルデータへのパス。

* `metadata_path` ([String](../../sql-reference/data-types/string.md)) - ファイルシステム内のテーブルのメタデータへのパス。

* `metadata_modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) - テーブルのメタデータが最後に変更された時刻。

* `metadata_version` ([Int32](../../sql-reference/data-types/int-uint.md)) - ReplicatedMergeTree テーブルに対するメタデータバージョン。ReplicatedMergeTree 以外のテーブルでは 0。

* `dependencies_database` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 依存しているデータベース。

* `dependencies_table` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - テーブルの依存関係（このテーブルをソースとする[マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view)）。

* `create_table_query` ([String](../../sql-reference/data-types/string.md)) - テーブルの作成に使用したクエリ。

* `engine_full` ([String](../../sql-reference/data-types/string.md)) - テーブルエンジンのパラメータ。

* `as_select` ([String](../../sql-reference/data-types/string.md)) - ビューを定義するための `SELECT` クエリ。

* `parameterized_view_parameters` ([Array](../../sql-reference/data-types/array.md) of [Tuple](../../sql-reference/data-types/tuple.md)) — パラメータ化されたビューのパラメータ。

* `partition_key` ([String](../../sql-reference/data-types/string.md)) - テーブルで指定されたパーティションキーの式。

* `sorting_key` ([String](../../sql-reference/data-types/string.md)) - テーブルに指定されたソートキー式。

* `primary_key` ([String](../../sql-reference/data-types/string.md)) - テーブルで指定された主キー式。

* `sampling_key` ([String](../../sql-reference/data-types/string.md)) - テーブルで指定されたサンプリングキーの式。

* `storage_policy` ([String](../../sql-reference/data-types/string.md)) - ストレージポリシー:

  * [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes)
  * [Distributed](/engines/table-engines/special/distributed)

* `total_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - テーブル（基盤となる `Buffer` テーブルを含む）内の行数を正確かつ迅速に判定できる場合は、その総行数。できない場合は `NULL`。

* `total_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - テーブルのストレージ上に保存されているバイト数の正確な値をすばやく取得できる場合は、インデックスおよびプロジェクションを含む合計バイト数。それが不可能な場合は `NULL`（基盤となるストレージ自体のサイズは含まれない）。

  * テーブルがディスク上にデータを保存している場合、ディスク上で使用されている領域（圧縮後）を返します。
  * テーブルがメモリ上にデータを保存している場合、メモリで使用されているバイト数のおおよその値を返します。

* `total_bytes_uncompressed` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - 圧縮されていないバイト数の合計（インデックスおよびプロジェクションを含む）。ストレージ上のテーブルについて、パートのチェックサムから正確なバイト数をすばやく算出できる場合はその値、それ以外の場合は `NULL`（下層のストレージが存在する場合でも、それは考慮しない）。

* `lifetime_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - サーバー起動後に INSERT された行の合計数（`Buffer` テーブルに対してのみ）。

* `lifetime_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - サーバー起動後に INSERT されたバイト数の総計（`Buffer` テーブルに対してのみ）。

* `comment` ([String](../../sql-reference/data-types/string.md)) - テーブルに関するコメント。

* `has_own_data` ([UInt8](../../sql-reference/data-types/int-uint.md)) — テーブル自体がディスク上にデータを保存しているかどうか、または他のデータソースにのみアクセスしているかどうかを示すフラグです。

* `loading_dependencies_database` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - データベースの読み込み依存関係（現在のオブジェクトより前に読み込まれている必要のあるオブジェクトの一覧）。

* `loading_dependencies_table` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - テーブル読み込み時の依存関係（現在のオブジェクトより前に読み込む必要があるオブジェクトのリスト）。

* `loading_dependent_database` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 依存してロードされるデータベース。

* `loading_dependent_table` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 依存関係のあるロード先テーブル。

`system.tables` テーブルは、`SHOW TABLES` クエリを実装する際に使用されます。

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
