---
description: "MergeTreeテーブルのパーツおよびカラムに関する情報を含むシステムテーブルです。"
slug: /operations/system-tables/parts_columns
title: "parts_columns"
keywords: ["システムテーブル", "parts_columns"]
---

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのパーツとカラムに関する情報を含みます。

各行は1つのデータパートを説明します。

カラム:

- `partition` ([String](../../sql-reference/data-types/string.md)) — パーティション名。パーティションとは何かを学ぶには、[ALTER](../../sql-reference/statements/alter/index.md#query_language_queries_alter) クエリの説明を参照してください。

    フォーマット:

    - 月単位での自動パーティショニングの場合は `YYYYMM`。
    - 手動でパーティショニングする場合は `any_string`。

- `name` ([String](../../sql-reference/data-types/string.md)) — データパートの名前。

- `part_type` ([String](../../sql-reference/data-types/string.md)) — データパートの保存形式。

    可能な値:

    - `Wide` — 各カラムがファイルシステム内の別々のファイルに保存されます。
    - `Compact` — すべてのカラムがファイルシステム内の1つのファイルに保存されます。

    データ保存形式は、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルの `min_bytes_for_wide_part` および `min_rows_for_wide_part` 設定によって制御されます。

- `active` ([UInt8](../../sql-reference/data-types/int-uint.md)) — データパートがアクティブかどうかを示すフラグ。データパートがアクティブな場合、それはテーブルで使用されます。それ以外の場合は削除されます。非アクティブなデータパートはマージ後に残ります。

- `marks` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マークの数。データパートの大体の行数を取得するには、`marks` にインデックスの粒度（通常は8192）を掛けます（このヒントはアダプティブ粒度には適用されません）。

- `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 行数。

- `bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパートファイルの総サイズ（バイト単位）。

- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパート内の圧縮データの総サイズ。すべての補助ファイル（例えば、マークを持つファイル）は含まれません。

- `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパート内の非圧縮データの総サイズ。すべての補助ファイル（例えば、マークを持つファイル）は含まれません。

- `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マークを持つファイルのサイズ。

- `modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — データパートを含むディレクトリが最後に変更された時間。これは通常、データパート作成時の時間に対応します。

- `remove_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — データパートが非アクティブになった時間。

- `refcount` ([UInt32](../../sql-reference/data-types/int-uint.md)) — データパートが使用されている場所の数。2より大きい値は、データパートがクエリやマージで使用されていることを示します。

- `min_date` ([Date](../../sql-reference/data-types/date.md)) — データパートのデートキーの最小値。

- `max_date` ([Date](../../sql-reference/data-types/date.md)) — データパートのデートキーの最大値。

- `partition_id` ([String](../../sql-reference/data-types/string.md)) — パーティションのID。

- `min_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マージ後に現在のパートを構成するデータパートの最小数。

- `max_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マージ後に現在のパートを構成するデータパートの最大数。

- `level` ([UInt32](../../sql-reference/data-types/int-uint.md)) — マージツリーの深さ。ゼロは、現在のパートが別のパートをマージするのではなく、挿入によって作成されたことを意味します。

- `data_version` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパートに適用すべきミューテーションを判断するために使用される番号（`data_version` よりもバージョンが高いミューテーション）。

- `primary_key_bytes_in_memory` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 主キー値によって使用されるメモリの量（バイト単位）。

- `primary_key_bytes_in_memory_allocated` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 主キー値のために予約されたメモリの量（バイト単位）。

- `database` ([String](../../sql-reference/data-types/string.md)) — データベース名。

- `table` ([String](../../sql-reference/data-types/string.md)) — テーブル名。

- `engine` ([String](../../sql-reference/data-types/string.md)) — パラメータなしのテーブルエンジンの名前。

- `disk_name` ([String](../../sql-reference/data-types/string.md)) — データパートを保存するディスクの名前。

- `path` ([String](../../sql-reference/data-types/string.md)) — データパートファイルのフォルダへの絶対パス。

- `column` ([String](../../sql-reference/data-types/string.md)) — カラム名。

- `type` ([String](../../sql-reference/data-types/string.md)) — カラムタイプ。

- `column_position` ([UInt64](../../sql-reference/data-types/int-uint.md)) — テーブル内のカラムの順位。1から始まります。

- `default_kind` ([String](../../sql-reference/data-types/string.md)) — デフォルト値の式タイプ（`DEFAULT`、`MATERIALIZED`、`ALIAS`）、または未定義の場合は空の文字列。

- `default_expression` ([String](../../sql-reference/data-types/string.md)) — デフォルト値の式、または未定義の場合は空の文字列。

- `column_bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) — カラムの総サイズ（バイト単位）。

- `column_data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — カラム内の圧縮データの総サイズ（バイト単位）。

- `column_data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — カラム内の非圧縮データの総サイズ（バイト単位）。

- `column_marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マークを持つカラムのサイズ（バイト単位）。

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

**関連項目**

- [MergeTreeファミリー](../../engines/table-engines/mergetree-family/mergetree.md)
