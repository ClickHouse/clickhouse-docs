---
'description': 'System table containing the history of error values from table `system.errors`,
  periodically flushed to disk.'
'keywords':
- 'system table'
- 'error_log'
'slug': '/operations/system-tables/system-error-log'
'title': 'system.error_log'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

テーブル `system.errors` からのエラー値の履歴を含み、定期的にディスクにフラッシュされます。

カラム：
- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベント日。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — イベント時間。
- `code` ([Int32](../../sql-reference/data-types/int-uint.md)) — エラーのコード番号。
- `error` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) - エラーの名前。
- `value` ([UInt64](../../sql-reference/data-types/int-uint.md)) — このエラーが発生した回数。
- `remote` ([UInt8](../../sql-reference/data-types/int-uint.md)) — リモート例外（すなわち、分散クエリの1つの間に受信したもの）。

**例**

```sql
SELECT * FROM system.error_log LIMIT 1 FORMAT Vertical;
```

```text
行 1:
──────
hostname:   clickhouse.eu-central1.internal
event_date: 2024-06-18
event_time: 2024-06-18 07:32:39
code:       999
error:      KEEPER_EXCEPTION
value:      2
remote:     0
```

**関連情報**

- [error_log 設定](../../operations/server-configuration-parameters/settings.md#error_log) — 設定の有効化と無効化。
- [system.errors](../../operations/system-tables/errors.md) — エラーコードとそれらが発生した回数を含む。
- [Monitoring](../../operations/monitoring.md) — ClickHouse モニタリングの基本概念。
