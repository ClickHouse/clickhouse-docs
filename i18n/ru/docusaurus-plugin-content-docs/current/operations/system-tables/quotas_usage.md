---
description: 'Системная таблица, содержащая сведения о использовании квот всеми пользователями.'
keywords: ['системная таблица', 'использование_квот', 'квота']
slug: /operations/system-tables/quotas_usage
title: 'system.quotas_usage'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.quotas_usage

<SystemTableCloud/>

Использование квот всеми пользователями.

Столбцы:
- `quota_name` ([String](../../sql-reference/data-types/string.md)) — Название квоты.
- `quota_key` ([String](../../sql-reference/data-types/string.md)) — Значение ключа.
- `is_current` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Использование квоты для текущего пользователя.
- `start_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md)))) — Время начала для расчета потребления ресурсов.
- `end_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md)))) — Время окончания для расчета потребления ресурсов.
- `duration` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt32](../../sql-reference/data-types/int-uint.md))) — Длительность временного интервала для расчета потребления ресурсов, в секундах.
- `queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Общее количество запросов за этот интервал.
- `max_queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество запросов.
- `query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Общее количество запросов select за этот интервал.
- `max_query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество запросов select.
- `query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Общее количество запросов insert за этот интервал.
- `max_query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество запросов insert.
- `errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Число запросов, вызвавших исключение.
- `max_errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество ошибок.
- `result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Общее количество строк, возвращенных в результате.
- `max_result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество строк, считанных из таблиц.
- `result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Объем ОЗУ в байтах, использованный для хранения результатов запросов.
- `max_result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальный объем ОЗУ, использованный для хранения результатов запросов, в байтах.
- `read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md)))) — Общее количество исходных строк, считанных из таблиц для выполнения запроса на всех удаленных серверах.
- `max_read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество строк, считанных из всех таблиц и таблиц-функций, участвовавших в запросах.
- `read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Общее количество байт, считанных из всех таблиц и таблиц-функций, участвовавших в запросах.
- `max_read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимально прочитанное количество байт из всех таблиц и таблиц-функций.
- `failed_sequential_authentications` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — Общее количество последовательных неудачных аутентификаций. Если пользователь ввел правильный пароль, прежде чем превысить порог `failed_sequential_authentications`, то счетчик будет сброшен.
- `max_failed_sequential_authentications` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — Максимальное количество последовательных неудачных аутентификаций.
- `execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/float.md))) — Общее время выполнения запроса, в секундах (реальное время).
- `max_execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/float.md))) — Максимальное время выполнения запроса.

## See Also {#see-also}

- [SHOW QUOTA](/sql-reference/statements/show#show-quota))
