---
'description': 'システムテーブルで、MergeTreeのパーツに関する情報を含みます'
'keywords':
- 'system table'
- 'parts'
'slug': '/operations/system-tables/parts'
'title': 'system.parts'
'doc_type': 'reference'
---


# system.parts

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのパーツに関する情報を含みます。

各行は、1つのデータパートを説明します。

カラム:

- `partition` ([String](../../sql-reference/data-types/string.md)) – パーティション名。パーティションについて学ぶには、[ALTER](/sql-reference/statements/alter) クエリの説明を参照してください。

    フォーマット:

  - 月ごとに自動パーティショニングの場合は `YYYYMM` 。
  - 手動でパーティショニングする場合は `any_string` 。

- `name` ([String](../../sql-reference/data-types/string.md)) – データパートの名前。パート命名構造は、データ、取り込み、マージパターンの多くの側面を決定するのに使用できます。パート名のフォーマットは次の通りです：

```text
<partition_id>_<minimum_block_number>_<maximum_block_number>_<level>_<data_version>
```

* 定義:
  - `partition_id` - パーティションキーを識別します
  - `minimum_block_number` - パート内の最小ブロック番号を識別します。ClickHouseは常に連続したブロックをマージします
  - `maximum_block_number` - パート内の最大ブロック番号を識別します
  - `level` - パートに対する追加のマージごとに1ずつ増加します。レベルが0の場合は、まだマージされていない新しいパートを示します。ClickHouseではすべてのパートが常に不変であることを思い出すことが重要です
  - `data_version` - オプションの値で、パートが変更されると増加します（再度、変更されたデータは常に新しいパートにのみ書き込まれ、パートは不変です）

- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) - データパートのUUID。

- `part_type` ([String](../../sql-reference/data-types/string.md)) — データパートのストレージフォーマット。

    可能な値:

  - `Wide` — 各カラムはファイルシステム内の別々のファイルに保存されます。
  - `Compact` — すべてのカラムがファイルシステム内の1つのファイルに保存されます。

    データストレージフォーマットは、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルの `min_bytes_for_wide_part` および `min_rows_for_wide_part` 設定によって制御されます。

- `active` ([UInt8](../../sql-reference/data-types/int-uint.md)) – データパートがアクティブかどうかを示すフラグ。データパートがアクティブな場合、それはテーブルで使用されます。そうでない場合、それは削除されます。非アクティブなデータパーツはマージ後に残ります。

- `marks` ([UInt64](../../sql-reference/data-types/int-uint.md)) – マークの数。データパート内の行数の概算を取得するには、`marks` にインデックスの粒度（通常は8192）を掛けます（このヒントは適応粒度には機能しません）。

- `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 行の数。

- `bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) – バイト単位のデータパートファイルの合計サイズ。

- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – データパート内の圧縮データの合計サイズ。すべての補助ファイル（たとえば、マークのあるファイル）は含まれません。

- `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – データパート内の未圧縮データの合計サイズ。すべての補助ファイル（たとえば、マークのあるファイル）は含まれません。

- `primary_key_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) – ディスク上の primary.idx/cidx ファイルで主キー値によって使用されるメモリの量（バイト単位）。

- `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – マークのあるファイルのサイズ。

- `secondary_indices_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – データパート内のセカンダリインデックスの圧縮データの合計サイズ。すべての補助ファイル（たとえば、マークのあるファイル）は含まれません。

- `secondary_indices_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – データパート内のセカンダリインデックスの未圧縮データの合計サイズ。すべての補助ファイル（たとえば、マークのあるファイル）は含まれません。

- `secondary_indices_marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – セカンダリインデックスのマークのあるファイルのサイズ。

- `modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – データパートのディレクトリが変更された時間。これは通常、データパート作成時に対応します。

- `remove_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – データパートが非アクティブになった時間。

- `refcount` ([UInt32](../../sql-reference/data-types/int-uint.md)) – データパートが使用されている場所の数。値が2より大きい場合は、データパートがクエリまたはマージに使用されていることを示します。

- `min_date` ([Date](../../sql-reference/data-types/date.md)) – データパート内の日付キーの最小値。

- `max_date` ([Date](../../sql-reference/data-types/date.md)) – データパート内の日付キーの最大値。

