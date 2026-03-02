---
slug: /sql-reference/table-functions/numbers
sidebar_position: 145
sidebar_label: 'numbers'
title: 'numbers'
description: 'Возвращает таблицу с единственным столбцом `number`, содержащим последовательность целых чисел.'
doc_type: 'reference'
---

# Табличная функция numbers \{#numbers-table-function\}

* `numbers()` – Возвращает бесконечную таблицу с единственным столбцом `number` (UInt64), который содержит целые числа в порядке возрастания, начиная с 0. Используйте `LIMIT` (и при необходимости `OFFSET`), чтобы ограничить число строк.

* `numbers(N)` – Возвращает таблицу с единственным столбцом `number` (UInt64), который содержит целые числа от 0 до `N - 1`.

* `numbers(N, M)` – Возвращает таблицу с единственным столбцом `number` (UInt64), который содержит `M` целых чисел от `N` до `N + M - 1`.

* `numbers(N, M, S)` – Возвращает таблицу с единственным столбцом `number` (UInt64), который содержит значения в диапазоне `[N, N + M)` с шагом `S` (примерно `M / S` строк, с округлением в большую сторону). `S` должно быть `>= 1`.

Она аналогична системной таблице [`system.numbers`](/operations/system-tables/numbers) и может использоваться для тестирования и генерации последовательных значений.

Следующие запросы равнозначны:

```sql
SELECT * FROM numbers(10);
SELECT * FROM numbers(0, 10);
SELECT * FROM numbers() LIMIT 10;
SELECT * FROM system.numbers LIMIT 10;
SELECT * FROM system.numbers WHERE number BETWEEN 0 AND 9;
SELECT * FROM system.numbers WHERE number IN (0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
```

Следующие запросы также эквивалентны друг другу:

```sql
SELECT * FROM numbers(10, 10);
SELECT * FROM numbers() LIMIT 10 OFFSET 10;
SELECT * FROM system.numbers LIMIT 10 OFFSET 10;
```

Также эквивалентны следующие запросы:

```sql
SELECT number * 2 FROM numbers(10);
SELECT (number - 10) * 2 FROM numbers(10, 10);
SELECT * FROM numbers(0, 20, 2);
```


### Примеры \{#examples\}

Первые 10 чисел.

```sql
SELECT * FROM numbers(10);
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
```

Сгенерируйте последовательность дат с 2010-01-01 по 2010-12-31.

```sql
SELECT toDate('2010-01-01') + number AS d FROM numbers(365);
```

Найдите первый `UInt64` `>= 10^15`, для которого `sipHash64(number)` имеет 20 нулевых младших битов.

```sql
SELECT number
FROM numbers()
WHERE number >= toUInt64(1e15)
  AND bitAnd(sipHash64(number), 0xFFFFF) = 0
LIMIT 1;
```

```response
 ┌───────────number─┐
 │ 1000000000056095 │ -- 1.00 quadrillion
 └──────────────────┘
```


### Примечания \{#notes\}

- Для повышения производительности, если вы знаете, сколько строк вам требуется, отдавайте предпочтение ограниченным формам (`numbers(N)`, `numbers(N, M[, S])`) вместо неограниченных `numbers()` / `system.numbers`.
- Для параллельной генерации используйте `numbers_mt(...)` или таблицу [`system.numbers_mt`](/operations/system-tables/numbers_mt). Имейте в виду, что результаты могут возвращаться в произвольном порядке.