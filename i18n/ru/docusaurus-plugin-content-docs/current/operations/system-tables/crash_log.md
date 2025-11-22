---
description: 'Системная таблица, содержащая информацию о трассировках стека для фатальных ошибок.'
keywords: ['system table', 'crash_log']
slug: /operations/system-tables/crash_log
title: 'system.crash_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';

<SystemTableCloud />

Содержит информацию о стек-трейсах для фатальных ошибок. Таблица по умолчанию в базе данных отсутствует, она создаётся только при возникновении фатальных ошибок.

Столбцы:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — имя хоста сервера, выполняющего запрос.
* `event_date` ([DateTime](../../sql-reference/data-types/datetime.md)) — дата события.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — время события.
* `timestamp_ns` ([UInt64](../../sql-reference/data-types/int-uint.md)) — метка времени события с точностью до наносекунд.
* `signal` ([Int32](../../sql-reference/data-types/int-uint.md)) — номер сигнала.
* `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — идентификатор потока.
* `query_id` ([String](../../sql-reference/data-types/string.md)) — идентификатор запроса.
* `trace` ([Array](../../sql-reference/data-types/array.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — стек-трейс в момент сбоя. Каждый элемент — это адрес виртуальной памяти внутри серверного процесса ClickHouse.
* `trace_full` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — стек-трейс в момент сбоя. Каждый элемент содержит вызванный метод внутри серверного процесса ClickHouse.
* `version` ([String](../../sql-reference/data-types/string.md)) — версия сервера ClickHouse.
* `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ревизия сервера ClickHouse.
* `build_id` ([String](../../sql-reference/data-types/string.md)) — BuildID, генерируемый компилятором.

**Пример**

Запрос:

```sql
SELECT * FROM system.crash_log ORDER BY event_time DESC LIMIT 1;
```

Результат (неполный):

```text
Строка 1:
──────
hostname:     clickhouse.eu-central1.internal
event_date:   2020-10-14
event_time:   2020-10-14 15:47:40
timestamp_ns: 1602679660271312710
signal:       11
thread_id:    23624
query_id:     428aab7c-8f5c-44e9-9607-d16b44467e69
trace:        [188531193,...]
trace_full:   ['3. DB::(anonymous namespace)::FunctionFormatReadableTimeDelta::executeImpl(std::__1::vector<DB::ColumnWithTypeAndName, std::__1::allocator<DB::ColumnWithTypeAndName> >&, std::__1::vector<unsigned long, std::__1::allocator<unsigned long> > const&, unsigned long, unsigned long) const @ 0xb3cc1f9 in /home/username/work/ClickHouse/build/programs/clickhouse',...]
version:      ClickHouse 20.11.1.1
revision:     54442
build_id:
```

**См. также**

* системная таблица [trace&#95;log](../../operations/system-tables/trace_log.md)
