---
'description': 'MergeTree のパーツに関する情報を含むシステムテーブル'
'keywords':
- 'system table'
- 'parts'
'slug': '/operations/system-tables/parts'
'title': 'system.parts'
---




# system.parts

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのパーツに関する情報が含まれています。

各行は1つのデータパートを説明します。

カラム:

- `partition` ([String](../../sql-reference/data-types/string.md)) – パーティション名。パーティションについて学ぶには、[ALTER](/sql-reference/statements/alter) クエリの説明を参照してください。

    フォーマット:

    - 月ごとの自動パーティショニングの場合は `YYYYMM` 。
    - 手動でパーティショニングする場合は `any_string` 。

- `name` ([String](../../sql-reference/data-types/string.md)) – データパートの名前。パートの命名構造は、データ、インジェスト、マージパターンの多くの側面を決定するために使用できます。パートの命名フォーマットは以下の通りです:

```text
<partition_id>_<minimum_block_number>_<maximum_block_number>_<level>_<data_version>
```

* 定義:
     - `partition_id` - パーティションキーを識別します。
     - `minimum_block_number` - パート内の最小ブロック番号を識別します。ClickHouseは常に連続したブロックをマージします。
     - `maximum_block_number` - パート内の最大ブロック番号を識別します。
     - `level` - パートに対する各追加マージごとに1加算されます。レベルが0の場合、新しいパートがマージされていないことを示します。ClickHouse内のすべてのパートは常に不変であることを覚えておくことが重要です。
     - `data_version` - オプションの値で、パートが変更されると加算されます（再度、変更されたデータは常に新しいパートにのみ書き込まれます。パートは不変です）。

- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) - データパートのUUID。

- `part_type` ([String](../../sql-reference/data-types/string.md)) — データパートのストレージ形式。

    可能な値:

    - `Wide` — 各カラムがファイルシステム内の別々のファイルに保存されます。
    - `Compact` — すべてのカラムがファイルシステム内の1つのファイルに保存されます。

    データのストレージ形式は、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルの `min_bytes_for_wide_part` および `min_rows_for_wide_part` 設定によって制御されます。

- `active` ([UInt8](../../sql-reference/data-types/int-uint.md)) – データパートがアクティブであるかどうかを示すフラグ。データパートがアクティブな場合、テーブルで使用されます。そうでない場合、削除されます。非アクティブなデータパートは、マージ後に残ります。

- `marks` ([UInt64](../../sql-reference/data-types/int-uint.md)) – マークの数。データパート内の行の推定数を取得するには、`marks` にインデックスの粒度（通常は8192）を掛けます（このヒントは適応粒度には機能しません）。

- `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 行の数。

- `bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) – バイト単位のすべてのデータパートファイルの合計サイズ。

- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – データパート内の圧縮データの合計サイズ。すべての補助ファイル（例えば、マークファイル）は含まれていません。

- `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – データパート内の非圧縮データの合計サイズ。すべての補助ファイル（例えば、マークファイル）は含まれていません。

- `primary_key_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) – ディスク上の primary.idx/cidx ファイル内の主キー値によって使用されるメモリの量（バイト単位）。

- `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – マークファイルのサイズ。

- `secondary_indices_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – データパート内のセカンダリインデックス用の圧縮データの合計サイズ。すべての補助ファイル（例えば、マークファイル）は含まれていません。

- `secondary_indices_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – データパート内のセカンダリインデックス用の非圧縮データの合計サイズ。すべての補助ファイル（例えば、マークファイル）は含まれていません。

- `secondary_indices_marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – セカンダリインデックスのマークファイルのサイズ。

- `modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – データパートのディレクトリが変更された時間。これは通常、データパートの作成時間に対応します。

- `remove_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – データパートが非アクティブになった時間。

- `refcount` ([UInt32](../../sql-reference/data-types/int-uint.md)) – データパートが使用されている場所の数。2より大きい値は、データパートがクエリまたはマージで使用されていることを示します。

