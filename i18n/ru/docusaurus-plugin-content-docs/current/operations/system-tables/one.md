---
description: 'Системная таблица, содержащая одну строку с одним столбцом `dummy`
  типа UInt8, содержащим значение 0. Аналог таблицы `DUAL` в других СУБД.'
keywords: ['системная таблица', 'one']
slug: /operations/system-tables/one
title: 'system.one'
doc_type: 'reference'
---

# system.one {#systemone}

Эта таблица содержит одну строку с единственным столбцом `dummy` типа UInt8 со значением 0.

Эта таблица используется, если в запросе `SELECT` не указано предложение `FROM`.

Она аналогична таблице `DUAL`, используемой в других СУБД.

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
