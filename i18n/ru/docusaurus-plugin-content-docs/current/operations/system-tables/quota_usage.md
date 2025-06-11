---
description: 'Системная таблица, содержащая информацию о использовании квот текущим пользователем, например, сколько квоты использовано и сколько осталось.'
keywords: ['системная таблица', 'использование квот']
slug: /operations/system-tables/quota_usage
title: 'system.quota_usage'
---

import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

Использование квоты текущим пользователем: сколько использовано и сколько осталось.

Колонки:
- `quota_name` ([String](../../sql-reference/data-types/string.md)) — Имя квоты.
- `quota_key` ([String](../../sql-reference/data-types/string.md)) — Значение ключа. Например, если keys = \[`ip address`\], то `quota_key` может иметь значение '192.168.1.1'.
- `start_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — Время начала для расчета потребления ресурсов.
- `end_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — Время окончания для расчета потребления ресурсов.
- `duration` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Длительность временного интервала для расчета потребления ресурсов в секундах.
- `queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Общее количество запросов за этот интервал.
- `query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Общее количество запросов select за этот интервал.
- `query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Общее количество запросов insert за этот интервал.
- `max_queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество запросов.
- `errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Количество запросов, которые вызвали исключение.
- `max_errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество ошибок.
- `result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Общее количество строк, возвращенных в результате.
- `max_result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество строк результата.
- `result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Объем ОЗУ в байтах, использованный для хранения результата запросов.
- `max_result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальный объем ОЗУ, использованный для хранения результата запросов в байтах.
- `read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Общее количество исходных строк, прочитанных из таблиц для выполнения запроса на всех удаленных серверах.
- `max_read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество строк, прочитанных из всех таблиц и табличных функций, участвовавших в запросах.
- `read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Общее количество байтов, прочитанных из всех таблиц и табличных функций, участвовавших в запросах.
- `max_read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество байтов, прочитанных из всех таблиц и табличных функций.
- `failed_sequential_authentications` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/float.md))) — Общее количество последовательных ошибок аутентификации. Если пользователь ввел правильный пароль до превышения порога `failed_sequential_authentications`, то счетчик будет сброшен.
- `max_failed_sequential_authentications` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/float.md))) — Максимальное количество последовательных ошибок аутентификации.
- `execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — Общее время выполнения запроса в секундах (Wall time).
- `max_execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — Максимальное время выполнения запроса.

## See Also {#see-also}

- [SHOW QUOTA](/sql-reference/statements/show#show-quota))
