---
slug: '/examples/aggregate-function-combinators/countResample'
title: 'countResample'
description: '将 Resample 组合器与 count 一起使用的示例'
keywords: ['count', 'Resample', 'combinator', '示例', 'countResample']
sidebar_label: 'countResample'
doc_type: 'reference'
---

# countResample \{#countResample\}

## 描述 \{#description\}

可以将 [`Resample`](/sql-reference/aggregate-functions/combinators#-resample) 
组合器应用到 [`count`](/sql-reference/aggregate-functions/reference/count)
聚合函数上，以在固定数量（`N`）的区间内统计指定键列的值的数量。

## 示例用法 \{#example-usage\}

### 基本示例 \{#basic-example\}

我们来看一个示例。我们将创建一个包含员工 `name`、`age` 和
`wage` 字段的表，并向其中插入一些数据：

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

让我们统计所有年龄落在区间 `[30,60)` 和 `[60,75)` 内的人数。由于我们使用整数来表示年龄，因此实际得到的是 `[30, 59]` 和 `[60,74]` 这两个区间的年龄。为此，我们对 `count` 使用 `Resample` 组合器。

```sql
SELECT countResample(30, 75, 30)(name, age) AS amount FROM employee_data
```

```response
┌─amount─┐
│ [3,2]  │
└────────┘
```

## 另请参阅 \{#see-also\}
- [`count`](/sql-reference/aggregate-functions/reference/count)
- [`Resample combinator`](/sql-reference/aggregate-functions/combinators#-resample)
