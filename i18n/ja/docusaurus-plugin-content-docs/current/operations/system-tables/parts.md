---
slug: /operations/system-tables/parts
title: "パーツ"
keywords: ["システムテーブル", "パーツ"]
---

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブルのパーツに関する情報を含みます。

各行は1つのデータパーツを説明します。

カラム:

- `partition` ([String](../../sql-reference/data-types/string.md)) – パーティション名。パーティションについての詳細は、[ALTER](../../sql-reference/statements/alter/index.md#query_language_queries_alter)クエリの説明を参照してください。

    フォーマット:

    - 月による自動パーティショニングの場合は `YYYYMM`。
    - 手動でパーティションを分ける場合は `any_string`。

- `name` ([String](../../sql-reference/data-types/string.md)) – データパーツの名前。パーツの命名構造は、データ、インジェスト、およびマージのパターンを判断するために使用できます。パーツの命名フォーマットは次の通りです：

```text
<partition_id>_<minimum_block_number>_<maximum_block_number>_<level>_<data_version>
```

* 定義:
     - `partition_id` - パーティションキーを識別します
     - `minimum_block_number` - パーツ内の最小ブロック番号を識別します。ClickHouseは常に連続するブロックをマージします
     - `maximum_block_number` - パーツ内の最大ブロック番号を識別します
     - `level` - パーツのマージが行われるごとに1ずつ増加します。0のレベルは、マージされていない新しいパーツを示します。ClickHouse内のすべてのパーツは常に不変であることを忘れないでください
     - `data_version` - オプションの値で、部分が変化する際に増加します（再度、変化したデータは常に新しいパーツにのみ書き込まれ、パーツは不変です）

- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) - データパーツのUUID。

- `part_type` ([String](../../sql-reference/data-types/string.md)) — データパーツのストレージフォーマット。

    可能な値:

    - `Wide` — 各カラムがファイルシステム内の別々のファイルに保存されます。
    - `Compact` — すべてのカラムがファイルシステム内の1つのファイルに保存されます。

    データストレージフォーマットは、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブルの `min_bytes_for_wide_part` と `min_rows_for_wide_part` 設定によって制御されます。

- `active` ([UInt8](../../sql-reference/data-types/int-uint.md)) – データパーツがアクティブかどうかを示すフラグ。データパーツがアクティブであれば、テーブルで使用されます。それ以外の場合は削除されます。非アクティブなデータパーツはマージ後も残ります。

- `marks` ([UInt64](../../sql-reference/data-types/int-uint.md)) – マークの数。データパーツ内の行数のおおよその数を得るには、`marks` にインデックスの粒度（通常は8192）を掛けます（このヒントは適応粒度には適用されません）。

- `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 行の数。

- `bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) – データパーツファイルの総サイズ（バイト）。

- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – データパーツ内の圧縮データの総サイズ。すべての補助ファイル（例：マークのあるファイル）は含まれません。

- `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – データパーツ内の非圧縮データの総サイズ。すべての補助ファイル（例：マークのあるファイル）は含まれません。

- `primary_key_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) – ディスク上の primary.idx/cidx ファイル内の主キー値によって使用されるメモリ量（バイト）。

- `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – マークのファイルサイズ。

- `secondary_indices_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – データパーツのセカンダリインデックスの圧縮データの総サイズ。すべての補助ファイル（例：マークのあるファイル）は含まれません。

- `secondary_indices_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – データパーツのセカンダリインデックスの非圧縮データの総サイズ。すべての補助ファイル（例：マークのあるファイル）は含まれません。

- `secondary_indices_marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – セカンダリインデックス用のマークのファイルサイズ。

- `modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – データパーツのディレクトリが変更された時間。通常はデータパーツの作成時間に対応します。

- `remove_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – データパーツが非アクティブになった時間。

- `refcount` ([UInt32](../../sql-reference/data-types/int-uint.md)) – データパーツが使用されている場所の数。2より大きい値は、データパーツがクエリやマージで使用されていることを示します。

- `min_date` ([Date](../../sql-reference/data-types/date.md)) – データパーツ内の日付キーの最小値。

- `max_date` ([Date](../../sql-reference/data-types/date.md)) – データパーツ内の日付キーの最大値。

- `min_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – データパーツ内の日付および時間キーの最小値。

- `max_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – データパーツ内の日付および時間キーの最大値。

- `partition_id` ([String](../../sql-reference/data-types/string.md)) – パーティションのID。

- `min_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) – マージ後の現在のパーツを構成する最小データブロック番号。

- `max_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) – マージ後の現在のパーツを構成する最大データブロック番号。

- `level` ([UInt32](../../sql-reference/data-types/int-uint.md)) – マージツリーの深さ。ゼロは、現在のパーツが他のパーツをマージするのではなく、挿入によって作成されたことを意味します。

- `data_version` ([UInt64](../../sql-reference/data-types/int-uint.md)) – データパーツに適用されるべき変異を決定するために使用される数（`data_version` よりもバージョンが高い変異）。

