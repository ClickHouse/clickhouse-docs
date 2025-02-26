---
description: "更新可能なマテリアライズドビューに関する情報を含むシステムテーブル"
slug: /operations/system-tables/view_refreshes
title: "view_refreshes"
keywords: ["システムテーブル", "view_refreshes"]
---
import SystemTableCloud from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

[更新可能なマテリアライズドビュー](../../sql-reference/statements/create/view.md#refreshable-materialized-view)に関する情報。現在進行中のリフレッシュがあるかどうかにかかわらず、すべての更新可能なマテリアライズドビューを含みます。

カラム：

- `database` ([String](../../sql-reference/data-types/string.md)) — テーブルがあるデータベースの名前。
- `view` ([String](../../sql-reference/data-types/string.md)) — テーブル名。
- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — テーブルのUUID（アトミックデータベース）。
- `status` ([String](../../sql-reference/data-types/string.md)) — リフレッシュの現在の状態。
- `last_success_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 最新の成功したリフレッシュが開始した時間。サーバーの起動またはテーブルの作成以来、成功したリフレッシュがなかった場合はNULL。
- `last_success_duration_ms` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最新のリフレッシュにかかった時間。
- `last_refresh_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 最新のリフレッシュ試行が終了した時間（既知の場合）または開始した時間（不明またはまだ実行中の場合）。サーバーの起動またはテーブルの作成以来、リフレッシュ試行がなかった場合はNULL。
- `last_refresh_replica` ([String](../../sql-reference/data-types/string.md)) — 調整が有効な場合、現在の（実行中の場合）または前の（実行していない場合）リフレッシュ試行を行ったレプリカの名前。
- `next_refresh_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — ステータスがScheduledの場合に次のリフレッシュが開始される予定の時間。
- `exception` ([String](../../sql-reference/data-types/string.md)) — 前の試行が失敗した場合のエラーメッセージ。
- `retry` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 現在のリフレッシュに対する失敗した試行の数。
- `progress` ([Float64](../../sql-reference/data-types/float.md)) — 現在のリフレッシュの進行状況、0と1の間。ステータスが`RunningOnAnotherReplica`の場合は利用できません。
- `read_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 現在のリフレッシュでこれまでに読み取られた行の数。ステータスが`RunningOnAnotherReplica`の場合は利用できません。
- `read_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 現在のリフレッシュ中に読み取られたバイト数。ステータスが`RunningOnAnotherReplica`の場合は利用できません。
- `total_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 現在のリフレッシュで読み取る必要のある行の推定総数。ステータスが`RunningOnAnotherReplica`の場合は利用できません。
- `written_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 現在のリフレッシュ中に書き込まれた行の数。ステータスが`RunningOnAnotherReplica`の場合は利用できません。
- `written_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 現在のリフレッシュ中に書き込まれたバイト数。ステータスが`RunningOnAnotherReplica`の場合は利用できません。

**例**

```sql
SELECT
    database,
    view,
    status,
    last_refresh_result,
    last_refresh_time,
    next_refresh_time
FROM system.view_refreshes

┌─database─┬─view───────────────────────┬─status────┬─last_refresh_result─┬───last_refresh_time─┬───next_refresh_time─┐
│ default  │ hello_documentation_reader │ Scheduled │ Finished            │ 2023-12-01 01:24:00 │ 2023-12-01 01:25:00 │
└──────────┴────────────────────────────┴───────────┴─────────────────────┴─────────────────────┴─────────────────────┘
```
