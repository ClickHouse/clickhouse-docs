---
title: 'varSamp'
slug: /sql-reference/aggregate-functions/reference/varSamp
sidebar_position: 212
description: 'Вычисляет выборочную дисперсию набора данных.'
---

## varSamp {#varsamp}

Вычисляет выборочную дисперсию набора данных.

**Синтаксис**

```sql
varSamp(x)
```

Псевдоним: `VAR_SAMP`.

**Параметры**

- `x`: Популяция, для которой вы хотите вычислить выборочную дисперсию. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**Возвращаемое значение**

- Возвращает выборочную дисперсию входного набора данных `x`. [Float64](../../data-types/float.md).

**Детали реализации**

Функция `varSamp` вычисляет выборочную дисперсию с использованием следующей формулы:

$$
\sum\frac{(x - \text{mean}(x))^2}{(n - 1)}
$$

Где:

- `x` — это каждое отдельное значение в наборе данных.
- `mean(x)` — это среднее арифметическое набора данных.
- `n` — это количество значений в наборе данных.

Функция предполагает, что входной набор данных представляет собой выборку из более крупной популяции. Если вы хотите вычислить дисперсию всей популяции (когда у вас есть полный набор данных), вам следует использовать [`varPop`](../reference/varpop.md).

**Пример**

Запрос:

```sql
DROP TABLE IF EXISTS test_data;
CREATE TABLE test_data
(
    x Float64
)
ENGINE = Memory;

INSERT INTO test_data VALUES (10.5), (12.3), (9.8), (11.2), (10.7);

SELECT round(varSamp(x),3) AS var_samp FROM test_data;
```

Ответ:

```response
┌─var_samp─┐
│    0.865 │
└──────────┘
```
