---
'description': 'システムテーブルは、MergeTreeファミリーのテーブルに対するプロジェクションパーツに関する情報を含んでいます。'
'keywords':
- 'system table'
- 'projection_parts'
'slug': '/operations/system-tables/projection_parts'
'title': 'system.projection_parts'
'doc_type': 'reference'
---



# system.projection_parts

このテーブルは、MergeTreeファミリーのテーブルに対するプロジェクションパーツの情報を含んでいます。

## Columns {#columns}

| Column                                  | Description                                                                                                                                                                                                 | Type            |
|-----------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|
| `partition`                             | パーティション名。                                                                                                                                                                                         | String          |
| `name`                                  | データパートの名前。                                                                                                                                                                                      | String          |
| `part_type`                             | データパートの格納形式。可能な値: Wide（カラムごとにファイル）と Compact（すべてのカラムを一つのファイルに格納）。                                                                                        | String          |
| `parent_name`                           | ソース（親）データパートの名前。                                                                                                                                                                          | String          |
| `parent_uuid`                           | ソース（親）データパートのUUID。                                                                                                                                                                          | UUID            |
| `parent_part_type`                      | ソース（親）データパートの格納形式。                                                                                                                                                                       | String          |
| `active`                                | データパートがアクティブかどうかを示すフラグ。データパートがアクティブであれば、テーブルで使用されます。そうでなければ、削除される予定です。非アクティブなデータパートは、マージおよび変異操作後に現れます。 | UInt8           |
| `marks`                                 | マークの数。データパートの行数を概算するには、マークにインデックスの粒度（通常8192）を掛けます（このヒントは、適応粒度には適用されません）。                       | UInt64          |
| `rows`                                  | 行の数。                                                                                                                                                                                                     | UInt64          |
| `bytes_on_disk`                         | データパートファイルの合計サイズ（バイト単位）。                                                                                                                                                           | UInt64          |
| `data_compressed_bytes`                 | データパート内の圧縮されたデータの合計サイズ。すべての補助ファイル（例えば、マークのファイル）は含まれていません。                                                                                     | UInt64          |
| `data_uncompressed_bytes`               | データパート内の未圧縮データの合計サイズ。すべての補助ファイル（例えば、マークのファイル）は含まれていません。                                                                                     | UInt64          |
| `marks_bytes`                           | マークを含むファイルのサイズ。                                                                                                                                                                            | UInt64          |
| `parent_marks`                          | ソース（親）パート内のマークの数。                                                                                                                                                                        | UInt64          |
| `parent_rows`                           | ソース（親）パート内の行の数。                                                                                                                                                                             | UInt64          |
| `parent_bytes_on_disk`                  | ソース（親）データパートファイルの合計サイズ（バイト単位）。                                                                                                                                               | UInt64          |
| `parent_data_compressed_bytes`          | ソース（親）データパート内の圧縮されたデータの合計サイズ。                                                                                                                                               | UInt64          |
| `parent_data_uncompressed_bytes`        | ソース（親）データパート内の未圧縮データの合計サイズ。                                                                                                                                                   | UInt64          |
| `parent_marks_bytes`                    | ソース（親）データパート内のマークを含むファイルのサイズ。                                                                                                                                               | UInt64          |
| `modification_time`                     | データパートを含むディレクトリが修正された時間。通常、これはデータパート作成の時間に対応します。                                                                                                        | DateTime        |
| `remove_time`                           | データパートが非アクティブになった時間。                                                                                                                                                                  | DateTime        |
| `refcount`                              | データパートが使用されている場所の数。値が2より大きい場合、データパートがクエリやマージに使用されています。                                                                                           | UInt32          |
| `min_date`                              | データパート内の日付キーの最小値。                                                                                                                                                                         | Date            |
| `max_date`                              | データパート内の日付キーの最大値。                                                                                                                                                                         | Date            |
| `min_time`                              | データパート内の日付と時間キーの最小値。                                                                                                                                                                   | DateTime        |
| `max_time`                              | データパート内の日付と時間キーの最大値。                                                                                                                                                                   | DateTime        |
| `partition_id`                          | パーティションのID。                                                                                                                                                                                        | String          |
| `min_block_number`                      | マージ後の現在のパートを構成するデータパートの最小数。                                                                                                                                                   | Int64           |
| `max_block_number`                      | マージ後の現在のパートを構成するデータパートの最大数。                                                                                                                                                   | Int64           |
| `level`                                 | マージツリーの深さ。ゼロは、現在のパートが他のパートをマージするのではなく、挿入によって作成されたことを意味します。                                                                                             | UInt32          |
| `data_version`                          | データパートに適用されるべき変異を決定するために使用される番号（data_versionよりも高いバージョンの変異）。                                                                                                   | UInt64          |
| `primary_key_bytes_in_memory`           | 主キー値によって使用されるメモリ量（バイト単位）。                                                                                                                                                       | UInt64          |
| `primary_key_bytes_in_memory_allocated` | 主キー値のために予約されたメモリ量（バイト単位）。                                                                                                                                                      | UInt64          |
| `is_frozen`                             | パーティションデータバックアップが存在することを示すフラグ。1はバックアップが存在することを示し、0はバックアップが存在しないことを示します。                                                                      | UInt8           |
| `database`                              | データベースの名前。                                                                                                                                                                                       | String          |
| `table`                                 | テーブルの名前。                                                                                                                                                                                          | String          |
| `engine`                                | パラメータのないテーブルエンジンの名前。                                                                                                                                                                  | String          |
| `disk_name`                             | データパートを格納するディスクの名前。                                                                                                                                                                     | String          |
| `path`                                  | データパートファイルが格納されているフォルダへの絶対パス。                                                                                                                                                 | String          |
| `hash_of_all_files`                     | 圧縮ファイルのsipHash128。                                                                                                                                                                                 | String          |
| `hash_of_uncompressed_files`            | 未圧縮ファイルのsipHash128（マークを含むファイル、インデックスファイルなど）。                                                                                                                                 | String          |
| `uncompressed_hash_of_compressed_files` | 圧縮ファイル内のデータを未圧縮であるかのようにsipHash128したもの。                                                                                                                                          | String          |
| `delete_ttl_info_min`                   | TTL DELETEルールのための日付と時間キーの最小値。                                                                                                                                                           | DateTime        |
| `delete_ttl_info_max`                   | TTL DELETEルールのための日付と時間キーの最大値。                                                                                                                                                           | DateTime        |
| `move_ttl_info.expression`              | 式の配列。各式はTTL MOVEルールを定義します。                                                                                                                                                               | Array(String)   |
| `move_ttl_info.min`                     | 日付と時間の値の配列。各要素はTTL MOVEルールのための最小キー値を説明します。                                                                                                                                | Array(DateTime) |
| `move_ttl_info.max`                     | 日付と時間の値の配列。各要素はTTL MOVEルールのための最大キー値を説明します。                                                                                                                                | Array(DateTime) |
| `default_compression_codec`             | このデータパートを圧縮するために使用されるコーデックの名前（カラムに明示的なコーデックがない場合）。                                                                                                      | String          |
| `recompression_ttl_info.expression`     | TTL式。                                                                                                                                                                                                     | Array(String)   |
| `recompression_ttl_info.min`            | このパート内で計算されたTTL式の最小値。この値を使って、失効したTTLを持つ行が少なくとも1つあるかどうかを理解します。                                                                                          | Array(DateTime) |
| `recompression_ttl_info.max`            | このパート内で計算されたTTL式の最大値。この値を使って、失効したTTLを持つ全ての行があるかどうかを理解します。                                                                                            | Array(DateTime) |
| `group_by_ttl_info.expression`          | TTL式。                                                                                                                                                                                                     | Array(String)   |
| `group_by_ttl_info.min`                 | このパート内で計算されたTTL式の最小値。この値を使って、失効したTTLを持つ行が少なくとも1つあるかどうかを理解します。                                                                                          | Array(DateTime) |
| `group_by_ttl_info.max`                 | このパート内で計算されたTTL式の最大値。この値を使って、失効したTTLを持つ全ての行があるかどうかを理解します。                                                                                            | Array(DateTime) |
| `rows_where_ttl_info.expression`        | TTL式。                                                                                                                                                                                                     | Array(String)   |
| `rows_where_ttl_info.min`               | このパート内で計算されたTTL式の最小値。この値を使って、失効したTTLを持つ行が少なくとも1つあるかどうかを理解します。                                                                                          | Array(DateTime) |
| `rows_where_ttl_info.max`               | このパート内で計算されたTTL式の最大値。この値を使って、失効したTTLを持つ全ての行があるかどうかを理解します。                                                                                            | Array(DateTime) |
| `is_broken`                             | プロジェクションパートが壊れているかどうか。                                                                                                                                                               | UInt8           |
| `exception_code`                        | プロジェクションパートの壊れている状態を説明する例外メッセージ。                                                                                                                                         | Int32           |
| `exception`                             | プロジェクションパートの壊れている状態を説明する例外コード。                                                                                                                                               | String          |
| `bytes`                                 | bytes_on_diskのエイリアス。                                                                                                                                                                               | UInt64          |
| `marks_size`                            | marks_bytesのエイリアス。                                                                                                                                                                                 | UInt64          |
| `part_name`                             | nameのエイリアス。                                                                                                                                                                                        | String          |                                                                                                                                       | ALIAS           | name |
