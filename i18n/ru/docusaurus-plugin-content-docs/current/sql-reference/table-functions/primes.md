---
slug: /sql-reference/table-functions/primes
sidebar_position: 145
sidebar_label: 'primes'
title: 'primes'
description: 'Возвращает таблицы с единственным столбцом `prime`, содержащим простые числа.'
doc_type: 'reference'
---

# Табличная функция primes \{#primes-table-function\}

`primes()` – возвращает бесконечную таблицу с единственным столбцом `prime` (UInt64), содержащим простые числа в порядке возрастания, начиная с 2. Используйте `LIMIT` (и при необходимости `OFFSET`), чтобы ограничить количество строк.
`primes(N)` – возвращает таблицу с единственным столбцом `prime` (UInt64), содержащим первые `N` простых чисел, начиная с 2.
`primes(N, M)` – возвращает таблицу с единственным столбцом `prime` (UInt64), содержащим `M` простых чисел, начиная с `N`-го простого числа (индексация с нуля).
`primes(N, M, S)` – возвращает таблицу с единственным столбцом `prime` (UInt64), содержащим `M` простых чисел, начиная с `N`-го простого числа (индексация с нуля) с шагом `S` (по индексу простого числа). Возвращаемые простые числа соответствуют индексам `N, N + S, N + 2S, ..., N + (M - 1)S`. `S` должен быть &gt;= 1.

Это аналогично системной таблице [`system.primes`](/operations/system-tables/primes).

Следующие запросы эквивалентны:

```sql
SELECT * FROM primes(10);
SELECT * FROM primes(0, 10);
SELECT * FROM primes() LIMIT 10;
SELECT * FROM system.primes LIMIT 10;
SELECT * FROM system.primes WHERE prime IN (2, 3, 5, 7, 11, 13, 17, 19, 23, 29);
```

Следующие запросы эквивалентны:

```sql
SELECT * FROM primes(10, 10);
SELECT * FROM primes() LIMIT 10 OFFSET 10;
SELECT * FROM system.primes LIMIT 10 OFFSET 10;
```

### Примеры \{#examples\}

Первые 10 простых чисел.

```sql
SELECT * FROM primes(10);
```

```response
  ┌─prime─┐
  │     2 │
  │     3 │
  │     5 │
  │     7 │
  │    11 │
  │    13 │
  │    17 │
  │    19 │
  │    23 │
  │    29 │
  └───────┘
```

Первое простое число, большее 1e15.

```sql
SELECT prime FROM primes() WHERE prime > toUInt64(1e15) LIMIT 1;
```

```response
  ┌────────────prime─┐
  │ 1000000000000037 │ -- 1.00 quadrillion
  └──────────────────┘
```

Первые семь простых чисел Мерсенна.

```sql
SELECT prime
FROM primes()
WHERE bitAnd(prime, prime + 1) = 0
LIMIT 7;
```

```response
  ┌──prime─┐
  │      3 │
  │      7 │
  │     31 │
  │    127 │
  │   8191 │
  │ 131071 │
  │ 524287 │
  └────────┘
```

### Примечание \{#note\}

* Самые быстрые формы — это простые варианты с диапазоном и точечным фильтром, которые используют шаг по умолчанию (`1`), например `primes(N)` или `primes() LIMIT N`. Эти формы используют оптимизированный генератор простых чисел для эффективного вычисления очень больших простых чисел. Например, следующий запрос выполняется почти мгновенно:

```sql
SELECT sum(prime)
FROM primes()
WHERE prime BETWEEN toUInt64(1e6) AND toUInt64(1e6) + 100
   OR prime BETWEEN toUInt64(1e12) AND toUInt64(1e12) + 100
   OR prime BETWEEN toUInt64(1e15) AND toUInt64(1e15) + 100
   OR prime IN (9999999967, 9999999971, 9999999973)
   OR prime == 1000000000000037;
```

```response
  ┌───────sum(prime)─┐
  │ 2004010006000641 │ -- 2.00 quadrillion
  └──────────────────┘
```

* Использование ненулевого смещения и/или шага больше 1 (`primes(offset, count)` / `primes(offset, count, step)`) может работать медленнее, поскольку функции может потребоваться сгенерировать дополнительные простые числа и затем отбросить их. Если вам не нужны смещение или шаг, просто не указывайте их.
