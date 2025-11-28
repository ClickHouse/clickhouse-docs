---
description: 'すべてのクォータにおける各間隔ごとの最大値に関する情報を含む system テーブル。1 つのクォータに対して、任意の数（0 行を含む）の行が対応する場合があります。'
keywords: ['system table', 'quota_limits']
slug: /operations/system-tables/quota_limits
title: 'system.quota_limits'
doc_type: 'reference'
---

# system.quota_limits

すべてのクォータのすべての間隔に対する上限に関する情報を含みます。1 つのクォータに対して、対応する行数は任意（0 行も可）です。

カラム:

- `quota_name` ([String](../../sql-reference/data-types/string.md)) — クォータ名。
- `duration` ([UInt32](../../sql-reference/data-types/int-uint.md)) — リソース消費量を集計する時間間隔の長さ（秒単位）。
- `is_randomized_interval` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 論理値。間隔がランダム化されているかどうかを示します。ランダム化されていない場合、間隔は常に同じ時刻から開始します。たとえば、1 分の間隔は常に分の整数値の時刻で開始します（つまり 11:20:00 で開始することはあっても、11:20:01 で開始することはありません）。1 日の間隔は常に UTC の真夜中から開始します。間隔がランダム化されている場合、最初の間隔はランダムな時刻から開始し、その後の間隔は連続して開始されます。値:
- `0` — 間隔はランダム化されていません。
- `1` — 間隔はランダム化されています。
- `max_queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリの最大数。
- `max_query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — SELECT クエリの最大数。
- `max_query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — INSERT クエリの最大数。
- `max_errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — エラーの最大数。
- `max_result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 結果の行数の最大値。
- `max_result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリ結果を保存するために使用される RAM 量の最大値（バイト単位）。
- `max_read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリで使用されたすべてのテーブルおよびテーブル関数から読み取られた行数の最大値。
- `max_read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリで使用されたすべてのテーブルおよびテーブル関数から読み取られたバイト数の最大値。
- `max_execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — クエリ実行時間の最大値（秒単位）。