---
'description': 'クエリの複雑さを制限する設定。'
'sidebar_label': 'クエリの複雑さに関する制限'
'sidebar_position': 59
'slug': '/operations/settings/query-complexity'
'title': 'クエリの複雑さに関する制限'
'doc_type': 'reference'
---


# クエリの複雑さに関する制限

## 概要 {#overview}

[設定](/operations/settings/overview)の一部として、ClickHouseはクエリの複雑さに制限を設ける機能を提供しています。これは、リソースを大量に消費する可能性のあるクエリから保護し、ユーザーインターフェースを使用する際に、より安全で予測可能な実行を確保します。

ほぼすべての制限は `SELECT` クエリにのみ適用され、分散クエリ処理の場合は，各サーバーごとに制限が適用されます。

ClickHouseは通常、データパーツが完全に処理された後にのみ制限をチェックし、各行に対して制限をチェックするのではありません。これにより、パーツが処理されている間に制限が違反される状況が生じる可能性があります。

## `overflow_mode` 設定 {#overflow_mode_setting}

ほとんどの制限には `overflow_mode` 設定があり、制限を超えた際に何が起こるかを定義しています。この設定は以下の2つの値のいずれかを取ります：
- `throw`: 例外をスローする（デフォルト）。
- `break`: クエリの実行を停止し、ソースデータが尽きたかのように部分的な結果を返す。

## `group_by_overflow_mode` 設定 {#group_by_overflow_mode_settings}

`group_by_overflow_mode` 設定には `any` という値もあります：
- `any` : セットに入ったキーの集計を続行しますが、新しいキーをセットに追加しません。

## 設定の一覧 {#relevant-settings}

以下の設定は、クエリの複雑さに制限を適用するために使用されます。

:::note
「最大の何か」の制限は `0` の値を取ることができ、これは「制限なし」を意味します。
:::

