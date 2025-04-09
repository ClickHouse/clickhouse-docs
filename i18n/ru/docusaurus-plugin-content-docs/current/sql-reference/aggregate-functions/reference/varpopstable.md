---
description: 'Возвращает выборочную дисперсию. В отличии от varPop, эта функция использует численно устойчивый алгоритм. Он работает медленнее, но обеспечивает меньшую вычислительную погрешность.'
sidebar_position: 211
slug: /sql-reference/aggregate-functions/reference/varpopstable
title: 'varPopStable'
---

## varPopStable {#varpopstable}

Возвращает выборочную дисперсию. В отличие от [`varPop`](../reference/varpop.md), эта функция использует [численно устойчивый](https://en.wikipedia.org/wiki/Numerical_stability) алгоритм. Он работает медленнее, но обеспечивает меньшую вычислительную погрешность.

**Синтаксис**

```sql
varPopStable(x)
```

Псевдоним: `VAR_POP_STABLE`.

**Параметры**

- `x`: Массив значений, для которого требуется найти выборочную дисперсию. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**Возвращаемое значение**

- Возвращает выборочную дисперсию `x`. [Float64](../../data-types/float.md).

**Пример**

Запрос:

```sql
DROP TABLE IF EXISTS test_data;
CREATE TABLE test_data
(
    x UInt8,
)
ENGINE = Memory;

INSERT INTO test_data VALUES (3),(3),(3),(4),(4),(5),(5),(7),(11),(15);

SELECT
    varPopStable(x) AS var_pop_stable
FROM test_data;
```

Результат:

```response
┌─var_pop_stable─┐
│           14.4 │
└────────────────┘
```