- `primary_key_bytes_in_memory` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 主キー値によって使用されるメモリ量（バイト）。

- `primary_key_bytes_in_memory_allocated` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 主キー値に予約されたメモリ量（バイト）。

- `is_frozen` ([UInt8](../../sql-reference/data-types/int-uint.md)) – パーティションデータのバックアップが存在することを示すフラグ。1はバックアップが存在することを示し、0は存在しないことを示します。詳細については、[FREEZE PARTITION](../../sql-reference/statements/alter/partition.md/#alter_freeze-partition)を参照してください。

- `database` ([String](../../sql-reference/data-types/string.md)) – データベースの名前。

- `table` ([String](../../sql-reference/data-types/string.md)) – テーブルの名前。

- `engine` ([String](../../sql-reference/data-types/string.md)) – パラメータなしのテーブルエンジンの名前。

- `path` ([String](../../sql-reference/data-types/string.md)) – データパーツファイルのフォルダーへの絶対パス。

- `disk_name` ([String](../../sql-reference/data-types/string.md)) – データパーツを保存するディスクの名前。

- `hash_of_all_files` ([String](../../sql-reference/data-types/string.md)) – 圧縮ファイルの[sipHash128](../../sql-reference/functions/hash-functions.md/#hash_functions-siphash128)。

- `hash_of_uncompressed_files` ([String](../../sql-reference/data-types/string.md)) – 非圧縮ファイルの[sipHash128](../../sql-reference/functions/hash-functions.md/#hash_functions-siphash128)（マークのあるファイル、インデックスファイルなど）。

- `uncompressed_hash_of_compressed_files` ([String](../../sql-reference/data-types/string.md)) – 圧縮ファイル内のデータの[sipHash128](../../sql-reference/functions/hash-functions.md/#hash_functions-siphash128)（非圧縮されているかのように）。

- `delete_ttl_info_min` ([DateTime](../../sql-reference/data-types/datetime.md)) — [TTL DELETE ルール](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)のための日付および時間キーの最小値。

- `delete_ttl_info_max` ([DateTime](../../sql-reference/data-types/datetime.md)) — [TTL DELETE ルール](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)のための日付および時間キーの最大値。

- `move_ttl_info.expression` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 式の配列。各式は[TTL MOVE ルール](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)を定義します。

:::note
`move_ttl_info.expression`配列は主に後方互換性のために保持されています。現在、最も簡単な方法は、`move_ttl_info.min`および`move_ttl_info.max`フィールドを使用して`TTL MOVE`ルールを確認することです。
:::

- `move_ttl_info.min` ([Array](../../sql-reference/data-types/array.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 日付および時間値の配列。各要素は[TTL MOVE ルール](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)のための最小キー値を説明します。

- `move_ttl_info.max` ([Array](../../sql-reference/data-types/array.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 日付および時間値の配列。各要素は[TTL MOVE ルール](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)のための最大キー値を説明します。

- `bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – `bytes_on_disk`のエイリアス。

- `marks_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) – `marks_bytes`のエイリアス。

**例**

``` sql
SELECT * FROM system.parts LIMIT 1 FORMAT Vertical;
```

``` text
行 1:
──────
partition:                             tuple()
name:                                  all_1_4_1_6
part_type:                             Wide
active:                                1
marks:                                 2
rows:                                  6
bytes_on_disk:                         310
data_compressed_bytes:                 157
data_uncompressed_bytes:               91
secondary_indices_compressed_bytes:    58
secondary_indices_uncompressed_bytes:  6
secondary_indices_marks_bytes:         48
marks_bytes:                           144
modification_time:                     2020-06-18 13:01:49
remove_time:                           1970-01-01 00:00:00
refcount:                              1
min_date:                              1970-01-01
max_date:                              1970-01-01
min_time:                              1970-01-01 00:00:00
max_time:                              1970-01-01 00:00:00
partition_id:                          all
min_block_number:                      1
max_block_number:                      4
level:                                 1
data_version:                          6
primary_key_bytes_in_memory:           8
primary_key_bytes_in_memory_allocated: 64
is_frozen:                             0
database:                              default
table:                                 months
engine:                                MergeTree
disk_name:                             default
path:                                  /var/lib/clickhouse/data/default/months/all_1_4_1_6/
hash_of_all_files:                     2d0657a16d9430824d35e327fcbd87bf
hash_of_uncompressed_files:            84950cc30ba867c77a408ae21332ba29
uncompressed_hash_of_compressed_files: 1ad78f1c6843bbfb99a2c931abe7df7d
delete_ttl_info_min:                   1970-01-01 00:00:00
delete_ttl_info_max:                   1970-01-01 00:00:00
move_ttl_info.expression:              []
move_ttl_info.min:                     []
move_ttl_info.max:                     []
```

**関連項目**

- [MergeTreeファミリー](../../engines/table-engines/mergetree-family/mergetree.md)
- [カラムとテーブルのためのTTL](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)
