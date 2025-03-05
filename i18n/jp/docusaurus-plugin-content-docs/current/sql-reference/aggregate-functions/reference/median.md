---
slug: /sql-reference/aggregate-functions/reference/median
sidebar_position: 167
title: "median"
description: "`median*` 関数は、対応する `quantile*` 関数のエイリアスです。数値データサンプルの中央値を計算します。"
---


# median

`median*` 関数は、対応する `quantile*` 関数のエイリアスです。数値データサンプルの中央値を計算します。

Functions:

- `median` — [quantile](../../../sql-reference/aggregate-functions/reference/quantile.md#quantile) のエイリアス。
- `medianDeterministic` — [quantileDeterministic](../../../sql-reference/aggregate-functions/reference/quantiledeterministic.md#quantiledeterministic) のエイリアス。
- `medianExact` — [quantileExact](../../../sql-reference/aggregate-functions/reference/quantileexact.md#quantileexact) のエイリアス。
- `medianExactWeighted` — [quantileExactWeighted](../../../sql-reference/aggregate-functions/reference/quantileexactweighted.md#quantileexactweighted) のエイリアス。
- `medianTiming` — [quantileTiming](../../../sql-reference/aggregate-functions/reference/quantiletiming.md#quantiletiming) のエイリアス。
- `medianTimingWeighted` — [quantileTimingWeighted](../../../sql-reference/aggregate-functions/reference/quantiletimingweighted.md#quantiletimingweighted) のエイリアス。
- `medianTDigest` — [quantileTDigest](../../../sql-reference/aggregate-functions/reference/quantiletdigest.md#quantiletdigest) のエイリアス。
- `medianTDigestWeighted` — [quantileTDigestWeighted](../../../sql-reference/aggregate-functions/reference/quantiletdigestweighted.md#quantiletdigestweighted) のエイリアス。
- `medianBFloat16` — [quantileBFloat16](../../../sql-reference/aggregate-functions/reference/quantilebfloat16.md#quantilebfloat16) のエイリアス。
- `medianDD` — [quantileDD](../../../sql-reference/aggregate-functions/reference/quantileddsketch.md#quantileddsketch) のエイリアス。

**Example**

Input table:

``` text
┌─val─┐
│   1 │
│   1 │
│   2 │
│   3 │
└─────┘
```

Query:

``` sql
SELECT medianDeterministic(val, 1) FROM t;
```

Result:

``` text
┌─medianDeterministic(val, 1)─┐
│                         1.5 │
└─────────────────────────────┘
```
