---
description: 'Системная таблица, содержащая информацию о использовании квоты всеми пользователями.'
slug: /operations/system-tables/quotas_usage
title: 'system.quotas_usage'
keywords: ['system table', 'quotas_usage', 'quota']
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

Использование квоты всеми пользователями.

Колонки:
- `quota_name` ([String](../../sql-reference/data-types/string.md)) — Название квоты.
- `quota_key` ([String](../../sql-reference/data-types/string.md)) — Значение ключа.
- `is_current` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Использование квоты для текущего пользователя.
- `start_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md)))) — Время начала расчета использования ресурсов.
- `end_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md)))) — Время конца расчета использования ресурсов.
- `duration` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt32](../../sql-reference/data-types/int-uint.md))) — Длительность временного интервала для расчета использования ресурсов, в секундах.
- `queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Общее количество запросов за этот интервал.
- `max_queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество запросов.
- `query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Общее количество запросов на выборку за этот интервал.
- `max_query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество запросов на выборку.
- `query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Общее количество вставок запросов за этот интервал.
- `max_query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество вставок запросов.
- `errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Количество запросов, которые выдали исключение.
- `max_errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество ошибок.
- `result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Общее количество строк, возвращенных в результате.
- `max_result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество исходных строк, прочитанных из таблиц.
- `result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Объем ОЗУ в байтах, использованный для хранения результата запросов.
- `max_result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальный объем ОЗУ, использованный для хранения результата запросов, в байтах.
- `read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md)))) — Общее количество исходных строк, прочитанных из таблиц для выполнения запроса на всех удаленных серверах.
- `max_read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество строк, прочитанных из всех таблиц и функций таблиц, участвующих в запросах.
- `read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Общее количество байтов, прочитанных из всех таблиц и функций таблиц, участвующих в запросах.
- `max_read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество байтов, прочитанных из всех таблиц и функций таблиц.
- `failed_sequential_authentications` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — Общее количество последовательных ошибок аутентификации. Если пользователь ввел правильный пароль до достижения порога `failed_sequential_authentications`, то счетчик будет сброшен.
- `max_failed_sequential_authentications` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — Максимальное количество последовательных ошибок аутентификации.
- `execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/float.md))) — Общее время выполнения запроса, в секундах (стена времени).
- `max_execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/float.md))) — Максимальное время выполнения запроса.

## See Also {#see-also}

- [SHOW QUOTA](/sql-reference/statements/show#show-quota))
