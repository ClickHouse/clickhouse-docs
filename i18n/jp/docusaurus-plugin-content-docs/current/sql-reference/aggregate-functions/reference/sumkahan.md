---
slug: /sql-reference/aggregate-functions/reference/sumkahan
sidebar_position: 197
title: sumKahan
description: "Kahan補正加算アルゴリズムで数値の合計を計算します"
---

[Kahan補正加算アルゴリズム](https://en.wikipedia.org/wiki/Kahan_summation_algorithm)を使用して数値の合計を計算します。  
[sum](./sum.md)関数よりも遅いです。  
補正は[Float](../../../sql-reference/data-types/float.md)型のみに機能します。

**構文**

``` sql
sumKahan(x)
```

**引数**

- `x` — 入力値、[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)、または[Decimal](../../../sql-reference/data-types/decimal.md)である必要があります。

**返される値**

- 合計値、型は入力引数の型に依存し、[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)、または[Decimal](../../../sql-reference/data-types/decimal.md)です。

**例**

クエリ:

``` sql
SELECT sum(0.1), sumKahan(0.1) FROM numbers(10);
```

結果:

``` text
┌───────────sum(0.1)─┬─sumKahan(0.1)─┐
│ 0.9999999999999999 │             1 │
└────────────────────┴───────────────┘
```
