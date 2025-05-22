
# rankCorr

计算排名相关系数。

**语法**

```sql
rankCorr(x, y)
```

**参数**

- `x` — 任意值。 [Float32](/sql-reference/data-types/float) 或 [Float64](/sql-reference/data-types/float)。
- `y` — 任意值。 [Float32](/sql-reference/data-types/float) 或 [Float64](/sql-reference/data-types/float)。

**返回值**

- 返回 x 和 y 的排名相关系数。相关系数的值范围从 -1 到 +1。如果传递的参数少于两个，将会抛出异常。接近 +1 的值表示高度线性关系，并且随着一个随机变量的增加，第二个随机变量也增加。接近 -1 的值表示高度线性关系，并且随着一个随机变量的增加，第二个随机变量减少。接近或等于 0 的值表示两个随机变量之间没有关系。

类型: [Float64](/sql-reference/data-types/float)。

**示例**

查询：

```sql
SELECT rankCorr(number, number) FROM numbers(100);
```

结果：

```text
┌─rankCorr(number, number)─┐
│                        1 │
└──────────────────────────┘
```

查询：

```sql
SELECT roundBankers(rankCorr(exp(number), sin(number)), 3) FROM numbers(100);
```

结果：

```text
┌─roundBankers(rankCorr(exp(number), sin(number)), 3)─┐
│                                              -0.037 │
└─────────────────────────────────────────────────────┘
```
**另见**

- [斯皮尔曼等级相关系数](https://en.wikipedia.org/wiki/Spearman%27s_rank_correlation_coefficient)
