---
slug: '/sql-reference/aggregate-functions/reference/uniqthetasketch'
sidebar_position: 209
title: 'uniqTheta'
description: 'Theta スケッチフレームワークを使用して、異なる引数値のおおよその数を計算します。'
---

Theta スケッチフレームワークを使用して、異なる引数値のおおよその数を計算します。[Theta スケッチフレームワーク](https://datasketches.apache.org/docs/Theta/ThetaSketchFramework.html)。

``` sql
uniqTheta(x[, ...])
```

**引数**

関数は可変数のパラメータを受け取ります。パラメータは `Tuple`、`Array`、`Date`、`DateTime`、`String` または数値型です。

**返される値**

- [UInt64](../../../sql-reference/data-types/int-uint.md) 型の数値。

**実装の詳細**

関数:

- 集約内のすべてのパラメータに対してハッシュを計算し、それを計算に使用します。

- [KMV](https://datasketches.apache.org/docs/Theta/InverseEstimate.html) アルゴリズムを使用して、異なる引数値の数を近似します。

        4096(2^12) 64 ビットスケッチが使用されます。ステートのサイズは約 41 KB です。

- 相対誤差は 3.125% (95% 信頼区間) です。詳細については、[相対誤差の表](https://datasketches.apache.org/docs/Theta/ThetaErrorTable.html)を参照してください。

**関連情報**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
