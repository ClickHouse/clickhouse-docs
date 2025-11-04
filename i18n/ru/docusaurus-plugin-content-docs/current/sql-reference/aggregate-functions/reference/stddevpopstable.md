---
slug: '/sql-reference/aggregate-functions/reference/stddevpopstable'
sidebar_position: 189
description: 'Результат равен квадратному корню из varPop. В отличии от stddevPop,'
title: stddevPopStable
doc_type: reference
---
# stddevPopStable

Результат равен квадратному корню из [varPop](../../../sql-reference/aggregate-functions/reference/varpop.md). В отличие от [`stddevPop`](../reference/stddevpop.md), эта функция использует численно стабильный алгоритм. Она работает медленнее, но обеспечивает более низкую вычислительную ошибку.

**Синтаксис**

```sql
stddevPopStable(x)
```

**Параметры**

- `x`: Популяция значений, для которой необходимо найти стандартное отклонение. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**Возвращаемое значение**

Квадратный корень из дисперсии `x`. [Float64](../../data-types/float.md).

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