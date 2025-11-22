---
description: '`system.errors` テーブルのエラー値の履歴を保持するシステムテーブルで、内容は定期的にディスクにフラッシュされます。'
keywords: ['システムテーブル', 'error_log']
slug: /operations/system-tables/system-error-log
title: 'system.error_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';

<SystemTableCloud />

テーブル `system.errors` に含まれるエラー値の履歴を保持しており、定期的にディスクにフラッシュされます。

列:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベントの日付。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — イベントの時刻。
* `code` ([Int32](../../sql-reference/data-types/int-uint.md)) — エラーコード番号。
* `error` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — エラー名。
* `value` ([UInt64](../../sql-reference/data-types/int-uint.md)) — このエラーが発生した回数。
* `remote` ([UInt8](../../sql-reference/data-types/int-uint.md)) — リモート例外（分散クエリのいずれかの実行中に受信したもの）。

**例**

```sql
SELECT * FROM system.error_log LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
hostname:   clickhouse.eu-central1.internal
event_date: 2024-06-18
event_time: 2024-06-18 07:32:39
code:       999
error:      KEEPER_EXCEPTION
value:      2
remote:     0
```

**関連項目**

* [error&#95;log 設定](../../operations/server-configuration-parameters/settings.md#error_log) — 設定の有効化および無効化について。
* [system.errors](../../operations/system-tables/errors.md) — 発生回数とともにエラーコードを保持します。
* [Monitoring](../../operations/monitoring.md) — ClickHouse の監視に関する基本概念。
