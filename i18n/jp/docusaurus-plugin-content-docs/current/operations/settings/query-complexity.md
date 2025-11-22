---
description: 'クエリの複雑度を制限する設定。'
sidebar_label: 'クエリの複雑度の制限'
sidebar_position: 59
slug: /operations/settings/query-complexity
title: 'クエリの複雑度の制限'
doc_type: 'reference'
---



# クエリの複雑性に対する制限



## Overview {#overview}

[設定](/operations/settings/overview)の一部として、ClickHouseはクエリの複雑さに制限を設定する機能を提供しています。これにより、リソースを大量に消費する可能性のあるクエリから保護し、特にユーザーインターフェースを使用する際に、より安全で予測可能な実行を確保します。

ほぼすべての制限は`SELECT`クエリにのみ適用され、分散クエリ処理においては、制限は各サーバーで個別に適用されます。

ClickHouseは通常、各行ごとに制限をチェックするのではなく、データパートが完全に処理された後にのみ制限をチェックします。これにより、パートの処理中に制限が超過される状況が発生する可能性があります。


## `overflow_mode` 設定 {#overflow_mode_setting}

ほとんどの制限には `overflow_mode` 設定も用意されており、制限を超えた場合の動作を定義します。この設定は次の2つの値のいずれかを取ります:

- `throw`: 例外をスローします（デフォルト）。
- `break`: クエリの実行を停止し、ソースデータが尽きた場合と同様に部分的な結果を返します。


## `group_by_overflow_mode` 設定 {#group_by_overflow_mode_settings}

`group_by_overflow_mode` 設定には、`any` という値も指定できます:

- `any` : セットに登録済みのキーに対しては集約を継続しますが、新しいキーはセットに追加しません。


## 設定一覧 {#relevant-settings}

以下の設定は、クエリの複雑さに制限を適用する際に使用されます。

:::note
「最大値」に関する制限は `0` を設定することができ、
これは「無制限」を意味します。
:::


