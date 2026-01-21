---
description: '包含后台调度池任务执行历史的 system 表。'
keywords: ['system 表', 'background_schedule_pool_log']
slug: /operations/system-tables/background_schedule_pool_log
title: 'system.background_schedule_pool_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.background_schedule_pool_log \{#systembackground_schedule_pool_log\}

<SystemTableCloud />

仅当指定了 [background&#95;schedule&#95;pool&#95;log](/operations/server-configuration-parameters/settings#background_schedule_pool_log) 服务器设置时，才会创建 `system.background_schedule_pool_log` 表。

该表包含后台调度池中任务执行的历史记录。后台调度池用于执行周期性任务，例如分布式发送、缓冲区刷新以及消息代理操作。

`system.background_schedule_pool_log` 表包含以下列：

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器主机名。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 事件日期。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 事件时间。
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 具有微秒精度的事件时间。
* `query_id` ([String](../../sql-reference/data-types/string.md)) — 与后台任务关联的查询标识符（注意，它不是实际的查询，而是随机生成的 ID，用于在 `system.text_log` 中匹配日志）。
* `database` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 数据库名称。
* `table` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 表名。
* `table_uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — 后台任务所属表的 UUID。
* `log_name` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 后台任务名称。
* `duration_ms` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 任务执行时长（毫秒）。
* `error` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 发生异常的错误码。
* `exception` ([String](../../sql-reference/data-types/string.md)) — 所发生错误的文本信息。

`system.background_schedule_pool_log` 表会在第一次执行后台任务后创建。

**示例**

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

**另请参阅**

* [system.background&#95;schedule&#95;pool](background_schedule_pool.md) — 包含关于后台调度池中当前计划任务的信息。
