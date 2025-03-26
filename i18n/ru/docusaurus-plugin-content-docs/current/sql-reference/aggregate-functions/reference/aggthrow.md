---
description: 'Эту функцию можно использовать для тестирования безопасности при исключениях.
  Она выбросит исключение при создании с заданной вероятностью.'
sidebar_position: 101
slug: /sql-reference/aggregate-functions/reference/aggthrow
title: 'aggThrow'
---


# aggThrow

Эту функцию можно использовать для тестирования безопасности при исключениях. Она выбросит исключение при создании с заданной вероятностью.

**Синтаксис**

```sql
aggThrow(throw_prob)
```

**Аргументы**

- `throw_prob` — Вероятность выброса исключения при создании. [Float64](../../data-types/float.md).

**Возвращаемое значение**

- Исключение: `Code: 503. DB::Exception: Aggregate function aggThrow has thrown exception successfully`.

**Пример**

Запрос:

```sql
SELECT number % 2 AS even, aggThrow(number) FROM numbers(10) GROUP BY even;
```

Результат:

```response
Получено исключение:
Code: 503. DB::Exception: Aggregate function aggThrow has thrown exception successfully: While executing AggregatingTransform. (AGGREGATE_FUNCTION_THROW)
```
