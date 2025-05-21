---
description: 'すべてのクォータのすべてのインターバルの最大値に関する情報を含むシステムテーブル。行数は任意で、ゼロでも1つのクォータに対応することができます。'
keywords: ['system table', 'quota_limits']
slug: /operations/system-tables/quota_limits
title: 'system.quota_limits'
---


# system.quota_limits

すべてのクォータのすべてのインターバルの最大値に関する情報を含んでいます。行数は任意で、ゼロでも1つのクォータに対応することができます。

カラム:
- `quota_name` ([String](../../sql-reference/data-types/string.md)) — クォータ名。
- `duration` ([UInt32](../../sql-reference/data-types/int-uint.md)) — リソース消費を計算するための時間インターバルの長さ（秒単位）。
- `is_randomized_interval` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 論理値。インターバルがランダム化されているかどうかを示します。ランダム化されていない場合、インターバルは常に同じ時刻に開始します。たとえば、1分のインターバルは常に整数分の時刻に開始します（つまり、11:20:00に開始できますが、11:20:01に開始することはありません）、1日のインターバルは常にUTCの真夜中に開始します。インターバルがランダム化されている場合、最初のインターバルはランダムな時刻に開始し、その後のインターバルは1つずつ開始します。値:
  - `0` — インターバルはランダム化されていません。
  - `1` — インターバルはランダム化されています。
- `max_queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大クエリ数。
- `max_query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大選択クエリ数。
- `max_query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大挿入クエリ数。
- `max_errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大エラー数。
- `max_result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大結果行数。
- `max_result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリの結果を格納するために使用されるバイト単位の最大RAM容量。
- `max_read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリに参加したすべてのテーブルおよびテーブル関数から読み取られた最大行数。
- `max_read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリに参加したすべてのテーブルおよびテーブル関数から読み取られた最大バイト数。
- `max_execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — クエリ実行時間の最大値（秒単位）。
