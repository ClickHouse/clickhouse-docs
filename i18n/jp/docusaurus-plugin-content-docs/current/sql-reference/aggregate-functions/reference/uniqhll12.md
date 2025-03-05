---
slug: /sql-reference/aggregate-functions/reference/uniqhll12
sidebar_position: 208
title: "uniqHLL12"
description: "ハイパーログログアルゴリズムを使用して、異なる引数値の概算数を計算します。"
---


# uniqHLL12

ハイパーログログアルゴリズムを使用して、異なる引数値の概算数を計算します。[HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) アルゴリズムを参照してください。

``` sql
uniqHLL12(x[, ...])
```

**引数**

この関数は可変数のパラメータを取ります。パラメータは `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型です。

**返り値**

- [UInt64](../../../sql-reference/data-types/int-uint.md)-型の数値。

**実装詳細**

関数:

- 集約内のすべてのパラメータに対してハッシュを計算し、それを計算に使用します。

- 異なる引数値の数を近似するために、ハイパーログログアルゴリズムを使用します。

        2^12 の5ビットセルが使用されます。状態のサイズは2.5 KBを少し超えます。結果は、小さなデータセット（&lt;10K要素）に対しては非常に正確とは言えません（最大約10％の誤差）。ただし、高次元データセット（10K-100M）に対しては、結果は比較的正確で、最大誤差は約1.6％です。100Mからは、推定誤差が増加し、極めて高いカーディナリティのデータセット（1B以上の要素）に対しては、関数は非常に不正確な結果を返します。

- 定まった結果を提供します（クエリ処理の順序に依存しません）。

この関数の使用は推奨しません。ほとんどの場合、[uniq](/sql-reference/aggregate-functions/reference/uniq) または [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md#agg_function-uniqcombined) 関数を使用してください。

**参照**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md#agg_function-uniqcombined)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](../../../sql-reference/aggregate-functions/reference/uniqthetasketch.md#agg_function-uniqthetasketch)
