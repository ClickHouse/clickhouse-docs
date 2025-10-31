---
slug: '/sql-reference/aggregate-functions/reference/sumwithoverflow'
sidebar_position: 200
description: 'Вычисляет сумму чисел, используя тот же тип данных для результата,'
title: sumWithOverflow
doc_type: reference
---
# sumWithOverflow

Вычисляет сумму чисел, используя тот же тип данных для результата, что и для входных параметров. Если сумма превышает максимальное значение для этого типа данных, она рассчитывается с переполнением.

Работает только для чисел.

**Синтаксис**

```sql
sumWithOverflow(num)
```

**Параметры**
- `num`: Колонка числовых значений. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**Возвращаемое значение**

- Сумма значений. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**Пример**

Сначала мы создаем таблицу `employees` и вставляем в нее некоторые вымышленные данные сотрудников. Для этого примера мы выберем `salary` как `UInt16`, так что сумма этих значений может привести к переполнению.

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

Мы запрашиваем общую сумму зарплат сотрудников, используя функции `sum` и `sumWithOverflow`, и показываем их типы, используя функцию `toTypeName`.
Для функции `sum` результирующий тип — `UInt64`, достаточный для хранения суммы, в то время как для `sumWithOverflow` результирующий тип остается `UInt16`.  

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