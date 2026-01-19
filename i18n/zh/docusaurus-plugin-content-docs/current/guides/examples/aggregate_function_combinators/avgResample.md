---
slug: '/examples/aggregate-function-combinators/avgResample'
title: 'avgResample'
description: '使用 Resample 组合器与 avg 的示例'
keywords: ['avg', 'Resample', 'combinator', 'examples', 'avgResample']
sidebar_label: 'avgResample'
doc_type: 'reference'
---

# countResample \{#countResample\}

## 描述 \{#description\}

[`Resample`](/sql-reference/aggregate-functions/combinators#-resample) 
组合器可以应用于 [`count`](/sql-reference/aggregate-functions/reference/count)
聚合函数，用于在固定数量的区间（`N`）内统计指定键列的取值次数。

## 示例用法 \{#example-usage\}

### 基本示例 \{#basic-example\}

来看一个示例。我们将创建一张包含员工 `name`、`age` 和 `wage` 的表，并向其中插入一些数据：

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

我们来计算年龄落在区间 `[30,60)` 和 `[60,75)`（`[` 为不包含，`)` 为包含）人群的平均工资。由于我们使用整数来表示年龄，实际得到的年龄区间为 `[30, 59]` 和 `[60,74]`。为此，我们对 `avg` 聚合函数应用 `Resample` 组合器。

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

## 另请参阅 \{#see-also\}
- [`count`](/sql-reference/aggregate-functions/reference/count)
- [`Resample combinator`](/sql-reference/aggregate-functions/combinators#-resample)
