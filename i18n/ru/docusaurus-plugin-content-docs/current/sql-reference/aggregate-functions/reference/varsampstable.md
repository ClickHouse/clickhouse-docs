---
description: 'Вычисляет выборочную дисперсию набора данных. В отличие от `varSamp` эта функция использует численно устойчивый алгоритм. Работает медленнее, но даёт меньшую вычислительную погрешность.'
sidebar_position: 213
slug: /sql-reference/aggregate-functions/reference/varsampstable
title: 'varSampStable'
doc_type: 'reference'
---



## varSampStable {#varsampstable}

Вычисляет выборочную дисперсию набора данных. В отличие от [`varSamp`](../reference/varsamp.md), эта функция использует численно устойчивый алгоритм. Работает медленнее, но обеспечивает меньшую вычислительную погрешность.

**Синтаксис**

```sql
varSampStable(x)
```

Псевдоним: `VAR_SAMP_STABLE`

**Параметры**

- `x`: Набор данных, для которого требуется вычислить выборочную дисперсию. [(U)Int\*](../../data-types/int-uint.md), [Float\*](../../data-types/float.md), [Decimal\*](../../data-types/decimal.md).

**Возвращаемое значение**

- Возвращает выборочную дисперсию входного набора данных. [Float64](../../data-types/float.md).

**Детали реализации**

Функция `varSampStable` вычисляет выборочную дисперсию по той же формуле, что и [`varSamp`](../reference/varsamp.md):

$$
\sum\frac{(x - \text{mean}(x))^2}{(n - 1)}
$$

Где:

- `x` — каждое отдельное значение в наборе данных.
- `mean(x)` — среднее арифметическое набора данных.
- `n` — количество значений в наборе данных.

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

SELECT round(varSampStable(x),3) AS var_samp_stable FROM test_data;
```

Ответ:

```response
┌─var_samp_stable─┐
│           0.865 │
└─────────────────┘
```
