---
'description': 'システムテーブルが現在のユーザーによるクォータ使用に関する情報を含みます。たとえば、どれだけのクォータが使用されていて、どれだけ残っているか。'
'keywords':
- 'system table'
- 'quota_usage'
'slug': '/operations/system-tables/quota_usage'
'title': 'system.quota_usage'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

現在のユーザーによるクォータの使用状況: 使用量と残量。

カラム:
- `quota_name` ([String](../../sql-reference/data-types/string.md)) — クォタ名。
- `quota_key`([String](../../sql-reference/data-types/string.md)) — キー値。例えば、キー = \[`ip address`\] の場合、`quota_key` の値は '192.168.1.1' となる可能性があります。
- `start_time`([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — リソース消費を計算するための開始時間。
- `end_time`([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — リソース消費を計算するための終了時間。
- `duration` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — リソース消費を計算するための時間間隔の長さ（秒単位）。
- `queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — このインターバル中のリクエストの合計数。
- `query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — このインターバル中の選択リクエストの合計数。
- `query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — このインターバル中の挿入リクエストの合計数。
- `max_queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大リクエスト数。
- `errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 例外をスローしたクエリの数。
- `max_errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大エラー数。
- `result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 結果として返された行の合計数。
- `max_result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大結果行数。
- `result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリ結果を格納するために使用されるRAMのボリューム（バイト単位）。
- `max_result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリ結果を格納するために使用される最大RAMボリューム（バイト単位）。
- `read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — すべてのリモートサーバーでクエリを実行するためにテーブルから読み取られたソース行の合計数。
- `max_read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリに参加したすべてのテーブルおよびテーブル関数から読み取られた最大行数。
- `read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリに参加したすべてのテーブルおよびテーブル関数から読み取られたバイト数の合計。
- `max_read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — すべてのテーブルおよびテーブル関数から読み取られた最大バイト数。
- `failed_sequential_authentications` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/float.md))) — 連続認証失敗の合計件数。ユーザーが `failed_sequential_authentications` の閾値を超える前に正しいパスワードを入力した場合、カウンタはリセットされます。
- `max_failed_sequential_authentications` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/float.md))) — 連続認証失敗の最大件数。
- `execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — クエリの総実行時間（秒単位、壁時間）。
- `max_execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — クエリ実行時間の最大値。

## 参照 {#see-also}

- [SHOW QUOTA](/sql-reference/statements/show#show-quota)
