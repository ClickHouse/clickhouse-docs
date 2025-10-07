---
slug: '/sql-reference/aggregate-functions/reference/avg'
sidebar_position: 112
description: 'Вычисляет среднее арифметическое.'
title: avg
doc_type: reference
---
# avg

Вычисляет среднее арифметическое.

**Синтаксис**

```sql
avg(x)
```

**Аргументы**

- `x` — входные значения, должны быть [Integer](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md) или [Decimal](../../../sql-reference/data-types/decimal.md).

**Возвращаемое значение**

- Среднее арифметическое, всегда как [Float64](../../../sql-reference/data-types/float.md).
- `NaN`, если входной параметр `x` пуст.

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

Получите среднее арифметическое:

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