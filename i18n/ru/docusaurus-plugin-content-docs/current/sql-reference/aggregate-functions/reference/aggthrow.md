---
slug: /sql-reference/aggregate-functions/reference/aggthrow
sidebar_position: 101
title: 'aggThrow'
description: 'Эта функция может использоваться для проверки безопасности исключений. Она вызовет исключение при создании с указанной вероятностью.'
---


# aggThrow

Эта функция может использоваться для проверки безопасности исключений. Она вызовет исключение при создании с указанной вероятностью.

**Синтаксис**

```sql
aggThrow(throw_prob)
```

**Аргументы**

- `throw_prob` — Вероятность вызова исключения при создании. [Float64](../../data-types/float.md).

**Возвращаемое значение**

- Исключение: `Code: 503. DB::Exception: Aggregate function aggThrow has thrown exception successfully`.

**Пример**

Запрос:

```sql
SELECT number % 2 AS even, aggThrow(number) FROM numbers(10) GROUP BY even;
```

Результат:

```response
Received exception:
Code: 503. DB::Exception: Aggregate function aggThrow has thrown exception successfully: While executing AggregatingTransform. (AGGREGATE_FUNCTION_THROW)
```
