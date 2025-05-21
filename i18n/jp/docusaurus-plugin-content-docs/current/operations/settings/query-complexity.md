---
description: 'クエリの複雑さを制限する設定。'
sidebar_label: 'クエリの複雑さの制限'
sidebar_position: 59
slug: /operations/settings/query-complexity
title: 'クエリの複雑さの制限'
---


# クエリの複雑さの制限

## 概要 {#overview}

[設定](/operations/settings/overview) の一環として、ClickHouseは
クエリの複雑さを制限する機能を提供します。これは、 
リソースを大量に消費する可能性のあるクエリから保護し、特にユーザーインターフェースを使用する際に、より安全で予測可能な実行を保証するのに役立ちます。

ほとんどの制限は `SELECT` クエリにのみ適用され、分散クエリ処理の場合、各サーバーごとに制限が適用されます。

ClickHouseは一般に、データパーツが完全に処理された後にのみ制限をチェックするため、各行ごとに制限をチェックするのではありません。これにより、パートが処理されている間に制限が違反される状況になる可能性があります。

## `overflow_mode` 設定 {#overflow_mode_setting}

ほとんどの制限には `overflow_mode` 設定があり、制限を超えたときに何が起こるかを定義し、次の2つの値のいずれかを取ることができます。
- `throw`: 例外をスローする（デフォルト）。
- `break`: クエリの実行を停止し、ソースデータが尽きたかのように部分結果を返す。

## `group_by_overflow_mode` 設定 {#group_by_overflow_mode_settings}

`group_by_overflow_mode` 設定にも `any` という値があります：
- `any` : セットに入ったキーに対しては集計を続けますが、新しいキーはセットに追加しません。

## 設定のリスト {#relevant-settings}

以下の設定は、クエリの複雑さに制限を適用するために使用されます。

:::note
「何かの最大量」に対する制限は `0` の値を取ることができ、これは「制限なし」を意味します。
:::

