---
slug: '/operations/system-tables/numbers'
description: 'Системная таблица, содержащая единственную колонку UInt64 с именем'
title: system.numbers
keywords: ['системная таблица', 'числа']
doc_type: reference
---
# system.numbers

Эта таблица содержит единственный столбец UInt64 с именем `number`, который содержит почти все натуральные числа, начиная с нуля. 

Вы можете использовать эту таблицу для тестов или если вам нужно провести полный перебор. 

Чтения из этой таблицы не распараллеливаются.

**Пример**

```sql
SELECT * FROM system.numbers LIMIT 10;
```

```response
┌─number─┐
│      0 │
│      1 │
│      2 │
│      3 │
│      4 │
│      5 │
│      6 │
│      7 │
│      8 │
│      9 │
└────────┘

10 rows in set. Elapsed: 0.001 sec.
```

Вы также можете ограничить вывод с помощью предикатов.

```sql
SELECT * FROM system.numbers < 10;
```

```response
┌─number─┐
│      0 │
│      1 │
│      2 │
│      3 │
│      4 │
│      5 │
│      6 │
│      7 │
│      8 │
│      9 │
└────────┘

10 rows in set. Elapsed: 0.001 sec.
```