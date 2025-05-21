---
'slug': '/examples/aggregate-function-combinators/countResample'
'title': 'countResample'
'description': '使用Resample组合器与count的示例'
'keywords':
- 'count'
- 'Resample'
- 'combinator'
- 'examples'
- 'countResample'
'sidebar_label': 'countResample'
---




# countResample {#countResample}

## Description {#description}

[`Resample`](/sql-reference/aggregate-functions/combinators#-resample) 
组合器可以被应用于[`count`](/sql-reference/aggregate-functions/reference/count)
聚合函数，以在固定数量的区间（`N`）中计算指定键列的值。

## Example Usage {#example-usage}

### Basic example {#basic-example}

让我们看一个例子。我们将创建一个包含员工的`name`、`age`和
`wage`的表，并向其中插入一些数据：

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

让我们计算年龄在区间`[30,60)` 
和`[60,75)`中的所有人。由于我们使用整数表示年龄，因此我们得到的年龄在
`[30, 59]`和`[60,74]`区间内。为此，我们将`Resample`组合器 
应用于`count`

```sql
SELECT countResample(30, 75, 30)(name, age) AS amount FROM employee_data
```

```response
┌─amount─┐
│ [3,2]  │
└────────┘
```

## See also {#see-also}
- [`count`](/sql-reference/aggregate-functions/reference/count)
- [`Resample combinator`](/sql-reference/aggregate-functions/combinators#-resample)
