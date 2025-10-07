---
slug: '/sql-reference/aggregate-functions/reference/covarpopstable'
sidebar_position: 123
description: 'Вычисляет значение общей ковариации населения'
title: covarPopStable
doc_type: reference
---
# covarPopStable

Вычисляет значение популяционной ковариации:

$$
\frac{\Sigma{(x - \bar{x})(y - \bar{y})}}{n}
$$

Это похоже на функцию [covarPop](../reference/covarpop.md), но использует численно стабильный алгоритм. В результате `covarPopStable` работает медленнее, чем `covarPop`, но дает более точный результат.

**Синтаксис**

```sql
covarPop(x, y)
```

**Аргументы**

- `x` — первая переменная. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal](../../data-types/decimal.md).
- `y` — вторая переменная. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal](../../data-types/decimal.md).

**Возвращаемое значение**

- Популяционная ковариация между `x` и `y`. [Float64](../../data-types/float.md).

**Пример**

Запрос:

```sql
DROP TABLE IF EXISTS series;
CREATE TABLE series(i UInt32, x_value Float64, y_value Float64) ENGINE = Memory;
INSERT INTO series(i, x_value, y_value) VALUES (1, 5.6,-4.4),(2, -9.6,3),(3, -1.3,-4),(4, 5.3,9.7),(5, 4.4,0.037),(6, -8.6,-7.8),(7, 5.1,9.3),(8, 7.9,-3.6),(9, -8.2,0.62),(10, -3,7.3);
```

```sql
SELECT covarPopStable(x_value, y_value)
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
┌─covarPopStable(x_value, y_value)─┐
│                         6.485648 │
└──────────────────────────────────┘
```