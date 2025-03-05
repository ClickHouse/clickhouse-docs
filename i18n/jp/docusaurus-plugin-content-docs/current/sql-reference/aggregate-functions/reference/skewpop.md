---
slug: /sql-reference/aggregate-functions/reference/skewpop
sidebar_position: 185
title: "skewPop"
description: "系列の歪度を計算します。"
---


# skewPop

系列の[歪度](https://en.wikipedia.org/wiki/Skewness)を計算します。

``` sql
skewPop(expr)
```

**引数**

`expr` — 数字を返す[式](../../../sql-reference/syntax.md#syntax-expressions)。

**返される値**

指定された分布の歪度。型 — [Float64](../../../sql-reference/data-types/float.md)

**例**

``` sql
SELECT skewPop(value) FROM series_with_value_column;
```
