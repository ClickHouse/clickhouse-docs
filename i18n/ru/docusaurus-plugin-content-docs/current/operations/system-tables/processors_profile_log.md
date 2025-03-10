---
description: 'Системная таблица, содержащая информацию профилирования на уровне процессоров (которую можно найти в `EXPLAIN PIPELINE`)'
slug: /operations/system-tables/processors_profile_log
title: 'system.processors_profile_log'
keywords: ['system table', 'processors_profile_log', 'EXPLAIN PIPELINE']
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

Эта таблица содержит профилирование на уровне процессоров (которое вы можете найти в [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md#explain-pipeline)).

Колонки:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Имя хоста сервера, выполняющего запрос.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — Дата, когда произошло событие.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Дата и время, когда произошло событие.
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — Дата и время с точностью до микросекунд, когда произошло событие.
- `id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ID процессора
- `parent_ids` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — ID родительских процессоров
- `plan_step` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ID шага плана запроса, который создал этот процессор. Значение равно нулю, если процессор не был добавлен ни с какого шага.
- `plan_group` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Группа процессора, если он был создан шагом плана запроса. Группа — это логическая партиция процессоров, добавленных с одного и того же шага плана запроса. Группа используется только для улучшения представления результата EXPLAIN PIPELINE.
- `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — ID первоначального запроса (для распределенного выполнения запросов).
- `query_id` ([String](../../sql-reference/data-types/string.md)) — ID запроса
- `name` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — Имя процессора.
- `elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество микросекунд, в течение которых был выполнен этот процессор.
- `input_wait_elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество микросекунд, в течение которых этот процессор ждал данные (от другого процессора).
- `output_wait_elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество микросекунд, в течение которых этот процессор ждал, потому что выходной порт был полон.
- `input_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество строк, обработанных процессором.
- `input_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество байт, обработанных процессором.
- `output_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество строк, сгенерированных процессором.
- `output_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество байт, сгенерированных процессором.

**Пример**

Запрос:

``` sql
EXPLAIN PIPELINE
SELECT sleep(1)
┌─explain─────────────────────────┐
│ (Expression)                    │
│ ExpressionTransform             │
│   (SettingQuotaAndLimits)       │
│     (ReadFromStorage)           │
│     SourceFromSingleChunk 0 → 1 │
└─────────────────────────────────┘

SELECT sleep(1)
SETTINGS log_processors_profiles = 1
Query id: feb5ed16-1c24-4227-aa54-78c02b3b27d4
┌─sleep(1)─┐
│        0 │
└──────────┘
1 rows in set. Elapsed: 1.018 sec.

SELECT
    name,
    elapsed_us,
    input_wait_elapsed_us,
    output_wait_elapsed_us
FROM system.processors_profile_log
WHERE query_id = 'feb5ed16-1c24-4227-aa54-78c02b3b27d4'
ORDER BY name ASC
```

Результат:

``` text
┌─name────────────────────┬─elapsed_us─┬─input_wait_elapsed_us─┬─output_wait_elapsed_us─┐
│ ExpressionTransform     │    1000497 │                  2823 │                    197 │
│ LazyOutputFormat        │         36 │               1002188 │                      0 │
│ LimitsCheckingTransform │         10 │               1002994 │                    106 │
│ NullSource              │          5 │               1002074 │                      0 │
│ NullSource              │          1 │               1002084 │                      0 │
│ SourceFromSingleChunk   │         45 │                  4736 │                1000819 │
└─────────────────────────┴────────────┴───────────────────────┴────────────────────────┘
```

Здесь вы можете видеть:

- `ExpressionTransform` выполнял функцию `sleep(1)`, поэтому его `работа` займет 1e6, и так `elapsed_us` > 1e6.
- `SourceFromSingleChunk` нуждается в ожидании, потому что `ExpressionTransform` не принимает никаких данных во время выполнения `sleep(1)`, поэтому он будет в состоянии `PortFull` в течение 1e6 мс, и так `output_wait_elapsed_us` > 1e6.
- `LimitsCheckingTransform`/`NullSource`/`LazyOutputFormat` нуждаются в ожидании, пока `ExpressionTransform` выполнит `sleep(1)`, чтобы обработать результат, так что `input_wait_elapsed_us` > 1e6.

**Смотрите также**

- [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md#explain-pipeline)
