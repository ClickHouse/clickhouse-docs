---
description: 'Системная таблица, содержащая точки инструментирования'
keywords: ['системная таблица', 'инструментирование']
slug: /operations/system-tables/instrumentation
title: 'system.instrumentation'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.instrumentation \\{#systeminstrumentation\\}

<SystemTableCloud />

Содержит точки инструментации, использующие функциональность XRay в LLVM.

Столбцы:

* `id` ([UInt32](../../sql-reference/data-types/int-uint.md)) — идентификатор точки инструментации.
* `function_id` ([Int32](../../sql-reference/data-types/int-uint.md)) — идентификатор, назначенный функции в секции `xray_instr_map` ELF-бинарного файла.
* `function_name` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — имя, используемое для инструментации функции.
* `handler` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — тип обработчика.
* `entry_type` ([Enum(&#39;Entry&#39; = 0, &#39;Exit&#39; = 1, &#39;EntryAndExit&#39; = 2)](../../sql-reference/data-types/enum.md)) — тип точки входа: `Entry`, `Exit` или `EntryAndExit`.
* `symbol` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — полный и деманглированный символ.
* `parameters` ([Array(Dynamic)](../../sql-reference/data-types/array.md)) — параметры вызова обработчика.

**Пример**

```sql
SELECT * FROM system.instrumentation FORMAT Vertical;
```

```text
Row 1:
──────
id:            0
function_id:   231280
function_name: QueryMetricLog::startQuery
handler:       log
entry_type:    Entry
symbol:        DB::QueryMetricLog::startQuery(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, std::__1::chrono::time_point<std::__1::chrono::system_clock, std::__1::chrono::duration<long long, std::__1::ratio<1l, 1000000l>>>, unsigned long)
parameters:    ['test']

Row 2:
──────
id:            1
function_id:   231280
function_name: QueryMetricLog::startQuery
handler:       profile
entry_type:    EntryAndExit
symbol:        DB::QueryMetricLog::startQuery(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, std::__1::chrono::time_point<std::__1::chrono::system_clock, std::__1::chrono::duration<long long, std::__1::ratio<1l, 1000000l>>>, unsigned long)
parameters:    []

Row 3:
──────
id:            2
function_id:   231280
function_name: QueryMetricLog::startQuery
handler:       sleep
entry_type:    Exit
symbol:        DB::QueryMetricLog::startQuery(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, std::__1::chrono::time_point<std::__1::chrono::system_clock, std::__1::chrono::duration<long long, std::__1::ratio<1l, 1000000l>>>, unsigned long)
parameters:    [0.3]

3 rows in set. Elapsed: 0.302 sec.
```

**См. также**

* [SYSTEM INSTRUMENT](../../sql-reference/statements/system.md#instrument) — Добавление или удаление точек инструментирования.
* [system.trace&#95;log](../../operations/system-tables/trace_log.md) — Просмотр журнала профилирования.
* [system.symbols](../../operations/system-tables/symbols.md) — Просмотр символов для добавления точек инструментирования.
