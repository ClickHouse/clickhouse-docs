---
description: 'MergeTree のパーツに関する情報が格納されているシステムテーブル'
keywords: ['システムテーブル', 'パーツ']
slug: /operations/system-tables/parts
title: 'system.parts'
doc_type: 'reference'
---

# system.parts

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのパーツに関する情報を含みます。

各行は 1 つのデータパーツを表します。

列:

* `partition` ([String](../../sql-reference/data-types/string.md)) – パーティション名。パーティションとは何かについては、[ALTER](/sql-reference/statements/alter) クエリの説明を参照してください。

  形式:

  * 月ごとの自動パーティション化の場合は `YYYYMM`。
  * 手動でパーティション化する場合は `any_string`。

* `name` ([String](../../sql-reference/data-types/string.md)) – データパーツの名前。パーツ名の構造から、データや取り込み、マージパターンに関する多くの側面を把握できます。パーツ名の形式は次のとおりです。

```text
<partition_id>_<minimum_block_number>_<maximum_block_number>_<level>_<data_version>
```

* 定義：
  * `partition_id` - パーティションキーを識別する
  * `minimum_block_number` - パーツ内の最小ブロック番号を識別する。ClickHouse は常に連続したブロックをマージする
  * `maximum_block_number` - パーツ内の最大ブロック番号を識別する
  * `level` - パーツに対してマージが行われるたびに 1 ずつ増加する。レベル 0 は、まだマージされていない新しいパーツであることを示す。ClickHouse におけるすべてのパーツは常に不変であることを覚えておくことが重要です
  * `data_version` - オプションの値であり、パーツがミューテートされたときに増加する（繰り返しになるが、パーツは不変であるため、ミューテートされたデータは常に新しいパーツにのみ書き込まれる）


* `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) - データパーツのUUID。

* `part_type` ([String](../../sql-reference/data-types/string.md)) — データパーツの保存形式。

  指定可能な値:

  * `Wide` — 各カラムはファイルシステム内の別々のファイルに格納されます。
  * `Compact` — すべてのカラムはファイルシステム内の1つのファイルに格納されます。

    データの格納形式は、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルの `min_bytes_for_wide_part` および `min_rows_for_wide_part` 設定によって制御されます。

* `active` ([UInt8](../../sql-reference/data-types/int-uint.md)) – データパーツがアクティブかどうかを示すフラグ。データパーツがアクティブな場合はテーブルで使用されるが、そうでない場合は削除される。非アクティブなデータパーツはマージ後も残る。

* `marks` ([UInt64](../../sql-reference/data-types/int-uint.md)) – マークの数。データパート内のおおよその行数を見積もるには、`marks` にインデックス粒度（通常は 8192）を掛けます（この目安はアダプティブ粒度には適用されません）。

* `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 行数。

* `bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) – すべてのデータパーツファイルの合計サイズ（バイト単位）。

* `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – データパーツ内の圧縮データの合計サイズ。マークファイルなどの補助ファイルは含まれません。

* `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – データパート内の非圧縮データの合計サイズ。マークファイルなどの補助ファイルは含まれません。

* `primary_key_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) – ディスク上の primary.idx/cidx ファイル内において、プライマリキー値により使用されているメモリ量（バイト単位）。

* `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – マークファイルのサイズ。

* `secondary_indices_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – データパート内のセカンダリインデックス用圧縮データの合計サイズ。すべての補助ファイル（たとえばマークファイル）は含まれません。

* `secondary_indices_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – データパーツ内のセカンダリインデックスに対する非圧縮データの合計サイズ。補助ファイル（たとえばマークを含むファイル）は含まれません。

* `secondary_indices_marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – セカンダリインデックスのマークが格納されているファイルのサイズ。

* `modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – データパーツのディレクトリが変更された時刻。通常はデータパーツが作成された時刻に対応します。

* `remove_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – データパーツが非アクティブになった時刻。

* `refcount` ([UInt32](../../sql-reference/data-types/int-uint.md)) – データパーツが参照されている箇所の数。値が 2 より大きい場合、そのデータパーツがクエリまたはマージで使用されていることを示す。

* `min_date` ([Date](../../sql-reference/data-types/date.md)) – データパート内における日付キーの最小値。

* `max_date` ([Date](../../sql-reference/data-types/date.md)) – データパート内における日付キーの最大値。

