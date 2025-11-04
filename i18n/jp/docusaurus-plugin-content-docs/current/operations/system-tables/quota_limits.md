---
'description': 'システムテーブルは、すべてのクォータのすべてのインターバルの最大値に関する情報を含みます。任意の数の行またはゼロは、1つのクォータに対応できます。'
'keywords':
- 'system table'
- 'quota_limits'
'slug': '/operations/system-tables/quota_limits'
'title': 'system.quota_limits'
'doc_type': 'reference'
---


# system.quota_limits

すべてのクオータのすべてのインターバルの最大値に関する情報を含みます。いくつかの行またはゼロは、1つのクオータに対応します。

カラム:
- `quota_name` ([String](../../sql-reference/data-types/string.md)) — クオータ名。
- `duration` ([UInt32](../../sql-reference/data-types/int-uint.md)) — リソース消費を計算するための時間インターバルの長さ（秒単位）。
- `is_randomized_interval` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 論理値。インターバルがランダム化されているかどうかを示します。インターバルがランダム化されていない場合、常に同じ時間に開始します。例えば、1分のインターバルは常に整数の分数から始まります（つまり、11:20:00から始まることはできますが、11:20:01から始まることはありません）、1日のインターバルは常にUTCの真夜中から始まります。インターバルがランダム化されている場合、最初のインターバルはランダムな時間に開始され、その後のインターバルは1つずつ開始されます。値:
  - `0` — インターバルはランダム化されていません。
  - `1` — インターバルはランダム化されています。
- `max_queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大クエリ数。
- `max_query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大セレクトクエリ数。
- `max_query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大挿入クエリ数。
- `max_errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大エラー数。
- `max_result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大結果行数。
- `max_result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリ結果を保存するために使用される最大RAMボリューム（バイト単位）。
- `max_read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリに参加したすべてのテーブルおよびテーブル関数から読み取られる最大行数。
- `max_read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリに参加したすべてのテーブルおよびテーブル関数から読み取られる最大バイト数。
- `max_execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — クエリの最大実行時間（秒単位）。