| 設定                                                                                                             | 短い説明                                                                                                                                              |
|----------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| [`max_memory_usage`](/operations/settings/settings#max_memory_usage)                                          | 単一サーバーでクエリを実行するために使用する最大RAM量。                                                                                        |
| [`max_memory_usage_for_user`](/operations/settings/settings#max_memory_usage_for_user)                        | 単一サーバーでユーザーのクエリを実行するために使用する最大RAM量。                                                                               |
| [`max_rows_to_read`](/operations/settings/settings#max_rows_to_read)                                          | クエリを実行するときにテーブルから読み取ることができる最大行数。                                                                                  |
| [`max_bytes_to_read`](/operations/settings/settings#max_bytes_to_read)                                        | クエリを実行するときにテーブルから読み取ることができる最大バイト数（非圧縮データ）。                                                             |
| [`read_overflow_mode_leaf`](/operations/settings/settings#read_overflow_mode_leaf)                            | 読み取るデータの量が1つのリーフ制限を超えたときに何が起こるかを設定します。                                                                       |
| [`max_rows_to_read_leaf`](/operations/settings/settings#max_rows_to_read_leaf)                                | 分散クエリを実行するときにリーフノード上のローカルテーブルから読み取ることができる最大行数。                                                     |
| [`max_bytes_to_read_leaf`](/operations/settings/settings#max_bytes_to_read_leaf)                              | 分散クエリを実行するときにリーフノード上のローカルテーブルから読み取ることができる最大バイト数（非圧縮データ）。                                  |
| [`read_overflow_mode_leaf`](/docs/operations/settings/settings#read_overflow_mode_leaf)                       | 読み取るデータの量が1つのリーフ制限を超えたときに何が起こるかを設定します。                                                                       |
| [`max_rows_to_group_by`](/operations/settings/settings#max_rows_to_group_by)                                  | 集計から受け取ることができる最大のユニークキー数。                                                                                                |
| [`group_by_overflow_mode`](/operations/settings/settings#group_by_overflow_mode)                              | 集計のユニークキーの数が制限を超えたときに何が起こるかを設定します。                                                                             |
| [`max_bytes_before_external_group_by`](/operations/settings/settings#max_bytes_before_external_group_by)      | 外部メモリでの `GROUP BY` 句の実行を有効または無効にします。                                                                                     |
| [`max_bytes_ratio_before_external_group_by`](/operations/settings/settings#max_bytes_ratio_before_external_group_by) | `GROUP BY` に許可されている利用可能メモリの比率。到達した場合、外部メモリが集計に使用されます。                                                 |
| [`max_bytes_before_external_sort`](/operations/settings/settings#max_bytes_before_external_sort)                | 外部メモリでの `ORDER BY` 句の実行を有効または無効にします。                                                                                     |
| [`max_bytes_ratio_before_external_sort`](/operations/settings/settings#max_bytes_ratio_before_external_sort)    | `ORDER BY` に許可されている利用可能メモリの比率。到達した場合、外部ソートが使用されます。                                                       |
| [`max_rows_to_sort`](/operations/settings/settings#max_rows_to_sort)                                          | ソート前に最大行数を制限します。ソート時のメモリ消費を制限できます。                                                                              |
| [`max_bytes_to_sort`](/operations/settings/settings#max_rows_to_sort)                                         | ソート前の最大バイト数。                                                                                                                                 |
| [`sort_overflow_mode`](/operations/settings/settings#sort_overflow_mode)                                      | ソート前に受け取った行数がいずれかの制限を超えた場合に何が起こるかを設定します。                                                                    |
| [`max_result_rows`](/operations/settings/settings#max_result_rows)                                            | 結果の行数を制限します。                                                                                                                                 |
| [`max_result_bytes`](/operations/settings/settings#max_result_bytes)                                          | 結果サイズをバイト（非圧縮）で制限します。                                                                                                           |
| [`result_overflow_mode`](/operations/settings/settings#result_overflow_mode)                                  | 結果のボリュームがいずれかの制限を超えた場合に何をするかを設定します。                                                                              |
| [`max_execution_time`](/operations/settings/settings#max_execution_time)                                      | 最大クエリ実行時間（秒）。                                                                                                                                 |
| [`timeout_overflow_mode`](/operations/settings/settings#timeout_overflow_mode)                                | クエリの実行が `max_execution_time` より長くなるか、推定実行時間が `max_estimated_execution_time` より長くなる場合に何をするかを設定します。     |
| [`max_execution_time_leaf`](/operations/settings/settings#max_execution_time_leaf)                            | `max_execution_time` と意味的に類似していますが、分散またはリモートクエリのリーフノードでのみ適用されます。                                       |
| [`timeout_overflow_mode_leaf`](/operations/settings/settings#timeout_overflow_mode_leaf)                      | リーフノードでクエリが `max_execution_time_leaf` より長く実行された場合に何が起こるかを設定します。                                                |
| [`min_execution_speed`](/operations/settings/settings#min_execution_speed)                                    | 秒あたりの最小実行速度。                                                                                                                                 |
| [`min_execution_speed_bytes`](/operations/settings/settings#min_execution_speed_bytes)                        | 秒あたりの最小実行バイト数。                                                                                                                            |
| [`max_execution_speed`](/operations/settings/settings#max_execution_speed)                                    | 秒あたりの最大実行行数。                                                                                                                                 |
| [`max_execution_speed_bytes`](/operations/settings/settings#max_execution_speed_bytes)                        | 秒あたりの最大実行バイト数。                                                                                                                            |
| [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed) | 指定された時間（秒）が経過した後に、実行速度が遅くないことを確認します（`min_execution_speed` より少なくない）。                                      |
| [`max_estimated_execution_time`](/operations/settings/settings#max_estimated_execution_time)                  | 最大クエリ推定実行時間（秒）。                                                                                                                          |
| [`max_columns_to_read`](/operations/settings/settings#max_columns_to_read)                                    | 単一クエリでテーブルから読み取ることができる最大カラム数。                                                                                            |
| [`max_temporary_columns`](/operations/settings/settings#max_temporary_columns)                                | クエリを実行する際に同時にRAMに保持すべき最大の一時カラム数（定数カラムを含む）。                                                                    |
| [`max_temporary_non_const_columns`](/operations/settings/settings#max_temporary_non_const_columns)              | クエリを実行する際に同時にRAMに保持すべき最大の一時カラム数ですが、定数カラムはカウントしません。                                                  |
| [`max_subquery_depth`](/operations/settings/settings#max_subquery_depth)                                      | クエリが指定した数以上のネストされたサブクエリを持つ場合に何が起こるかを設定します。                                                                |
| [`max_ast_depth`](/operations/settings/settings#max_ast_depth)                                                | クエリ構文木の最大ネスト深度。                                                                                                                        |
| [`max_ast_elements`](/operations/settings/settings#max_ast_elements)                                          | クエリ構文木の最大要素数。                                                                                                                                 |
| [`max_rows_in_set`](/operations/settings/settings#max_rows_in_set)                                            | サブクエリから作成されたIN句のデータセットに対する最大行数。                                                                                          |
| [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set)                                          | サブクエリから作成されたIN句で使用されるセットによる最大バイト数（非圧縮データ）。                                                                     |
| [`set_overflow_mode`](/operations/settings/settings#max_bytes_in_set)                                         | データ量がいずれかの制限を超えた場合に何が起こるかを設定します。                                                                                      |
| [`max_rows_in_distinct`](/operations/settings/settings#max_rows_in_distinct)                                  | DISTINCT を使用する際の異なる行の最大数。                                                                                                             |
| [`max_bytes_in_distinct`](/operations/settings/settings#max_bytes_in_distinct)                                | DISTINCT を使用する際のハッシュテーブルによって使用されるメモリ内の状態の最大バイト数（非圧縮バイト）。                                              |
| [`distinct_overflow_mode`](/operations/settings/settings#distinct_overflow_mode)                               | データ量がいずれかの制限を超えた場合に何が起こるかを設定します。                                                                                      |
| [`max_rows_to_transfer`](/operations/settings/settings#max_rows_to_transfer)                                  | GLOBAL IN/JOINセクションが実行されるときにリモートサーバーに渡したり、一時テーブルに保存できる最大サイズ（行数）。                               |
| [`max_bytes_to_transfer`](/operations/settings/settings#max_bytes_to_transfer)                                | GLOBAL IN/JOINセクションが実行されるときにリモートサーバーに渡したり、一時テーブルに保存できる最大バイト数（非圧縮データ）。                      |
| [`transfer_overflow_mode`](/operations/settings/settings#transfer_overflow_mode)                              | データ量がいずれかの制限を超えた場合に何が起こるかを設定します。                                                                                      |
| [`max_rows_in_join`](/operations/settings/settings#max_rows_in_join)                                          | テーブル結合に使用されるハッシュテーブル内の行数を制限します。                                                                                        |
| [`max_bytes_in_join`](/operations/settings/settings#max_bytes_in_join)                                        | テーブル結合に使用されるハッシュテーブルの最大サイズ（バイト数）。                                                                                  |
| [`join_overflow_mode`](/operations/settings/settings#join_overflow_mode)                                      | これらの結合制限のいずれかに達したときに ClickHouse が実行するアクションを定義します。                                                               |
| [`max_partitions_per_insert_block`](/operations/settings/settings#max_partitions_per_insert_block)              | 単一挿入ブロック内の最大パーティション数を制限し、ブロックにパーティションが多すぎると例外がスローされます。                                         |
| [`throw_on_max_partitions_per_insert_block`](/operations/settings/settings#throw_on_max_partitions_per_insert_block)| `max_partitions_per_insert_block` に達したときの動作を制御できます。                                                                                    |
| [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#throw_on_max_partitions_per_insert_block)| 同時に実行されるユーザークエリのディスク上の一時ファイルによって消費される最大データ量。                                                              |
| [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query) | 同時に実行されるクエリのディスク上の一時ファイルによって消費される最大データ量。                                                                      |
| [`max_sessions_for_user`](/operations/settings/settings#max_sessions_for_user)                                | 認証されたユーザーごとの ClickHouse サーバーへの最大同時セッション数。                                                                                   |
| [`max_partitions_to_read`](/operations/settings/settings#max_partitions_to_read)                               | 単一クエリでアクセスできる最大パーティション数を制限します。                                                                                          |

## 廃止された設定 {#obsolete-settings}

:::note
以下の設定は廃止されています。
:::

### max_pipeline_depth {#max-pipeline-depth}

最大パイプライン深度。これは、各データブロックがクエリ処理中に通過する変換の数に対応します。単一サーバーの制限内でカウントされます。パイプラインの深度が大きすぎると、例外がスローされます。
