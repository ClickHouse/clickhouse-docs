---
description: "MergeTreeテーブルのパーツとカラムに関する情報を含むシステムテーブル。"
slug: /operations/system-tables/parts_columns
title: "system.parts_columns"
keywords: ["system table", "parts_columns"]
---

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブルのパーツとカラムに関する情報を含みます。

各行は1つのデータパーツを説明します。

カラム:

- `partition` ([String](../../sql-reference/data-types/string.md)) — パーティション名。パーティションが何であるかを知りたい場合は、[ALTER](../../sql-reference/statements/alter/index.md#query_language_queries_alter)クエリの説明を参照してください。

    フォーマット:

    - `YYYYMM`は月ごとの自動パーティショニング。
    - `any_string`は手動でパーティショニングする場合。

- `name` ([String](../../sql-reference/data-types/string.md)) — データパーツの名前。

- `part_type` ([String](../../sql-reference/data-types/string.md)) — データパーツの格納形式。

    可能な値:

    - `Wide` — 各カラムがファイルシステム内の別々のファイルに格納されます。
    - `Compact` — すべてのカラムがファイルシステム内の1つのファイルに格納されます。

    データ格納形式は、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブルの設定`min_bytes_for_wide_part`と`min_rows_for_wide_part`で制御されます。

- `active` ([UInt8](../../sql-reference/data-types/int-uint.md)) — データパーツがアクティブかどうかを示すフラグ。データパーツがアクティブであれば、テーブルで使用されます。そうでなければ削除されます。非アクティブなデータパーツは、マージ後に残ります。

- `marks` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マークの数。データパーツ内の行のおおよその数を得るには、`marks`にインデックスの粒度（通常は8192）を掛けます（このヒントは適応粒度には適用されません）。

- `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 行の数。

- `bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパーツファイルの合計サイズ（バイト単位）。

- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパーツ内の圧縮データの合計サイズ。すべての補助ファイル（たとえば、マークのファイル）は含まれません。

- `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパーツ内の非圧縮データの合計サイズ。すべての補助ファイル（たとえば、マークのファイル）は含まれません。

- `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マーク付きファイルのサイズ。

- `modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — データパーツが格納されているディレクトリが変更された時刻。これは通常、データパーツ作成時刻に対応します。

- `remove_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — データパーツが非アクティブになった時刻。

- `refcount` ([UInt32](../../sql-reference/data-types/int-uint.md)) — データパーツが使用されている場所の数。2より大きい値は、データパーツがクエリまたはマージで使用されていることを示します。

- `min_date` ([Date](../../sql-reference/data-types/date.md)) — データパーツ内の日付キーの最小値。

- `max_date` ([Date](../../sql-reference/data-types/date.md)) — データパーツ内の日付キーの最大値。

- `partition_id` ([String](../../sql-reference/data-types/string.md)) — パーティションのID。

- `min_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マージ後の現在のパーツを構成しているデータパーツの最小数。

- `max_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マージ後の現在のパーツを構成しているデータパーツの最大数。

- `level` ([UInt32](../../sql-reference/data-types/int-uint.md)) — マージツリーの深さ。ゼロは、現在のパーツが他のパーツをマージするのではなく、挿入によって作成されたことを意味します。

- `data_version` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパーツに適用すべき変更を決定するために使用される番号（`data_version`よりも高いバージョンの変更）。

- `primary_key_bytes_in_memory` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 主キー値が使用するメモリ量（バイト単位）。

- `primary_key_bytes_in_memory_allocated` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 主キー値のために予約されたメモリの量（バイト単位）。

- `database` ([String](../../sql-reference/data-types/string.md)) — データベースの名前。

- `table` ([String](../../sql-reference/data-types/string.md)) — テーブルの名前。

- `engine` ([String](../../sql-reference/data-types/string.md)) — パラメータなしのテーブルエンジンの名前。

- `disk_name` ([String](../../sql-reference/data-types/string.md)) — データパーツが格納されているディスクの名前。

- `path` ([String](../../sql-reference/data-types/string.md)) — データパーツファイルのフォルダーへの絶対パス。

- `column` ([String](../../sql-reference/data-types/string.md)) — カラムの名前。

- `type` ([String](../../sql-reference/data-types/string.md)) — カラムの型。

- `column_position` ([UInt64](../../sql-reference/data-types/int-uint.md)) — テーブル内のカラムの順序位置（1から始まる）。

- `default_kind` ([String](../../sql-reference/data-types/string.md)) — デフォルト値の式の種類（`DEFAULT`, `MATERIALIZED`, `ALIAS`）、または未定義の場合は空文字列。

- `default_expression` ([String](../../sql-reference/data-types/string.md)) — デフォルト値のための式、または未定義の場合は空文字列。

- `column_bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) — カラムの合計サイズ（バイト単位）。

- `column_data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — カラム内の圧縮データの合計サイズ（バイト単位）。

- `column_data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — カラム内の非圧縮データの合計サイズ（バイト単位）。

- `column_marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マーク付きカラムのサイズ（バイト単位）。

- `bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `bytes_on_disk`のエイリアス。

- `marks_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `marks_bytes`のエイリアス。

**例**

``` sql
SELECT * FROM system.parts_columns LIMIT 1 FORMAT Vertical;
```

``` text
Row 1:
──────
partition:                             tuple()
name:                                  all_1_2_1
part_type:                             Wide
active:                                1
marks:                                 2
rows:                                  2
bytes_on_disk:                         155
data_compressed_bytes:                 56
data_uncompressed_bytes:               4
marks_bytes:                           96
modification_time:                     2020-09-23 10:13:36
remove_time:                           2106-02-07 06:28:15
refcount:                              1
min_date:                              1970-01-01
max_date:                              1970-01-01
partition_id:                          all
min_block_number:                      1
max_block_number:                      2
level:                                 1
data_version:                          1
primary_key_bytes_in_memory:           2
primary_key_bytes_in_memory_allocated: 64
database:                              default
table:                                 53r93yleapyears
engine:                                MergeTree
disk_name:                             default
path:                                  /var/lib/clickhouse/data/default/53r93yleapyears/all_1_2_1/
column:                                id
type:                                  Int8
column_position:                       1
default_kind:
default_expression:
column_bytes_on_disk:                  76
column_data_compressed_bytes:          28
column_data_uncompressed_bytes:        2
column_marks_bytes:                    48
```

**参照**

- [MergeTreeファミリー](../../engines/table-engines/mergetree-family/mergetree.md)
