---
'description': 'システムテーブルは、すべてのユーザーによるクォータ使用に関する情報を含んでいます。'
'keywords':
- 'system table'
- 'quotas_usage'
- 'quota'
'slug': '/operations/system-tables/quotas_usage'
'title': 'system.quotas_usage'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.quotas_usage

<SystemTableCloud/>

すべてのユーザーによるクォータの使用状況。

## カラム:
- `quota_name` ([String](../../sql-reference/data-types/string.md)) — クォータ名。
- `quota_key` ([String](../../sql-reference/data-types/string.md)) — キーの値。
- `is_current` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 現在のユーザーのクォータ使用状況。
- `start_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md)))) — リソース消費を計算するための開始時刻。
- `end_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md)))) — リソース消費を計算するための終了時刻。
- `duration` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt32](../../sql-reference/data-types/int-uint.md))) — リソース消費を計算するための時間インターバルの長さ（秒単位）。
- `queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — このインターバル内のリクエストの総数。
- `max_queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大リクエスト数。
- `query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — このインターバル内の SELECT リクエストの総数。
- `max_query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大 SELECT リクエスト数。
- `query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — このインターバル内の INSERT リクエストの総数。
- `max_query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大 INSERT リクエスト数。
- `errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 例外をスローしたクエリの数。
- `max_errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大エラー数。
- `result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 結果として与えられた行の総数。
- `max_result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — テーブルから読み取られたソース行の最大数。
- `result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリの結果を格納するために使用される RAM のバイト量。
- `max_result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリの結果を格納するために使用される最大 RAM のバイト量。
- `read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md)))) — すべてのリモートサーバーでクエリを実行するために、テーブルから読み取られるソース行の総数。
- `max_read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリに参加するすべてのテーブルおよびテーブル関数から読み取られた行の最大数。
- `read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリに参加するすべてのテーブルおよびテーブル関数から読み取られるバイトの総数。
- `max_read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — すべてのテーブルおよびテーブル関数から読み取られるバイトの最大数。
- `failed_sequential_authentications` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — 連続した認証失敗の総数。ユーザーが `failed_sequential_authentications` 閾値を超える前に正しいパスワードを入力した場合、カウンターはリセットされます。
- `max_failed_sequential_authentications` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — 連続した認証失敗の最大数。
- `execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/float.md))) — クエリの総実行時間（秒単位、ウォールタイム）。
- `max_execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/float.md))) — クエリ実行時間の最大値。

## 参照 {#see-also}

- [SHOW QUOTA](/sql-reference/statements/show#show-quota))
