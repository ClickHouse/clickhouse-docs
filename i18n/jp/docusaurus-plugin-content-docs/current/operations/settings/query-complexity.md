---
'description': 'Settings which restrict query complexity.'
'sidebar_label': 'Restrictions on Query Complexity'
'sidebar_position': 59
'slug': '/operations/settings/query-complexity'
'title': 'Restrictions on Query Complexity'
---




# クエリの複雑性に関する制限

## 概要 {#overview}

[設定](/operations/settings/overview)の一部として、ClickHouseは
クエリの複雑性に制限を設ける機能を提供しています。これにより、リソースを集中的に消費する可能性のあるクエリから保護され、安全で予測可能な
実行が保証されます。特にユーザーインターフェースを使用する際に有効です。

ほとんどの制限は`SELECT`クエリにのみ適用され、分散クエリ処理の場合は各サーバーに対して制限が個別に適用されます。

ClickHouseは通常、データパーツが完全に処理された後にのみ制限をチェックし、各行ごとに制限を確認することはありません。これにより、パートが処理されている間に制限が違反される状況が発生する可能性があります。

## `overflow_mode` 設定 {#overflow_mode_setting}

ほとんどの制限には `overflow_mode` 設定があり、制限が超過した場合に何が起こるかを定義します。値は次の2つのいずれかを取ることができます。
- `throw`：例外をスローする (デフォルト)。
- `break`：クエリの実行を停止し、ソースデータが尽きたかのように部分結果を返します。

## `group_by_overflow_mode` 設定 {#group_by_overflow_mode_settings}

`group_by_overflow_mode` 設定には `any` という値もあります。
- `any` : セットに入ったキーの集計を続行しますが、新しいキーはセットに加えません。

## 設定のリスト {#relevant-settings}

以下の設定がクエリの複雑性に制限を適用するために使用されます。

:::note
「何かの最大量」に関する制限は `0` の値をとることができ、これは「制限なし」を意味します。
:::

