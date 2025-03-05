---
description: "すべてのクオータのすべてのインターバルの最大値に関する情報を含むシステムテーブル。行数は任意の数またはゼロであり、1つのクオータに対応する場合があります。"
slug: /operations/system-tables/quota_limits
title: "system.quota_limits"
keywords: ["system table", "quota_limits"]
---

すべてのクオータのすべてのインターバルの最大値に関する情報を含みます。行数は任意の数またはゼロであり、1つのクオータに対応する場合があります。

カラム:
- `quota_name` ([String](../../sql-reference/data-types/string.md)) — クオータ名。
- `duration` ([UInt32](../../sql-reference/data-types/int-uint.md)) — リソース消費を計算するための時間インターバルの長さ（秒単位）。
- `is_randomized_interval` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) — 論理値。このインターバルがランダマイズされているかどうかを示します。インターバルがランダマイズされていない場合、常に同じ時間から始まります。例えば、1分のインターバルは常に分の整数の数で始まります（つまり、11:20:00から始まることはありますが、11:20:01からは始まりません）、1日のインターバルは常にUTCの真夜中から始まります。インターバルがランダマイズされている場合、最初のインターバルはランダムな時間から始まり、以降のインターバルは1つずつ始まります。値:
  - `0` — インターバルはランダマイズされていません。
  - `1` — インターバルはランダマイズされています。
- `max_queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大クエリ数。
- `max_query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大セレクトクエリ数。
- `max_query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大挿入クエリ数。
- `max_errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大エラー数。
- `max_result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大結果行数。
- `max_result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリ結果を格納するために使用されるRAMボリュームの最大バイト数。
- `max_read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリに参加したすべてのテーブルおよびテーブル関数から読み取られた最大行数。
- `max_read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリに参加したすべてのテーブルおよびテーブル関数から読み取られた最大バイト数。
- `max_execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — クエリ実行時間の最大値（秒単位）。
