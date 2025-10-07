---
slug: '/sql-reference/aggregate-functions/reference/aggthrow'
sidebar_position: 101
description: 'Эта функция может быть использована для тестирования безопастности'
title: aggThrow
doc_type: reference
---
# aggThrow

Эта функция может быть использована для проверки отказоустойчивости при возникновении исключений. Она создаст исключение с заданной вероятностью.

**Синтаксис**

```sql
aggThrow(throw_prob)
```

**Аргументы**

- `throw_prob` — Вероятность возникновения исключения при создании. [Float64](../../data-types/float.md).

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