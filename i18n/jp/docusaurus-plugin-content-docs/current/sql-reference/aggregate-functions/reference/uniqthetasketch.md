---
slug: /sql-reference/aggregate-functions/reference/uniqthetasketch
sidebar_position: 209
title: uniqTheta
description: "Thetaスケッチフレームワークを使用して、異なる引数値のおおよその数を計算します。"
---

Thetaスケッチフレームワークを使用して、異なる引数値のおおよその数を計算します。[Theta Sketch Framework](https://datasketches.apache.org/docs/Theta/ThetaSketchFramework.html)を参照してください。

``` sql
uniqTheta(x[, ...])
```

**引数**

この関数は、可変数のパラメータを受け取ります。パラメータは、`Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型であることができます。

**返される値**

- [UInt64](../../../sql-reference/data-types/int-uint.md)-型の数値。

**実装の詳細**

関数:

- 集約内のすべてのパラメータのハッシュを計算し、それを計算に使用します。

- 異なる引数値のおおよその数を求めるために、[KMV](https://datasketches.apache.org/docs/Theta/InverseEstimate.html)アルゴリズムを使用します。

        4096(2^12)の64ビットスケッチが使用されます。状態のサイズは約41 KBです。

- 相対誤差は3.125%（95%の信頼度）であり、詳細については[相対誤差表](https://datasketches.apache.org/docs/Theta/ThetaErrorTable.html)を参照してください。

**関連項目**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md#agg_function-uniqcombined)
- [uniqCombined64](../../../sql-reference/aggregate-functions/reference/uniqcombined64.md#agg_function-uniqcombined64)
- [uniqHLL12](../../../sql-reference/aggregate-functions/reference/uniqhll12.md#agg_function-uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
