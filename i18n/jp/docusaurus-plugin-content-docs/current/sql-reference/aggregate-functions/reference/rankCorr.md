description: 'ランク相関係数を計算します。'
sidebar_position: 182
slug: /sql-reference/aggregate-functions/reference/rankCorr
title: 'rankCorr'
```


# rankCorr

ランク相関係数を計算します。

**構文**

```sql
rankCorr(x, y)
```

**引数**

- `x` — 任意の値。 [Float32](/sql-reference/data-types/float) または [Float64](/sql-reference/data-types/float)。
- `y` — 任意の値。 [Float32](/sql-reference/data-types/float) または [Float64](/sql-reference/data-types/float)。

**戻り値**

- x と y のランクのランク相関係数を返します。相関係数の値は -1 から +1 の範囲です。2つ未満の引数が渡された場合、関数は例外を返します。+1 に近い値は高い線形関係を示し、一方のランダム変数が増加する際に、もう一方のランダム変数も増加します。-1 に近い値は高い線形関係を示し、一方のランダム変数が増加すると、もう一方のランダム変数は減少します。0 に近いか等しい値は、二つのランダム変数間に関係がないことを示します。

型: [Float64](/sql-reference/data-types/float)。

**例**

クエリ:

```sql
SELECT rankCorr(number, number) FROM numbers(100);
```

結果:

```text
┌─rankCorr(number, number)─┐
│                        1 │
└──────────────────────────┘
```

クエリ:

```sql
SELECT roundBankers(rankCorr(exp(number), sin(number)), 3) FROM numbers(100);
```

結果:

```text
┌─roundBankers(rankCorr(exp(number), sin(number)), 3)─┐
│                                              -0.037 │
└─────────────────────────────────────────────────────┘
```
**関連情報**

- [スピアマンのランク相関係数](https://en.wikipedia.org/wiki/Spearman%27s_rank_correlation_coefficient)
