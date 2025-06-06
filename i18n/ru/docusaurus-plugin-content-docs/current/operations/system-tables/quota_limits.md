---
description: 'Системная таблица, содержащая информацию о максимумах для всех интервалов всех квот. Любое количество строк или ноль может соответствовать одной квоте.'
keywords: ['системная таблица', 'quota_limits']
slug: /operations/system-tables/quota_limits
title: 'system.quota_limits'
---


# system.quota_limits

Содержит информацию о максимумах для всех интервалов всех квот. Любое количество строк или ноль может соответствовать одной квоте.

Колонки:
- `quota_name` ([String](../../sql-reference/data-types/string.md)) — Название квоты.
- `duration` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Длина временного интервала для расчета потребления ресурсов в секундах.
- `is_randomized_interval` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Логическое значение. Показывает, является ли интервал случайным. Интервал всегда начинается в одно и то же время, если он не случайный. Например, интервал в 1 минуту всегда начинается с целого числа минут (т.е. он может начинаться в 11:20:00, но никогда не начинается в 11:20:01), интервал в один день всегда начинается в полночь по UTC. Если интервал случайный, самый первый интервал начинается в случайное время, а последующие интервалы начинаются один за другим. Значения:
- `0` — Интервал не случайный.
- `1` — Интервал случайный.
- `max_queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество запросов.
- `max_query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество запросов select.
- `max_query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество запросов insert.
- `max_errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество ошибок.
- `max_result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество строк результата.
- `max_result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество объема ОЗУ в байтах, используемого для хранения результата запроса.
- `max_read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество строк, прочитанных из всех таблиц и табличных функций, участвующих в запросах.
- `max_read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество байт, прочитанных из всех таблиц и табличных функций, участвующих в запросах.
- `max_execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — Максимальное время выполнения запроса в секундах.
