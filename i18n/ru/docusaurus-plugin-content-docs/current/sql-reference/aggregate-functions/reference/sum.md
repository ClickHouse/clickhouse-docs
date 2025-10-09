---
slug: '/sql-reference/aggregate-functions/reference/sum'
sidebar_position: 195
description: 'Вычисляет сумму. Работает только для чисел.'
title: sum
doc_type: reference
---
# sum

Вычисляет сумму. Работает только для чисел.

**Синтаксис**

```sql
sum(num)
```

**Параметры**
- `num`: Колонка числовых значений. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**Возвращаемое значение**

- Сумма значений. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**Пример**

Сначала мы создаем таблицу `employees` и вставляем в нее некоторые вымышленные данные сотрудников.

Запрос:

```sql
CREATE TABLE employees
(
    `id` UInt32,
    `name` String,
    `salary` UInt32
)
ENGINE = Log
```

```sql
INSERT INTO employees VALUES
    (87432, 'John Smith', 45680),
    (59018, 'Jane Smith', 72350),
    (20376, 'Ivan Ivanovich', 58900),
    (71245, 'Anastasia Ivanovna', 89210);
```

Мы запрашиваем общую сумму зарплат сотрудников, используя функцию `sum`.

Запрос:

```sql
SELECT sum(salary) FROM employees;
```

Результат:

```response
   ┌─sum(salary)─┐
1. │      266140 │
   └─────────────┘
```