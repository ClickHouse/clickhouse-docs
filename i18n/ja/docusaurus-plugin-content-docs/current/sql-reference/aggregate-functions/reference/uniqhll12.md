---
slug: /sql-reference/aggregate-functions/reference/uniqhll12
sidebar_position: 208
---

# uniqHLL12

[HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog)アルゴリズムを使用して、異なる引数値の概算数を計算します。

``` sql
uniqHLL12(x[, ...])
```

**引数**

この関数は、可変数のパラメータを受け取ります。パラメータは`Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型であることができます。

**返される値**

- [UInt64](../../../sql-reference/data-types/int-uint.md)-型の数値。

**実装詳細**

関数:

- 集約内のすべてのパラメータに対してハッシュを計算し、それを計算に使用します。

- HyperLogLogアルゴリズムを使用して異なる引数値の数を近似します。

        2^12の5ビットセルが使用されます。状態のサイズはわずかに2.5 KBを超えます。結果は小規模データセット（&lt;10K要素）に対してはあまり正確ではなく（最大約10％の誤差）、高カーディナリティデータセット（10K-100M）に対してはかなり正確で、最大誤差は約1.6％です。100M以上になると、推定誤差は増加し、非常に高いカーディナリティのデータセット（1B以上の要素）に対しては非常に不正確な結果を返します。

- 決定的な結果を提供します（クエリ処理の順序に依存しません）。

この関数の使用は推奨しません。ほとんどの場合、[uniq](../../../sql-reference/aggregate-functions/reference/uniq.md#agg_function-uniq)または[uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md#agg_function-uniqcombined)関数を使用してください。

**参照**

- [uniq](../../../sql-reference/aggregate-functions/reference/uniq.md#agg_function-uniq)
- [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md#agg_function-uniqcombined)
- [uniqExact](../../../sql-reference/aggregate-functions/reference/uniqexact.md#agg_function-uniqexact)
- [uniqTheta](../../../sql-reference/aggregate-functions/reference/uniqthetasketch.md#agg_function-uniqthetasketch)
