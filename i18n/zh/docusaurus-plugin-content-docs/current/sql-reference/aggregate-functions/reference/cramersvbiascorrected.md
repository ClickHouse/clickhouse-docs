---
'description': 'Calculates Cramer''s V, but uses a bias correction.'
'sidebar_position': 128
'slug': '/sql-reference/aggregate-functions/reference/cramersvbiascorrected'
'title': 'cramersVBiasCorrected'
---




# cramersVBiasCorrected

Cramer's V 是一个用于测量表中两列之间关联性的指标。[`cramersV` 函数](./cramersv.md) 的结果范围从 0（对应变量之间没有关联）到 1，仅当每个值完全由另一个值决定时才能达到 1。该函数可能存在较大的偏差，因此此版本的 Cramer's V 使用了 [偏差修正](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V#Bias_correction)。

**语法**

```sql
cramersVBiasCorrected(column1, column2)
```

**参数**

- `column1`: 需要比较的第一列。
- `column2`: 需要比较的第二列。

**返回值**

- 介于 0（对应于列值之间没有关联）和 1（完全关联）之间的值。

类型：始终为 [Float64](../../../sql-reference/data-types/float.md)。

**示例**

下面比较的两列之间关联性较小。注意 `cramersVBiasCorrected` 的结果小于 `cramersV` 的结果：

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
