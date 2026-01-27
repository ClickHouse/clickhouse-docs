---
description: 'Системная таблица, содержащая записи журнала.'
keywords: ['system table', 'text_log']
slug: /operations/system-tables/text_log
title: 'system.text_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.text&#95;log \{#systemtext&#95;log\}

<SystemTableCloud />

Содержит записи логов. Уровень логирования, записи с которым попадают в эту таблицу, можно ограничить с помощью серверной настройки `text_log.level`.

Столбцы:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — имя хоста сервера, выполняющего запрос.
* `event_date` (Date) — дата записи.
* `event_time` (DateTime) — время записи.
* `event_time_microseconds` (DateTime64) — время записи с точностью до микросекунд.
* `microseconds` (UInt32) — микросекунды записи.
* `thread_name` (String) — имя потока, из которого производилось логирование.
* `thread_id` (UInt64) — ID потока ОС.
* `level` (`Enum8`) — уровень записи. Возможные значения:
  * `1` или `'Fatal'`.
  * `2` или `'Critical'`.
  * `3` или `'Error'`.
  * `4` или `'Warning'`.
  * `5` или `'Notice'`.
  * `6` или `'Information'`.
  * `7` или `'Debug'`.
  * `8` или `'Trace'`.
* `query_id` (String) — ID запроса.
* `logger_name` (LowCardinality(String)) — имя логгера (например, `DDLWorker`).
* `message` (String) — само сообщение.
* `revision` (UInt32) — ревизия ClickHouse.
* `source_file` (LowCardinality(String)) — исходный файл, из которого производилось логирование.
* `source_line` (UInt64) — строка исходного кода, из которой производилось логирование.
* `message_format_string` (LowCardinality(String)) — строка формата, использовавшаяся для форматирования сообщения.
* `value1` (String) — аргумент 1, использованный для форматирования сообщения.
* `value2` (String) — аргумент 2, использованный для форматирования сообщения.
* `value3` (String) — аргумент 3, использованный для форматирования сообщения.
* `value4` (String) — аргумент 4, использованный для форматирования сообщения.
* `value5` (String) — аргумент 5, использованный для форматирования сообщения.
* `value6` (String) — аргумент 6, использованный для форматирования сообщения.
* `value7` (String) — аргумент 7, использованный для форматирования сообщения.
* `value8` (String) — аргумент 8, использованный для форматирования сообщения.
* `value9` (String) — аргумент 9, использованный для форматирования сообщения.
* `value10` (String) — аргумент 10, использованный для форматирования сообщения.

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
