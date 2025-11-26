---
description: 'Вычисляет среднее арифметическое.'
sidebar_position: 112
slug: /sql-reference/aggregate-functions/reference/avg
title: 'avg'
doc_type: 'reference'
---

# avg

Вычисляет среднее арифметическое.

**Синтаксис**

```sql
avg(x)
```

**Аргументы**

* `x` — входные значения, должны иметь тип [Integer](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md) или [Decimal](../../../sql-reference/data-types/decimal.md).

**Возвращаемое значение**

* Среднее арифметическое, всегда типа [Float64](../../../sql-reference/data-types/float.md).
* `NaN`, если входной параметр `x` пуст.

**Пример**

Запрос:

```sql
SELECT avg(x) FROM VALUES('x Int8', 0, 1, 2, 3, 4, 5);
```

Результат:

```text
┌─avg(x)─┐
│    2.5 │
└────────┘
```

**Пример**

Создайте временную таблицу:

Запрос:

```sql
CREATE TABLE test (t UInt8) ENGINE = Memory;
```

Найдите среднее арифметическое:

Запрос:

```sql
SELECT avg(t) FROM test;
```

Результат:

```text
┌─avg(x)─┐
│    nan │
└────────┘
```
