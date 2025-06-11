---
description: 'Системная таблица, содержащая информацию о профилировании на уровне процессоров
  (которая доступна в `EXPLAIN PIPELINE`)'
keywords: ['системная таблица', 'processors_profile_log', 'EXPLAIN PIPELINE']
slug: /operations/system-tables/processors_profile_log
title: 'system.processors_profile_log'
---

import SystemTableCloud from '@site/i18n/ru/current/_snippets/_system_table_cloud.md';


# system.processors_profile_log

<SystemTableCloud/>

Эта таблица содержит профилирование на уровне процессоров (которое можно найти в [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md#explain-pipeline)).

Колонки:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Имя хоста сервера, выполняющего запрос.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — Дата, когда событие произошло.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Дата и время, когда событие произошло.
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — Дата и время с точностью до микросекунд, когда событие произошло.
- `id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ID процессора.
- `parent_ids` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — ID родительских процессоров.
- `plan_step` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ID шага плана запроса, который создал этот процессор. Значение равно нулю, если процессор не был добавлен из какого-либо шага.
- `plan_group` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Группа процессора, если он был создан шагом плана запроса. Группа — это логическое разбиение процессоров, добавленных из одного и того же шага плана запроса. Группа используется только для улучшения внешнего вида результата EXPLAIN PIPELINE.
- `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — ID первоначального запроса (для распределенного выполнения запроса).
- `query_id` ([String](../../sql-reference/data-types/string.md)) — ID запроса.
- `name` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — Имя процессора.
- `elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество микросекунд, в течение которых выполнялся этот процессор.
- `input_wait_elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество микросекунд, в течение которых этот процессор ждал данные (от другого процессора).
- `output_wait_elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество микросекунд, в течение которых этот процессор ждал, потому что выходной порт был заполнен.
- `input_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество строк, потребленных процессором.
- `input_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество байт, потребленных процессором.
- `output_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество строк, сгенерированных процессором.
- `output_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество байт, сгенерированных процессором.

**Пример**

Запрос:

```sql
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

```text
┌─name────────────────────┬─elapsed_us─┬─input_wait_elapsed_us─┬─output_wait_elapsed_us─┐
│ ExpressionTransform     │    1000497 │                  2823 │                    197 │
│ LazyOutputFormat        │         36 │               1002188 │                      0 │
│ LimitsCheckingTransform │         10 │               1002994 │                    106 │
│ NullSource              │          5 │               1002074 │                      0 │
│ NullSource              │          1 │               1002084 │                      0 │
│ SourceFromSingleChunk   │         45 │                  4736 │                1000819 │
└─────────────────────────┴────────────┴───────────────────────┴────────────────────────┘
```

Здесь вы можете увидеть:

- `ExpressionTransform` выполнял функцию `sleep(1)`, поэтому его `работа` займет 1e6, и так `elapsed_us` > 1e6.
- `SourceFromSingleChunk` необходимо ждать, потому что `ExpressionTransform` не принимает данные во время выполнения `sleep(1)`, так что он будет в состоянии `PortFull` в течение 1e6 мкс, и так `output_wait_elapsed_us` > 1e6.
- `LimitsCheckingTransform`/`NullSource`/`LazyOutputFormat` необходимо ждать, пока `ExpressionTransform` выполнит `sleep(1)`, чтобы обработать результат, так что `input_wait_elapsed_us` > 1e6.

**См. также**

- [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md#explain-pipeline)
