---
slug: /sql-reference/aggregate-functions/reference/cramersvbiascorrected
sidebar_position: 128
---

# cramersVBiasCorrected

Cramer's Vは、テーブル内の2つのカラム間の関連性の尺度です。[`cramersV`関数](./cramersv.md)の結果は、0（変数間に関連がないことを示す）から1までで、各値が他の値によって完全に決定されるときのみ1に達することができます。この関数は大きく偏る可能性があるため、このCramer's Vのバージョンは[バイアス補正](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V#Bias_correction)を用います。

**構文**

``` sql
cramersVBiasCorrected(column1, column2)
```

**パラメータ**

- `column1`: 比較する最初のカラム。
- `column2`: 比較する2番目のカラム。

**返される値**

- カラムの値の関連性がない場合の0から（完全な関連性の場合の）1の間の値。

タイプ: 常に [Float64](../../../sql-reference/data-types/float.md)。

**例**

以下に比較される2つのカラムは、お互いに小さな関連性を持っています。`cramersVBiasCorrected`の結果が`cramersV`の結果よりも小さいことに注意してください。

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
