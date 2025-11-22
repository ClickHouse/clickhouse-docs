---
description: 'Результат равен квадратному корню из значения varPop. В отличие от stddevPop, эта функция использует численно устойчивый алгоритм.'
sidebar_position: 189
slug: /sql-reference/aggregate-functions/reference/stddevpopstable
title: 'stddevPopStable'
doc_type: 'reference'
---

# stddevPopStable

Результат равен квадратному корню из [varPop](../../../sql-reference/aggregate-functions/reference/varpop.md). В отличие от [`stddevPop`](../reference/stddevpop.md), эта функция использует численно устойчивый алгоритм. Она работает медленнее, но обеспечивает меньшую вычислительную погрешность.

**Синтаксис**

```sql
stddevPopStable(x)
```

**Параметры**

* `x`: Набор значений, для которого вычисляется стандартное отклонение. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**Возвращаемое значение**

Квадратный корень дисперсии `x`. [Float64](../../data-types/float.md).

**Пример**

Запрос:

```sql
DROP TABLE IF EXISTS test_data;
CREATE TABLE test_data
(
    population Float64,
)
ENGINE = Log;

INSERT INTO test_data SELECT randUniform(5.5, 10) FROM numbers(1000000)

SELECT
    stddevPopStable(population) AS stddev
FROM test_data;
```

Результат:

```response
┌─────────────stddev─┐
│ 1.2999977786592576 │
└────────────────────┘
```
