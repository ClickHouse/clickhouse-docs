---
'slug': '/examples/aggregate-function-combinators/avgResample'
'title': 'avgResample'
'description': '使用 avg 的 Resample 组合器示例'
'keywords':
- 'avg'
- 'Resample'
- 'combinator'
- 'examples'
- 'avgResample'
'sidebar_label': 'avgResample'
---


# countResample {#countResample}

## 描述 {#description}

[`Resample`](/sql-reference/aggregate-functions/combinators#-resample) 
组合器可以应用于[`count`](/sql-reference/aggregate-functions/reference/count)
聚合函数，以计算指定键列在固定数量的区间（`N`）中的值。

## 示例用法 {#example-usage}

### 基本示例 {#basic-example}

我们来看一个示例。我们将创建一个表，该表包含员工的`name`、`age` 和
`wage`，并插入一些数据：

```sql
CREATE TABLE employee_data 
(
    name String,
    age UInt8,
    wage Float32
) 
ENGINE = MergeTree()
ORDER BY tuple()

INSERT INTO employee_data (name, age, wage) VALUES
    ('John', 16, 10.0),
    ('Alice', 30, 15.0),
    ('Mary', 35, 8.0),
    ('Evelyn', 48, 11.5),
    ('David', 62, 9.9),
    ('Brian', 60, 16.0);
```

让我们获取年龄在区间 `[30,60)` 
和 `[60,75)`（`[` 是排他性的，`)` 是包含性的）中的人的平均工资。由于我们使用整数 
表示年龄，我们得到年龄在区间 `[30, 59]` 和 `[60,74]`。 
为此，我们将`Resample` 组合器应用于 `avg` 聚合函数。

```sql
WITH avg_wage AS
(
    SELECT avgResample(30, 75, 30)(wage, age) AS original_avg_wage
    FROM employee_data
)
SELECT
    arrayMap(x -> round(x, 3), original_avg_wage) AS avg_wage_rounded
FROM avg_wage;
```

```response
┌─avg_wage_rounded─┐
│ [11.5,12.95]     │
└──────────────────┘
```

## 另请参阅 {#see-also}
- [`count`](/sql-reference/aggregate-functions/reference/count)
- [`Resample combinator`](/sql-reference/aggregate-functions/combinators#-resample)
