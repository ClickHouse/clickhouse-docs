---
description: 'Эта функция может использоваться для тестирования корректности обработки исключений.
  При создании она будет выбрасывать исключение с указанной вероятностью.'
sidebar_position: 101
slug: /sql-reference/aggregate-functions/reference/aggthrow
title: 'aggThrow'
doc_type: 'reference'
---

# aggThrow

Эта функция может использоваться для проверки устойчивости к исключениям. Она генерирует исключение при инициализации с заданной вероятностью.

**Синтаксис**

```sql
aggThrow(throw_prob)
```

**Аргументы**

* `throw_prob` — Вероятность выброса исключения при создании. [Float64](../../data-types/float.md).

**Возвращаемое значение**

* Исключение: `Code: 503. DB::Exception: Aggregate function aggThrow has thrown exception successfully`.

**Пример**

Запрос:

```sql
SELECT number % 2 AS even, aggThrow(number) FROM numbers(10) GROUP BY even;
```

Результат:

```response
Получено исключение:
Код: 503. DB::Exception: Агрегатная функция aggThrow успешно выбросила исключение: При выполнении AggregatingTransform. (AGGREGATE_FUNCTION_THROW)
```
