---
description: 'バックグラウンドスケジュールプール内のタスク情報を保持するシステムテーブル。'
keywords: ['システムテーブル', 'background_schedule_pool']
slug: /operations/system-tables/background_schedule_pool
title: 'system.background_schedule_pool'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.background_schedule_pool {#systembackground_schedule_pool}

<SystemTableCloud />

バックグラウンドスケジュールプール内のタスクに関する情報を含みます。バックグラウンドスケジュールプールは、分散送信、バッファフラッシュ、メッセージブローカー処理などの定期的なタスクの実行に使用されます。

カラム:

* `pool` ([String](../../sql-reference/data-types/string.md)) — プール名。取り得る値は次のとおりです:
  * `schedule` — 汎用スケジュールプール
  * `buffer_flush` — Buffer テーブルデータをフラッシュするためのプール
  * `distributed` — 分散テーブル操作用のプール
  * `message_broker` — メッセージブローカー処理用のプール
* `database` ([String](../../sql-reference/data-types/string.md)) — データベース名。
* `table` ([String](../../sql-reference/data-types/string.md)) — テーブル名。
* `table_uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — テーブルの UUID。
* `query_id` ([String](../../sql-reference/data-types/string.md)) — クエリ ID（現在実行中の場合）。 （これは実際のクエリではなく、`system.text_log` 内のログを照合するためにランダムに生成される ID である点に注意してください。）
* `elapsed_ms` ([UInt64](../../sql-reference/data-types/int-uint.md)) — タスクの実行時間（現在実行中の場合）。
* `log_name` ([String](../../sql-reference/data-types/string.md)) — タスクのログ名。
* `deactivated` ([UInt8](../../sql-reference/data-types/int-uint.md)) — タスクが無効化されているかどうか（常に false です。無効化されたタスクはプールから削除されるため）。
* `scheduled` ([UInt8](../../sql-reference/data-types/int-uint.md)) — タスクが実行予定かどうか。
* `delayed` ([UInt8](../../sql-reference/data-types/int-uint.md)) — タスクが遅延付きでスケジュールされているかどうか。
* `executing` ([UInt8](../../sql-reference/data-types/int-uint.md)) — タスクが現在実行中かどうか。

**例**

```sql
SELECT * FROM system.background_schedule_pool LIMIT 5 FORMAT Vertical;
```

```text
Row 1:
──────
pool:        distributed
database:    default
table:       data
table_uuid:  00000000-0000-0000-0000-000000000000
query_id:
elapsed_ms:  0
log_name:    BackgroundJobsAssignee:DataProcessing
deactivated: 0
scheduled:   1
delayed:     0
executing:   0
```

**関連項目**

* [system.background&#95;schedule&#95;pool&#95;log](background_schedule_pool_log.md) — バックグラウンドスケジュールプールタスクの実行履歴を保持します。
