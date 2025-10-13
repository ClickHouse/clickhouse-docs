---
slug: '/sql-reference/aggregate-functions/reference/covarsampstable'
sidebar_position: 126
description: 'Подобно covarSamp, но работает медленнее, обеспечивая меньшую вычислительную'
title: covarSampStable
doc_type: reference
---
# covarSampStable

Вычисляет значение `Σ((x - x̅)(y - y̅)) / (n - 1)`. Похож на [covarSamp](../reference/covarsamp.md), но работает медленнее, обеспечивая меньшую вычислительную ошибку.

**Синтаксис**

```sql
covarSampStable(x, y)
```

**Аргументы**

- `x` — первая переменная. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal](../../data-types/decimal.md).
- `y` — вторая переменная. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal](../../data-types/decimal.md).

**Возвращаемое значение**

- Выборочная ковариация между `x` и `y`. Для `n <= 1` возвращается `inf`. [Float64](../../data-types/float.md).

**Пример**

Запрос:

```sql
DROP TABLE IF EXISTS series;
CREATE TABLE series(i UInt32, x_value Float64, y_value Float64) ENGINE = Memory;
INSERT INTO series(i, x_value, y_value) VALUES (1, 5.6,-4.4),(2, -9.6,3),(3, -1.3,-4),(4, 5.3,9.7),(5, 4.4,0.037),(6, -8.6,-7.8),(7, 5.1,9.3),(8, 7.9,-3.6),(9, -8.2,0.62),(10, -3,7.3);
```

```sql
SELECT covarSampStable(x_value, y_value)
FROM
(
    SELECT
        x_value,
        y_value
    FROM series
);
```

Результат:

```reference
┌─covarSampStable(x_value, y_value)─┐
│                 7.206275555555556 │
└───────────────────────────────────┘
```

Запрос:

```sql
SELECT covarSampStable(x_value, y_value)
FROM
(
    SELECT
        x_value,
        y_value
    FROM series LIMIT 1
);
```

Результат:

```reference
┌─covarSampStable(x_value, y_value)─┐
│                               inf │
└───────────────────────────────────┘
```