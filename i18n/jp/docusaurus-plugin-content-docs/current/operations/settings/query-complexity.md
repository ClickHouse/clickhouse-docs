---
description: 'クエリの複雑さを制限するための設定。'
sidebar_label: 'クエリの複雑さの制限'
sidebar_position: 59
slug: /operations/settings/query-complexity
title: 'クエリの複雑さの制限'
doc_type: 'reference'
---

# クエリの複雑さに関する制限 \{#restrictions-on-query-complexity\}

## 概要 \{#overview\}

[settings](/operations/settings/overview) の一部として、ClickHouse では
クエリの複雑さに関する制限を設けることができます。これにより、潜在的にリソース負荷の高いクエリからシステムを保護し、
特にユーザーインターフェイスを使用する場合に、より安全で予測可能な
実行を実現できます。

ほとんどすべての制限は `SELECT` クエリにのみ適用され、分散クエリ処理の場合には、
各サーバーごとに個別に制限が適用されます。

ClickHouse は一般的に、各行ごとに制限をチェックするのではなく、
データパーツが完全に処理された後でのみ制限をチェックします。
このため、パーツの処理中に制限違反が発生する状況が起こり得ます。

## `overflow_mode` 設定 \{#overflow_mode_setting\}

ほとんどの制限には `overflow_mode` 設定もあり、制限を超過した場合に何が起こるかを定義します。`overflow_mode` には次の 2 つの値を設定できます:
- `throw`: 例外をスローする（デフォルト）。
- `break`: クエリの実行を停止し、ソースデータが尽きたかのように途中までの結果を返します。

## `group_by_overflow_mode` 設定 \{#group_by_overflow_mode_settings\}

`group_by_overflow_mode` 設定には `any` という値もあります:
- `any` : 集合にすでに含まれているキーは集計を継続しますが、新しいキーは集合に追加しません。

## 設定一覧 \{#relevant-settings\}

以下の設定は、クエリの複雑さに対する制限を適用するために使用されます。

:::note
「〜の最大量」に対する制限は値として `0` を指定でき、
その場合は「無制限」であることを意味します。
:::

