---
slug: /sql-reference/aggregate-functions/reference/uniq
sidebar_position: 204
---

# uniq

引数の異なる値のおおよその数を計算します。

``` sql
uniq(x[, ...])
```

**引数**

この関数は可変数のパラメーターを受け取ります。パラメーターは `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型である必要があります。

**返される値**

- [UInt64](../../../sql-reference/data-types/int-uint.md)-型の数値。

**実装詳細**

関数:

- 集計内のすべてのパラメーターのハッシュを計算し、それを計算に使用します。

- 適応サンプリングアルゴリズムを使用します。計算状態には、最大65536の要素ハッシュ値のサンプルを使用します。このアルゴリズムは非常に正確で、CPUに対して非常に効率的です。クエリにこれらの関数がいくつか含まれている場合、`uniq`を使用することは他の集約関数を使用するのとほぼ同じ速さです。

- 結果は決定的に提供されます（クエリ処理の順序に依存しません）。

ほとんどすべてのシナリオでこの関数の使用を推奨します。

**関連情報**

- [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md#agg_function-uniqcombined)
- [uniqCombined64](../../../sql-reference/aggregate-functions/reference/uniqcombined64.md#agg_function-uniqcombined64)
- [uniqHLL12](../../../sql-reference/aggregate-functions/reference/uniqhll12.md#agg_function-uniqhll12)
- [uniqExact](../../../sql-reference/aggregate-functions/reference/uniqexact.md#agg_function-uniqexact)
- [uniqTheta](../../../sql-reference/aggregate-functions/reference/uniqthetasketch.md#agg_function-uniqthetasketch)
