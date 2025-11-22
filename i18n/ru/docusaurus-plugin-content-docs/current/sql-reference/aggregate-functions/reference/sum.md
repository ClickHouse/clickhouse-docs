---
description: 'Вычисляет сумму. Применимо только к числовым значениям.'
sidebar_position: 195
slug: /sql-reference/aggregate-functions/reference/sum
title: 'sum'
doc_type: 'reference'
---

# sum

Вычисляет сумму. Применимо только к числам.

**Синтаксис**

```sql
sum(num)
```

**Параметры**

* `num`: Столбец с числовыми значениями. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**Возвращаемое значение**

* Сумма значений. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**Пример**

Сначала создадим таблицу `employees` и вставим в неё некоторые фиктивные данные о сотрудниках.

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

Выполним запрос, чтобы вычислить общую сумму зарплат сотрудников с помощью функции `sum`.

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
