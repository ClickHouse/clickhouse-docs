---
slug: '/sql-reference/aggregate-functions/reference/uniqhll12'
sidebar_position: 208
title: 'uniqHLL12'
description: 'HyperLogLogアルゴリズムを使用して、異なる引数値の近似数を計算します。'
---


# uniqHLL12

[HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog)アルゴリズムを使用して、異なる引数値の近似数を計算します。

``` sql
uniqHLL12(x[, ...])
```

**引数**

この関数は可変数のパラメータを受け取ります。パラメータは`Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型です。

**返される値**

- [UInt64](../../../sql-reference/data-types/int-uint.md)型の数値。

**実装の詳細**

関数：

- 集約内のすべてのパラメータに対してハッシュを計算し、それを計算に利用します。

- HyperLogLogアルゴリズムを使用して、異なる引数値の数を近似します。

        2^12の5ビットセルが使用されます。状態のサイズは2.5 KBを少し超えます。結果は、小規模データセット（&lt;10K要素）に対してはあまり正確ではなく（最大で約10%の誤差）、しかし、高カーディナリティのデータセット（10K-100M）に対しては、最大誤差は約1.6%でかなり正確です。100Mを超えると、推定誤差は増加し、非常に高いカーディナリティのデータセット（1B+要素）に対しては非常に不正確な結果が返されます。

- 結果は決定的です（クエリ処理の順序に依存しません）。

この関数の使用は推奨されません。ほとんどの場合、[uniq](/sql-reference/aggregate-functions/reference/uniq)または[uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)関数を使用してください。

**関連項目**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
