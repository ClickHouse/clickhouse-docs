---
description: 'バックグラウンドスケジュールプール内のタスク実行履歴を保持するシステムテーブル。'
keywords: ['system table', 'background_schedule_pool_log']
slug: /operations/system-tables/background_schedule_pool_log
title: 'system.background_schedule_pool_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.background_schedule_pool_log \{#systembackground_schedule_pool_log\}

<SystemTableCloud />

`system.background_schedule_pool_log` テーブルは、[background&#95;schedule&#95;pool&#95;log](/operations/server-configuration-parameters/settings#background_schedule_pool_log) サーバー設定が指定されている場合にのみ作成されます。

このテーブルには、バックグラウンドスケジュールプールで実行されたタスクの履歴が含まれます。バックグラウンドスケジュールプールは、分散送信、バッファフラッシュ、メッセージブローカーの操作といった定期タスクの実行に使用されます。

`system.background_schedule_pool_log` テーブルには、次のカラムが含まれます。

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベントの日付。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — イベントの時刻。
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒精度でのイベントの時刻。
* `query_id` ([String](../../sql-reference/data-types/string.md)) — バックグラウンドタスクに関連付けられたクエリの識別子（これは実際のクエリではなく、`system.text_log` 内のログを突き合わせるためにランダムに生成される ID です）。
* `database` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — データベース名。
* `table` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — テーブル名。
* `table_uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — バックグラウンドタスクが属するテーブルの UUID。
* `log_name` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — バックグラウンドタスクの名前。
* `duration_ms` ([UInt64](../../sql-reference/data-types/int-uint.md)) — タスク実行時間（ミリ秒単位）。
* `error` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 発生した例外のエラーコード。
* `exception` ([String](../../sql-reference/data-types/string.md)) — 発生したエラーのテキストメッセージ。

`system.background_schedule_pool_log` テーブルは、最初のバックグラウンドタスクが実行された後に作成されます。

**例**

```sql
SELECT * FROM system.background_schedule_pool_log LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
hostname:                clickhouse.eu-central1.internal
event_date:              2025-12-18
event_time:              2025-12-18 10:30:15
event_time_microseconds: 2025-12-18 10:30:15.123456
query_id:
database:                default
table:                   data
table_uuid:              00000000-0000-0000-0000-000000000000
log_name:                default.data
duration_ms:             42
error:                   0
exception:
```

**関連項目**

* [system.background&#95;schedule&#95;pool](background_schedule_pool.md) — バックグラウンドスケジュールプールで現在スケジュールされているタスクに関する情報を含みます。