| 設定                                                                                                                     | 簡単な説明                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [`max_memory_usage`](/operations/settings/settings#max_memory_usage)                                                   | 単一サーバーでのクエリ実行に使用される RAM の最大量。                                                                        |
| [`max_memory_usage_for_user`](/operations/settings/settings#max_memory_usage_for_user)                                 | 単一サーバー上でユーザーのクエリの実行に使用できるRAMの最大容量。                                                                   |
| [`max_rows_to_read`](/operations/settings/settings#max_rows_to_read)                                                   | クエリ実行時にテーブルから読み取れる最大行数。                                                                              |
| [`max_bytes_to_read`](/operations/settings/settings#max_bytes_to_read)                                                 | クエリ実行時にテーブルから読み取れる非圧縮データの最大バイト数。                                                                     |
| [`read_overflow_mode_leaf`](/operations/settings/settings#read_overflow_mode_leaf)                                     | 読み取るデータ量がいずれかのリーフの制限値を超えた場合の挙動を設定します                                                                 |
| [`max_rows_to_read_leaf`](/operations/settings/settings#max_rows_to_read_leaf)                                         | 分散クエリ実行時に、リーフノード上のローカルテーブルから読み取ることができる最大行数                                                           |
| [`max_bytes_to_read_leaf`](/operations/settings/settings#max_bytes_to_read_leaf)                                       | 分散クエリの実行時にリーフノード上のローカルテーブルから読み出せる非圧縮データの最大バイト数。                                                      |
| [`read_overflow_mode_leaf`](/docs/operations/settings/settings#read_overflow_mode_leaf)                                | データの読み取り量がいずれかのリーフ制限を超えた場合の動作を設定します。                                                                 |
| [`max_rows_to_group_by`](/operations/settings/settings#max_rows_to_group_by)                                           | 集約で受け取る一意キーの最大数。                                                                                     |
| [`group_by_overflow_mode`](/operations/settings/settings#group_by_overflow_mode)                                       | 集約時の一意キー数が上限を超えた場合の動作を設定します                                                                          |
| [`max_bytes_before_external_group_by`](/operations/settings/settings#max_bytes_before_external_group_by)               | `GROUP BY` 句の外部メモリでの実行を有効または無効にします。                                                                  |
| [`max_bytes_ratio_before_external_group_by`](/operations/settings/settings#max_bytes_ratio_before_external_group_by)   | 使用可能メモリのうち、`GROUP BY` に使用を許可する割合。この割合に達すると、集計には外部メモリが使用されます。                                         |
| [`max_bytes_before_external_sort`](/operations/settings/settings#max_bytes_before_external_sort)                       | `ORDER BY` 句の外部メモリでの実行を有効または無効にします。                                                                  |
| [`max_bytes_ratio_before_external_sort`](/operations/settings/settings#max_bytes_ratio_before_external_sort)           | 利用可能メモリのうち `ORDER BY` に使用できる割合。この割合に達すると、外部ソートが使用されます。                                               |
| [`max_rows_to_sort`](/operations/settings/settings#max_rows_to_sort)                                                   | ソート前の行数の上限。ソート処理時のメモリ使用量を制限するために使用されます。                                                              |
| [`max_bytes_to_sort`](/operations/settings/settings#max_rows_to_sort)                                                  | ソート前のバイト数の上限。                                                                                        |
| [`sort_overflow_mode`](/operations/settings/settings#sort_overflow_mode)                                               | ソート前に受信した行数がいずれかの制限を超えた場合の動作を設定します。                                                                  |
| [`max_result_rows`](/operations/settings/settings#max_result_rows)                                                     | 結果の行数を制限します。                                                                                         |
| [`max_result_bytes`](/operations/settings/settings#max_result_bytes)                                                   | 結果のサイズを非圧縮時のバイト数で制限します                                                                               |
| [`result_overflow_mode`](/operations/settings/settings#result_overflow_mode)                                           | 結果のボリュームがいずれかの制限を超えた場合の動作を設定します。                                                                     |
| [`max_execution_time`](/operations/settings/settings#max_execution_time)                                               | クエリの最大実行時間（秒）。                                                                                       |
| [`timeout_overflow_mode`](/operations/settings/settings#timeout_overflow_mode)                                         | クエリの実行が `max_execution_time` を超えて継続した場合、または推定実行時間が `max_estimated_execution_time` を超える場合に行う処理を設定します。 |
| [`max_execution_time_leaf`](/operations/settings/settings#max_execution_time_leaf)                                     | 意味上は `max_execution_time` と同様ですが、分散クエリまたはリモートクエリの場合にリーフノードにのみ適用されます。                                 |
| [`timeout_overflow_mode_leaf`](/operations/settings/settings#timeout_overflow_mode_leaf)                               | リーフノードでのクエリ実行時間が `max_execution_time_leaf` を超えた場合に、どのような動作を行うかを設定します。                                |
| [`min_execution_speed`](/operations/settings/settings#min_execution_speed)                                             | 行/秒で表した最小実行速度。                                                                                       |
| [`min_execution_speed_bytes`](/operations/settings/settings#min_execution_speed_bytes)                                 | 1秒あたりの実行バイト数の最小値。                                                                                    |
| [`max_execution_speed`](/operations/settings/settings#max_execution_speed)                                             | 1 秒あたりの実行行数の最大値。                                                                                     |
| [`max_execution_speed_bytes`](/operations/settings/settings#max_execution_speed_bytes)                                 | 1 秒あたりの実行バイト数の上限。                                                                                    |
| [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)     | 指定された時間（秒）が経過した後に、実行速度が遅すぎない（`min_execution_speed` を下回っていない）ことをチェックします。                              |
| [`max_estimated_execution_time`](/operations/settings/settings#max_estimated_execution_time)                           | クエリの推定実行時間の最大値（秒）。                                                                                   |
| [`max_columns_to_read`](/operations/settings/settings#max_columns_to_read)                                             | 単一のクエリでテーブルから読み取ることができる列の最大数。                                                                        |
| [`max_temporary_columns`](/operations/settings/settings#max_temporary_columns)                                         | クエリの実行時に、定数カラムを含めて同時にRAM内に保持する必要がある一時カラムの最大数。                                                        |
| [`max_temporary_non_const_columns`](/operations/settings/settings#max_temporary_non_const_columns)                     | クエリ実行時にRAM上に同時に保持しておく必要がある一時列の最大数（ただし、定数列は含まない）。                                                     |
| [`max_subquery_depth`](/operations/settings/settings#max_subquery_depth)                                               | クエリ内のネストされたサブクエリの数が指定値を超えた場合の動作を指定します。                                                               |
| [`max_ast_depth`](/operations/settings/settings#max_ast_depth)                                                         | クエリの構文木における最大ネスト深さ。                                                                                  |
| [`max_ast_elements`](/operations/settings/settings#max_ast_elements)                                                   | クエリの構文木に含まれる要素数の上限。                                                                                  |
| [`max_rows_in_set`](/operations/settings/settings#max_rows_in_set)                                                     | IN 句にサブクエリで生成されるデータセットの最大行数。                                                                         |
| [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set)                                                   | サブクエリから生成された IN 句のセットで使用される非圧縮データの最大バイト数。                                                            |
| [`set_overflow_mode`](/operations/settings/settings#max_bytes_in_set)                                                  | データ量がいずれかの上限を超えた場合の動作を設定します。                                                                         |
| [`max_rows_in_distinct`](/operations/settings/settings#max_rows_in_distinct)                                           | DISTINCT 使用時の重複しない行の最大数。                                                                             |
| [`max_bytes_in_distinct`](/operations/settings/settings#max_bytes_in_distinct)                                         | DISTINCT を使用する際に、ハッシュテーブルがメモリ上で保持する状態の最大サイズ（非圧縮時のバイト数）。                                              |
| [`distinct_overflow_mode`](/operations/settings/settings#distinct_overflow_mode)                                       | データ量がいずれかの制限を超えた場合に実行される処理を設定します。                                                                    |
| [`max_rows_to_transfer`](/operations/settings/settings#max_rows_to_transfer)                                           | GLOBAL IN/JOIN 句の実行時に、リモートサーバーへ渡すか一時テーブルに保存できる最大サイズ（行数）。                                             |
| [`max_bytes_to_transfer`](/operations/settings/settings#max_bytes_to_transfer)                                         | GLOBAL IN/JOIN 句が実行される際に、リモートサーバーへ送信または一時テーブルに保存できる非圧縮データの最大バイト数。                                    |
| [`transfer_overflow_mode`](/operations/settings/settings#transfer_overflow_mode)                                       | データ量がいずれかの上限を超えた場合の動作を設定します。                                                                         |
| [`max_rows_in_join`](/operations/settings/settings#max_rows_in_join)                                                   | テーブル結合時に使用されるハッシュテーブルの行数を制限します。                                                                      |
| [`max_bytes_in_join`](/operations/settings/settings#max_bytes_in_join)                                                 | テーブルを結合する際に使用されるハッシュテーブルの最大サイズ（バイト単位）。                                                               |
| [`join_overflow_mode`](/operations/settings/settings#join_overflow_mode)                                               | 次のいずれかの結合制限に達した場合に ClickHouse が実行する動作を定義します。                                                         |
| [`max_partitions_per_insert_block`](/operations/settings/settings#max_partitions_per_insert_block)                     | 単一の挿入ブロック内のパーティション数の最大値を制限し、ブロックがその数を超えるパーティションを含む場合は例外をスローします。                                      |
| [`throw_on_max_partitions_per_insert_block`](/operations/settings/settings#throw_on_max_partitions_per_insert_block)   | `max_partitions_per_insert_block` に到達した場合の動作を制御します。                                                  |
| [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#throw_on_max_partitions_per_insert_block)   | 同時に実行中のすべてのユーザークエリによって、ディスク上の一時ファイルで消費されるデータ量の最大値（バイト単位）。                                            |
| [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query) | 同時に実行中のすべてのクエリによって生成される一時ファイルがディスク上で使用するデータ量の上限（バイト単位）。                                              |
| [`max_sessions_for_user`](/operations/settings/settings#max_sessions_for_user)                                         | 認証済みユーザー1人あたりの ClickHouse サーバーへの同時セッション数の上限。                                                         |
| [`max_partitions_to_read`](/operations/settings/settings#max_partitions_to_read)                                       | 単一のクエリでアクセスできるパーティション数の最大値を制限します。                                                                    |





## 廃止された設定 {#obsolete-settings}

:::note
以下の設定は廃止されています
:::

### max_pipeline_depth {#max-pipeline-depth}

パイプラインの最大深度。クエリ処理中に各データブロックが経由する変換の数に対応します。単一サーバーの制限内でカウントされます。パイプラインの深度がこの値を超えた場合、例外がスローされます。
