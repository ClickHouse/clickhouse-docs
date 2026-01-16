---
description: 'MergeTree テーブルのパーツおよび列に関する情報を保持する system テーブル。'
keywords: ['system テーブル', 'parts_columns']
slug: /operations/system-tables/parts_columns
title: 'system.parts_columns'
doc_type: 'reference'
---

# system.parts&#95;columns \\{#systemparts&#95;columns\\}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのパーツおよび列に関する情報を含んでいます。

各行は1つのデータパーツを表します。

列:

* `partition` ([String](../../sql-reference/data-types/string.md)) — パーティション名。パーティションについては、[ALTER](/sql-reference/statements/alter) クエリの説明を参照してください。

  フォーマット：

  * 月ごとの自動パーティション作成には `YYYYMM` を使用します。
  * 手動でパーティションを指定する場合は `any_string` を使用します。

* `name` ([String](../../sql-reference/data-types/string.md)) — データパーツの名称。

* `part_type` ([String](../../sql-reference/data-types/string.md)) — データパーツの格納形式。

  指定可能な値:

  * `Wide` — 各列はファイルシステム内の個別のファイルに保存されます。
  * `Compact` — すべての列はファイルシステム内の1つのファイルに保存されます。

    データの格納形式は、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルの `min_bytes_for_wide_part` および `min_rows_for_wide_part` 設定によって制御されます。

* `active` ([UInt8](../../sql-reference/data-types/int-uint.md)) — データパーツがアクティブかどうかを示すフラグ。データパーツがアクティブな場合、そのパーツはテーブルで使用される。それ以外の場合は削除される。マージ後も非アクティブなデータパーツは残る。

* `marks` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マーク数。データパート内のおおよその行数を求めるには、`marks` にインデックスの粒度（通常は 8192）を掛けます（このヒントはアダプティブ粒度には使用できません）。

* `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 行数。

* `bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) — すべてのデータパーツのファイルサイズの合計（バイト単位）。

* `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパーツ内の圧縮済みデータの合計サイズ。マークファイルなどの補助ファイルは含まれません。

* `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパーツ内の非圧縮データの合計サイズ。すべての補助ファイル（たとえばマークを含むファイルなど）は含まれません。

* `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マークを格納するファイルのサイズ。

* `modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — データパーツを含むディレクトリが更新された時刻。通常はデータパーツが作成された時刻に対応します。

* `remove_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — データパートが非アクティブになった時刻。

* `refcount` ([UInt32](../../sql-reference/data-types/int-uint.md)) — データパーツが使用されている場所の数。値が 2 より大きい場合、そのデータパーツがクエリまたはマージで使用されていることを示します。

* `min_date` ([Date](../../sql-reference/data-types/date.md)) — データパートに含まれる日付キーの最小値。

* `max_date` ([Date](../../sql-reference/data-types/date.md)) — データパート内の日付キーの最大値。

* `partition_id` ([String](../../sql-reference/data-types/string.md)) — パーティションのID。

* `min_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マージ後の現在のパーツを構成するデータパーツの最小番号。

* `max_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マージ後に現在のパーツを構成するデータパーツ数の最大値。

* `level` ([UInt32](../../sql-reference/data-types/int-uint.md)) — マージツリー内での深さ。0 は、現在のパーツが他のパーツをマージしてではなく、挿入によって作成されたことを意味します。

* `data_version` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパートにどのミューテーションを適用すべきかを判定するために使用される数値（`data_version` より大きいバージョンを持つミューテーションが適用される）。

* `primary_key_bytes_in_memory` ([UInt64](../../sql-reference/data-types/int-uint.md)) — プライマリキー値により使用されているメモリ量（バイト単位）。

* `primary_key_bytes_in_memory_allocated` ([UInt64](../../sql-reference/data-types/int-uint.md)) — プライマリキー値用に確保されているメモリ量（バイト単位）。

* `database` ([String](../../sql-reference/data-types/string.md)) — データベースの名前。

* `table` ([String](../../sql-reference/data-types/string.md)) — テーブルの名前。

* `engine` ([String](../../sql-reference/data-types/string.md)) — パラメータを含まないテーブルエンジン名。

* `disk_name` ([String](../../sql-reference/data-types/string.md)) — データパーツを格納しているディスクの名前。

* `path` ([String](../../sql-reference/data-types/string.md)) — データパートのファイルが格納されているフォルダへの絶対パス。

* `column` ([String](../../sql-reference/data-types/string.md)) — カラム名。

* `type` ([String](../../sql-reference/data-types/string.md)) — 列のデータ型。

* `column_position` ([UInt64](../../sql-reference/data-types/int-uint.md)) — テーブル内の列の位置（1 から開始）。

* `default_kind` ([String](../../sql-reference/data-types/string.md)) — デフォルト値に対する式タイプ（`DEFAULT`、`MATERIALIZED`、`ALIAS`）。定義されていない場合は空文字列となります。

* `default_expression` ([String](../../sql-reference/data-types/string.md)) — デフォルト値の式。定義されていない場合は空文字列。

* `column_bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) — カラムの合計サイズ（バイト数）。

* `column_data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 列内の圧縮されたデータの合計サイズ（バイト単位）。

* `column_data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 列内の非圧縮データの合計サイズ（バイト単位）。

* `column_marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マークを含むカラムのサイズ（バイト単位）。

* `bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `bytes_on_disk` のエイリアス。

* `marks_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `marks_bytes` のエイリアスです。

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

**関連項目**

* [MergeTree ファミリー](../../engines/table-engines/mergetree-family/mergetree.md)
