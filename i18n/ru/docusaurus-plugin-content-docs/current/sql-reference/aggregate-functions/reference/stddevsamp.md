---
description: 'Результат равен квадратному корню из varSamp'
sidebar_position: 190
slug: /sql-reference/aggregate-functions/reference/stddevsamp
title: 'stddevSamp'
---


# stddevSamp

Результат равен квадратному корню из [varSamp](../../../sql-reference/aggregate-functions/reference/varsamp.md).

Псевдоним: `STDDEV_SAMP`.

:::note
Эта функция использует численно нестабильный алгоритм. Если вам нужна [численная стабильность](https://en.wikipedia.org/wiki/Numerical_stability) в расчетах, используйте функцию [`stddevSampStable`](../reference/stddevsampstable.md). Она работает медленнее, но предоставляет меньшую вычислительную ошибку.
:::

**Синтаксис**

```sql
stddevSamp(x)
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
    stddevSamp(population)
FROM test_data;
```

Результат:

```response
┌─stddevSamp(population)─┐
│                      4 │
└────────────────────────┘
```
