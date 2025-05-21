---
description: '引数の異なる値の近似数を計算します。'
sidebar_position: 204
slug: /sql-reference/aggregate-functions/reference/uniq
title: 'uniq'
---


# uniq

引数の異なる値の近似数を計算します。

```sql
uniq(x[, ...])
```

**引数**

この関数は可変数のパラメータを受け取ります。パラメータは `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型であることができます。

**返される値**

- [UInt64](../../../sql-reference/data-types/int-uint.md)型の数値。

**実装の詳細**

関数:

- 集約内のすべてのパラメータのハッシュを計算し、それを計算に使用します。

- 適応サンプリングアルゴリズムを使用します。計算状態において、関数は最大65536の要素ハッシュ値のサンプルを使用します。このアルゴリズムは非常に正確で、CPUに対して非常に効率的です。クエリにこれらの関数がいくつか含まれている場合、`uniq`を使用することは他の集約関数を使用するのとほぼ同じくらい速いです。

- 結果は決定論的に提供されます（クエリの処理順序に依存しません）。

ほぼすべてのシナリオでこの関数の使用をお勧めします。

**関連項目**

- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
