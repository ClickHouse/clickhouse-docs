---
slug: '/sql-reference/aggregate-functions/reference/varSamp'
sidebar_position: 212
description: 'Вычислить выборочную дисперсию набора данных.'
title: varSamp
doc_type: reference
---
## varSamp {#varsamp}

Вычисляет выборочную дисперсию набора данных.

**Синтаксис**

```sql
varSamp(x)
```

Псевдоним: `VAR_SAMP`.

**Параметры**

- `x`: Совокупность, для которой вы хотите рассчитать выборочную дисперсию. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**Возвращаемое значение**

- Возвращает выборочную дисперсию входного набора данных `x`. [Float64](../../data-types/float.md).

**Детали реализации**

Функция `varSamp` вычисляет выборочную дисперсию по следующей формуле:

$$
\sum\frac{(x - \text{mean}(x))^2}{(n - 1)}
$$

Где:

- `x` — это каждое отдельное значение в наборе данных.
- `mean(x)` — это арифметическое среднее набора данных.
- `n` — это количество значений в наборе данных.

Функция предполагает, что входной набор данных представляет собой выборку из более крупной совокупности. Если вы хотите рассчитать дисперсию всей совокупности (когда у вас есть полный набор данных), вам следует использовать [`varPop`](../reference/varpop.md).

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