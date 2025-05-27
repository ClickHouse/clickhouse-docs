---
'description': '`cramersV` 函数的结果范围从 0（对应于变量之间没有关联）到 1，并且仅当每个值完全由另一个值决定时才能达到 1。它可以被视为两个变量之间的关联作为其最大可能变化的百分比。'
'sidebar_position': 127
'slug': '/sql-reference/aggregate-functions/reference/cramersv'
'title': 'cramersV'
---


# cramersV

[Cramer's V](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V)（有时称为 Cramer's phi）是一个衡量表中两列之间关联性的指标。`cramersV` 函数的结果范围从 0（表示变量之间没有关联）到 1，只有当每个值完全由另一个值决定时，结果才能达到 1。它可以被视为两个变量之间的关联程度，占其最大可能变化的百分比。

:::note
有关 Cramer's V 的偏差修正版本，请参见：[cramersVBiasCorrected](./cramersvbiascorrected.md)
:::

**语法**

```sql
cramersV(column1, column2)
```

**参数**

- `column1`: 第一个要比较的列。
- `column2`: 第二个要比较的列。

**返回值**

- 一个值在 0（对应于列值之间没有关联）到 1（完全关联）之间。

类型：始终是 [Float64](../../../sql-reference/data-types/float.md)。

**示例**

下面比较的两个列之间没有关联，因此 `cramersV` 的结果为 0：

查询：

```sql
SELECT
    cramersV(a, b)
FROM
    (
        SELECT
            number % 3 AS a,
            number % 5 AS b
        FROM
            numbers(150)
    );
```

结果：

```response
┌─cramersV(a, b)─┐
│              0 │
└────────────────┘
```

以下两个列之间的关联相当密切，因此 `cramersV` 的结果为较高的值：

```sql
SELECT
    cramersV(a, b)
FROM
    (
        SELECT
            number % 10 AS a,
            number % 5 AS b
        FROM
            numbers(150)
    );
```

结果：

```response
┌─────cramersV(a, b)─┐
│ 0.8944271909999159 │
└────────────────────┘
```
