---
slug: '/sql-reference/aggregate-functions/reference/uniq'
sidebar_position: 204
title: 'uniq'
description: '引数の異なる値の近似数を計算します。'
---


# uniq

引数の異なる値の近似数を計算します。

``` sql
uniq(x[, ...])
```

**Arguments**

この関数は可変数のパラメータを取ります。パラメータは `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値タイプであることができます。

**Returned value**

- [UInt64](../../../sql-reference/data-types/int-uint.md)-タイプの数値。

**Implementation details**

関数:

- 集約内のすべてのパラメータのハッシュを計算し、それを計算に使用します。

- 適応サンプリングアルゴリズムを使用します。計算状態のために、関数は65536までの要素ハッシュ値のサンプルを使用します。このアルゴリズムは非常に正確であり、CPUに対して非常に効率的です。クエリにこれらの関数がいくつか含まれている場合、`uniq`の使用は他の集約関数を使用するのとほぼ同じ速度です。

- 結果を決定論的に提供します（クエリ処理順序に依存しません）。

この関数はほぼすべてのシナリオでの使用を推奨します。

**See Also**

- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
