---
description: 'サーバーが認識している各テーブルのメタデータを含むシステムテーブル。'
slug: /operations/system-tables/tables
title: 'system.tables'
keywords: ['システムテーブル', 'テーブル']
---

サーバーが認識している各テーブルのメタデータを含みます。

[Detached](../../sql-reference/statements/detach.md) テーブルは `system.tables` に表示されません。

[Temporary tables](../../sql-reference/statements/create/table.md#temporary-tables) は、それらが作成されたセッション内でのみ `system.tables` に表示されます。空の `database` フィールドと `is_temporary` フラグがオンになっている状態で表示されます。

カラム:

- `database` ([String](../../sql-reference/data-types/string.md)) — テーブルが存在するデータベースの名前。

- `name` ([String](../../sql-reference/data-types/string.md)) — テーブル名。

- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — テーブルのUUID（アトミックデータベース）。

- `engine` ([String](../../sql-reference/data-types/string.md)) — テーブルエンジン名（パラメータなし）。

- `is_temporary` ([UInt8](../../sql-reference/data-types/int-uint.md)) - テーブルが一時的であるかどうかを示すフラグ。

- `data_paths` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - ファイルシステム内のテーブルデータへのパス。

- `metadata_path` ([String](../../sql-reference/data-types/string.md)) - ファイルシステム内のテーブルメタデータへのパス。

- `metadata_modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) - テーブルメタデータの最新の変更時間。

- `metadata_version` ([Int32](../../sql-reference/data-types/int-uint.md)) - ReplicatedMergeTree テーブルのメタデータバージョン、非 ReplicatedMergeTree テーブルの場合は 0。

- `dependencies_database` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - データベースの依存関係。

- `dependencies_table` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - テーブルの依存関係（現在のテーブルの [materialized views](/sql-reference/statements/create/view#materialized-view)）。

- `create_table_query` ([String](../../sql-reference/data-types/string.md)) - テーブルを作成するために使用されたクエリ。

- `engine_full` ([String](../../sql-reference/data-types/string.md)) - テーブルエンジンのパラメータ。

- `as_select` ([String](../../sql-reference/data-types/string.md)) - ビュー用の `SELECT` クエリ。

- `partition_key` ([String](../../sql-reference/data-types/string.md)) - テーブルに指定されたパーティションキー式。

- `sorting_key` ([String](../../sql-reference/data-types/string.md)) - テーブルに指定されたソートキー式。

- `primary_key` ([String](../../sql-reference/data-types/string.md)) - テーブルに指定された主キー式。

- `sampling_key` ([String](../../sql-reference/data-types/string.md)) - テーブルに指定されたサンプリングキー式。

- `storage_policy` ([String](../../sql-reference/data-types/string.md)) - ストレージポリシー:

    - [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes)
    - [Distributed](/engines/table-engines/special/distributed)

- `total_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - 総行数。テーブル内の行数を迅速に特定できる場合はその値、そうでない場合は `NULL`（基底の `Buffer` テーブルを含む）。

- `total_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - 総バイト数。ストレージ上のテーブルに対して迅速に正確なバイト数を特定できる場合はその値、そうでない場合は `NULL`（基底ストレージは含まれない）。

    - テーブルがディスクにデータを保存する場合、ディスク上の使用済みスペース（圧縮された状態）を返します。
    - テーブルがメモリにデータを保存する場合、メモリ内の使用済みバイト数の近似値を返します。

- `total_bytes_uncompressed` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - 総未圧縮バイト数。ストレージに対して部分のチェックサムから正確なバイト数を迅速に特定できる場合はその値、そうでない場合は `NULL`（基底ストレージ（ある場合）は考慮されない）。

- `lifetime_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - サーバー起動以来INSERTされた総行数（`Buffer` テーブルのみ）。

- `lifetime_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - サーバー起動以来INSERTされた総バイト数（`Buffer` テーブルのみ）。

- `comment` ([String](../../sql-reference/data-types/string.md)) - テーブルのコメント。

- `has_own_data` ([UInt8](../../sql-reference/data-types/int-uint.md)) — テーブル自身がディスク上にデータを保存しているか、または別のソースにのみアクセスしているかを示すフラグ。

- `loading_dependencies_database` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - データベースの読み込み依存関係（現在のオブジェクトの前に読み込む必要があるオブジェクトのリスト）。

- `loading_dependencies_table` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - テーブルの読み込み依存関係（現在のオブジェクトの前に読み込む必要があるオブジェクトのリスト）。

- `loading_dependent_database` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 依存している読み込みデータベース。

- `loading_dependent_table` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 依存している読み込みテーブル。

`system.tables` テーブルは `SHOW TABLES` クエリの実装で使用されます。

**例**

```sql
SELECT * FROM system.tables LIMIT 2 FORMAT Vertical;
```

```text
行 1:
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

行 2:
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
