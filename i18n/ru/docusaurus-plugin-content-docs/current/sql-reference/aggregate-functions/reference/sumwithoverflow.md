---
description: 'Вычисляет сумму чисел; для результата используется тот же тип данных, что и для входных параметров. Если сумма превышает максимальное значение для этого типа данных, результат вычисляется с переполнением.'
sidebar_position: 200
slug: /sql-reference/aggregate-functions/reference/sumwithoverflow
title: 'sumWithOverflow'
doc_type: 'reference'
---

# sumWithOverflow {#sumwithoverflow}

Вычисляет сумму чисел, используя для результата тот же тип данных, что и для входных параметров. Если сумма превышает максимально допустимое значение для этого типа данных, результат вычисляется с переполнением.

Поддерживает только числовые типы.

**Синтаксис**

```sql
sumWithOverflow(num)
```

**Параметры**

* `num`: Столбец числовых значений. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**Возвращаемое значение**

* Сумма значений. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**Пример**

Сначала создаём таблицу `employees` и вставляем в неё некоторые вымышленные данные о сотрудниках. В этом примере мы зададим столбец `salary` типа `UInt16` так, чтобы сумма этих значений могла привести к переполнению.

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

Мы выполняем запрос на сумму зарплат сотрудников, используя функции `sum` и `sumWithOverflow`, и отображаем их типы с помощью функции `toTypeName`.
Для функции `sum` результирующий тип — `UInt64`, достаточно велик, чтобы вместить сумму, тогда как для `sumWithOverflow` результирующий тип остаётся `UInt16`.

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
