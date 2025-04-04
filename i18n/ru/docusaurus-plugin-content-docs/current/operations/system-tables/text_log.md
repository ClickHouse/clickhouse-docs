---
description: 'Системная таблица, содержащая записи логов.'
keywords: ['системная таблица', 'text_log']
slug: /operations/system-tables/text_log
title: 'system.text_log'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.text_log

<SystemTableCloud/>

Содержит записи логов. Уровень логирования, который поступает в эту таблицу, можно ограничить настройкой сервера `text_log.level`.

Столбцы:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Имя хоста сервера, исполняющего запрос.
- `event_date` (Date) — Дата записи.
- `event_time` (DateTime) — Время записи.
- `event_time_microseconds` (DateTime64) — Время записи с точностью до микросекунд.
- `microseconds` (UInt32) — Микросекунды записи.
- `thread_name` (String) — Имя потока, из которого выполнялось логирование.
- `thread_id` (UInt64) — ID потока ОС.
- `level` (`Enum8`) — Уровень записи. Возможные значения:
    - `1` или `'Fatal'`.
    - `2` или `'Critical'`.
    - `3` или `'Error'`.
    - `4` или `'Warning'`.
    - `5` или `'Notice'`.
    - `6` или `'Information'`.
    - `7` или `'Debug'`.
    - `8` или `'Trace'`.
- `query_id` (String) — ID запроса.
- `logger_name` (LowCardinality(String)) — Имя логгера (например, `DDLWorker`).
- `message` (String) — Собственно сообщение.
- `revision` (UInt32) — Ревизия ClickHouse.
- `source_file` (LowCardinality(String)) — Исходный файл, из которого производилось логирование.
- `source_line` (UInt64) — Исходная строка, из которой производилось логирование.
- `message_format_string` (LowCardinality(String)) — Форматная строка, использованная для форматирования сообщения.
- `value1` (String) - Аргумент 1, использованный для форматирования сообщения.
- `value2` (String) - Аргумент 2, использованный для форматирования сообщения.
- `value3` (String) - Аргумент 3, использованный для форматирования сообщения.
- `value4` (String) - Аргумент 4, использованный для форматирования сообщения.
- `value5` (String) - Аргумент 5, использованный для форматирования сообщения.
- `value6` (String) - Аргумент 6, использованный для форматирования сообщения.
- `value7` (String) - Аргумент 7, использованный для форматирования сообщения.
- `value8` (String) - Аргумент 8, использованный для форматирования сообщения.
- `value9` (String) - Аргумент 9, использованный для форматирования сообщения.
- `value10` (String) - Аргумент 10, использованный для форматирования сообщения.

**Пример**

```sql
SELECT * FROM system.text_log LIMIT 1 \G
```

```text
Row 1:
──────
hostname:                clickhouse.eu-central1.internal
event_date:              2020-09-10
event_time:              2020-09-10 11:23:07
event_time_microseconds: 2020-09-10 11:23:07.871397
microseconds:            871397
thread_name:             clickhouse-serv
thread_id:               564917
level:                   Information
query_id:
logger_name:             DNSCacheUpdater
message:                 Update period 15 seconds
revision:                54440
source_file:             /ClickHouse/src/Interpreters/DNSCacheUpdater.cpp; void DB::DNSCacheUpdater::start()
source_line:             45
message_format_string:   Update period {} seconds
value1:                  15
value2:                  
value3:                  
value4:                  
value5:                  
value6:                  
value7:                  
value8:                  
value9:                  
value10:                  
```
