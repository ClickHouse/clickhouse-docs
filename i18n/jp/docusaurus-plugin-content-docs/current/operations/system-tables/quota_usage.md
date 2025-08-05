---
description: 'System table containing formation about quota usage by the current
  user such as how much of the quota is used and how much is left.'
keywords:
- 'system table'
- 'quota_usage'
slug: '/operations/system-tables/quota_usage'
title: 'system.quota_usage'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

現在のユーザーによるクォータの使用状況: 使用量と残量。

列:
- `quota_name` ([String](../../sql-reference/data-types/string.md)) — クォタ名。
- `quota_key`([String](../../sql-reference/data-types/string.md)) — キー値。たとえば、keys = \[`ip address`\] の場合、`quota_key` の値は '192.168.1.1' となることがあります。
- `start_time`([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — リソース消費の計算開始時間。
- `end_time`([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — リソース消費の計算終了時間。
- `duration` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — リソース消費を計算するための時間間隔の長さ（秒単位）。
- `queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — この間隔内でのリクエストの総数。
- `query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — この間隔内での Select リクエストの総数。
- `query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — この間隔内での Insert リクエストの総数。
- `max_queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大リクエスト数。
- `errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 例外をスローしたクエリの数。
- `max_errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大エラー数。
- `result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 結果として返された行の総数。
- `max_result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大結果行数。
- `result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリの結果を保存するために使用された RAM のバイト数。
- `max_result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリの結果を保存するために使用された最大 RAM バイト数。
- `read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — すべてのリモートサーバーでクエリを実行するためにテーブルから読み取られたソース行の総数。
- `max_read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリに参加したすべてのテーブル及びテーブル関数から読み取られた最大行数。
- `read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリに参加したすべてのテーブル及びテーブル関数から読み取られたバイト数の総数。
- `max_read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — すべてのテーブル及びテーブル関数から読み取られたバイトの最大数。
- `failed_sequential_authentications` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/float.md))) — 連続した認証失敗の合計カウント。ユーザーが `failed_sequential_authentications` の閾値を超える前に正しいパスワードを入力した場合、カウンタはリセットされます。
- `max_failed_sequential_authentications` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/float.md))) — 連続した認証失敗の最大カウント。
- `execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — 総クエリ実行時間（秒単位、壁時間）。
- `max_execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — クエリ実行時間の最大値。

## 関連情報 {#see-also}

- [SHOW QUOTA](/sql-reference/statements/show#show-quota)
