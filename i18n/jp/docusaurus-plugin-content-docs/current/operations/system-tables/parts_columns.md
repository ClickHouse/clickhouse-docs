---
description: 'MergeTree テーブルのパーツおよび列に関する情報を保持する system テーブル。'
keywords: ['system テーブル', 'parts_columns']
slug: /operations/system-tables/parts_columns
title: 'system.parts_columns'
doc_type: 'reference'
---

# system.parts_columns \{#systemparts_columns\}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのパーツおよびカラムに関する情報を保持します。
各行は 1 つのデータパートを表します。

| Column                                  | Type     | Description                                                                                                                                     |
| --------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `partition`                             | String   | パーティション名。形式: 月ごとの自動パーティションでは `YYYYMM`、手動パーティションでは `any_string`。                                                                                 |
| `name`                                  | String   | データパートの名前。                                                                                                                                      |
| `part_type`                             | String   | データパートの保存フォーマット。値: `Wide`（各カラムを個別ファイルに保存）または `Compact`（すべてのカラムを 1 ファイルに保存）。`min_bytes_for_wide_part` および `min_rows_for_wide_part` 設定によって制御されます。 |
| `active`                                | UInt8    | データパートがアクティブかどうかを示すフラグ。アクティブなパーツはテーブルで使用され、非アクティブなパーツは削除されるかマージ後に残ります。                                                                          |
| `marks`                                 | UInt64   | マーク数。インデックス粒度（通常 8192）を掛けることで、おおよその行数を取得できます。                                                                                                   |
| `rows`                                  | UInt64   | 行数。                                                                                                                                             |
| `bytes_on_disk`                         | UInt64   | データパート内のすべてのファイルの合計サイズ（バイト単位）。                                                                                                                  |
| `data_compressed_bytes`                 | UInt64   | データパート内の圧縮データの合計サイズ（マークなどの補助ファイルを除く）。                                                                                                           |
| `data_uncompressed_bytes`               | UInt64   | データパート内の非圧縮データの合計サイズ（マークなどの補助ファイルを除く）。                                                                                                          |
| `marks_bytes`                           | UInt64   | マークファイルのサイズ。                                                                                                                                    |
| `modification_time`                     | DateTime | データパートを含むディレクトリが更新された時刻（通常は作成時刻に相当）。                                                                                                            |
| `remove_time`                           | DateTime | データパートが非アクティブになった時刻。                                                                                                                            |
| `refcount`                              | UInt32   | データパートが使用されている箇所の数。値が 2 より大きい場合、クエリまたはマージで使用されていることを示します。                                                                                       |
| `min_date`                              | Date     | データパート内の日付キーの最小値。                                                                                                                               |
| `max_date`                              | Date     | データパート内の日付キーの最大値。                                                                                                                               |
| `partition_id`                          | String   | パーティションの ID。                                                                                                                                    |
| `min_block_number`                      | UInt64   | マージ後に現在のパートを構成するデータパートの最小ブロック番号。                                                                                                                |
| `max_block_number`                      | UInt64   | マージ後に現在のパートを構成するデータパートの最大ブロック番号。                                                                                                                |
| `level`                                 | UInt32   | マージツリーの深さ。ゼロは INSERT によって作成され、マージによるものではないことを意味します。                                                                                             |
| `data_version`                          | UInt64   | どのミューテーションを適用すべきかを決定するために使用される番号であり、`data_version` より大きいバージョンを持つミューテーションが対象になります。                                                               |
| `primary_key_bytes_in_memory`           | UInt64   | プライマリキー値に使用されているメモリ量（バイト単位）。                                                                                                                    |
| `primary_key_bytes_in_memory_allocated` | UInt64   | プライマリキー値のために確保されているメモリ量（バイト単位）。                                                                                                                 |
| `database`                              | String   | データベース名。                                                                                                                                        |
| `table`                                 | String   | テーブル名。                                                                                                                                          |
| `engine`                                | String   | パラメータを除いたテーブルエンジン名。                                                                                                                             |
| `disk_name`                             | String   | データパートを保存しているディスク名。                                                                                                                             |
| `path`                                  | String   | データパートファイルが格納されているフォルダへの絶対パス。                                                                                                                   |
| `column`                                | String   | カラム名。                                                                                                                                           |
| `type`                                  | String   | カラムの型。                                                                                                                                          |
| `column_position`                       | UInt64   | テーブル内でのカラムの位置（1 から始まる序数）。                                                                                                                       |
| `default_kind`                          | String   | デフォルト値の式の種類（`DEFAULT`、`MATERIALIZED`、`ALIAS`）、または未定義の場合は空文字列。                                                                                   |
| `default_expression`                    | String   | デフォルト値の式、または未定義の場合は空文字列。                                                                                                                        |
| `column_bytes_on_disk`                  | UInt64   | カラムの合計サイズ（バイト単位）。                                                                                                                               |
| `column_data_compressed_bytes`          | UInt64   | カラム内の圧縮データの合計サイズ（バイト単位）。注意: コンパクトパーツについては計算されません。                                                                                               |
| `column_data_uncompressed_bytes`        | UInt64   | カラム内の非圧縮データの合計サイズ（バイト単位）。注意: コンパクトパーツについては計算されません。                                                                                              |
| `column_marks_bytes`                    | UInt64   | カラムのマークファイルのサイズ（バイト単位）。                                                                                                                         |
| `bytes`                                 | UInt64   | `bytes_on_disk` のエイリアス。                                                                                                                         |
| `marks_size`                            | UInt64   | `marks_bytes` のエイリアス。                                                                                                                           |

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
* [コンパクトおよびワイドパーツの数とサイズの算出](/knowledgebase/count-parts-by-type)
