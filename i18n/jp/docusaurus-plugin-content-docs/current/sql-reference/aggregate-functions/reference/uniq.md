---
slug: /sql-reference/aggregate-functions/reference/uniq
sidebar_position: 204
title: "uniq"
description: "引数の異なる値の近似数を計算します。"
---


# uniq

引数の異なる値の近似数を計算します。

``` sql
uniq(x[, ...])
```

**引数**

関数は可変数のパラメータを受け取ります。パラメータは `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型であることができます。

**返される値**

- [UInt64](../../../sql-reference/data-types/int-uint.md)-型の数値。

**実装の詳細**

関数:

- 集約内のすべてのパラメータに対してハッシュを計算し、その後計算に使用します。

- 適応サンプリングアルゴリズムを使用します。計算状態のために、関数は最大65536の要素ハッシュ値のサンプルを使用します。このアルゴリズムは非常に正確で、CPUに対して非常に効率的です。クエリにこれらの関数がいくつか含まれている場合、`uniq`の使用は他の集約関数を使用するのとほぼ同じ速さです。

- 結果を決定論的に提供します（クエリ処理の順序に依存しません）。

この関数はほぼすべてのシナリオでの使用を推奨します。

**関連情報**

- [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md#agg_function-uniqcombined)
- [uniqCombined64](../../../sql-reference/aggregate-functions/reference/uniqcombined64.md#agg_function-uniqcombined64)
- [uniqHLL12](../../../sql-reference/aggregate-functions/reference/uniqhll12.md#agg_function-uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](../../../sql-reference/aggregate-functions/reference/uniqthetasketch.md#agg_function-uniqthetasketch)
