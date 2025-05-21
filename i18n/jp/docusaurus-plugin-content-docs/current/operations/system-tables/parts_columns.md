---
description: 'MergeTree テーブルのパーツとカラムに関する情報を含むシステムテーブルです。'
keywords: ['system table', 'parts_columns']
slug: /operations/system-tables/parts_columns
title: 'system.parts_columns'
---


# system.parts_columns

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのパーツとカラムに関する情報を含みます。

各行は1つのデータパーツを記述しています。

カラム:

- `partition` ([String](../../sql-reference/data-types/string.md)) — パーティション名です。パーティションとは何かを学ぶには、[ALTER](/sql-reference/statements/alter) クエリの説明を参照してください。

    形式:

    - `YYYYMM` は月ごとの自動パーティショニングです。
    - `any_string` は手動でのパーティショニングです。

- `name` ([String](../../sql-reference/data-types/string.md)) — データパーツの名前です。

- `part_type` ([String](../../sql-reference/data-types/string.md)) — データパーツの保存形式です。

    可能な値:

    - `Wide` — 各カラムがファイルシステム内の別々のファイルに保存されます。
    - `Compact` — すべてのカラムがファイルシステム内の1つのファイルに保存されます。

    データ保存形式は、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルの `min_bytes_for_wide_part` および `min_rows_for_wide_part` 設定によって制御されます。

- `active` ([UInt8](../../sql-reference/data-types/int-uint.md)) — データパーツがアクティブかどうかを示すフラグです。データパーツがアクティブな場合、それはテーブルで使用されます。そうでない場合は削除されます。非アクティブなデータパーツはマージ後に残ります。

- `marks` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マークの数です。データパーツ内の行の概算数を得るには、`marks` にインデックスの粒度（通常は 8192）を掛けます（このヒントは適応粒度には適用されません）。

- `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 行数です。

- `bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパーツファイルの総サイズ（バイト単位）です。

- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパーツ内の圧縮データの総サイズです。すべての補助ファイル（例えば、マークを含むファイル）は含まれません。

- `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパーツ内の非圧縮データの総サイズです。すべての補助ファイル（例えば、マークを含むファイル）は含まれません。

- `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マークのあるファイルのサイズです。

- `modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — データパーツのディレクトリが変更された時間です。これは通常、データパーツの作成時間に対応します。

- `remove_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — データパーツが非アクティブになった時間です。

- `refcount` ([UInt32](../../sql-reference/data-types/int-uint.md)) — データパーツが使用されている場所の数です。2より大きい値は、データパーツがクエリやマージに使用されていることを示します。

- `min_date` ([Date](../../sql-reference/data-types/date.md)) — データパーツ内の日時キーの最小値です。

- `max_date` ([Date](../../sql-reference/data-types/date.md)) — データパーツ内の日時キーの最大値です。

- `partition_id` ([String](../../sql-reference/data-types/string.md)) — パーティションのIDです。

- `min_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マージ後に現在のパーツを構成するデータパーツの最小数です。

- `max_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マージ後に現在のパーツを構成するデータパーツの最大数です。

- `level` ([UInt32](../../sql-reference/data-types/int-uint.md)) — マージツリーの深さです。ゼロは、現在のパーツが他のパーツをマージするのではなく、挿入によって作成されたことを意味します。

- `data_version` ([UInt64](../../sql-reference/data-types/int-uint.md)) — どの変更がデータパーツに適用されるべきかを判断するために使用される番号（`data_version` より高いバージョンの変更）です。

- `primary_key_bytes_in_memory` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 主キー値によって使用されるメモリの量（バイト単位）です。

- `primary_key_bytes_in_memory_allocated` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 主キー値のために予約されたメモリの量（バイト単位）です。

- `database` ([String](../../sql-reference/data-types/string.md)) — データベースの名前です。

- `table` ([String](../../sql-reference/data-types/string.md)) — テーブルの名前です。

- `engine` ([String](../../sql-reference/data-types/string.md)) — パラメータなしのテーブルエンジンの名前です。

- `disk_name` ([String](../../sql-reference/data-types/string.md)) — データパーツを保存しているディスクの名前です。

- `path` ([String](../../sql-reference/data-types/string.md)) — データパーツファイルのフォルダへの絶対パスです。

- `column` ([String](../../sql-reference/data-types/string.md)) — カラムの名前です。

- `type` ([String](../../sql-reference/data-types/string.md)) — カラムの型です。

- `column_position` ([UInt64](../../sql-reference/data-types/int-uint.md)) — テーブル内のカラムの序数位置（1から始まります）です。

- `default_kind` ([String](../../sql-reference/data-types/string.md)) — デフォルト値の式のタイプ（`DEFAULT`, `MATERIALIZED`, `ALIAS`）または未定義の場合は空の文字列です。

- `default_expression` ([String](../../sql-reference/data-types/string.md)) — デフォルト値の式、または未定義の場合は空の文字列です。

- `column_bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) — カラムの総サイズ（バイト単位）です。

- `column_data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — カラム内の圧縮データの総サイズ（バイト単位）です。

- `column_data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — カラム内の非圧縮データの総サイズ（バイト単位）です。

- `column_marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マークのあるカラムのサイズ（バイト単位）です。

- `bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `bytes_on_disk` の別名です。

- `marks_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `marks_bytes` の別名です。

**例**

```sql
SELECT * FROM system.parts_columns LIMIT 1 FORMAT Vertical;
```

```text
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

**関連情報**

- [MergeTree ファミリー](../../engines/table-engines/mergetree-family/mergetree.md)
