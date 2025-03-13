---
title: 'varPop'
slug: /ru/sql-reference/aggregate-functions/reference/varPop
sidebar_position: 210
description: 'Вычисляет дисперсию для генеральной совокупности.'
---

## varPop {#varpop}

Вычисляет дисперсию для генеральной совокупности:

$$
\frac{\Sigma{(x - \bar{x})^2}}{n}
$$

**Синтаксис**

```sql
varPop(x)
```

Псевдоним: `VAR_POP`.

**Параметры**

- `x`: Совокупность значений, для которой необходимо найти дисперсию. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**Возвращаемое значение**

- Возвращает дисперсию для `x`. [`Float64`](../../data-types/float.md).

**Пример**

Запрос:

```sql
DROP TABLE IF EXISTS test_data;
CREATE TABLE test_data
(
    x UInt8,
)
ENGINE = Memory;

INSERT INTO test_data VALUES (3), (3), (3), (4), (4), (5), (5), (7), (11), (15);

SELECT
    varPop(x) AS var_pop
FROM test_data;
```

Результат:

```response
┌─var_pop─┐
│    14.4 │
└─────────┘
```
