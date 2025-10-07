---
slug: '/sql-reference/aggregate-functions/reference/varPop'
sidebar_position: 210
description: 'Вычисляет дисперсию по всему объему.'
title: varPop
doc_type: reference
---
## varPop {#varpop}

Вычисляет дисперсию по генеральной совокупности:

$$
\frac{\Sigma{(x - \bar{x})^2}}{n}
$$

**Синтаксис**

```sql
varPop(x)
```

Псевдоним: `VAR_POP`.

**Параметры**

- `x`: Генеральная совокупность значений, для которых необходимо найти дисперсию. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**Возвращаемое значение**

- Возвращает дисперсию по генеральной совокупности `x`. [`Float64`](../../data-types/float.md).

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