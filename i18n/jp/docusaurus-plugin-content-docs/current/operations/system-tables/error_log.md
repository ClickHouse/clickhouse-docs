---
'description': 'システムテーブルは`system.errors`テーブルからのエラー値の履歴を含んでおり、定期的にディスクにフラッシュされます。'
'keywords':
- 'system table'
- 'error_log'
'slug': '/operations/system-tables/system-error-log'
'title': 'system.error_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

`system.errors` テーブルからのエラー値の履歴を含み、定期的にディスクにフラッシュされます。

カラム:
- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベントの日付。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — イベントの時間。
- `code` ([Int32](../../sql-reference/data-types/int-uint.md)) — エラーのコード番号。
- `error` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) - エラーの名称。
- `value` ([UInt64](../../sql-reference/data-types/int-uint.md)) — このエラーが発生した回数。
- `remote` ([UInt8](../../sql-reference/data-types/int-uint.md)) — リモート例外 (つまり、分散クエリのうちの1つで受信されたもの)。

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

**参照してください**

- [error_log 設定](../../operations/server-configuration-parameters/settings.md#error_log) — 設定の有効化および無効化。
- [system.errors](../../operations/system-tables/errors.md) — 発生した回数と共にエラーコードを含む。
- [Monitoring](../../operations/monitoring.md) — ClickHouse モニタリングの基本概念。
