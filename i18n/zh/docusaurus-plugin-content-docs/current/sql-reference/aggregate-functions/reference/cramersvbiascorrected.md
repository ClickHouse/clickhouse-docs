---
'description': '计算 Cramer''s V，但使用偏差修正。'
'sidebar_position': 128
'slug': '/sql-reference/aggregate-functions/reference/cramersvbiascorrected'
'title': 'cramersVBiasCorrected'
---


# cramersVBiasCorrected

Cramer's V 是一个衡量表中两列之间关联性的指标。[`cramersV` 函数](./cramersv.md)的结果范围从 0（对应于变量之间没有关联）到 1，只有在每个值完全由另一个值确定时，结果才能达到 1。该函数可能会受到严重偏倚，因此这个版本的 Cramer's V 使用了 [偏倚校正](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V#Bias_correction)。

**语法**

```sql
cramersVBiasCorrected(column1, column2)
```

**参数**

- `column1`: 第一个待比较的列。
- `column2`: 第二个待比较的列。

**返回值**

- 一个介于 0（表示列值之间没有关联）到 1（完全关联）之间的值。

类型：始终为 [Float64](../../../sql-reference/data-types/float.md)。

**示例**

下面比较的两个列之间关联性较小。请注意 `cramersVBiasCorrected` 的结果小于 `cramersV` 的结果：

查询：

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

结果：

```response
┌──────cramersV(a, b)─┬─cramersVBiasCorrected(a, b)─┐
│ 0.41171788506213564 │         0.33369281784141364 │
└─────────────────────┴─────────────────────────────┘
```
