---
description: "現在のユーザーによるクオータ使用状況に関する情報を含むシステムテーブル。クオータの使用量と残りの量を示します。"
slug: /operations/system-tables/quota_usage
title: "system.quota_usage"
keywords: ["system table", "quota_usage"]
---
import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

現在のユーザーによるクオータの使用状況：使用量と残りの量。

カラム:
- `quota_name` ([String](../../sql-reference/data-types/string.md)) — クオタ名。
- `quota_key` ([String](../../sql-reference/data-types/string.md)) — キー値。例えば、`keys = \[`ip address`\]` の場合、`quota_key` の値は '192.168.1.1' になる可能性があります。
- `start_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — リソース消費を計算するための開始時刻。
- `end_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — リソース消費を計算するための終了時刻。
- `duration` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — リソース消費を計算するための時間間隔の長さ（秒）。
- `queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — この間隔内の総リクエスト数。
- `query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — この間隔内の選択リクエストの総数。
- `query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — この間隔内の挿入リクエストの総数。
- `max_queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — リクエストの最大数。
- `errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 例外を投げたクエリの数。
- `max_errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大エラー数。
- `result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 結果として提供された行の総数。
- `max_result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 結果行の最大数。
- `result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリ結果を格納するために使用されたRAMのバイト量。
- `max_result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリ結果を格納するのに使用された最大RAM量（バイト）。
- `read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — すべてのリモートサーバーでクエリを実行するために読み取ったソーステーブルの行の総数。
- `max_read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリに参加したすべてのテーブルおよびテーブル関数から読み取った最大行数。
- `read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリに参加したすべてのテーブルおよびテーブル関数から読み取ったバイトの合計数。
- `max_read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — すべてのテーブルおよびテーブル関数から読み取った最大バイト数。
- `failed_sequential_authentications` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/float.md))) — 連続認証の失敗の総数。ユーザーが `failed_sequential_authentications` の閾値を超える前に正しいパスワードを入力した場合、カウンターはリセットされます。
- `max_failed_sequential_authentications` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/float.md))) — 連続認証失敗の最大カウント。
- `execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — クエリの総実行時間（秒、ウォールタイム）。
- `max_execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — クエリ実行時間の最大値。

## 参考文献 {#see-also}

- [SHOW QUOTA](../../sql-reference/statements/show.md#show-quota-statement)
