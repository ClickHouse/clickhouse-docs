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

この関数は可変数のパラメータを受け取ります。パラメータは `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型です。

**戻り値**

- [UInt64](../../../sql-reference/data-types/int-uint.md)-型の数値。

**実装の詳細**

関数:

- 集約内のすべてのパラメータのハッシュを計算し、それを計算に使用します。

- 適応型サンプリングアルゴリズムを使用します。計算状態のために、この関数は65536までの要素のハッシュ値のサンプルを使用します。このアルゴリズムは非常に正確で、CPUにとても効率的です。クエリに複数のこの関数が含まれている場合、`uniq`の使用は他の集約関数を使用するのとほぼ同じくらい速いです。

- 結果を決定論的に提供します（クエリ処理順序に依存しません）。

この関数はほぼすべてのシナリオでの使用を推奨します。

**関連項目**

- [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md#agg_function-uniqcombined)
- [uniqCombined64](../../../sql-reference/aggregate-functions/reference/uniqcombined64.md#agg_function-uniqcombined64)
- [uniqHLL12](../../../sql-reference/aggregate-functions/reference/uniqhll12.md#agg_function-uniqhll12)
- [uniqExact](../../../sql-reference/aggregate-functions/reference/uniqexact.md#agg_function-uniqexact)
- [uniqTheta](../../../sql-reference/aggregate-functions/reference/uniqthetasketch.md#agg_function-uniqthetasketch)
