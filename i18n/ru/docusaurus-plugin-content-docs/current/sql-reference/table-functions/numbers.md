---
slug: /sql-reference/table-functions/numbers
sidebar_position: 145
sidebar_label: 'numbers'
title: 'numbers'
description: 'Возвращает таблицы с одним столбцом `number`, содержащим задаваемые целые числа.'
doc_type: 'reference'
---

# Табличная функция numbers

`numbers(N)` – возвращает таблицу с одним столбцом `number` (UInt64), который содержит целые числа от 0 до N-1.
`numbers(N, M)` – возвращает таблицу с одним столбцом `number` (UInt64), который содержит целые числа от N до (N + M - 1).
`numbers(N, M, S)` – возвращает таблицу с одним столбцом `number` (UInt64), который содержит целые числа от N до (N + M - 1) с шагом S.

Подобно таблице `system.numbers`, она может использоваться для тестирования и генерации последовательных значений. Функция `numbers(N, M)` более эффективна, чем `system.numbers`.

Следующие запросы эквивалентны:

```sql
SELECT * FROM numbers(10);
SELECT * FROM numbers(0, 10);
SELECT * FROM system.numbers LIMIT 10;
SELECT * FROM system.numbers WHERE number BETWEEN 0 AND 9;
SELECT * FROM system.numbers WHERE number IN (0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
```

Следующие запросы эквивалентны:

```sql
SELECT number * 2 FROM numbers(10);
SELECT (number - 10) * 2 FROM numbers(10, 10);
SELECT * FROM numbers(0, 20, 2);
```

Примеры:

```sql
-- Генерирует последовательность дат с 2010-01-01 по 2010-12-31
SELECT toDate('2010-01-01') + number AS d FROM numbers(365);
```
