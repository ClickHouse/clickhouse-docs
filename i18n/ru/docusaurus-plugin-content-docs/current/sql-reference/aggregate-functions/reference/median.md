---
description: 'Функции `median*` являются псевдонимами соответствующих функций `quantile*`.
  Они вычисляют медиану по числовой выборке данных.'
slug: /sql-reference/aggregate-functions/reference/median
title: 'median'
doc_type: 'reference'
---

Функции `median*` являются псевдонимами соответствующих функций `quantile*`. Они вычисляют медиану по числовой выборке данных.

Функции:

* `median` — псевдоним для [quantile](/sql-reference/aggregate-functions/reference/quantile).
* `medianDeterministic` — псевдоним для [quantileDeterministic](/sql-reference/aggregate-functions/reference/quantileDeterministic.md).
* `medianExact` — псевдоним для [quantileExact](/sql-reference/aggregate-functions/reference/quantileExact.md).
* `medianExactWeighted` — псевдоним для [quantileExactWeighted](/sql-reference/aggregate-functions/reference/quantileExactWeighted.md).
* `medianTiming` — псевдоним для [quantileTiming](/sql-reference/aggregate-functions/reference/quantileTiming.md).
* `medianTimingWeighted` — псевдоним для [quantileTimingWeighted](/sql-reference/aggregate-functions/reference/quantileTimingWeighted.md).
* `medianTDigest` — псевдоним для [quantileTDigest](/sql-reference/aggregate-functions/reference/quantileTDigest.md).
* `medianTDigestWeighted` — псевдоним для [quantileTDigestWeighted](/sql-reference/aggregate-functions/reference/quantileTDigestWeighted.md).
* `medianBFloat16` — псевдоним для [quantileBFloat16](/sql-reference/aggregate-functions/reference/quantileBFloat16.md).
* `medianDD` — псевдоним для [quantileDD](/sql-reference/aggregate-functions/reference/quantileDD.md).

**Пример**

Входная таблица:

```text
┌─val─┐
│   1 │
│   1 │
│   2 │
│   3 │
└─────┘
```

```sql title="Query"
SELECT medianDeterministic(val, 1) FROM t;
```

```text title="Response"
┌─medianDeterministic(val, 1)─┐
│                         1.5 │
└─────────────────────────────┘
```