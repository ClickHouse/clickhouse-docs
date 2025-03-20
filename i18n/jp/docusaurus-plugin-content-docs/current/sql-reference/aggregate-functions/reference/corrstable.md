---
slug: /sql-reference/aggregate-functions/reference/corrstable
sidebar_position: 119
title: "corrStable"
description: "数値的に安定したアルゴリズムを使用して、ピアソン相関係数を計算します。"
---


# corrStable

[ピアソン相関係数](https://en.wikipedia.org/wiki/Pearson_correlation_coefficient)を計算します:

$$
\frac{\Sigma{(x - \bar{x})(y - \bar{y})}}{\sqrt{\Sigma{(x - \bar{x})^2} * \Sigma{(y - \bar{y})^2}}}
$$

[`corr`](../reference/corr.md)関数と似ていますが、数値的に安定したアルゴリズムを使用します。その結果、`corrStable`は`corr`よりも遅いですが、より正確な結果を生成します。

**構文**

```sql
corrStable(x, y)
```

**引数**

- `x` — 第一の変数。[(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal](../../data-types/decimal.md)。
- `y` — 第二の変数。[(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal](../../data-types/decimal.md)。

**返される値**

- ピアソン相関係数。[Float64](../../data-types/float.md)。

***例***

クエリ:

```sql
DROP TABLE IF EXISTS series;
CREATE TABLE series
(
    i UInt32,
    x_value Float64,
    y_value Float64
)
ENGINE = Memory;
INSERT INTO series(i, x_value, y_value) VALUES (1, 5.6, -4.4),(2, -9.6, 3),(3, -1.3, -4),(4, 5.3, 9.7),(5, 4.4, 0.037),(6, -8.6, -7.8),(7, 5.1, 9.3),(8, 7.9, -3.6),(9, -8.2, 0.62),(10, -3, 7.3);
```

```sql
SELECT corrStable(x_value, y_value)
FROM series;
```

結果:

```response
┌─corrStable(x_value, y_value)─┐
│          0.17302657554532558 │
└──────────────────────────────┘
```
