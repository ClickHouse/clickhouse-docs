---
'description': 'Computes a rank correlation coefficient.'
'sidebar_position': 182
'slug': '/sql-reference/aggregate-functions/reference/rankCorr'
'title': 'rankCorr'
---




# rankCorr

ランク相関係数を計算します。

**構文**

```sql
rankCorr(x, y)
```

**引数**

- `x` — 任意の値。[Float32](/sql-reference/data-types/float) または [Float64](/sql-reference/data-types/float)。
- `y` — 任意の値。[Float32](/sql-reference/data-types/float) または [Float64](/sql-reference/data-types/float)。


**返される値**

- x および y のランクのランク相関係数を返します。相関係数の値は -1 から +1 までの範囲です。引数が2つ未満の場合、この関数は例外を返します。+1 に近い値は高い線形関係を示し、1つのランダム変数が増加すると、2つ目のランダム変数も増加します。-1 に近い値は高い線形関係を示し、1つのランダム変数が増加すると、2つ目のランダム変数は減少します。0 に近いか等しい値は、2つのランダム変数間に関係がないことを示します。

タイプ: [Float64](/sql-reference/data-types/float)です。

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
**関連項目**

- [スピアマンのランク相関係数](https://en.wikipedia.org/wiki/Spearman%27s_rank_correlation_coefficient)
