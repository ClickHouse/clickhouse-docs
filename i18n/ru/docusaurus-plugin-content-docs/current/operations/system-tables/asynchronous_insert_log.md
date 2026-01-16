---
description: 'Системная таблица, содержащая информацию об асинхронных вставках. Каждая запись представляет запрос INSERT, помещённый в буфер асинхронных вставок.'
keywords: ['системная таблица', 'asynchronous_insert_log']
slug: /operations/system-tables/asynchronous_insert_log
title: 'system.asynchronous_insert_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.asynchronous&#95;insert&#95;log \\{#systemasynchronous&#95;insert&#95;log\\}

<SystemTableCloud />

Содержит информацию об асинхронных вставках. Каждая запись соответствует запросу INSERT, поставленному в буфер для асинхронной вставки.

Чтобы начать вести журнал, настройте параметры в разделе [asynchronous&#95;insert&#95;log](../../operations/server-configuration-parameters/settings.md#asynchronous_insert_log).

Период сброса данных задаётся параметром `flush_interval_milliseconds` в разделе настроек сервера [asynchronous&#95;insert&#95;log](../../operations/server-configuration-parameters/settings.md#asynchronous_insert_log). Чтобы принудительно выполнить сброс, используйте запрос [SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs).

ClickHouse не удаляет данные из таблицы автоматически. Подробнее см. в разделе [Введение](/operations/system-tables/overview#system-tables-introduction).

Столбцы:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Имя хоста сервера, выполняющего запрос.
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — Дата, когда была выполнена асинхронная вставка.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Дата и время завершения выполнения асинхронной вставки.
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — Дата и время завершения выполнения асинхронной вставки с точностью до микросекунд.
* `query` ([String](../../sql-reference/data-types/string.md)) — Строка запроса.
* `database` ([String](../../sql-reference/data-types/string.md)) — Имя базы данных, в которой находится таблица.
* `table` ([String](../../sql-reference/data-types/string.md)) — Имя таблицы.
* `format` ([String](/sql-reference/data-types/string.md)) — Имя формата.
* `query_id` ([String](../../sql-reference/data-types/string.md)) — ID исходного запроса.
* `bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Количество вставленных байт.
* `exception` ([String](../../sql-reference/data-types/string.md)) — Сообщение об исключении.
* `status` ([Enum8](../../sql-reference/data-types/enum.md)) — Статус представления. Значения:
  * `'Ok' = 1` — Успешная вставка.
  * `'ParsingError' = 2` — Исключение при разборе данных.
  * `'FlushError' = 3` — Исключение при сбросе данных.
* `flush_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Дата и время, когда был выполнен сброс.
* `flush_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — Дата и время, когда был выполнен сброс, с точностью до микросекунд.
* `flush_query_id` ([String](../../sql-reference/data-types/string.md)) — ID запроса сброса.

**Пример**

Запрос:

```sql
SELECT * FROM system.asynchronous_insert_log LIMIT 1 \G;
```

Результат:

```text
hostname:                clickhouse.eu-central1.internal
event_date:              2023-06-08
event_time:              2023-06-08 10:08:53
event_time_microseconds: 2023-06-08 10:08:53.199516
query:                   INSERT INTO public.data_guess (user_id, datasource_id, timestamp, path, type, num, str) FORMAT CSV
database:                public
table:                   data_guess
format:                  CSV
query_id:                b46cd4c4-0269-4d0b-99f5-d27668c6102e
bytes:                   133223
exception:
status:                  Ok
flush_time:              2023-06-08 10:08:55
flush_time_microseconds: 2023-06-08 10:08:55.139676
flush_query_id:          cd2c1e43-83f5-49dc-92e4-2fbc7f8d3716
```

**См. также**

* [system.query&#95;log](../../operations/system-tables/query_log) — Описание системной таблицы `query_log`, которая содержит общую информацию о выполнении запросов.
* [system.asynchronous&#95;inserts](/operations/system-tables/asynchronous_inserts) — Эта таблица содержит информацию о находящихся в очереди асинхронных вставках.
