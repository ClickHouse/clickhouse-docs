---
slug: /sql-reference/aggregate-functions/reference/rankCorr
sidebar_position: 182
title: "rankCorr"
description: "順位相関係数を計算します。"
---


# rankCorr

順位相関係数を計算します。

**構文**

``` sql
rankCorr(x, y)
```

**引数**

- `x` — 任意の値。[Float32](/sql-reference/data-types/float) または [Float64](/sql-reference/data-types/float) です。
- `y` — 任意の値。[Float32](/sql-reference/data-types/float) または [Float64](/sql-reference/data-types/float) です。

**返される値**

- x と y の順位の順位相関係数を返します。相関係数の値は -1 から +1 の範囲です。引数が二つ未満の場合、この関数は例外を返します。+1 に近い値は高い線形関係を示し、一つのランダム変数が増加すると、二つ目のランダム変数も増加します。-1 に近い値は高い線形関係を示し、一つのランダム変数が増加すると、二つ目のランダム変数は減少します。0 に近い、または0に等しい値は、二つのランダム変数の間に関係がないことを示します。

タイプ: [Float64](/sql-reference/data-types/float)。

**例**

クエリ:

``` sql
SELECT rankCorr(number, number) FROM numbers(100);
```

結果:

``` text
┌─rankCorr(number, number)─┐
│                        1 │
└──────────────────────────┘
```

クエリ:

``` sql
SELECT roundBankers(rankCorr(exp(number), sin(number)), 3) FROM numbers(100);
```

結果:

``` text
┌─roundBankers(rankCorr(exp(number), sin(number)), 3)─┐
│                                              -0.037 │
└─────────────────────────────────────────────────────┘
```
**関連情報**

- [スピアマンの順位相関係数](https://en.wikipedia.org/wiki/Spearman%27s_rank_correlation_coefficient)