| 設定                                                                                                                | 短い説明                                                                                                                                               |
|--------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`max_memory_usage`](/operations/settings/settings#max_memory_usage)                                             | 単一サーバーでクエリを実行するために使用できる最大RAM量。                                                                                        |
| [`max_memory_usage_for_user`](/operations/settings/settings#max_memory_usage_for_user)                           | 単一サーバーでユーザーのクエリを実行するために使用できる最大RAM量。                                                                               |
| [`max_rows_to_read`](/operations/settings/settings#max_rows_to_read)                                             | クエリを実行する際にテーブルから読み取れる最大行数。                                                                                             |
| [`max_bytes_to_read`](/operations/settings/settings#max_bytes_to_read)                                           | クエリを実行する際にテーブルから読み取ることができる最大バイト数（非圧縮データ）。                                                                  |
| [`read_overflow_mode_leaf`](/operations/settings/settings#read_overflow_mode_leaf)                               | 読み取るデータ量が葉の制限の1つを超えた場合に何が起こるかを設定します。                                                                           |
| [`max_rows_to_read_leaf`](/operations/settings/settings#max_rows_to_read_leaf)                                   | 分散クエリを実行する際に、葉ノードのローカルテーブルから読み取ることができる最大行数。                                                              |
| [`max_bytes_to_read_leaf`](/operations/settings/settings#max_bytes_to_read_leaf)                                 | 分散クエリを実行する際に、葉ノードのローカルテーブルから読み取ることができる最大バイト数（非圧縮データ）。                                          |
| [`read_overflow_mode_leaf`](/operations/settings/settings#read_overflow_mode_leaf)                          | 読み取るデータ量が葉の制限の1つを超えた場合に何が起こるかを設定します。                                                                           |
| [`max_rows_to_group_by`](/operations/settings/settings#max_rows_to_group_by)                                     | 集計から受け取ることができるユニークキーの最大行数。                                                                                               |
| [`group_by_overflow_mode`](/operations/settings/settings#group_by_overflow_mode)                                 | 集計のユニークキーの数が制限を超えた場合に何が起こるかを設定します。                                                                               |
| [`max_bytes_before_external_group_by`](/operations/settings/settings#max_bytes_before_external_group_by)         | 外部メモリでの `GROUP BY` 句の実行を有効または無効にします。                                                                                      |
| [`max_bytes_ratio_before_external_group_by`](/operations/settings/settings#max_bytes_ratio_before_external_group_by) | `GROUP BY` に許可される利用可能メモリの比率。これに達すると、集計に外部メモリが使用されます。                                                      |
| [`max_bytes_before_external_sort`](/operations/settings/settings#max_bytes_before_external_sort)                  | 外部メモリでの `ORDER BY` 句の実行を有効または無効にします。                                                                                      |
| [`max_bytes_ratio_before_external_sort`](/operations/settings/settings#max_bytes_ratio_before_external_sort)      | `ORDER BY` に許可される利用可能メモリの比率。これに達すると、外部ソートが使用されます。                                                            |
| [`max_rows_to_sort`](/operations/settings/settings#max_rows_to_sort)                                             | ソート前の最大行数。ソート時にメモリ消費を制限できます。                                                                                           |
| [`max_bytes_to_sort`](/operations/settings/settings#max_rows_to_sort)                                            | ソート前の最大バイト数。                                                                                                                                  |
| [`sort_overflow_mode`](/operations/settings/settings#sort_overflow_mode)                                         | ソート前に受け取った行数が制限の1つを超えた場合に何が起こるかを設定します。                                                                        |
| [`max_result_rows`](/operations/settings/settings#max_result_rows)                                               | 結果の行数を制限します。                                                                                                                                 |
| [`max_result_bytes`](/operations/settings/settings#max_result_bytes)                                             | 結果のサイズをバイト（非圧縮）で制限します。                                                                                                         |
| [`result_overflow_mode`](/operations/settings/settings#result_overflow_mode)                                     | 結果のボリュームが制限の1つを超えた場合に何をするかを設定します。                                                                                    |
| [`max_execution_time`](/operations/settings/settings#max_execution_time)                                         | 最大クエリ実行時間（秒単位）。                                                                                                                           |
| [`timeout_overflow_mode`](/operations/settings/settings#timeout_overflow_mode)                                   | クエリが `max_execution_time` より長く実行された場合や、推定実行時間が `max_estimated_execution_time` より長い場合に何をするかを設定します。     |
| [`max_execution_time_leaf`](/operations/settings/settings#max_execution_time_leaf)                               | `max_execution_time` と意味的に類似していますが、分散またはリモートクエリの葉ノードにのみ適用されます。                                               |
| [`timeout_overflow_mode_leaf`](/operations/settings/settings#timeout_overflow_mode_leaf)                         | 葉ノードでのクエリが `max_execution_time_leaf` より長く実行された場合に何が起こるかを設定します。                                                    |
| [`min_execution_speed`](/operations/settings/settings#min_execution_speed)                                       | 秒あたりの最小実行速度。                                                                                                                                 |
| [`min_execution_speed_bytes`](/operations/settings/settings#min_execution_speed_bytes)                           | 秒あたりの最小実行バイト数。                                                                                                                                 |
| [`max_execution_speed`](/operations/settings/settings#max_execution_speed)                                       | 秒あたりの最大実行行数。                                                                                                                                   |
| [`max_execution_speed_bytes`](/operations/settings/settings#max_execution_speed_bytes)                           | 秒あたりの最大実行バイト数。                                                                                                                                 |
| [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed) | 指定した秒数が経過した後に、実行速度があまりにも遅くないこと（`min_execution_speed`より少なくないこと）をチェックします。                               |
| [`max_estimated_execution_time`](/operations/settings/settings#max_estimated_execution_time)                     | 最大クエリ推定実行時間（秒単位）。                                                                                                                       |
| [`max_columns_to_read`](/operations/settings/settings#max_columns_to_read)                                       | 単一クエリでテーブルから読み取れる最大カラム数。                                                                                                       |
| [`max_temporary_columns`](/operations/settings/settings#max_temporary_columns)                                   | クエリを実行する際にRAMに同時に保持しなければならない最大の一時カラム数（定数カラムを含む）。                                                          |
| [`max_temporary_non_const_columns`](/operations/settings/settings#max_temporary_non_const_columns)               | クエリを実行する際にRAMに同時に保持しなければならない最大の一時カラム数（ただし定数カラムは含まない）。                                              |
| [`max_subquery_depth`](/operations/settings/settings#max_subquery_depth)                                         | クエリに指定された数より多くの入れ子サブクエリがある場合に何が起こるかを設定します。                                                                   |
| [`max_ast_depth`](/operations/settings/settings#max_ast_depth)                                                   | クエリ構文木の最大ネスト深度。                                                                                                                            |
| [`max_ast_elements`](/operations/settings/settings#max_ast_elements)                                             | クエリ構文木の最大要素数。                                                                                                                                 |
| [`max_rows_in_set`](/operations/settings/settings#max_rows_in_set)                                               | サブクエリから作成されたIN句のデータセットにおける最大行数。                                                                                           |
| [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set)                                             | サブクエリから作成されたIN句で使用されるセットの最大バイト数（非圧縮データ）。                                                                          |
| [`set_overflow_mode`](/operations/settings/settings#max_bytes_in_set)                                           | データ量が制限の1つを超えた場合に何が起こるかを設定します。                                                                                            |
| [`max_rows_in_distinct`](/operations/settings/settings#max_rows_in_distinct)                                     | DISTINCTを使用する際の異なる行の最大数。                                                                                                                 |
| [`max_bytes_in_distinct`](/operations/settings/settings#max_bytes_in_distinct)                                   | DISTINCT使用時にハッシュテーブルが使用する状態の最大バイト数（非圧縮バイト）。                                                                       |
| [`distinct_overflow_mode`](/operations/settings/settings#distinct_overflow_mode)                                   | データ量が制限の1つを超えた場合に何が起こるかを設定します。                                                                                            |
| [`max_rows_to_transfer`](/operations/settings/settings#max_rows_to_transfer)                                     | GLOBAL IN/JOIN セクションが実行される際にリモートサーバーに渡すことができる最大サイズ（行単位）。                                                    |
| [`max_bytes_to_transfer`](/operations/settings/settings#max_bytes_to_transfer)                                     | GLOBAL IN/JOIN セクションが実行される際にリモートサーバーに渡すことができる最大バイト数（非圧縮データ）。                                             |
| [`transfer_overflow_mode`](/operations/settings/settings#transfer_overflow_mode)                                   | データ量が制限の1つを超えた場合に何が起こるかを設定します。                                                                                            |
| [`max_rows_in_join`](/operations/settings/settings#max_rows_in_join)                                             | テーブルを結合する際に使用されるハッシュテーブル内の行数を制限します。                                                                                |
| [`max_bytes_in_join`](/operations/settings/settings#max_bytes_in_join)                                           | テーブルを結合する際に使用されるハッシュテーブルの最大バイト数。                                                                                       |
| [`join_overflow_mode`](/operations/settings/settings#join_overflow_mode)                                         | 次のいずれかの結合制限に達した場合にClickHouseが実行するアクションを定義します。                                                                     |
| [`max_partitions_per_insert_block`](/operations/settings/settings#max_partitions_per_insert_block)                 | 挿入ブロック内の最大パーティション数を制限し、ブロックが多すぎるパーティションを含む場合は例外をスローします。                                          |
| [`throw_on_max_partitions_per_insert_block`](/operations/settings/settings#throw_on_max_partitions_per_insert_block) | `max_partitions_per_insert_block` に達した際の動作を制御することができます。                                                                          |
| [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#throw_on_max_partitions_per_insert_block) | 同時に実行されるユーザーのすべてのクエリによって消費される一時ファイルのディスク上のデータの最大量（バイト）。                                          |
| [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query) | 同時に実行されるすべてのクエリによって消費される一時ファイルのディスク上のデータの最大量（バイト）。                                                   |
| [`max_sessions_for_user`](/operations/settings/settings#max_sessions_for_user)                                   | 認証されたユーザーに対するClickHouseサーバーへの最大同時セッション数。                                                                                 |
| [`max_partitions_to_read`](/operations/settings/settings#max_partitions_to_read)                                   | 単一クエリでアクセスできる最大パーティション数を制限します。                                                                                         |

## 廃止された設定 {#obsolete-settings}

:::note
以下の設定は廃止されています
:::

### max_pipeline_depth {#max-pipeline-depth}

最大パイプライン深度。各データブロックがクエリ処理中に通過する変換の数に対応します。単一サーバーの制限内でカウントされます。パイプラインの深度が大きすぎる場合は例外がスローされます。
