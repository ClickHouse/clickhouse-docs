---
description: 'MergeTree テーブルのパーツおよびカラムに関する情報を保持するシステムテーブル。'
keywords: ['システムテーブル', 'parts_columns']
slug: /operations/system-tables/parts_columns
title: 'system.parts_columns'
doc_type: 'reference'
---

# system.parts_columns

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのパーツおよびカラムに関する情報が含まれます。

各行は 1 つのデータパーツを表します。

カラム:

* `partition` ([String](../../sql-reference/data-types/string.md)) — パーティション名。パーティションの詳細については、[ALTER](/sql-reference/statements/alter) クエリの説明を参照してください。

  フォーマット：

  * 月単位で自動パーティションを作成する場合は `YYYYMM` を使用します。
  * 手動でパーティションを指定する場合は `any_string` を使用します。

* `name` ([String](../../sql-reference/data-types/string.md)) — データパーツの名前。

* `part_type` ([String](../../sql-reference/data-types/string.md)) — データパーツの格納形式。

  指定可能な値:

  * `Wide` — 各カラムがファイルシステム内の個別ファイルに格納されます。
  * `Compact` — すべてのカラムがファイルシステム内の1つのファイルに格納されます。

    データの格納形式は、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルの `min_bytes_for_wide_part` および `min_rows_for_wide_part` 設定によって制御されます。

* `active` ([UInt8](../../sql-reference/data-types/int-uint.md)) — データパーツがアクティブかどうかを示すフラグ。データパーツがアクティブな場合はテーブルで使用され、そうでない場合は削除されます。非アクティブなデータパーツはマージ後も残ります。

* `marks` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マークの数。データパーツ内のおおよその行数を見積もるには、`marks` にインデックス粒度（通常は 8192）を掛けます（この目安はアダプティブ粒度には適用されません）。

* `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 行数。

* `bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) — すべてのデータパーツファイルの合計サイズ（バイト単位）。

* `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパーツ内の圧縮データの合計サイズ。補助ファイル（たとえばマークファイルなど）は含まれません。

* `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパート内の非圧縮データの合計サイズ。すべての補助ファイル（たとえば、マークを格納するファイル）は含まれません。

* `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マークファイルのサイズ（バイト単位）。

* `modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — データパーツが格納されているディレクトリが更新された時刻。通常はデータパーツの作成時刻に相当します。

* `remove_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — データパーツが非アクティブになった日時。

* `refcount` ([UInt32](../../sql-reference/data-types/int-uint.md)) — データパーツが使用されている箇所の数。2 より大きい値は、そのデータパーツがクエリまたはマージで使用されていることを示します。

* `min_date` ([Date](../../sql-reference/data-types/date.md)) — データパート内の日付キーの最小値。

* `max_date` ([Date](../../sql-reference/data-types/date.md)) — データパートにおける日付キーの最大値。

* `partition_id` ([String](../../sql-reference/data-types/string.md)) — パーティションのID。

* `min_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マージ後の現在のパーツを構成するデータパーツ番号の最小値。

* `max_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マージ後の現在のパーツを構成するデータパーツ数の最大値。

* `level` ([UInt32](../../sql-reference/data-types/int-uint.md)) — マージツリーにおける深さ。0 の場合、このパートは他のパートのマージではなく、INSERT によって作成されたことを意味します。

* `data_version` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパーツにどのミューテーションを適用すべきかを判定するために使用される数値（`data_version` より大きいバージョンを持つミューテーションが対象）。

* `primary_key_bytes_in_memory` ([UInt64](../../sql-reference/data-types/int-uint.md)) — プライマリキー値に使用されているメモリ量（バイト単位）。

* `primary_key_bytes_in_memory_allocated` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 主キー値用に確保されているメモリ量（バイト単位）。

* `database` ([String](../../sql-reference/data-types/string.md)) — データベースの名前。

* `table` ([String](../../sql-reference/data-types/string.md)) — テーブルの名前。

* `engine` ([String](../../sql-reference/data-types/string.md)) — パラメータなしのテーブルエンジン名。

* `disk_name` ([String](../../sql-reference/data-types/string.md)) — データパートを保存しているディスクの名前。

* `path` ([String](../../sql-reference/data-types/string.md)) — データパーツファイルが格納されているフォルダへの絶対パス。

* `column` ([String](../../sql-reference/data-types/string.md)) — 列名。

* `type` ([String](../../sql-reference/data-types/string.md)) — 列の型。

* `column_position` ([UInt64](../../sql-reference/data-types/int-uint.md)) — テーブル内の列の序数位置。1から始まる。

* `default_kind` ([String](../../sql-reference/data-types/string.md)) — デフォルト値の式の種類（`DEFAULT`、`MATERIALIZED`、`ALIAS`）を表し、未定義の場合は空文字列になります。

* `default_expression` ([String](../../sql-reference/data-types/string.md)) — デフォルト値を与える式。未定義の場合は空文字列。

* `column_bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 列の合計サイズ（バイト単位）。

* `column_data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 列内の圧縮済みデータの合計サイズ（バイト単位）。

* `column_data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — カラム内の解凍（非圧縮）データの合計サイズ（バイト単位）。

* `column_marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マーク付きカラムのサイズ（バイト単位）。

* `bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `bytes_on_disk` の別名。

* `marks_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `marks_bytes` のエイリアス。

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
