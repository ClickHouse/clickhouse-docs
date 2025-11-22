---
description: 'Вычисляет сумму чисел, используя для результата тот же тип данных, что и для входных параметров. Если сумма превышает максимальное значение для этого типа данных, происходит переполнение.'
sidebar_position: 200
slug: /sql-reference/aggregate-functions/reference/sumwithoverflow
title: 'sumWithOverflow'
doc_type: 'reference'
---

# sumWithOverflow

Вычисляет сумму чисел, используя для результата тот же тип данных, что и для входных параметров. Если сумма превышает максимальное значение для этого типа данных, она вычисляется с переполнением.

Работает только с числами.

**Синтаксис**

```sql
sumWithOverflow(num)
```

**Параметры**

* `num`: Столбец числовых значений. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**Возвращаемое значение**

* Сумма значений. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**Пример**

Сначала создадим таблицу `employees` и вставим в неё некоторые фиктивные данные о сотрудниках. В этом примере мы выберем тип столбца `salary` — `UInt16`, чтобы сумма этих значений могла привести к переполнению.

Запрос:

```sql
CREATE TABLE employees
(
    `id` UInt32,
    `name` String,
    `monthly_salary` UInt16
)
ENGINE = Log
```

```sql
SELECT
    sum(monthly_salary) AS no_overflow,
    sumWithOverflow(monthly_salary) AS overflow,
    toTypeName(no_overflow),
    toTypeName(overflow)
FROM employees
```

Мы выполняем запрос для получения общей суммы зарплат сотрудников, используя функции `sum` и `sumWithOverflow`, и отображаем их типы с помощью функции `toTypeName`.
Для функции `sum` результирующим типом является `UInt64`, достаточно большой, чтобы вместить сумму, тогда как для `sumWithOverflow` результирующий тип по-прежнему сохраняется `UInt16`.

Запрос:

```sql
SELECT 
    sum(monthly_salary) AS no_overflow,
    sumWithOverflow(monthly_salary) AS overflow,
    toTypeName(no_overflow),
    toTypeName(overflow),    
FROM employees;
```

Результат:

```response
   ┌─no_overflow─┬─overflow─┬─toTypeName(no_overflow)─┬─toTypeName(overflow)─┐
1. │      118700 │    53164 │ UInt64                  │ UInt16               │
   └─────────────┴──────────┴─────────────────────────┴──────────────────────┘
```
