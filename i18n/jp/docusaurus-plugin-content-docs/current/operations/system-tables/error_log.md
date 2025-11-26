---
description: 'テーブル `system.errors` に記録されたエラー値の履歴を保持し、定期的にディスクへフラッシュするシステムテーブル。'
keywords: ['システムテーブル', 'error_log']
slug: /operations/system-tables/system-error-log
title: 'system.error_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';

<SystemTableCloud />

テーブル `system.errors` に記録されるエラー値の履歴を保持しており、定期的にディスクにフラッシュされます。

列:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行したサーバーのホスト名。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベントの日付。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — イベントの時刻。
* `code` ([Int32](../../sql-reference/data-types/int-uint.md)) — エラーコード番号。
* `error` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) - エラー名。
* `value` ([UInt64](../../sql-reference/data-types/int-uint.md)) — このエラーが発生した回数。
* `remote` ([UInt8](../../sql-reference/data-types/int-uint.md)) — リモート例外（例: 分散クエリのいずれかの実行中に受信したもの）。
* `last_error_time` ([DateTime](../../sql-reference/data-types/datetime.md))  — 最後に発生したエラーの時刻。
* `last_error_message` ([String](../../sql-reference/data-types/string.md)) — 最後に発生したエラーのメッセージ。
* `last_error_query_id` ([String](../../sql-reference/data-types/string.md)) — 最後のエラーを引き起こしたクエリの ID（存在する場合）。
* `last_error_trace` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — 呼び出されたメソッドが格納されている物理アドレスの一覧を表すスタックトレース。

**例**

```sql
SELECT * FROM system.error_log LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
hostname:            clickhouse.testing.internal
event_date:          2025-11-11
event_time:          2025-11-11 11:35:28
code:                60
error:               UNKNOWN_TABLE
value:               1
remote:              0
last_error_time:     2025-11-11 11:35:28
last_error_message:  スコープ SELECT * FROM system.table_not_exist 内でテーブル式識別子 'system.table_not_exist' が見つかりません
last_error_query_id: 77ad9ece-3db7-4236-9b5a-f789bce4aa2e
last_error_trace:    [100506790044914,100506534488542,100506409937998,100506409936517,100506425182891,100506618154123,100506617994473,100506617990486,100506617988112,100506618341386,100506630272160,100506630266232,100506630276900,100506629795243,100506633519500,100506633495783,100506692143858,100506692248921,100506790779783,100506790781278,100506790390399,100506790380047,123814948752036,123814949330028]
```

**関連項目**

* [error&#95;log 設定](../../operations/server-configuration-parameters/settings.md#error_log) — この設定の有効化および無効化について。
* [system.errors](../../operations/system-tables/errors.md) — エラーコードとその発生回数を保持します。
* [Monitoring](../../operations/monitoring.md) — ClickHouse のモニタリングに関する基本的な概念。
