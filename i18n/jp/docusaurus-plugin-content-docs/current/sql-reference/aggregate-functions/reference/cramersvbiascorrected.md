---
slug: /sql-reference/aggregate-functions/reference/cramersvbiascorrected
sidebar_position: 128
title: "cramersVBiasCorrected"
description: "バイアス補正を使用してCramer's Vを計算します。"
---


# cramersVBiasCorrected

Cramer's Vは、テーブル内の2つのカラム間の関連性を測定する指標です。 [`cramersV`関数](./cramersv.md) の結果は、0（変数間に関連性がないことを示す）から1までの範囲を持ち、各値が完全に別の値によって決定される場合にのみ1に達することができます。この関数は大きなバイアスがかかることがあるため、このバージョンのCramer's Vは[バイアス補正](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V#Bias_correction)を使用します。

**構文**

``` sql
cramersVBiasCorrected(column1, column2)
```

**パラメーター**

- `column1`: 比較される最初のカラム。
- `column2`: 比較される2番目のカラム。

**返される値**

- カラムの値間に関連性がないことを示す0から（完全関連性を示す）1までの値。

タイプ: いつも [Float64](../../../sql-reference/data-types/float.md)。

**例**

以下で比較される2つのカラムには小さな関連性があります。 `cramersVBiasCorrected` の結果が `cramersV` の結果よりも小さいことに注意してください。

クエリ:

``` sql
SELECT
    cramersV(a, b),
    cramersVBiasCorrected(a ,b)
FROM
    (
        SELECT
            number % 10 AS a,
            number % 4 AS b
        FROM
            numbers(150)
    );
```

結果:

```response
┌──────cramersV(a, b)─┬─cramersVBiasCorrected(a, b)─┐
│ 0.41171788506213564 │         0.33369281784141364 │
└─────────────────────┴─────────────────────────────┘
```
