---
description: 'Результат равен квадратному корню значения, возвращаемого функцией varSamp. В отличие от varSamp эта функция использует численно устойчивый алгоритм.'
sidebar_position: 191
slug: /sql-reference/aggregate-functions/reference/stddevsampstable
title: 'stddevSampStable'
doc_type: 'reference'
---

# stddevSampStable

Результат равен квадратному корню из [varSamp](../../../sql-reference/aggregate-functions/reference/varsamp.md). В отличие от [`stddevSamp`](../reference/stddevsamp.md), эта функция использует численно устойчивый алгоритм. Она работает медленнее, но обеспечивает меньшую вычислительную погрешность.

**Синтаксис**

```sql
stddevSampStable(x)
```

**Параметры**

* `x`: Значения, для которых нужно найти квадратный корень выборочной дисперсии. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**Возвращаемое значение**

Квадратный корень выборочной дисперсии по `x`. [Float64](../../data-types/float.md).

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
