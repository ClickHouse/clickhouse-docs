---
slug: '/examples/aggregate-function-combinators/countResample'
title: 'countResample'
description: '使用 Resample 组合器配合 count 的示例'
keywords: ['count', 'Resample', 'combinator', 'examples', 'countResample']
sidebar_label: 'countResample'
doc_type: 'reference'
---



# countResample {#countResample}


## 描述 {#description}

[`Resample`](/sql-reference/aggregate-functions/combinators#-resample) 组合器可应用于 [`count`](/sql-reference/aggregate-functions/reference/count) 聚合函数，以在固定数量的区间（`N`）内对指定键列的值进行计数。


## 使用示例 {#example-usage}

### 基础示例 {#basic-example}

让我们看一个示例。我们将创建一个包含员工 `name`、`age` 和 `wage` 的表,并向其中插入一些数据:

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

让我们统计年龄位于 `[30,60)` 和 `[60,75)` 区间内的所有人员。由于我们使用整数表示年龄,因此得到的年龄区间为 `[30, 59]` 和 `[60,74]`。为此,我们将 `Resample` 组合器应用于 `count`:

```sql
SELECT countResample(30, 75, 30)(name, age) AS amount FROM employee_data
```

```response
┌─amount─┐
│ [3,2]  │
└────────┘
```


## 另请参阅 {#see-also}

- [`count`](/sql-reference/aggregate-functions/reference/count)
- [`Resample 组合器`](/sql-reference/aggregate-functions/combinators#-resample)
