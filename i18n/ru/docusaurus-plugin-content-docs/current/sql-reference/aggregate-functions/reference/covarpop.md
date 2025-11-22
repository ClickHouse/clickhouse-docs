---
description: 'Вычисляет ковариацию генеральной совокупности'
sidebar_position: 121
slug: /sql-reference/aggregate-functions/reference/covarpop
title: 'covarPop'
doc_type: 'reference'
---



# covarPop

Вычисляет ковариацию для генеральной совокупности:

$$
\frac{\Sigma{(x - \bar{x})(y - \bar{y})}}{n}
$$

:::note
Эта функция использует численно неустойчивый алгоритм. Если вам необходима [численная устойчивость](https://en.wikipedia.org/wiki/Numerical_stability) в вычислениях, используйте функцию [`covarPopStable`](../reference/covarpopstable.md). Она работает медленнее, но обеспечивает меньшую вычислительную погрешность.
:::

**Синтаксис**

```sql
covarPop(x, y)
```

**Аргументы**

- `x` — первая переменная. [(U)Int\*](../../data-types/int-uint.md), [Float\*](../../data-types/float.md), [Decimal](../../data-types/decimal.md).
- `y` — вторая переменная. [(U)Int\*](../../data-types/int-uint.md), [Float\*](../../data-types/float.md), [Decimal](../../data-types/decimal.md).

**Возвращаемое значение**

- Ковариация генеральной совокупности между `x` и `y`. [Float64](../../data-types/float.md).

**Пример**

Запрос:

```sql
DROP TABLE IF EXISTS series;
CREATE TABLE series(i UInt32, x_value Float64, y_value Float64) ENGINE = Memory;
INSERT INTO series(i, x_value, y_value) VALUES (1, 5.6, -4.4),(2, -9.6, 3),(3, -1.3, -4),(4, 5.3, 9.7),(5, 4.4, 0.037),(6, -8.6, -7.8),(7, 5.1, 9.3),(8, 7.9, -3.6),(9, -8.2, 0.62),(10, -3, 7.3);
```

```sql
SELECT covarPop(x_value, y_value)
FROM series;
```

Результат:

```reference
┌─covarPop(x_value, y_value)─┐
│                   6.485648 │
└────────────────────────────┘
```
