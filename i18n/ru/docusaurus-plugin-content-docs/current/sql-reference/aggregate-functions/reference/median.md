---
description: 'Функции `median*` являются псевдонимами для соответствующих функций `quantile*`. Они вычисляют медиану числовой выборки данных.'
sidebar_position: 167
slug: /sql-reference/aggregate-functions/reference/median
title: 'median'
---


# median

Функции `median*` являются псевдонимами для соответствующих функций `quantile*`. Они вычисляют медиану числовой выборки данных.

Функции:

- `median` — Псевдоним для [quantile](/sql-reference/aggregate-functions/reference/quantile).
- `medianDeterministic` — Псевдоним для [quantileDeterministic](/sql-reference/aggregate-functions/reference/quantiledeterministic).
- `medianExact` — Псевдоним для [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact).
- `medianExactWeighted` — Псевдоним для [quantileExactWeighted](/sql-reference/aggregate-functions/reference/quantileexactweighted).
- `medianTiming` — Псевдоним для [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming).
- `medianTimingWeighted` — Псевдоним для [quantileTimingWeighted](/sql-reference/aggregate-functions/reference/quantiletimingweighted).
- `medianTDigest` — Псевдоним для [quantileTDigest](/sql-reference/aggregate-functions/reference/quantiletdigest).
- `medianTDigestWeighted` — Псевдоним для [quantileTDigestWeighted](/sql-reference/aggregate-functions/reference/quantiletdigestweighted).
- `medianBFloat16` — Псевдоним для [quantileBFloat16](/sql-reference/aggregate-functions/reference/quantilebfloat16).
- `medianDD` — Псевдоним для [quantileDD](/sql-reference/aggregate-functions/reference/quantileddsketch).

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
