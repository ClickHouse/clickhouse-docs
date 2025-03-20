---
description: 'Системная таблица, содержащая трассировки стека, собранные профайлером запросов по выборке.'
slug: /operations/system-tables/trace_log
title: 'system.trace_log'
keywords: ['system table', 'trace_log']
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

Содержит трассировки стека, собранные [профайлером запросов по выборке](../../operations/optimizing-performance/sampling-query-profiler.md).

ClickHouse создает эту таблицу, когда раздел конфигурации сервера [trace_log](../../operations/server-configuration-parameters/settings.md#trace_log) установлен. Также смотрите настройки: [query_profiler_real_time_period_ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns), [query_profiler_cpu_time_period_ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns), [memory_profiler_step](../../operations/settings/settings.md#memory_profiler_step),
[memory_profiler_sample_probability](../../operations/settings/settings.md#memory_profiler_sample_probability), [trace_profile_events](../../operations/settings/settings.md#trace_profile_events).

Для анализа журналов используйте функции интроспекции `addressToLine`, `addressToLineWithInlines`, `addressToSymbol` и `demangle`.

Колонки:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Имя хоста сервера, выполняющего запрос.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — Дата момента выборки.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Временная метка момента выборки.
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — Временная метка момента выборки с точностью до микросекунд.
- `timestamp_ns` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Временная метка момента выборки в наносекундах.
- `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Ревизия сборки сервера ClickHouse.

    При подключении к серверу с помощью `clickhouse-client` вы видите строку, похожую на `Connected to ClickHouse server version 19.18.1.`. Это поле содержит `revision`, но не `version` сервера.

- `trace_type` ([Enum8](../../sql-reference/data-types/enum.md)) — Тип трассировки:
    - `Real` представляет сбор трассировок стека по реальному времени.
    - `CPU` представляет сбор трассировок стека по времени ЦП.
    - `Memory` представляет сбор выделений и освобождений памяти, когда выделение памяти превышает последующий порог.
    - `MemorySample` представляет сбор случайных выделений и освобождений памяти.
    - `MemoryPeak` представляет сбор обновлений максимального использования памяти.
    - `ProfileEvent` представляет сбор увеличений профилированных событий.
- `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Идентификатор потока.
- `query_id` ([String](../../sql-reference/data-types/string.md)) — Идентификатор запроса, который можно использовать для получения сведений о запросе, выполняющемся из системной таблицы [query_log](/operations/system-tables/query_log).
- `trace` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — Трассировка стека в момент выборки. Каждый элемент — это адрес виртуальной памяти внутри процесса сервера ClickHouse.
- `size` ([Int64](../../sql-reference/data-types/int-uint.md)) - Для типов трассировок `Memory`, `MemorySample` или `MemoryPeak` это количество выделенной памяти, для других типов трассировок - 0.
- `event` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) - Для типа трассировки `ProfileEvent` это имя обновленного профилируемого события, для других типов трассировок - пустая строка.
- `increment` ([UInt64](../../sql-reference/data-types/int-uint.md)) - Для типа трассировки `ProfileEvent` это количество увеличения профилируемого события, для других типов трассировок - 0.
- `symbols`, ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md)), Если символизация включена, содержит деманглированные имена символов, соответствующие `trace`.
- `lines`, ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md)), Если символизация включена, содержит строки с именами файлов с номерами строк, соответствующие `trace`.

Символизация может быть включена или отключена в `symbolize` в `trace_log` в конфигурационном файле сервера.

**Пример**

``` sql
SELECT * FROM system.trace_log LIMIT 1 \G
```

``` text
Row 1:
──────
hostname:                clickhouse.eu-central1.internal
event_date:              2020-09-10
event_time:              2020-09-10 11:23:09
event_time_microseconds: 2020-09-10 11:23:09.872924
timestamp_ns:            1599762189872924510
revision:                54440
trace_type:              Memory
thread_id:               564963
query_id:
trace:                   [371912858,371912789,371798468,371799717,371801313,371790250,624462773,566365041,566440261,566445834,566460071,566459914,566459842,566459580,566459469,566459389,566459341,566455774,371993941,371988245,372158848,372187428,372187309,372187093,372185478,140222123165193,140222122205443]
size:                    5244400
```
