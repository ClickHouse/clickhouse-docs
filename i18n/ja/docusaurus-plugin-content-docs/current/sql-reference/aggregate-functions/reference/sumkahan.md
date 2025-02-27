---
slug: /sql-reference/aggregate-functions/reference/sumkahan
sidebar_position: 197
title: sumKahan
---

[Kahan補償加算アルゴリズム](https://en.wikipedia.org/wiki/Kahan_summation_algorithm)を使用して数値の合計を計算します。
[sum](./sum.md)関数よりも遅くなります。
補償は[Float](../../../sql-reference/data-types/float.md)タイプに対してのみ機能します。

**構文**

``` sql
sumKahan(x)
```

**引数**

- `x` — 入力値。必ず[整数](../../../sql-reference/data-types/int-uint.md)、[浮動小数点](../../../sql-reference/data-types/float.md)、または[小数](../../../sql-reference/data-types/decimal.md)でなければなりません。

**戻り値**

- 数値の合計。戻り値の型は、入力引数の型に依存し、[整数](../../../sql-reference/data-types/int-uint.md)、[浮動小数点](../../../sql-reference/data-types/float.md)、または[小数](../../../sql-reference/data-types/decimal.md)になります。

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
