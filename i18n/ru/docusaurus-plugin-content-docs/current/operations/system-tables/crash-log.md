---
description: 'Системная таблица, содержащая информацию о стеке вызовов для фатальных ошибок.'
keywords: ['системная таблица', 'crash_log']
slug: /operations/system-tables/crash-log
title: 'system.crash_log'
---

import SystemTableCloud from '@site/i18n/ru/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

Содержит информацию о стеках вызовов для фатальных ошибок. Таблица по умолчанию не существует в базе данных, она создаётся только в случае возникновения фатальных ошибок.

Столбцы:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Имя хоста сервера, выполняющего запрос.
- `event_date` ([DateTime](../../sql-reference/data-types/datetime.md)) — Дата события.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время события.
- `timestamp_ns` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Момент времени события с наносекундами.
- `signal` ([Int32](../../sql-reference/data-types/int-uint.md)) — Номер сигнала.
- `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Идентификатор потока.
- `query_id` ([String](../../sql-reference/data-types/string.md)) — Идентификатор запроса.
- `trace` ([Array](../../sql-reference/data-types/array.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Стек вызовов на момент сбоя. Каждый элемент — это виртуальный адрес памяти внутри процесса сервера ClickHouse.
- `trace_full` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Стек вызовов на момент сбоя. Каждый элемент содержит вызываемый метод внутри процесса сервера ClickHouse.
- `version` ([String](../../sql-reference/data-types/string.md)) — Версия сервера ClickHouse.
- `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Ревизия сервера ClickHouse.
- `build_id` ([String](../../sql-reference/data-types/string.md)) — BuildID, который генерируется компилятором.

**Пример**

Запрос:

```sql
SELECT * FROM system.crash_log ORDER BY event_time DESC LIMIT 1;
```

Результат (не полный):

```text
Row 1:
──────
hostname:     clickhouse.eu-central1.internal
event_date:   2020-10-14
event_time:   2020-10-14 15:47:40
timestamp_ns: 1602679660271312710
signal:       11
thread_id:    23624
query_id:     428aab7c-8f5c-44e9-9607-d16b44467e69
trace:        [188531193,...]
trace_full:   ['3. DB::(анонимное пространство имен)::FunctionFormatReadableTimeDelta::executeImpl(std::__1::vector<DB::ColumnWithTypeAndName, std::__1::allocator<DB::ColumnWithTypeAndName> >&, std::__1::vector<unsigned long, std::__1::allocator<unsigned long> > const&, unsigned long, unsigned long) const @ 0xb3cc1f9 in /home/username/work/ClickHouse/build/programs/clickhouse',...]
version:      ClickHouse 20.11.1.1
revision:     54442
build_id:
```

**Смотрите также**
- [trace_log](../../operations/system-tables/trace_log.md) системная таблица
