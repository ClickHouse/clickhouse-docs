---
'description': '系统表，包含来自表 `system.errors` 的错误值历史记录，定期刷新到磁盘。'
'keywords':
- 'system table'
- 'error_log'
'slug': '/operations/system-tables/system-error-log'
'title': 'system.error_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

包含来自表 `system.errors` 的错误值历史记录，定期刷新到磁盘。

列：
- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器主机名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 事件日期。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 事件时间。
- `code` ([Int32](../../sql-reference/data-types/int-uint.md)) — 错误的代码编号。
- `error` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) - 错误的名称。
- `value` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 此错误发生的次数。
- `remote` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 远程异常（即在分布式查询期间接收的异常）。

**示例**

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

**另请参阅**

- [error_log setting](../../operations/server-configuration-parameters/settings.md#error_log) — 启用和禁用此设置。
- [system.errors](../../operations/system-tables/errors.md) — 包含错误代码及其触发次数。
- [Monitoring](../../operations/monitoring.md) — ClickHouse 监控的基本概念。
