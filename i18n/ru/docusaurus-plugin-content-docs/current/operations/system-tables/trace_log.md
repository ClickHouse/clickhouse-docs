---
slug: '/operations/system-tables/trace_log'
description: 'Системная таблица, содержащая трассировки стека, собранные с помощью'
title: system.trace_log
keywords: ['системная таблица', 'trace_log']
doc_type: reference
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.trace_log

<SystemTableCloud/>

Содержит стековые трейсы, собранные [профайлером запросов выборки](../../operations/optimizing-performance/sampling-query-profiler.md).

ClickHouse создает эту таблицу, когда раздел конфигурации сервера [trace_log](../../operations/server-configuration-parameters/settings.md#trace_log) установлен. Также смотрите параметры: [query_profiler_real_time_period_ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns), [query_profiler_cpu_time_period_ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns), [memory_profiler_step](../../operations/settings/settings.md#memory_profiler_step),
[memory_profiler_sample_probability](../../operations/settings/settings.md#memory_profiler_sample_probability), [trace_profile_events](../../operations/settings/settings.md#trace_profile_events).

Чтобы проанализировать логи, используйте функции интроспекции `addressToLine`, `addressToLineWithInlines`, `addressToSymbol` и `demangle`.

Колонки:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Имя хоста сервера, выполняющего запрос.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — Дата момента выборки.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Временная метка момента выборки.
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — Временная метка момента выборки с точностью до микросекунд.
- `timestamp_ns` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Временная метка момента выборки в наносекундах.
- `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Ревизия сборки сервера ClickHouse.

    При подключении к серверу через `clickhouse-client`, вы видите строку, подобную `Connected to ClickHouse server version 19.18.1.`. Это поле содержит `revision`, но не `version` сервера.

- `trace_type` ([Enum8](../../sql-reference/data-types/enum.md)) — Тип трассировки:
  - `Real` представляет собой сбор стековых трейсов по реальному времени.
  - `CPU` представляет собой сбор стековых трейсов по времени CPU.
  - `Memory` представляет собой сбор аллокаций и деаллокаций, когда аллокация памяти превышает последующую верхнюю границу.
  - `MemorySample` представляет собой сбор случайных аллокаций и деаллокаций.
  - `MemoryPeak` представляет собой сбор обновлений пикового использования памяти.
  - `ProfileEvent` представляет собой сбор инкрементов событий профилирования.
  - `JemallocSample` представляет собой сбор образцов jemalloc.
  - `MemoryAllocatedWithoutCheck` представляет собой сбор значительных аллокаций (>16MiB), выполненных с игнорированием любых ограничений на память (только для разработчиков ClickHouse).
- `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Идентификатор потока.
- `query_id` ([String](../../sql-reference/data-types/string.md)) — Идентификатор запроса, который можно использовать для получения информации о запросе, который выполнялся из системной таблицы [query_log](/operations/system-tables/query_log).
- `trace` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — Стековый трейса в момент выборки. Каждый элемент — это виртуальный адрес памяти внутри процесса сервера ClickHouse.
- `size` ([Int64](../../sql-reference/data-types/int-uint.md)) - Для типов трассировки `Memory`, `MemorySample` или `MemoryPeak` это количество выделенной памяти, для других типов трассировки — 0.
- `event` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) - Для типа трассировки `ProfileEvent` это имя обновленного события профилирования, для других типов трассировки — пустая строка.
- `increment` ([UInt64](../../sql-reference/data-types/int-uint.md)) - Для типа трассировки `ProfileEvent` это количество инкремента события профилирования, для других типов трассировки — 0.
- `symbols` ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md)), Если символизация включена, содержит деманглированные имена символов, соответствующие `trace`.
- `lines` ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md)), Если символизация включена, содержит строки с именами файлов с номерами строк, соответствующие `trace`.

Символизация может быть включена или выключена в параметре `symbolize` в разделе `trace_log` в файле конфигурации сервера.

**Пример**

```sql
SELECT * FROM system.trace_log LIMIT 1 \G
```

```text
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