| 設定                                                                                                                     | 概要                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [`max_memory_usage`](/operations/settings/settings#max_memory_usage)                                                   | 単一サーバーでクエリを実行する際に使用できる RAM の最大量。                                                                     |
| [`max_memory_usage_for_user`](/operations/settings/settings#max_memory_usage_for_user)                                 | 単一サーバーでユーザーのクエリを実行する際に使用できる RAM の最大容量。                                                               |
| [`max_rows_to_read`](/operations/settings/settings#max_rows_to_read)                                                   | クエリ実行時にテーブルから読み取ることができる行数の上限。                                                                        |
| [`max_bytes_to_read`](/operations/settings/settings#max_bytes_to_read)                                                 | クエリ実行時にテーブルから読み取ることができる非圧縮データの最大バイト数。                                                                |
| [`read_overflow_mode_leaf`](/operations/settings/settings#read_overflow_mode_leaf)                                     | 読み取りデータ量がリーフのいずれかの制限値を超えた場合の挙動を設定します                                                                 |
| [`max_rows_to_read_leaf`](/operations/settings/settings#max_rows_to_read_leaf)                                         | 分散クエリ実行時にリーフノード上のローカルテーブルから読み出せる最大行数                                                                 |
| [`max_bytes_to_read_leaf`](/operations/settings/settings#max_bytes_to_read_leaf)                                       | 分散クエリ実行時に、リーフノード上のローカルテーブルから読み取ることのできる非圧縮データの最大バイト数。                                                 |
| [`read_overflow_mode_leaf`](/docs/operations/settings/settings#read_overflow_mode_leaf)                                | 読み取られるデータ量がいずれかのリーフ上限を超えた場合の動作を設定します。                                                                |
| [`max_rows_to_group_by`](/operations/settings/settings#max_rows_to_group_by)                                           | 集約で受信した一意キーの最大数。                                                                                     |
| [`group_by_overflow_mode`](/operations/settings/settings#group_by_overflow_mode)                                       | 集約における一意キーの数が制限を超えた場合の動作を設定します                                                                       |
| [`max_bytes_before_external_group_by`](/operations/settings/settings#max_bytes_before_external_group_by)               | `GROUP BY` 句の外部メモリでの実行を有効または無効にします。                                                                  |
| [`max_bytes_ratio_before_external_group_by`](/operations/settings/settings#max_bytes_ratio_before_external_group_by)   | 使用可能メモリのうち、`GROUP BY` に使用を許可する割合です。この割合に達すると、集約には外部メモリが使用されます。                                       |
| [`max_bytes_before_external_sort`](/operations/settings/settings#max_bytes_before_external_sort)                       | 外部メモリでの `ORDER BY` 句の実行を有効化または無効化します。                                                                |
| [`max_bytes_ratio_before_external_sort`](/operations/settings/settings#max_bytes_ratio_before_external_sort)           | 利用可能メモリのうち、`ORDER BY` に使用を許可する比率。この比率に達すると、外部ソートが使用されます。                                             |
| [`max_rows_to_sort`](/operations/settings/settings#max_rows_to_sort)                                                   | ソート前の行数の上限。ソート時のメモリ使用量を制限するために利用します。                                                                 |
| [`max_bytes_to_sort`](/operations/settings/settings#max_rows_to_sort)                                                  | ソートを実行する前の最大バイト数。                                                                                    |
| [`sort_overflow_mode`](/operations/settings/settings#sort_overflow_mode)                                               | ソート前に受信した行数がいずれかの制限を超えた場合の挙動を設定します。                                                                  |
| [`max_result_rows`](/operations/settings/settings#max_result_rows)                                                     | 結果の行数を制限します。                                                                                         |
| [`max_result_bytes`](/operations/settings/settings#max_result_bytes)                                                   | 結果サイズをバイト数（圧縮前）で制限します                                                                                |
| [`result_overflow_mode`](/operations/settings/settings#result_overflow_mode)                                           | 結果の量がいずれかの上限を超えた場合の動作を設定します。                                                                         |
| [`max_execution_time`](/operations/settings/settings#max_execution_time)                                               | クエリの最大実行時間（秒）。                                                                                       |
| [`timeout_overflow_mode`](/operations/settings/settings#timeout_overflow_mode)                                         | クエリの実行時間が `max_execution_time` を超えた場合、または推定実行時間が `max_estimated_execution_time` を超える場合に実行する動作を設定します。 |
| [`max_execution_time_leaf`](/operations/settings/settings#max_execution_time_leaf)                                     | 意味的には `max_execution_time` と同様ですが、分散クエリやリモートクエリではリーフノードにのみ適用されます。                                    |
| [`timeout_overflow_mode_leaf`](/operations/settings/settings#timeout_overflow_mode_leaf)                               | リーフノード上でのクエリ実行時間が `max_execution_time_leaf` を超えた場合の動作を設定します。                                         |
| [`min_execution_speed`](/operations/settings/settings#min_execution_speed)                                             | 実行速度の最小値（行/秒）。                                                                                       |
| [`min_execution_speed_bytes`](/operations/settings/settings#min_execution_speed_bytes)                                 | 毎秒の最小実行バイト数。                                                                                         |
| [`max_execution_speed`](/operations/settings/settings#max_execution_speed)                                             | 1 秒あたりに実行される行数の最大値。                                                                                  |
| [`max_execution_speed_bytes`](/operations/settings/settings#max_execution_speed_bytes)                                 | 1 秒あたりの実行バイト数の上限。                                                                                    |
| [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)     | 指定された秒数が経過した後、実行速度が遅すぎないこと（`min_execution_speed` 以上であること）を確認します。                                     |
| [`max_estimated_execution_time`](/operations/settings/settings#max_estimated_execution_time)                           | クエリ実行時間の最大推定値（秒）。                                                                                    |
| [`max_columns_to_read`](/operations/settings/settings#max_columns_to_read)                                             | 1つのクエリでテーブルから読み取れる列の最大数。                                                                             |
| [`max_temporary_columns`](/operations/settings/settings#max_temporary_columns)                                         | クエリ実行時に、定数列も含めて同時にRAM内に保持される必要がある一時列の最大数。                                                            |
| [`max_temporary_non_const_columns`](/operations/settings/settings#max_temporary_non_const_columns)                     | クエリの実行時に同時にRAM内に保持しておく必要がある一時カラムの最大数を示します。ただし、定数カラムは含めません。                                           |
| [`max_subquery_depth`](/operations/settings/settings#max_subquery_depth)                                               | クエリ内のネストされたサブクエリ数が指定した数を超えた場合の動作を設定します。                                                              |
| [`max_ast_depth`](/operations/settings/settings#max_ast_depth)                                                         | クエリの構文木における最大のネスト深さ。                                                                                 |
| [`max_ast_elements`](/operations/settings/settings#max_ast_elements)                                                   | クエリの構文木における要素数の上限。                                                                                   |
| [`max_rows_in_set`](/operations/settings/settings#max_rows_in_set)                                                     | サブクエリから生成された IN 句のデータセットに含められる最大行数。                                                                  |
| [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set)                                                   | サブクエリから作成された IN 句内の集合に対して使用される未圧縮データの最大バイト数。                                                         |
| [`set_overflow_mode`](/operations/settings/settings#max_bytes_in_set)                                                  | データ量がいずれかの制限を超えた場合に実行される動作を設定します。                                                                    |
| [`max_rows_in_distinct`](/operations/settings/settings#max_rows_in_distinct)                                           | DISTINCT 使用時の重複排除後の行数の最大値。                                                                           |
| [`max_bytes_in_distinct`](/operations/settings/settings#max_bytes_in_distinct)                                         | DISTINCT を使用する際にハッシュテーブルがメモリ上に保持する状態の最大サイズ（非圧縮時のバイト数）。                                               |
| [`distinct_overflow_mode`](/operations/settings/settings#distinct_overflow_mode)                                       | データ量がいずれかの制限を超えた場合の動作を設定します。                                                                         |
| [`max_rows_to_transfer`](/operations/settings/settings#max_rows_to_transfer)                                           | GLOBAL IN/JOIN セクションの実行時に、リモートサーバーへ渡すか一時テーブルに保存できる最大サイズ（行数）。                                         |
| [`max_bytes_to_transfer`](/operations/settings/settings#max_bytes_to_transfer)                                         | GLOBAL IN/JOIN セクションの実行時に、リモートサーバーへ送信するか一時テーブルに保存できる非圧縮データの最大バイト数。                                   |
| [`transfer_overflow_mode`](/operations/settings/settings#transfer_overflow_mode)                                       | データ量がいずれかの制限を超えた場合の挙動を設定します。                                                                         |
| [`max_rows_in_join`](/operations/settings/settings#max_rows_in_join)                                                   | テーブル結合時に使用されるハッシュテーブルの行数を制限します。                                                                      |
| [`max_bytes_in_join`](/operations/settings/settings#max_bytes_in_join)                                                 | テーブル結合時に使用されるハッシュテーブルの最大サイズ（バイト単位）。                                                                  |
| [`join_overflow_mode`](/operations/settings/settings#join_overflow_mode)                                               | 次のいずれかの結合制限に達した場合に ClickHouse が実行する動作を定義します。                                                         |
| [`max_partitions_per_insert_block`](/operations/settings/settings#max_partitions_per_insert_block)                     | 単一の挿入ブロックに含められるパーティション数の最大値を制限し、ブロックに含まれるパーティションが多すぎる場合は例外をスローします。                                   |
| [`throw_on_max_partitions_per_insert_block`](/operations/settings/settings#throw_on_max_partitions_per_insert_block)   | `max_partitions_per_insert_block` に到達した場合の動作を制御します。                                                  |
| [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#throw_on_max_partitions_per_insert_block)   | 同時実行されているすべてのユーザークエリに対して、ディスク上の一時ファイルによって消費されるデータ量の最大値（バイト単位）。                                       |
| [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query) | 同時実行中のすべてのクエリで、ディスク上の一時ファイルが使用するデータ量の最大値（バイト単位）。                                                     |
| [`max_sessions_for_user`](/operations/settings/settings#max_sessions_for_user)                                         | 認証済みユーザー1人あたりの ClickHouse サーバーへの同時セッション数の上限。                                                         |
| [`max_partitions_to_read`](/operations/settings/settings#max_partitions_to_read)                                       | 1つのクエリでアクセスできるパーティションの最大数を制限します。                                                                     |



## 廃止された設定 \{#obsolete-settings\}

:::note
次の設定は廃止されています
:::

### max_pipeline_depth \{#max-pipeline-depth\}

パイプラインの最大深さです。クエリ処理中に各データブロックが通過する変換の数に対応します。単一サーバー内でのみカウントされます。パイプラインの深さがこれより大きい場合は、例外が送出されます。