- `min_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – データパート内の日付と時間キーの最小値。

- `max_time`([DateTime](../../sql-reference/data-types/datetime.md)) – データパート内の日付と時間キーの最大値。

- `partition_id` ([String](../../sql-reference/data-types/string.md)) – パーティションのID。

- `min_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) – マージ後の現在のパートを構成する最小データブロック番号。

- `max_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) – マージ後の現在のパートを構成する最大データブロック番号。

- `level` ([UInt32](../../sql-reference/data-types/int-uint.md)) – マージツリーの深さ。ゼロは、現在のパートが他のパートのマージによってではなく、挿入によって作成されたことを意味します。

- `data_version` ([UInt64](../../sql-reference/data-types/int-uint.md)) – データパートに適用されるべき変更を判定するために使用される番号（`data_version` よりも大きいバージョンの変更）。

- `primary_key_bytes_in_memory` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 主キー値に使用されるメモリ量（バイト単位）（`primary_key_lazy_load=1` および `use_primary_key_cache=1` の場合は `0` になります）。

- `primary_key_bytes_in_memory_allocated` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 主キー値のために予約されたメモリ量（バイト単位）（`primary_key_lazy_load=1` および `use_primary_key_cache=1` の場合は `0` になります）。

- `is_frozen` ([UInt8](../../sql-reference/data-types/int-uint.md)) – パーティションデータのバックアップが存在することを示すフラグ。1 はバックアップが存在することを示し、0 はバックアップが存在しないことを示します。詳細については、[FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition) を参照してください。

- `database` ([String](../../sql-reference/data-types/string.md)) – データベースの名前。

- `table` ([String](../../sql-reference/data-types/string.md)) – テーブルの名前。

- `engine` ([String](../../sql-reference/data-types/string.md)) – パラメーターなしのテーブルエンジンの名前。

- `path` ([String](../../sql-reference/data-types/string.md)) – データパートファイルがあるフォルダの絶対パス。

- `disk_name` ([String](../../sql-reference/data-types/string.md)) – データパートを保存しているディスクの名前。

- `hash_of_all_files` ([String](../../sql-reference/data-types/string.md)) – [sipHash128](/sql-reference/functions/hash-functions#sipHash128) の圧縮ファイル。

- `hash_of_uncompressed_files` ([String](../../sql-reference/data-types/string.md)) – [sipHash128](/sql-reference/functions/hash-functions#sipHash128) の未圧縮ファイル（マークのあるファイル、インデックスファイルなど）。

- `uncompressed_hash_of_compressed_files` ([String](../../sql-reference/data-types/string.md)) – 圧縮ファイル内のデータの[sipHash128](/sql-reference/functions/hash-functions#sipHash128)、未圧縮された場合のように。

- `delete_ttl_info_min` ([DateTime](../../sql-reference/data-types/datetime.md)) — [TTL DELETE ルール](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)のための日付と時刻キーの最小値。

- `delete_ttl_info_max` ([DateTime](../../sql-reference/data-types/datetime.md)) — [TTL DELETE ルール](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)のための日付と時刻キーの最大値。

- `move_ttl_info.expression` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 式の配列。各式は、[TTL MOVE ルール](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)を定義します。

:::note
`move_ttl_info.expression` 配列は主に後方互換性のために保持されており、現在の最も簡単な方法は、`move_ttl_info.min` および `move_ttl_info.max` フィールドを使用して `TTL MOVE` ルールを確認することです。
:::

- `move_ttl_info.min` ([Array](../../sql-reference/data-types/array.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 日付と時刻の値の配列。各要素は、[TTL MOVE ルール](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)の最小キー値を説明します。

- `move_ttl_info.max` ([Array](../../sql-reference/data-types/array.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 日付と時刻の値の配列。各要素は、[TTL MOVE ルール](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)の最大キー値を説明します。

- `bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – `bytes_on_disk` のエイリアス。

- `marks_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) – `marks_bytes` のエイリアス。

**例**

```sql
SELECT * FROM system.parts LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
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

**関連情報**

- [MergeTree ファミリー](../../engines/table-engines/mergetree-family/mergetree.md)
- [カラムとテーブルのためのTTL](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)
