
# cramersVBiasCorrected

Cramer's V 是一个用于衡量表中两个列之间关联度的指标。 [`cramersV` 函数](./cramersv.md) 的结果范围从 0（对应于变量之间没有关联）到 1，只有在每个值完全由另一个值决定时才能达到 1。该函数可能受到较大偏差，因此此版本的 Cramer's V 使用了 [偏差修正](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V#Bias_correction)。

**语法**

```sql
cramersVBiasCorrected(column1, column2)
```

**参数**

- `column1`: 要比较的第一个列。
- `column2`: 要比较的第二个列。

**返回值**

- 一个值在 0（对应于列值之间没有关联）到 1（完全关联）之间。

类型：始终为 [Float64](../../../sql-reference/data-types/float.md)。

**示例**

下面比较的两个列之间的关联度较小。注意 `cramersVBiasCorrected` 的结果小于 `cramersV` 的结果：

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