| 設定                                                                                                                | 短い説明                                                                                                                                               |
|--------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`max_memory_usage`](/operations/settings/settings#max_memory_usage)                                             | 単一サーバーでクエリを実行するために使用できる最大RAM量。                                                                                          |
| [`max_memory_usage_for_user`](/operations/settings/settings#max_memory_usage_for_user)                           | 単一サーバーでユーザーのクエリを実行するために使用できる最大RAM量。                                                                                |
| [`max_rows_to_read`](/operations/settings/settings#max_rows_to_read)                                             | クエリを実行する際にテーブルから読み込むことができる最大行数。                                                                                      |
| [`max_bytes_to_read`](/operations/settings/settings#max_bytes_to_read)                                           | クエリを実行する際にテーブルから読み込むことができる最大バイト数（圧縮されていないデータ）。                                                          |
| [`read_overflow_mode_leaf`](/operations/settings/settings#read_overflow_mode_leaf)                               | 読み込むデータのボリュームがリーフの制限を超えた場合に何が起こるかを設定します。                                                                     |
| [`max_rows_to_read_leaf`](/operations/settings/settings#max_rows_to_read_leaf)                                   | 分散クエリを実行する際に、リーフノードのローカルテーブルから読み込むことができる最大行数。                                                        |
| [`max_bytes_to_read_leaf`](/operations/settings/settings#max_bytes_to_read_leaf)                                 | 分散クエリを実行する際に、リーフノードのローカルテーブルから読み込むことができる最大バイト数（圧縮されていないデータ）。                                 |
| [`read_overflow_mode_leaf`](/docs/operations/settings/settings#read_overflow_mode_leaf)                          | 読み込むデータのボリュームがリーフの制限を超えた場合に何が起こるかを設定します。                                                                     |
| [`max_rows_to_group_by`](/operations/settings/settings#max_rows_to_group_by)                                     | 集計から受け取ることができるユニークキーの最大数。                                                                                                      |
| [`group_by_overflow_mode`](/operations/settings/settings#group_by_overflow_mode)                                 | 集計のためのユニークキーの数が制限を超えた場合に何が起こるかを設定します。                                                                             |
| [`max_bytes_before_external_group_by`](/operations/settings/settings#max_bytes_before_external_group_by)         | 外部メモリ内での `GROUP BY` 句の実行を有効または無効にします。                                                                                       |
| [`max_bytes_ratio_before_external_group_by`](/operations/settings/settings#max_bytes_ratio_before_external_group_by) | `GROUP BY` のために許可される利用可能メモリの比率。一度到達すると、外部メモリが集計のために使用されます。                                          |
| [`max_bytes_before_external_sort`](/operations/settings/settings#max_bytes_before_external_sort)                 | 外部メモリ内での `ORDER BY` 句の実行を有効または無効にします。                                                                                       |
| [`max_bytes_ratio_before_external_sort`](/operations/settings/settings#max_bytes_ratio_before_external_sort)     | `ORDER BY` のために許可される利用可能メモリの比率。一度到達すると、外部ソートが使用されます。                                                       |
| [`max_rows_to_sort`](/operations/settings/settings#max_rows_to_sort)                                             | ソート前の最大行数。ソート時のメモリ消費を制限できます。                                                                                            |
| [`max_bytes_to_sort`](/operations/settings/settings#max_rows_to_sort)                                            | ソート前の最大バイト数。                                                                                                                                 |
| [`sort_overflow_mode`](/operations/settings/settings#sort_overflow_mode)                                         | ソート前に受け取った行数が制限を超えた場合に何が起こるかを設定します。                                                                               |
| [`max_result_rows`](/operations/settings/settings#max_result_rows)                                               | 結果の行数を制限します。                                                                                                                                |
| [`max_result_bytes`](/operations/settings/settings#max_result_bytes)                                             | 結果サイズをバイト（圧縮されていない）で制限します。                                                                                                 |
| [`result_overflow_mode`](/operations/settings/settings#result_overflow_mode)                                     | 結果のボリュームが制限を超えた場合に何をするかを設定します。                                                                                          |
| [`max_execution_time`](/operations/settings/settings#max_execution_time)                                         | クエリの最大実行時間（秒）を設定します。                                                                                                              |
| [`timeout_overflow_mode`](/operations/settings/settings#timeout_overflow_mode)                                   | クエリが `max_execution_time` を超えて実行される場合や、推定実行時間が `max_estimated_execution_time` を超えた場合に何をするかを設定します。              |
| [`max_execution_time_leaf`](/operations/settings/settings#max_execution_time_leaf)                               | `max_execution_time` と意味的に似ていますが、分散またはリモートクエリのリーフノードのみに適用されます。                                            |
| [`timeout_overflow_mode_leaf`](/operations/settings/settings#timeout_overflow_mode_leaf)                         | リーフノードのクエリが `max_execution_time_leaf` より長く実行される場合に何が起こるかを設定します。                                                 |
| [`min_execution_speed`](/operations/settings/settings#min_execution_speed)                                       | 秒あたりの最小実行速度。                                                                                                                                  |
| [`min_execution_speed_bytes`](/operations/settings/settings#min_execution_speed_bytes)                           | 秒あたりの最小実行バイト数。                                                                                                                                 |
| [`max_execution_speed`](/operations/settings/settings#max_execution_speed)                                       | 秒あたりの最大実行行数。                                                                                                                                  |
| [`max_execution_speed_bytes`](/operations/settings/settings#max_execution_speed_bytes)                           | 秒あたりの最大実行バイト数。                                                                                                                                 |
| [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed) | 指定された時間（秒）が経過した後に、実行速度が遅すぎないこと（`min_execution_speed` より少なくないか）を確認します。                                 |
| [`max_estimated_execution_time`](/operations/settings/settings#max_estimated_execution_time)                     | 最大クエリ推定実行時間（秒）。                                                                                                                           |
| [`max_columns_to_read`](/operations/settings/settings#max_columns_to_read)                                       | 単一クエリでテーブルから読み込むことができる最大カラム数。                                                                                              |
| [`max_temporary_columns`](/operations/settings/settings#max_temporary_columns)                                   | クエリ実行中にRAM内で同時に保持される必要のある最大一時カラム数（定数カラムを含む）。                                                                 |
| [`max_temporary_non_const_columns`](/operations/settings/settings#max_temporary_non_const_columns)               | クエリ実行中にRAM内で同時に保持される必要のある最大一時カラム数（定数カラムは含まない）。                                                           |
| [`max_subquery_depth`](/operations/settings/settings#max_subquery_depth)                                         | クエリが指定された数のネストされたサブクエリを超えた場合に何が起こるかを設定します。                                                                |
| [`max_ast_depth`](/operations/settings/settings#max_ast_depth)                                                   | クエリ構文ツリーの最大ネスト深度。                                                                                                                       |
| [`max_ast_elements`](/operations/settings/settings#max_ast_elements)                                             | クエリ構文ツリーの要素の最大数。                                                                                                                         |
| [`max_rows_in_set`](/operations/settings/settings#max_rows_in_set)                                               | サブクエリから作成されたIN句内のデータセットの最大行数。                                                                                               |
| [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set)                                             | サブクエリから作成されたIN句内のセットによって使用される最大バイト数（圧縮されていないデータ）。                                                     |
| [`set_overflow_mode`](/operations/settings/settings#max_bytes_in_set)                                            | データの量が制限を超えた場合に何が起こるかを設定します。                                                                                              |
| [`max_rows_in_distinct`](/operations/settings/settings#max_rows_in_distinct)                                     | DISTINCT を使用する際の異なる行の最大数。                                                                                                                |
| [`max_bytes_in_distinct`](/operations/settings/settings#max_bytes_in_distinct)                                   | DISTINCT を使用する際にハッシュテーブルで使用される状態の最大バイト数（圧縮されていないバイト）。                                                  |
| [`distinct_overflow_mode`](/operations/settings/settings#distinct_overflow_mode)                                  | データの量が制限を超えた場合に何が起こるかを設定します。                                                                                              |
| [`max_rows_to_transfer`](/operations/settings/settings#max_rows_to_transfer)                                     | リモートサーバーに渡すことができる最大サイズ（行数）または、GLOBAL IN/JOIN セクションが実行されるときに一時テーブルに保存されます。               |
| [`max_bytes_to_transfer`](/operations/settings/settings#max_bytes_to_transfer)                                   | リモートサーバーに渡すことができる最大バイト数（圧縮されていないデータ）または、GLOBAL IN/JOIN セクションが実行されるときに一時テーブルに保存されます。   |
| [`transfer_overflow_mode`](/operations/settings/settings#transfer_overflow_mode)                                   | データの量が制限を超えた場合に何が起こるかを設定します。                                                                                              |
| [`max_rows_in_join`](/operations/settings/settings#max_rows_in_join)                                             | テーブルを結合する際にハッシュテーブルで使用される行の最大数を制限します。                                                                           |
| [`max_bytes_in_join`](/operations/settings/settings#max_bytes_in_join)                                           | テーブルを結合する際にハッシュテーブルで使用される最大バイト数。                                                                                       |
| [`join_overflow_mode`](/operations/settings/settings#join_overflow_mode)                                         | 次の結合制限のいずれかに達した場合にClickHouseが実行するアクションを定義します。                                                                     |
| [`max_partitions_per_insert_block`](/operations/settings/settings#max_partitions_per_insert_block)                 | 単一の挿入ブロック内の最大パーティション数を制限し、ブロックにパーティションが多すぎる場合は例外がスローされます。                                      |
| [`throw_on_max_partitions_per_insert_block`](/operations/settings/settings#throw_on_max_partitions_per_insert_block) | `max_partitions_per_insert_block` に達したときの動作を制御します。                                                                                     |
| [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#throw_on_max_partitions_per_insert_block) | 同時に実行されているユーザークエリのためにディスク上の一時ファイルによって消費される最大データ量（バイト）。                                           |
| [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query) | 同時に実行されているすべてのクエリのためにディスク上の一時ファイルによって消費される最大データ量（バイト）。                                         |
| [`max_sessions_for_user`](/operations/settings/settings#max_sessions_for_user)                                   | 認証ユーザーごとにClickHouseサーバーへの同時セッションの最大数。                                                                                        |
| [`max_partitions_to_read`](/operations/settings/settings#max_partitions_to_read)                                   | 単一クエリでアクセスできる最大パーティション数を制限します。                                                                                           |

## 廃止された設定 {#obsolete-settings}

:::note
以下の設定は廃止されています。
:::

### max_pipeline_depth {#max-pipeline-depth}

最大パイプライン深度。これは、各データブロックがクエリ処理中に通過する変換の数に対応します。単一のサーバーの制限内でカウントされます。パイプライン深度が大きすぎる場合、例外がスローされます。
