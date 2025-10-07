---
slug: '/sql-reference/table-functions/numbers'
sidebar_label: numbers
sidebar_position: 145
description: 'Возвращает таблицы с единственной колонкой `number`, которая содержит'
title: numbers
doc_type: reference
---
# Функция Таблицы numbers

`numbers(N)` – Возвращает таблицу с единственной колонкой 'number' (UInt64), которая содержит целые числа от 0 до N-1.  
`numbers(N, M)` - Возвращает таблицу с единственной колонкой 'number' (UInt64), которая содержит целые числа от N до (N + M - 1).  
`numbers(N, M, S)` - Возвращает таблицу с единственной колонкой 'number' (UInt64), которая содержит целые числа от N до (N + M - 1) с шагом S.

Подобно таблице `system.numbers`, её можно использовать для тестирования и генерации последовательных значений, при этом `numbers(N, M)` более эффективна, чем `system.numbers`.

Следующие запросы эквивалентны:

```sql
SELECT * FROM numbers(10);
SELECT * FROM numbers(0, 10);
SELECT * FROM system.numbers LIMIT 10;
SELECT * FROM system.numbers WHERE number BETWEEN 0 AND 9;
SELECT * FROM system.numbers WHERE number IN (0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
```

А следующие запросы также эквивалентны:

```sql
SELECT number * 2 FROM numbers(10);
SELECT (number - 10) * 2 FROM numbers(10, 10);
SELECT * FROM numbers(0, 20, 2);
```

Примеры:

```sql
-- Generate a sequence of dates from 2010-01-01 to 2010-12-31
SELECT toDate('2010-01-01') + number AS d FROM numbers(365);
```