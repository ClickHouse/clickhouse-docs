---
slug: /sql-reference/aggregate-functions/reference/skewpop
sidebar_position: 185
title: "skewPop"
description: "シーケンスの歪度を計算します。"
---


# skewPop

シーケンスの[歪度](https://en.wikipedia.org/wiki/Skewness)を計算します。

``` sql
skewPop(expr)
```

**引数**

`expr` — 数値を返す[式](/sql-reference/syntax#expressions)。

**返される値**

指定された分布の歪度。タイプ — [Float64](../../../sql-reference/data-types/float.md)

**例**

``` sql
SELECT skewPop(value) FROM series_with_value_column;
```
