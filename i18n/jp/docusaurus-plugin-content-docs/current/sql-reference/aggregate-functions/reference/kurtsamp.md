---
slug: /sql-reference/aggregate-functions/reference/kurtsamp
sidebar_position: 158
title: "kurtSamp"
description: "シーケンスのサンプル尖度を計算します。"
---


# kurtSamp

シーケンスの[サンプル尖度](https://en.wikipedia.org/wiki/Kurtosis)を計算します。

値がサンプルを形成する場合、これはランダム変数の尖度の無偏推定値を表します。

``` sql
kurtSamp(expr)
```

**引数**

`expr` — [数値を返す式](/sql-reference/syntax#expressions)。

**返される値**

指定された分布の尖度。型 — [Float64](../../../sql-reference/data-types/float.md)。もし `n <= 1`（`n` はサンプルサイズ）であれば、関数は `nan` を返します。

**例**

``` sql
SELECT kurtSamp(value) FROM series_with_value_column;
```
