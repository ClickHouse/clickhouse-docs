---
description: 'すべてのクォータについて、その各間隔ごとの最大値に関する情報を含む system テーブル。一つのクォータに対して、0 行を含む任意の数の行が対応する可能性があります。'
keywords: ['system table', 'quota_limits']
slug: /operations/system-tables/quota_limits
title: 'system.quota_limits'
doc_type: 'reference'
---

# system.quota_limits

すべてのクォータに対する、すべての時間間隔における最大値に関する情報を含みます。1 つのクォータに対して、任意の数の行が対応することもあれば、0 行の場合もあります。

カラム:

- `quota_name` ([String](../../sql-reference/data-types/string.md)) — クォータ名。
- `duration` ([UInt32](../../sql-reference/data-types/int-uint.md)) — リソース消費量を計算するための時間間隔の長さ（秒）。
- `is_randomized_interval` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 論理値。この時間間隔がランダム化されているかどうかを示します。ランダム化されていない場合、時間間隔は常に同じタイミングで開始されます。例えば、1 分間の間隔は常に分の整数値の時点で開始されます（つまり 11:20:00 に開始されることはあっても、11:20:01 に開始されることはありません）。1 日の間隔は常に UTC の深夜に開始されます。時間間隔がランダム化されている場合、最初の間隔はランダムな時刻に開始され、以降の間隔は順次開始されます。値:
- `0` — 時間間隔はランダム化されません。
- `1` — 時間間隔はランダム化されます。
- `max_queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリ数の最大値。
- `max_query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — `SELECT` クエリ数の最大値。
- `max_query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — `INSERT` クエリ数の最大値。
- `max_errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — エラー数の最大値。
- `max_result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 結果の行数の最大値。
- `max_result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリ結果の保存に使用される RAM 容量（バイト単位）の最大値。
- `max_read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリで使用されたすべてのテーブルおよびテーブル関数から読み取られた行数の最大値。
- `max_read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリで使用されたすべてのテーブルおよびテーブル関数から読み取られたバイト数の最大値。
- `max_execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — クエリ実行時間の最大値（秒）。