* `min_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – データパート内における日時キーの最小値。

* `max_time`([DateTime](../../sql-reference/data-types/datetime.md)) – データパーツ内の日付時刻キーの最大値。

* `partition_id` ([String](../../sql-reference/data-types/string.md)) – パーティション ID。

* `min_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) – マージ後の現在のパーツを構成するデータブロック番号の最小値。

* `max_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) – マージ後に得られた現在のパーツを構成しているデータブロック番号の最大値。

* `level` ([UInt32](../../sql-reference/data-types/int-uint.md)) – マージツリーの深さ。0 は、現在のパーツが他のパーツのマージではなく挿入によって作成されたことを意味します。

* `data_version` ([UInt64](../../sql-reference/data-types/int-uint.md)) – データパーツにどのミューテーションを適用するかを判定するために使用される数値（`data_version` より大きいバージョン番号を持つミューテーションが適用される）。

* `primary_key_bytes_in_memory` ([UInt64](../../sql-reference/data-types/int-uint.md)) – プライマリキー値に使用されているメモリ量（バイト単位）。`primary_key_lazy_load=1` かつ `use_primary_key_cache=1` の場合は `0` になります。

* `primary_key_bytes_in_memory_allocated` ([UInt64](../../sql-reference/data-types/int-uint.md)) – プライマリキー値用に予約されているメモリ量（バイト単位）（`primary_key_lazy_load=1` かつ `use_primary_key_cache=1` の場合は `0`）。

* `is_frozen` ([UInt8](../../sql-reference/data-types/int-uint.md)) – パーティションデータのバックアップが存在することを示すフラグ。1 の場合はバックアップが存在し、0 の場合はバックアップが存在しません。詳細については [FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition) を参照してください。

* `database` ([String](../../sql-reference/data-types/string.md)) – データベース名。

* `table` ([String](../../sql-reference/data-types/string.md)) – テーブルの名前。

* `engine` ([String](../../sql-reference/data-types/string.md)) – パラメータを含まないテーブルエンジンの名前。

* `path` ([String](../../sql-reference/data-types/string.md)) – データパートファイルが格納されているディレクトリへの絶対パス。

* `disk_name` ([String](../../sql-reference/data-types/string.md)) – データパーツを格納しているディスクの名前。

* `hash_of_all_files` ([String](../../sql-reference/data-types/string.md)) – 圧縮済みファイルに対する [sipHash128](/sql-reference/functions/hash-functions#sipHash128) の値。

* `hash_of_uncompressed_files` ([String](../../sql-reference/data-types/string.md)) – 非圧縮ファイル（マークファイル、インデックスファイルなど）に対する [sipHash128](/sql-reference/functions/hash-functions#sipHash128)。

* `uncompressed_hash_of_compressed_files` ([String](../../sql-reference/data-types/string.md)) – 圧縮ファイル内のデータを非圧縮データとして扱った場合に得られる [sipHash128](/sql-reference/functions/hash-functions#sipHash128) ハッシュ値。

* `delete_ttl_info_min` ([DateTime](../../sql-reference/data-types/datetime.md)) — [TTL DELETE ルール](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl) に対する日付と時刻キーの最小値。

* `delete_ttl_info_max` ([DateTime](../../sql-reference/data-types/datetime.md)) — [TTL DELETE ルール](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)における日付時刻キーの最大値。

* `move_ttl_info.expression` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 式の配列。各式は [TTL MOVE ルール](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl) を定義します。

:::note
`move_ttl_info.expression` 配列は主に後方互換性のために残されています。現在では、`TTL MOVE` ルールを確認する最も簡単な方法は `move_ttl_info.min` と `move_ttl_info.max` フィールドを使用することです。
:::

* `move_ttl_info.min` ([Array](../../sql-reference/data-types/array.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 日付と時刻の値の配列。各要素は、[TTL MOVE ルール](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl) におけるキー値の最小値を表します。

* `move_ttl_info.max` ([Array](../../sql-reference/data-types/array.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 日付と時刻の値の配列。各要素は、[TTL MOVE ルール](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl) におけるキー値の最大値を表します。

* `bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – `bytes_on_disk` の別名。

* `marks_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) – `marks_bytes` の別名。

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

* [MergeTree ファミリー](../../engines/table-engines/mergetree-family/mergetree.md)
* [列およびテーブルの TTL](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)
