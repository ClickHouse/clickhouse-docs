---
description: "MergeTree テーブルのパーツとカラムに関する情報を含むシステムテーブルです。"
slug: /operations/system-tables/parts_columns
title: "system.parts_columns"
keywords: ["system table", "parts_columns"]
---

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのパーツとカラムに関する情報を含みます。

各行は 1 つのデータパーツを説明します。

カラム:

- `partition` ([String](../../sql-reference/data-types/string.md)) — パーティション名。パーティションの説明については、[ALTER](/sql-reference/statements/alter) クエリの説明を参照してください。

    フォーマット:

    - `YYYYMM` は月による自動パーティショニング。
    - `any_string` は手動でのパーティショニング。

- `name` ([String](../../sql-reference/data-types/string.md)) — データパーツの名前。

- `part_type` ([String](../../sql-reference/data-types/string.md)) — データパーツの保存形式。

    可能な値:

    - `Wide` — 各カラムがファイルシステム内の別々のファイルに保存されています。
    - `Compact` — すべてのカラムがファイルシステム内の 1 つのファイルに保存されています。

    データ保存形式は、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルの `min_bytes_for_wide_part` と `min_rows_for_wide_part` 設定によって制御されます。

- `active` ([UInt8](../../sql-reference/data-types/int-uint.md)) — データパーツがアクティブであるかどうかを示すフラグ。データパーツがアクティブであれば、テーブルで使用されます。そうでない場合、削除されます。非アクティブなデータパーツはマージ後に残ります。

- `marks` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マークの数。データパーツ内の行数の概算を得るには、`marks` にインデックスのグラニュラリティ（通常は 8192）を掛けます（このヒントは適応グラニュラリティには適用されません）。

- `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 行数。

- `bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパーツファイルの合計サイズ（バイト単位）。

- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパーツ内の圧縮データの合計サイズ。すべての補助ファイル（例えば、マークのあるファイル）は含まれません。

- `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパーツ内の非圧縮データの合計サイズ。すべての補助ファイル（例えば、マークのあるファイル）は含まれません。

- `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マークのあるファイルのサイズ。

- `modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — データパーツが存在するディレクトリが最後に変更された時刻。通常は、データパーツの作成時刻に対応しています。

- `remove_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — データパーツが非アクティブになった時刻。

- `refcount` ([UInt32](../../sql-reference/data-types/int-uint.md)) — データパーツが使用されている場所の数。値が 2 より大きい場合、データパーツはクエリまたはマージで使用されています。

- `min_date` ([Date](../../sql-reference/data-types/date.md)) — データパーツ内の最小の日付キーの値。

- `max_date` ([Date](../../sql-reference/data-types/date.md)) — データパーツ内の最大の日付キーの値。

- `partition_id` ([String](../../sql-reference/data-types/string.md)) — パーティションの ID。

- `min_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 現在のパーツを構成するデータパーツの最小数（マージ後）。

- `max_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 現在のパーツを構成するデータパーツの最大数（マージ後）。

- `level` ([UInt32](../../sql-reference/data-types/int-uint.md)) — マージツリーの深さ。ゼロは現在のパーツが他のパーツのマージではなく、挿入によって作成されたことを意味します。

- `data_version` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパーツに適用すべきミューテーションを決定するために使用される番号（`data_version` よりもバージョンが高いミューテーション）。

- `primary_key_bytes_in_memory` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 主キーの値が使用するメモリ量（バイト単位）。

- `primary_key_bytes_in_memory_allocated` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 主キーの値のために予約されたメモリ量（バイト単位）。

- `database` ([String](../../sql-reference/data-types/string.md)) — データベースの名前。

- `table` ([String](../../sql-reference/data-types/string.md)) — テーブルの名前。

- `engine` ([String](../../sql-reference/data-types/string.md)) — パラメータなしのテーブルエンジンの名前。

- `disk_name` ([String](../../sql-reference/data-types/string.md)) — データパーツが保存されているディスクの名前。

- `path` ([String](../../sql-reference/data-types/string.md)) — データパーツファイルのフォルダへの絶対パス。

- `column` ([String](../../sql-reference/data-types/string.md)) — カラムの名前。

- `type` ([String](../../sql-reference/data-types/string.md)) — カラムのタイプ。

- `column_position` ([UInt64](../../sql-reference/data-types/int-uint.md)) — テーブル内のカラムの順序位置（1 から始まります）。

- `default_kind` ([String](../../sql-reference/data-types/string.md)) — デフォルト値の表現タイプ（`DEFAULT`, `MATERIALIZED`, `ALIAS`）、または定義されていない場合は空文字列。

- `default_expression` ([String](../../sql-reference/data-types/string.md)) — デフォルト値のための表現、または定義されていない場合は空文字列。

- `column_bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) — カラムの合計サイズ（バイト単位）。

- `column_data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — カラム内の圧縮データの合計サイズ（バイト単位）。

- `column_data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — カラム内の非圧縮データの合計サイズ（バイト単位）。

- `column_marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マーク付きカラムのサイズ（バイト単位）。

- `bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `bytes_on_disk` のエイリアス。

- `marks_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `marks_bytes` のエイリアス。

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

**関連事項**

- [MergeTree ファミリー](../../engines/table-engines/mergetree-family/mergetree.md)
