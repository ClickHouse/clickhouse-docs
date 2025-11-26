---
description: 'Системная таблица, содержащая трассировки стека, собранные профилировщиком запросов с выборочным профилированием.'
keywords: ['системная таблица', 'trace_log']
slug: /operations/system-tables/trace_log
title: 'system.trace_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.trace&#95;log

<SystemTableCloud />

Содержит трассировки стека, собранные [профилировщиком запросов с выборкой](../../operations/optimizing-performance/sampling-query-profiler.md).

ClickHouse создаёт эту таблицу, когда задан раздел конфигурации сервера [trace&#95;log](../../operations/server-configuration-parameters/settings.md#trace_log). Также см. настройки: [query&#95;profiler&#95;real&#95;time&#95;period&#95;ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns), [query&#95;profiler&#95;cpu&#95;time&#95;period&#95;ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns), [memory&#95;profiler&#95;step](../../operations/settings/settings.md#memory_profiler_step),
[memory&#95;profiler&#95;sample&#95;probability](../../operations/settings/settings.md#memory_profiler_sample_probability), [trace&#95;profile&#95;events](../../operations/settings/settings.md#trace_profile_events).

Для анализа логов используйте функции интроспекции `addressToLine`, `addressToLineWithInlines`, `addressToSymbol` и `demangle`.

Столбцы:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Имя хоста сервера, выполняющего запрос.

* `event_date` ([Date](../../sql-reference/data-types/date.md)) — Дата момента выборки.

* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Временная метка момента выборки.

* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — Временная метка момента выборки с точностью до микросекунд.

* `timestamp_ns` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Временная метка момента выборки в наносекундах.

* `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Ревизия сборки сервера ClickHouse.

  При подключении к серверу через `clickhouse-client` вы видите строку вида `Connected to ClickHouse server version 19.18.1.`. Это поле содержит `revision`, а не `version` сервера.

* `trace_type` ([Enum8](../../sql-reference/data-types/enum.md)) — Тип трассировки:
  * `Real` — сбор трассировок стека по реальному времени (времени настенных часов).
  * `CPU` — сбор трассировок стека по времени CPU.
  * `Memory` — сбор выделений и освобождений памяти при превышении очередного порогового значения по объёму выделенной памяти.
  * `MemorySample` — сбор случайных выделений и освобождений памяти.
  * `MemoryPeak` — сбор обновлений пикового потребления памяти.
  * `ProfileEvent` — сбор увеличений счётчиков событий профиля.
  * `JemallocSample` — сбор выборок jemalloc.
  * `MemoryAllocatedWithoutCheck` — сбор значительных выделений (&gt;16MiB), выполняемый с игнорированием любых лимитов по памяти (только для разработчиков ClickHouse).

* `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Идентификатор потока.

* `query_id` ([String](../../sql-reference/data-types/string.md)) — Идентификатор запроса, который можно использовать для получения подробной информации о выполнявшемся запросе из системной таблицы [query&#95;log](/operations/system-tables/query_log).

* `trace` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — Трассировка стека в момент выборки. Каждый элемент — виртуальный адрес памяти внутри процесса сервера ClickHouse.

* `size` ([Int64](../../sql-reference/data-types/int-uint.md)) — Для типов трассировок `Memory`, `MemorySample` или `MemoryPeak` — объём выделенной памяти, для остальных типов трассировок — 0.

* `event` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — Для типа трассировки `ProfileEvent` — имя обновлённого события профиля, для остальных типов трассировок — пустая строка.

* `increment` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Для типа трассировки `ProfileEvent` — величина увеличения счётчика события профиля, для остальных типов трассировок — 0.

* `symbols`, ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md)) — если символизация включена, содержит деманглированные имена символов, соответствующие `trace`.

* `lines`, ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md)) — если символизация включена, содержит строки с именами файлов и номерами строк, соответствующие `trace`.

Символизацию можно включить или отключить в параметре `symbolize` в разделе `trace_log` в конфигурационном файле сервера.

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
