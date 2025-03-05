---
slug: /sql-reference/aggregate-functions/reference/uniqhll12
sidebar_position: 208
title: "uniqHLL12"
description: "ハイパーログログアルゴリズムを使用して、異なる引数値の近似数を計算します。"
---


# uniqHLL12

ハイパーログログアルゴリズムを使用して、異なる引数値の近似数を計算します。[HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) アルゴリズムを参照してください。

``` sql
uniqHLL12(x[, ...])
```

**引数**

この関数は可変数のパラメータを受け取ります。パラメータは `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型であることができます。

**戻り値**

- [UInt64](../../../sql-reference/data-types/int-uint.md)-型の数値。

**実装の詳細**

関数：

- 集約内のすべてのパラメータのハッシュを計算し、それを計算に使用します。

- ハイパーログログアルゴリズムを使用して、異なる引数値の近似数を計算します。

        2^12 の 5ビットセルが使用されます。状態のサイズは2.5 KBよりわずかに大きくなります。結果は、小さなデータセット（&lt;10K要素）に対しては非常に正確ではなく（最大で約10%の誤差）、しかし、高い基数のデータセット（10K-100M）に対してはかなり正確で、最大誤差は約1.6%です。100Mからは、推定誤差が増加し、関数は非常に高い基数のデータセット（1B+要素）に対して非常に不正確な結果を返します。

- 決定的な結果を提供します（クエリ処理順序には依存しません）。

この関数の使用は推奨しません。ほとんどの場合、[uniq](../../../sql-reference/aggregate-functions/reference/uniq.md#agg_function-uniq) または [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md#agg_function-uniqcombined) 関数を使用してください。

**関連情報**

- [uniq](../../../sql-reference/aggregate-functions/reference/uniq.md#agg_function-uniq)
- [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md#agg_function-uniqcombined)
- [uniqExact](../../../sql-reference/aggregate-functions/reference/uniqexact.md#agg_function-uniqexact)
- [uniqTheta](../../../sql-reference/aggregate-functions/reference/uniqthetasketch.md#agg_function-uniqthetasketch)
