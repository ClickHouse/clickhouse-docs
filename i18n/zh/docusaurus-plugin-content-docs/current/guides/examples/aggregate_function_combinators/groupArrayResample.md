---
slug: '/examples/aggregate-function-combinators/groupArrayResample'
title: 'groupArrayResample'
description: '将 Resample 组合子用于 groupArray 的示例'
keywords: ['groupArray', 'Resample', 'combinator', 'examples', 'groupArrayResample']
sidebar_label: 'groupArrayResample'
doc_type: 'reference'
---



# groupArrayResample {#grouparrayresample}


## 描述 {#description}

[`Resample`](/sql-reference/aggregate-functions/combinators#-resample) 组合器可应用于 [`groupArray`](/sql-reference/aggregate-functions/reference/sum) 聚合函数,将指定键列的范围划分为固定数量的区间(`N`),并从落入每个区间的数据点中选择一个代表值(对应最小键)来构造结果数组。它创建数据的降采样视图,而非收集所有值。


## 使用示例 {#example-usage}

让我们看一个示例。我们将创建一个包含员工的 `name`（姓名）、`age`（年龄）和 `wage`（工资）的表,并向其中插入一些数据:

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

让我们获取年龄位于 `[30,60)` 和 `[60,75)` 区间内的人员姓名。由于我们使用整数表示年龄,因此实际获取的是 `[30, 59]` 和 `[60,74]` 区间内的年龄。

要将姓名聚合到数组中,我们使用 `groupArray` 聚合函数。它接受一个参数。在本例中,该参数是 name 列。`groupArrayResample` 函数使用 age 列按年龄聚合姓名。为了定义所需的区间,我们将 `30`、`75`、`30` 作为参数传递给 `groupArrayResample` 函数:

```sql
SELECT groupArrayResample(30, 75, 30)(name, age) FROM employee_data
```

```response
┌─groupArrayResample(30, 75, 30)(name, age)─────┐
│ [['Alice','Mary','Evelyn'],['David','Brian']] │
└───────────────────────────────────────────────┘
```


## 另请参阅 {#see-also}

- [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`Resample combinator`](/sql-reference/aggregate-functions/combinators#-resample)
