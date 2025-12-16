---
description: 'Kahan 補償和アルゴリズムを用いて数値の合計を計算します'
sidebar_position: 197
slug: /sql-reference/aggregate-functions/reference/sumkahan
title: 'sumKahan'
doc_type: 'reference'
---

[Kahan 補償和アルゴリズム](https://en.wikipedia.org/wiki/Kahan_summation_algorithm) を用いて数値の合計を計算します。
[sum](./sum.md) 関数よりも処理が遅くなります。
補償は [Float](../../../sql-reference/data-types/float.md) 型に対してのみ有効です。

**構文**

```sql
sumKahan(x)
```

**引数**

* `x` — 入力値。[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)、または [Decimal](../../../sql-reference/data-types/decimal.md) である必要があります。

**戻り値**

* 数値の合計。[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)、または [Decimal](../../../sql-reference/data-types/decimal.md) 型で、入力引数の型に依存します。

**例**

クエリ:

```sql
SELECT sum(0.1), sumKahan(0.1) FROM numbers(10);
```

結果:

```text
┌───────────sum(0.1)─┬─sumKahan(0.1)─┐
│ 0.9999999999999999 │             1 │
└────────────────────┴───────────────┘
```
