---
'description': 'システムテーブルは、MergeTree テーブルのパーツとカラムに関する情報を含んでいます。'
'keywords':
- 'system table'
- 'parts_columns'
'slug': '/operations/system-tables/parts_columns'
'title': 'system.parts_columns'
'doc_type': 'reference'
---



# system.parts_columns

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのパーツとカラムに関する情報を含みます。

各行は1つのデータパートを説明します。

カラム:

- `partition` ([String](../../sql-reference/data-types/string.md)) — パーティション名。パーティションとは何かを学ぶには、[ALTER](/sql-reference/statements/alter) クエリの説明を参照してください。

    フォーマット:

  - 月による自動パーティショニングの場合 `YYYYMM`。
  - 手動でパーティショニングする場合は `any_string`。

- `name` ([String](../../sql-reference/data-types/string.md)) — データパートの名称。

- `part_type` ([String](../../sql-reference/data-types/string.md)) — データパートの格納形式。

    可能な値:

  - `Wide` — 各カラムはファイルシステム内の別々のファイルに保存されます。
  - `Compact` — すべてのカラムがファイルシステム内の1つのファイルに保存されます。

    データ格納形式は、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルの `min_bytes_for_wide_part` と `min_rows_for_wide_part` 設定によって制御されます。

- `active` ([UInt8](../../sql-reference/data-types/int-uint.md)) — データパートがアクティブかどうかを示すフラグ。データパートがアクティブであれば、テーブルで使用されます。それ以外の場合は削除されます。非アクティブなデータパートは、マージ後に残ります。

- `marks` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マークの数。データパート内の行数の概算を得るには、`marks` にインデックスの粒度（通常は 8192）を掛けます（このヒントは適応粒度には機能しません）。

- `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 行数。

- `bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) — バイト単位のすべてのデータパートファイルの合計サイズ。

- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパート内の圧縮データの合計サイズ。すべての補助ファイル（例えば、マークのあるファイル）は含まれません。

- `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパート内の非圧縮データの合計サイズ。すべての補助ファイル（例えば、マークのあるファイル）は含まれません。

- `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マークのあるファイルのサイズ。

- `modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — データパートのディレクトリが修正された時間。通常、これはデータパートの作成時間に対応します。

- `remove_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — データパートが非アクティブになった時間。

- `refcount` ([UInt32](../../sql-reference/data-types/int-uint.md)) — データパートが使用されている場所の数。2を超える値は、データパートがクエリまたはマージで使用されていることを示します。

- `min_date` ([Date](../../sql-reference/data-types/date.md)) — データパート内のデートキーの最小値。

- `max_date` ([Date](../../sql-reference/data-types/date.md)) — データパート内のデートキーの最大値。

- `partition_id` ([String](../../sql-reference/data-types/string.md)) — パーティションのID。

- `min_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マージ後の現在のパートを構成する最小データパート数。

- `max_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マージ後の現在のパートを構成する最大データパート数。

- `level` ([UInt32](../../sql-reference/data-types/int-uint.md)) — マージツリーの深さ。ゼロは、現在のパートが他のパートをマージするのではなく、挿入によって作成されたことを意味します。

- `data_version` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパートに適用すべきミューテーション（`data_version` よりもバージョンが高いミューテーション）を決定するために使用される番号。

- `primary_key_bytes_in_memory` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 主キーの値が使用するメモリの量（バイト単位）。

- `primary_key_bytes_in_memory_allocated` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 主キーの値に予約されたメモリの量（バイト単位）。

- `database` ([String](../../sql-reference/data-types/string.md)) — データベースの名称。

- `table` ([String](../../sql-reference/data-types/string.md)) — テーブルの名称。

- `engine` ([String](../../sql-reference/data-types/string.md)) — パラメータなしのテーブルエンジンの名称。

- `disk_name` ([String](../../sql-reference/data-types/string.md)) — データパートを保存するディスクの名称。

- `path` ([String](../../sql-reference/data-types/string.md)) — データパートファイルのフォルダへの絶対パス。

- `column` ([String](../../sql-reference/data-types/string.md)) — カラムの名称。

- `type` ([String](../../sql-reference/data-types/string.md)) — カラムのタイプ。

- `column_position` ([UInt64](../../sql-reference/data-types/int-uint.md)) — テーブル内のカラムの順位（1から始まります）。

- `default_kind` ([String](../../sql-reference/data-types/string.md)) — デフォルト値の式のタイプ（`DEFAULT`、`MATERIALIZED`、`ALIAS`）または未定義の場合は空の文字列。

- `default_expression` ([String](../../sql-reference/data-types/string.md)) — デフォルト値の式、または未定義の場合は空の文字列。

- `column_bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) — バイト単位のカラムの合計サイズ。

- `column_data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — バイト単位のカラム内の圧縮データの合計サイズ。

- `column_data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — バイト単位のカラム内の非圧縮データの合計サイズ。

- `column_marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — バイト単位のマークのあるカラムのサイズ。

- `bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `bytes_on_disk` のエイリアス。

- `marks_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `marks_bytes` のエイリアス。

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

**参照**

- [MergeTree ファミリー](../../engines/table-engines/mergetree-family/mergetree.md)
