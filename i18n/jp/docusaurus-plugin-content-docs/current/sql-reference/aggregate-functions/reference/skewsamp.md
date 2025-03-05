---
slug: /sql-reference/aggregate-functions/reference/skewsamp
sidebar_position: 186
title: "skewSamp"
description: "サンプルの歪度を計算します。"
---


# skewSamp

シーケンスの[サンプルの歪度](https://en.wikipedia.org/wiki/Skewness)を計算します。

これは、渡された値がそのサンプルを形成する場合にランダム変数の歪度の無偏推定値を表します。

``` sql
skewSamp(expr)
```

**引数**

`expr` — 数値を返す[式](/sql-reference/syntax#expressions)。

**返される値**

指定された分布の歪度。型 — [Float64](../../../sql-reference/data-types/float.md)。`n <= 1`（`n`はサンプルのサイズ）の場合、関数は`nan`を返します。

**例**

``` sql
SELECT skewSamp(value) FROM series_with_value_column;
```
