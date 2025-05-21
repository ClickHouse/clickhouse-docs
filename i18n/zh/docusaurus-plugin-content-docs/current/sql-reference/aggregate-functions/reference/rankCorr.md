---
'description': '计算排名相关系数'
'sidebar_position': 182
'slug': '/sql-reference/aggregate-functions/reference/rankCorr'
'title': 'rankCorr'
---




# rankCorr

计算秩相关系数。

**语法**

```sql
rankCorr(x, y)
```

**参数**

- `x` — 任意值。 [Float32](/sql-reference/data-types/float) 或 [Float64](/sql-reference/data-types/float)。
- `y` — 任意值。 [Float32](/sql-reference/data-types/float) 或 [Float64](/sql-reference/data-types/float)。

**返回值**

- 返回 x 和 y 的秩相关系数。相关系数的值范围从 -1 到 +1。如果传递的参数少于两个，函数将返回异常。值接近 +1 表示高度线性关系，随着一个随机变量的增加，另一个随机变量也增加。值接近 -1 表示高度线性关系，随着一个随机变量的增加，另一个随机变量减少。值接近或等于 0 表示两个随机变量之间没有关系。

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
**另请参阅**

- [斯皮尔曼秩相关系数](https://en.wikipedia.org/wiki/Spearman%27s_rank_correlation_coefficient)
