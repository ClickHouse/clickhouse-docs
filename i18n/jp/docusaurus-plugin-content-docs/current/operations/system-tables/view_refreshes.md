---
'description': 'リフレッシュ可能なマテリアライズドビューに関する情報を含むシステムテーブルです。'
'keywords':
- 'system table'
- 'view_refreshes'
'slug': '/operations/system-tables/view_refreshes'
'title': 'system.view_refreshes'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.view_refreshes

<SystemTableCloud/>

[リフレッシュ可能なマテリアライズドビュー](../../sql-reference/statements/create/view.md#refreshable-materialized-view) に関する情報。リフレッシュが進行中であるかどうかにかかわらず、すべてのリフレッシュ可能なマテリアライズドビューを含みます。

カラム:

- `database` ([String](../../sql-reference/data-types/string.md)) — テーブルが存在するデータベースの名前。
- `view` ([String](../../sql-reference/data-types/string.md)) — テーブル名。
- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — テーブルのuuid (Atomic database)。
- `status` ([String](../../sql-reference/data-types/string.md)) — リフレッシュの現在の状態。
- `last_success_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 最新の成功したリフレッシュが開始された時間。サーバー起動以降またはテーブル作成以降に成功したリフレッシュがない場合はNULL。
- `last_success_duration_ms` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最新のリフレッシュにかかった時間。
- `last_refresh_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 最新のリフレッシュ試行が終了した時間（既知の場合）または開始された時間（不明またはまだ実行中の場合）。サーバー起動以降またはテーブル作成以降にリフレッシュ試行がない場合はNULL。
- `last_refresh_replica` ([String](../../sql-reference/data-types/string.md)) — 調整が有効な場合、現在の（実行中の場合）または前回の（実行されていない場合）リフレッシュ試行を行ったレプリカの名前。
- `next_refresh_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 次のリフレッシュが開始される予定の時間。status = Scheduled の場合。
- `exception` ([String](../../sql-reference/data-types/string.md)) — 前回の試行が失敗した場合のエラーメッセージ。
- `retry` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 現在のリフレッシュに対して、これまでにあった失敗した試行の数。
- `progress` ([Float64](../../sql-reference/data-types/float.md)) — 現在のリフレッシュの進行状況、0から1の間。status が `RunningOnAnotherReplica` の場合は利用できません。
- `read_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 現在のリフレッシュによってこれまでに読み取られた行の数。status が `RunningOnAnotherReplica` の場合は利用できません。
- `read_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 現在のリフレッシュ中に読み取られたバイト数。status が `RunningOnAnotherReplica` の場合は利用できません。
- `total_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 現在のリフレッシュによって読み取る必要がある推定総行数。status が `RunningOnAnotherReplica` の場合は利用できません。
- `written_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 現在のリフレッシュ中に書き込まれた行の数。status が `RunningOnAnotherReplica` の場合は利用できません。
- `written_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 現在のリフレッシュ中に書き込まれたバイト数。status が `RunningOnAnotherReplica` の場合は利用できません。

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
