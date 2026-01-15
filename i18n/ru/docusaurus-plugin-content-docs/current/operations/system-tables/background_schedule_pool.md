---
description: 'Системная таблица, содержащая информацию о задачах в пулах фонового планировщика.'
keywords: ['системная таблица', 'background_schedule_pool']
slug: /operations/system-tables/background_schedule_pool
title: 'system.background_schedule_pool'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.background_schedule_pool {#systembackground_schedule_pool}

<SystemTableCloud />

Содержит информацию о заданиях в пулах фонового планировщика. Пулы фонового планировщика используются для выполнения периодических задач, таких как отправка данных в distributed таблицы, сброс буферов и операции с брокером сообщений.

Столбцы:

* `pool` ([String](../../sql-reference/data-types/string.md)) — Имя пула. Возможные значения:
  * `schedule` — Пул общего назначения
  * `buffer_flush` — Пул для сброса данных таблиц Buffer
  * `distributed` — Пул для операций с distributed таблицами
  * `message_broker` — Пул для операций брокера сообщений
* `database` ([String](../../sql-reference/data-types/string.md)) — Имя базы данных.
* `table` ([String](../../sql-reference/data-types/string.md)) — Имя таблицы.
* `table_uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — UUID таблицы.
* `query_id` ([String](../../sql-reference/data-types/string.md)) — Идентификатор запроса (если выполняется сейчас) (обратите внимание: это не реальный запрос, а просто случайно сгенерированный идентификатор для сопоставления записей в `system.text_log`).
* `elapsed_ms` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Время выполнения задания (если выполняется сейчас).
* `log_name` ([String](../../sql-reference/data-types/string.md)) — Имя лога для задания.
* `deactivated` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Деактивировано ли задание (всегда имеет значение `false`, так как деактивированные задания удаляются из пула).
* `scheduled` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Запланировано ли задание к выполнению.
* `delayed` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Запланировано ли задание с задержкой.
* `executing` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Выполняется ли задание в данный момент.

**Пример**

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

**См. также**

* [system.background&#95;schedule&#95;pool&#95;log](background_schedule_pool_log.md) — содержит историю выполненных задач пула фонового планировщика.
