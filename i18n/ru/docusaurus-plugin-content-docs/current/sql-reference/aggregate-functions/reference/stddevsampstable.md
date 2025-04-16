---
description: 'Результат равен квадратному корню из varSamp. В отличие от этой функции используется численно стабильный алгоритм.'
sidebar_position: 191
slug: /sql-reference/aggregate-functions/reference/stddevsampstable
title: 'stddevSampStable'
---


# stddevSampStable

Результат равен квадратному корню из [varSamp](../../../sql-reference/aggregate-functions/reference/varsamp.md). В отличие от [`stddevSamp`](../reference/stddevsamp.md), эта функция использует численно стабильный алгоритм. Она работает медленнее, но обеспечивает меньшую вычислительную ошибку.

**Синтаксис**

```sql
stddevSampStable(x)
```

**Параметры**

- `x`: Значения, для которых необходимо найти квадратный корень из выборочной дисперсии. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**Возвращаемое значение**

Квадратный корень из выборочной дисперсии `x`. [Float64](../../data-types/float.md).

**Пример**

Запрос:

```sql
DROP TABLE IF EXISTS test_data;
CREATE TABLE test_data
(
    population UInt8,
)
ENGINE = Log;

INSERT INTO test_data VALUES (3),(3),(3),(4),(4),(5),(5),(7),(11),(15);

SELECT
    stddevSampStable(population)
FROM test_data;
```

Результат:

```response
┌─stddevSampStable(population)─┐
│                            4 │
└──────────────────────────────┘
```
