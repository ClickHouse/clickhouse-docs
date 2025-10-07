---
slug: '/operations/system-tables/one'
description: 'Системная таблица, содержащая единую строку с одной колонкой `dummy`'
title: system.one
keywords: ['системная таблица', 'один']
doc_type: reference
---
# system.one

Эта таблица содержит одну строку с одной колонкой `dummy` типа UInt8, которая содержит значение 0.

Эта таблица используется, если запрос `SELECT` не указывает клаузу `FROM`.

Это аналог таблицы `DUAL`, которая встречается в других СУБД.

**Пример**

```sql
SELECT * FROM system.one LIMIT 10;
```

```response
┌─dummy─┐
│     0 │
└───────┘

1 rows in set. Elapsed: 0.001 sec.
```