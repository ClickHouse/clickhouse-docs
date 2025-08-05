---
description: 'System table containing information about maximums for all intervals
  of all quotas. Any number of rows or zero can correspond to one quota.'
keywords:
- 'system table'
- 'quota_limits'
slug: '/operations/system-tables/quota_limits'
title: 'system.quota_limits'
---




# system.quota_limits

すべてのクォータのすべてのインターバルの最大値に関する情報を含みます。1つのクォータに対して、行数は0または任意の数を対応させることができます。

カラム:
- `quota_name` ([String](../../sql-reference/data-types/string.md)) — クォータの名前。
- `duration` ([UInt32](../../sql-reference/data-types/int-uint.md)) — リソース消費を計算するための時間間隔の長さ（秒単位）。
- `is_randomized_interval` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 論理値。インターバルがランダム化されているかどうかを示します。インターバルがランダムでない場合、常に同じ時刻から開始します。例えば、1分のインターバルは常に整数分から開始します（つまり、11:20:00から開始できますが、11:20:01から開始することはありません）、1日のインターバルは常にUTCの真夜中から開始します。インターバルがランダム化されている場合、最初のインターバルはランダムな時刻から始まり、次のインターバルは1つずつ始まります。値:
  - `0` — インターバルはランダム化されていない。
  - `1` — インターバルはランダム化されている。
- `max_queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大クエリ数。
- `max_query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大セレクトクエリ数。
- `max_query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大インサートクエリ数。
- `max_errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大エラー数。
- `max_result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大結果行数。
- `max_result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリの結果を保存するのに使用されるRAMのバイト数の最大値。
- `max_read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリに参加したすべてのテーブルおよびテーブル関数から読み取られた最大行数。
- `max_read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリに参加したすべてのテーブルおよびテーブル関数から読み取られた最大バイト数。
- `max_execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — クエリ実行時間の最大値（秒単位）。
