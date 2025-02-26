---
description: "すべてのクォータのすべての間隔に対する最大値に関する情報を含むシステムテーブル。行数はゼロまたは任意の数が1つのクォータに対応することがあります。"
slug: /operations/system-tables/quota_limits
title: "quota_limits"
keywords: ["システムテーブル", "quota_limits"]
---

すべてのクォータのすべての間隔に対する最大値に関する情報を含む。行数はゼロまたは任意の数が1つのクォータに対応することがあります。

カラム:
- `quota_name` ([String](../../sql-reference/data-types/string.md)) — クォータ名。
- `duration` ([UInt32](../../sql-reference/data-types/int-uint.md)) — リソース消費を計算するための時間間隔の長さ（秒単位）。
- `is_randomized_interval` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) — 論理値。間隔がランダム化されているかどうかを示します。ランダム化されていない場合、間隔は常に同じ時刻から始まります。例えば、1分の間隔は常に整数の分数で始まり（例: 11:20:00で始まることはありますが、11:20:01では始まりません）、1日の間隔は常にUTCの真夜中に始まります。間隔がランダム化されている場合、最初の間隔はランダムな時刻から始まり、その後の間隔は1つずつ続きます。値:
  - `0` — 間隔はランダム化されていない。
  - `1` — 間隔はランダム化されている。
- `max_queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大クエリ数。
- `max_query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大セレクトクエリ数。
- `max_query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大インサートクエリ数。
- `max_errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大エラー数。
- `max_result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大結果行数。
- `max_result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリの結果を格納するために使用されるRAMのバイト数の最大値。
- `max_read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリに参加したすべてのテーブルおよびテーブル関数から読み取られた最大行数。
- `max_read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリに参加したすべてのテーブルおよびテーブル関数から読み取られた最大バイト数。
- `max_execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — クエリの実行時間の最大値（秒単位）。