- `min_date` ([Date](../../sql-reference/data-types/date.md)) – データパート内の日付キーの最小値。

- `max_date` ([Date](../../sql-reference/data-types/date.md)) – データパート内の日付キーの最大値。

- `min_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – データパート内の日付と時間キーの最小値。

- `max_time`([DateTime](../../sql-reference/data-types/datetime.md)) – データパート内の日付と時間キーの最大値。

- `partition_id` ([String](../../sql-reference/data-types/string.md)) – パーティションのID。

- `min_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) – マージ後の現在のパートを構成する最小データブロック番号。

- `max_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) – マージ後の現在のパートを構成する最大データブロック番号。

- `level` ([UInt32](../../sql-reference/data-types/int-uint.md)) – マージツリーの深さ。ゼロは、現在のパートが他のパートのマージによってではなく、挿入によって作成されたことを意味します。

- `data_version` ([UInt64](../../sql-reference/data-types/int-uint.md)) – データパートに適用すべき変更を決定するために使用される数値（`data_version` よりも高いバージョンの変更）。

- `primary_key_bytes_in_memory` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 主キー値によって使用されるメモリの量（バイト単位）。

- `primary_key_bytes_in_memory_allocated` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 主キー値のために予約されたメモリの量（バイト単位）。

- `is_frozen` ([UInt8](../../sql-reference/data-types/int-uint.md)) – パーティションのデータバックアップが存在することを示すフラグ。1はバックアップが存在することを示し、0はバックアップが存在しないことを示します。詳細については、[FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition)を参照してください。

- `database` ([String](../../sql-reference/data-types/string.md)) – データベースの名前。

- `table` ([String](../../sql-reference/data-types/string.md)) – テーブルの名前。

- `engine` ([String](../../sql-reference/data-types/string.md)) – パラメータなしのテーブルエンジンの名前。

- `path` ([String](../../sql-reference/data-types/string.md)) – データパートファイルのフォルダへの絶対パス。

- `disk_name` ([String](../../sql-reference/data-types/string.md)) – データパートを保存するディスクの名前。

- `hash_of_all_files` ([String](../../sql-reference/data-types/string.md)) – [sipHash128](/sql-reference/functions/hash-functions#siphash128) 圧縮ファイルのハッシュ。

- `hash_of_uncompressed_files` ([String](../../sql-reference/data-types/string.md)) – [sipHash128](/sql-reference/functions/hash-functions#siphash128) 非圧縮ファイル（マークファイル、インデックスファイルなど）のハッシュ。

- `uncompressed_hash_of_compressed_files` ([String](../../sql-reference/data-types/string.md)) – 圧縮ファイル内のデータを非圧縮されたかのように表した[sipHash128](/sql-reference/functions/hash-functions#siphash128)。

- `delete_ttl_info_min` ([DateTime](../../sql-reference/data-types/datetime.md)) — [TTL DELETE ルール](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)のための日付と時間キーの最小値。

- `delete_ttl_info_max` ([DateTime](../../sql-reference/data-types/datetime.md)) — [TTL DELETE ルール](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)のための日付と時間キーの最大値。

- `move_ttl_info.expression` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 式の配列。各式は [TTL MOVE ルール](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl) を定義します。

:::note
`move_ttl_info.expression` 配列は主に後方互換性のために保持されており、現在のところ、最も簡単な方法は `move_ttl_info.min` と `move_ttl_info.max` フィールドを使用して `TTL MOVE` ルールを確認することです。
:::

- `move_ttl_info.min` ([Array](../../sql-reference/data-types/array.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 日付と時間の値の配列。各要素は [TTL MOVE ルール](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)の最小キー値を説明します。

- `move_ttl_info.max` ([Array](../../sql-reference/data-types/array.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 日付と時間の値の配列。各要素は [TTL MOVE ルール](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)の最大キー値を説明します。

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

**参照**

- [MergeTree ファミリー](../../engines/table-engines/mergetree-family/mergetree.md)
- [カラムおよびテーブルの TTL](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)
