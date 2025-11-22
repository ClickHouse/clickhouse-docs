---
description: 'Функции `median*` являются псевдонимами соответствующих функций `quantile*`. Они вычисляют медиану выборки числовых данных.'
sidebar_position: 167
slug: /sql-reference/aggregate-functions/reference/median
title: 'median'
doc_type: 'reference'
---

# median

Функции `median*` — это псевдонимы соответствующих функций `quantile*`. Они вычисляют медиану по числовой выборке данных.

Функции:

* `median` — псевдоним для [quantile](/sql-reference/aggregate-functions/reference/quantile).
* `medianDeterministic` — псевдоним для [quantileDeterministic](/sql-reference/aggregate-functions/reference/quantiledeterministic).
* `medianExact` — псевдоним для [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact).
* `medianExactWeighted` — псевдоним для [quantileExactWeighted](/sql-reference/aggregate-functions/reference/quantileexactweighted).
* `medianTiming` — псевдоним для [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming).
* `medianTimingWeighted` — псевдоним для [quantileTimingWeighted](/sql-reference/aggregate-functions/reference/quantiletimingweighted).
* `medianTDigest` — псевдоним для [quantileTDigest](/sql-reference/aggregate-functions/reference/quantiletdigest).
* `medianTDigestWeighted` — псевдоним для [quantileTDigestWeighted](/sql-reference/aggregate-functions/reference/quantiletdigestweighted).
* `medianBFloat16` — псевдоним для [quantileBFloat16](/sql-reference/aggregate-functions/reference/quantilebfloat16).
* `medianDD` — псевдоним для [quantileDD](/sql-reference/aggregate-functions/reference/quantileddsketch).

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

Запрос:

```sql
SELECT medianDeterministic(val, 1) FROM t;
```

Результат:

```text
┌─medianDeterministic(val, 1)─┐
│                         1.5 │
└─────────────────────────────┘
```
