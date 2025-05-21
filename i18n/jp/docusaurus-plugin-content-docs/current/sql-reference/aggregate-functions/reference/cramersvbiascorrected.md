---
description: 'クレーマーのVを計算しますが、バイアス補正を使用します。'
sidebar_position: 128
slug: /sql-reference/aggregate-functions/reference/cramersvbiascorrected
title: 'cramersVBiasCorrected'
---


# cramersVBiasCorrected

クレーマーのVは、テーブル内の二つのカラム間の関連性を測定する指標です。 [`cramersV`関数](./cramersv.md) の結果は、0（変数間に関連性がないことに対応）から1までの範囲で、各値が他方によって完全に決定されるときのみ1に達することができます。この関数は大きくバイアスがかかる可能性があるため、このバージョンのクレーマーのVは[バイアス補正](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V#Bias_correction)を使用します。

**構文**

```sql
cramersVBiasCorrected(column1, column2)
```

**パラメーター**

- `column1`: 比較される最初のカラム。
- `column2`: 比較される2番目のカラム。

**戻り値**

- カラムの値間に関連性がないことに対応する0から完全な関連性に対応する1までの値。

タイプ: 常に [Float64](../../../sql-reference/data-types/float.md)。

**例**

以下に比較される二つのカラムは、お互いに小さな関連性を示しています。`cramersVBiasCorrected`の結果が`cramersV`の結果よりも小さいことに注意してください：

クエリ:

```sql
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
