---
'description': 'システムテーブルは、MergeTreeファミリーのテーブルのプロジェクションパーツ内のカラムに関する情報を含んでいます。'
'keywords':
- 'system table'
- 'projection_parts_columns'
'slug': '/operations/system-tables/projection_parts_columns'
'title': 'system.projection_parts_columns'
'doc_type': 'reference'
---

# system.projection_parts_columns

このテーブルは、MergeTreeファミリーのテーブルにおけるプロジェクションパーツのカラムに関する情報を含みます。

## カラム {#columns}

| カラム                                   | 説明                                                                                                                                   | タイプ               |
|-----------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|--------------------|
| `partition`                             | パーティション名。                                                                                                                     | String             |
| `name`                                  | データパートの名前。                                                                                                                  | String             |
| `part_type`                             | データパートの保存形式。                                                                                                             | String             |
| `parent_name`                           | ソース（親）データパートの名前。                                                                                                        | String             |
| `parent_uuid`                           | ソース（親）データパートのUUID。                                                                                                        | UUID               |
| `parent_part_type`                      | ソース（親）データパートの保存形式。                                                                                                   | String             |
| `active`                                | データパートがアクティブであるかどうかを示すフラグ。                                                                                     | UInt8              |
| `marks`                                 | マークの数。                                                                                                                           | UInt64             |
| `rows`                                  | 行の数。                                                                                                                               | UInt64             |
| `bytes_on_disk`                         | データパートファイルの合計サイズ（バイト）。                                                                                             | UInt64             |
| `data_compressed_bytes`                 | データパート内の圧縮データの合計サイズ。すべての補助ファイル（例：マークのあるファイル）は含まれません。                               | UInt64             |
| `data_uncompressed_bytes`               | データパート内の非圧縮データの合計サイズ。すべての補助ファイル（例：マークのあるファイル）は含まれません。                           | UInt64             |
| `marks_bytes`                           | マークのあるファイルのサイズ。                                                                                                         | UInt64             |
| `parent_marks`                          | ソース（親）パート内のマークの数。                                                                                                      | UInt64             |
| `parent_rows`                           | ソース（親）パート内の行の数。                                                                                                         | UInt64             |
| `parent_bytes_on_disk`                  | ソース（親）データパートファイルの合計サイズ（バイト）。                                                                               | UInt64             |
| `parent_data_compressed_bytes`          | ソース（親）データパート内の圧縮データの合計サイズ。                                                                                   | UInt64             |
| `parent_data_uncompressed_bytes`        | ソース（親）データパート内の非圧縮データの合計サイズ。                                                                                   | UInt64             |
| `parent_marks_bytes`                    | ソース（親）データパート内のマークのあるファイルのサイズ。                                                                             | UInt64             |
| `modification_time`                     | データパートが変更されたディレクトリの時間。通常はデータパート作成時の時間に対応します。                                             | DateTime           |
| `remove_time`                           | データパートが非アクティブになった時間。                                                                                                 | DateTime           |
| `refcount`                              | データパートが使用されている場所の数。値が2より大きい場合は、データパートがクエリまたはマージで使用されています。                     | UInt32             |
| `min_date`                              | パーティションキーに含まれている場合、Dateカラムの最小値。                                                                             | Date               |
| `max_date`                              | パーティションキーに含まれている場合、Dateカラムの最大値。                                                                             | Date               |
| `min_time`                              | パーティションキーに含まれている場合、DateTimeカラムの最小値。                                                                         | DateTime           |
| `max_time`                              | パーティションキーに含まれている場合、DateTimeカラムの最大値。                                                                         | DateTime           |
| `partition_id`                          | パーティションのID。                                                                                                                    | String             |
| `min_block_number`                      | マージ後の現在のパートを構成するデータパートの最小数。                                                                                 | Int64              |
| `max_block_number`                      | マージ後の現在のパートを構成するデータパートの最大数。                                                                                 | Int64              |
| `level`                                 | マージツリーの深さ。ゼロは、現在のパートが他のパートのマージではなく挿入によって作成されたことを意味します。                          | UInt32             |
| `data_version`                          | データパートに適用されるべきミューテーションを決定するための番号（data_versionよりも高いバージョンのミューテーション）。            | UInt64             |
| `primary_key_bytes_in_memory`           | 主キー値によって使用されるメモリの量（バイト）。                                                                                        | UInt64             |
| `primary_key_bytes_in_memory_allocated` | 主キー値用に予約されたメモリの量（バイト）。                                                                                          | UInt64             |
| `database`                              | データベースの名前。                                                                                                                    | String             |
| `table`                                 | テーブルの名前。                                                                                                                       | String             |
| `engine`                                | パラメータなしのテーブルエンジンの名前。                                                                                                 | String             |
| `disk_name`                             | データパートを保存するディスクの名前。                                                                                                   | String             |
| `path`                                  | データパートファイルのフォルダへの絶対パス。                                                                                           | String             |
| `column`                                | カラムの名前。                                                                                                                         | String             |
| `type`                                  | カラムタイプ。                                                                                                                          | String             |
| `column_position`                       | テーブル内のカラムの順序位置（1から始まる）。                                                                                             | UInt64             |
| `default_kind`                          | デフォルト値のための式のタイプ（DEFAULT、MATERIALIZED、ALIAS）、または定義されていない場合は空文字列。                             | String             |
| `default_expression`                    | デフォルト値のための式、または定義されていない場合は空文字列。                                                                         | String             |
| `column_bytes_on_disk`                  | カラムの合計サイズ（バイト）。                                                                                                          | UInt64             |
| `column_data_compressed_bytes`          | カラム内の圧縮データの合計サイズ（バイト）。                                                                                            | UInt64             |
| `column_data_uncompressed_bytes`        | カラム内の非圧縮データの合計サイズ（バイト）。                                                                                          | UInt64             |
| `column_marks_bytes`                    | マークのあるカラムのサイズ（バイト）。                                                                                                  | UInt64             |
| `column_modification_time`              | カラムが最後に変更された時間。                                                                                                          | Nullable(DateTime) |
| `bytes`                                 | bytes_on_diskのエイリアス。                                                                                                             | UInt64             |
| `marks_size`                            | marks_bytesのエイリアス。                                                                                                               | UInt64             |
| `part_name`                             | nameのエイリアス。                                                                                                                      | String             |
