
# cramersV

[Cramer's V](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V)（有时称为 Cramer's phi）是一个度量表中两列之间关联性的指标。 `cramersV` 函数的结果范围从 0（对应于变量之间没有关联）到 1，当每个值完全由另一个值决定时可以达到 1。它可以被视为两变量之间关联性的百分比，相对于它们可能的最大变化。

:::note
有关 Cramer's V 的偏差修正版本，请参见：[cramersVBiasCorrected](./cramersvbiascorrected.md)
:::

**语法**

```sql
cramersV(column1, column2)
```

**参数**

- `column1`：要比较的第一列。
- `column2`：要比较的第二列。

**返回值**

- 一个介于 0（对应于列值之间没有关联）和 1（完全关联）之间的值。

类型：始终为 [Float64](../../../sql-reference/data-types/float.md)。

**示例**

下面比较的两列彼此之间没有关联，因此 `cramersV` 的结果为 0：

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

以下两个列之间具有相当紧密的关联，因此 `cramersV` 的结果是一个较高的值：

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
