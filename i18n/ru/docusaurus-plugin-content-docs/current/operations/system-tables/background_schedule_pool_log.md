---
description: 'Системная таблица, содержащая историю выполнения задач в пуле фонового планировщика.'
keywords: ['system table', 'background_schedule_pool_log']
slug: /operations/system-tables/background_schedule_pool_log
title: 'system.background_schedule_pool_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.background&#95;schedule&#95;pool&#95;log {#systembackground&#95;schedule&#95;pool&#95;log}

<SystemTableCloud />

Таблица `system.background_schedule_pool_log` создаётся только если указана серверная настройка [background&#95;schedule&#95;pool&#95;log](/operations/server-configuration-parameters/settings#background_schedule_pool_log).

Эта таблица содержит историю выполнения задач пула фонового планировщика. Пулы фонового планировщика используются для выполнения периодических задач, таких как распределённые отправки, сброс буферов и операции с брокером сообщений.

Таблица `system.background_schedule_pool_log` содержит следующие столбцы:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — имя хоста сервера, выполняющего запрос.
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — дата события.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — время события.
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — время события с точностью до микросекунд.
* `query_id` ([String](../../sql-reference/data-types/string.md)) — идентификатор запроса, связанного с фоновой задачей (учтите, что это не реальный запрос, а случайно сгенерированный идентификатор для сопоставления записей в `system.text_log`).
* `database` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — имя базы данных.
* `table` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — имя таблицы.
* `table_uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — UUID таблицы, к которой относится фоновая задача.
* `log_name` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — имя фоновой задачи.
* `duration_ms` ([UInt64](../../sql-reference/data-types/int-uint.md)) — длительность выполнения задачи в миллисекундах.
* `error` ([UInt16](../../sql-reference/data-types/int-uint.md)) — код ошибки возникшего исключения.
* `exception` ([String](../../sql-reference/data-types/string.md)) — текстовое сообщение возникшей ошибки.

Таблица `system.background_schedule_pool_log` создаётся после первого выполнения фоновой задачи.

**Пример**

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

**См. также**

* [system.background&#95;schedule&#95;pool](background_schedule_pool.md) — содержит информацию о задачах, запланированных в пулах фонового планировщика.
