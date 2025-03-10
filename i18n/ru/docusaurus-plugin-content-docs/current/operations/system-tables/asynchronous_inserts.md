---
description: 'Системная таблица, содержащая информацию о ожидающих асинхронных вставках в очереди.'
slug: /operations/system-tables/asynchronous_inserts
title: 'system.asynchronous_inserts'
keywords: ['system table', 'asynchronous_inserts']
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

Содержит информацию о ожидающих асинхронных вставках в очереди.

Колонки:

- `query` ([String](../../sql-reference/data-types/string.md)) — Строка запроса.
- `database` ([String](../../sql-reference/data-types/string.md)) — Имя базы данных, в которой находится таблица.
- `table` ([String](../../sql-reference/data-types/string.md)) — Имя таблицы.
- `format` ([String](/sql-reference/data-types/string.md)) — Имя формата.
- `first_update` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — Время первой вставки с разрешением до микросекунд.
- `total_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Общее количество байт, ожидающих в очереди.
- `entries.query_id` ([Array(String)](../../sql-reference/data-types/array.md)) - Массив идентификаторов запросов вставок, ожидающих в очереди.
- `entries.bytes` ([Array(UInt64)](../../sql-reference/data-types/array.md)) - Массив байт каждого запроса вставки, ожидающего в очереди.

**Пример**

Запрос:

``` sql
SELECT * FROM system.asynchronous_inserts LIMIT 1 \G;
```

Результат:

``` text
Row 1:
──────
query:            INSERT INTO public.data_guess (user_id, datasource_id, timestamp, path, type, num, str) FORMAT CSV
database:         public
table:            data_guess
format:           CSV
first_update:     2023-06-08 10:08:54.199606
total_bytes:      133223
entries.query_id: ['b46cd4c4-0269-4d0b-99f5-d27668c6102e']
entries.bytes:    [133223]
```

**Смотрите также**

- [system.query_log](/operations/system-tables/query_log) — Описание системной таблицы `query_log`, содержащей общую информацию о выполнении запросов.
- [system.asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) — Эта таблица содержит информацию о выполненных асинхронных вставках.
