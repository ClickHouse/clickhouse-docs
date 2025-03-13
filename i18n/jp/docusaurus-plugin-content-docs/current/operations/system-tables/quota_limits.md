---
description: "すべてのクォータのすべてのインターバルに関する最大値の情報を含むシステムテーブル。0行または任意の数の行が1つのクォータに対応可能です。"
slug: /operations/system-tables/quota_limits
title: "system.quota_limits"
keywords: ["system table", "quota_limits"]
---

すべてのクォータのすべてのインターバルに関する最大値の情報を含みます。0行または任意の数の行が1つのクォータに対応します。

カラム:
- `quota_name` ([String](../../sql-reference/data-types/string.md)) — クォータ名。
- `duration` ([UInt32](../../sql-reference/data-types/int-uint.md)) — リソース消費を計算するための時間インターバルの長さ（秒単位）。
- `is_randomized_interval` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 論理値。このインターバルがランダム化されているかどうかを示します。インターバルがランダム化されていない場合、常に同じ時刻から始まります。たとえば、1分のインターバルは常に整数分の数（つまり、11:20:00から始まりますが、11:20:01から始まることはありません）から始まり、1日のインターバルは常にUTCの真夜中から始まります。インターバルがランダム化されている場合、最初のインターバルはランダムな時刻から始まり、次のインターバルは1つずつ始まります。値:
- `0` — インターバルはランダム化されていません。
- `1` — インターバルはランダム化されています。
- `max_queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大クエリ数。
- `max_query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大選択クエリ数。
- `max_query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大挿入クエリ数。
- `max_errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大エラー数。
- `max_result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大結果行数。
- `max_result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリの結果を格納するために使用されるRAMボリュームの最大バイト数。
- `max_read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリに参加したすべてのテーブルおよびテーブル関数から読み取られた行の最大数。
- `max_read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリに参加したすべてのテーブルおよびテーブル関数から読み取られた最大バイト数。
- `max_execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — クエリ実行時間の最大値（秒単位）。
