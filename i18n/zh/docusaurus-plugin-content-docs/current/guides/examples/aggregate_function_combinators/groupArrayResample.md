
# groupArrayResample {#grouparrayresample}

## Description {#description}

[`Resample`](/sql-reference/aggregate-functions/combinators#-resample) 
组合器可以应用于[`groupArray`](/sql-reference/aggregate-functions/reference/sum) 聚合函数，以将指定键列的范围划分为固定数量的区间（`N`），并通过从落入每个区间的数据点中选择一个代表性值（对应于最小的键）来构建结果数组。它创建了数据的一个降采样视图，而不是收集所有值。

## Example Usage {#example-usage}

让我们看一个例子。我们将创建一个包含员工的 `name`、`age` 和 `wage` 的表，并向其中插入一些数据：

```sql
CREATE TABLE employee_data 
(
    name String,
    age UInt8,
    wage Float32
) ENGINE = MergeTree()
ORDER BY tuple()

INSERT INTO employee_data (name, age, wage) VALUES
    ('John', 16, 10.0),
    ('Alice', 30, 15.0),
    ('Mary', 35, 8.0),
    ('Evelyn', 48, 11.5),
    ('David', 62, 9.9),
    ('Brian', 60, 16.0);
```

让我们获取年龄位于区间 `[30,60)` 和 `[60,75)` 的人的姓名。由于我们使用整数表示年龄，所以我们得到了年龄在 `[30, 59]` 和 `[60,74]` 区间。

为了将姓名聚合到一个数组中，我们使用 `groupArray` 聚合函数。它接受一个参数。在我们的例子中，它是姓名列。`groupArrayResample` 函数应该使用年龄列按年龄聚合姓名。为了定义所需的区间，我们将 `30`、`75` 和 `30` 作为参数传递给 `groupArrayResample` 函数：

```sql
SELECT groupArrayResample(30, 75, 30)(name, age) FROM employee_data
```

```response
┌─groupArrayResample(30, 75, 30)(name, age)─────┐
│ [['Alice','Mary','Evelyn'],['David','Brian']] │
└───────────────────────────────────────────────┘
```

## See also {#see-also}
- [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`Resample combinator`](/sql-reference/aggregate-functions/combinators#-resample)
