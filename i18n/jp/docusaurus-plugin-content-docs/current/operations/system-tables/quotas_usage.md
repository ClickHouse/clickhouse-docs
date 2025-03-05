---
description: "全ユーザーによるクォータ使用状況に関する情報を含むシステムテーブル。"
slug: /operations/system-tables/quotas_usage
title: "system.quotas_usage"
keywords: ["system table", "quotas_usage", "quota"]
---
import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

全ユーザーによるクォータ使用状況。

カラム:
- `quota_name` ([String](../../sql-reference/data-types/string.md)) — クォータ名。
- `quota_key` ([String](../../sql-reference/data-types/string.md)) — キー値。
- `is_current` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) — 現在のユーザーのクォータ使用状況。
- `start_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md)))) — リソース消費を計算するための開始時間。
- `end_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md)))) — リソース消費を計算するための終了時間。
- `duration` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt32](../../sql-reference/data-types/int-uint.md))) — リソース消費を計算するための時間間隔の長さ（秒単位）。
- `queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — この時間間隔内の総リクエスト数。
- `max_queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大リクエスト数。
- `query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — この時間間隔内の選択リクエストの総数。
- `max_query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大選択リクエスト数。
- `query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — この時間間隔内の挿入リクエストの総数。
- `max_query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大挿入リクエスト数。
- `errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 例外を投げたクエリの数。
- `max_errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大エラー数。
- `result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 結果として返された行の総数。
- `max_result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — テーブルから読み取った最大の元データ行数。
- `result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリ結果を格納するために使用されるバイト単位のRAMボリューム。
- `max_result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリ結果を格納するために使用される最大RAMボリューム（バイト単位）。
- `read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md)))) — すべてのリモートサーバーでクエリを実行するためにテーブルから読み取られた総元データ行数。
- `max_read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリに参加したすべてのテーブルおよびテーブル関数から読み取られた最大行数。
- `read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — クエリに参加したすべてのテーブルおよびテーブル関数から読み取られたバイトの合計。
- `max_read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — すべてのテーブルおよびテーブル関数から読み取られた最大バイト数。
- `failed_sequential_authentications` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — 連続認証失敗の総数。ユーザーが `failed_sequential_authentications` の閾値を超える前に正しいパスワードを入力すると、カウンターはリセットされる。
- `max_failed_sequential_authentications` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — 連続認証失敗の最大数。
- `execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/float.md))) — 合計クエリ実行時間（秒単位：ウォールタイム）。
- `max_execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/float.md))) — クエリ実行時間の最大値。

## その他を見る {#see-also}

- [SHOW QUOTA](../../sql-reference/statements/show.md#show-quota-statement)
