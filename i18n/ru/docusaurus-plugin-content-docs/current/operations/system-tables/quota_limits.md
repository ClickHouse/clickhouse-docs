---
description: 'Системная таблица, содержащая информацию о максимальных значениях для всех интервалов всех квот. Одной квоте может соответствовать любое количество строк, включая ноль.'
keywords: ['системная таблица', 'quota_limits']
slug: /operations/system-tables/quota_limits
title: 'system.quota_limits'
doc_type: 'reference'
---

# system.quota&#95;limits \\{#systemquota&#95;limits\\}

Содержит информацию о максимальных значениях для всех интервалов всех квот. Одной квоте может соответствовать любое количество строк или ни одной.

Столбцы:

* `quota_name` ([String](../../sql-reference/data-types/string.md)) — Имя квоты.
* `duration` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Длительность временного интервала для расчёта потребления ресурсов, в секундах.
* `is_randomized_interval` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Логическое значение. Показывает, является ли интервал рандомизированным. Если интервал не рандомизирован, он всегда начинается в одно и то же время. Например, интервал в 1 минуту всегда начинается в целое количество минут (т. е. он может начаться в 11:20:00, но никогда не начинается в 11:20:01), интервал в один день всегда начинается в полночь по UTC. Если интервал рандомизирован, первый интервал начинается в случайный момент времени, а последующие интервалы идут один за другим. Значения:
* `0` — Интервал не рандомизирован.
* `1` — Интервал рандомизирован.
* `max_queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество запросов.
* `max_query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество запросов `SELECT`.
* `max_query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество запросов `INSERT`.
* `max_errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество ошибок.
* `max_result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество строк в результате.
* `max_result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальный объём оперативной памяти в байтах, используемой для хранения результата запроса.
* `max_read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество строк, прочитанных из всех таблиц и табличных функций, участвующих в запросах.
* `max_read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальное количество байт, прочитанных из всех таблиц и табличных функций, участвующих в запросах.
* `max_execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — Максимальное время выполнения запроса, в секундах.