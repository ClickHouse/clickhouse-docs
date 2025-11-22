---
description: '引数に含まれる異なる値のおおよその個数を計算します。'
sidebar_position: 204
slug: /sql-reference/aggregate-functions/reference/uniq
title: 'uniq'
doc_type: 'reference'
---

# uniq

引数の異なる値のおおよその個数を計算します。

```sql
uniq(x[, ...])
```

**引数**

この関数は可変個のパラメータを受け取ります。パラメータには `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型を指定できます。

**戻り値**

* [UInt64](../../../sql-reference/data-types/int-uint.md) 型の数値。

**実装の詳細**

この関数は次のように実装されています:

* 集約内のすべてのパラメータに対してハッシュ値を計算し、そのハッシュ値を内部計算に利用します。

* アダプティブサンプリングアルゴリズムを使用します。計算状態には、要素のハッシュ値サンプルを最大 65536 個まで保持します。このアルゴリズムは非常に高精度であり、CPU 上でも非常に効率的です。クエリにこれらの関数が複数含まれている場合でも、`uniq` の使用は他の集約関数の使用とほぼ同等の速度で動作します。

* 決定論的な結果を返します（クエリ処理順序に依存しません）。

この関数は、ほとんどあらゆるシナリオでの使用を推奨します。

**関連項目**

* [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
* [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
* [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
* [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
* [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
