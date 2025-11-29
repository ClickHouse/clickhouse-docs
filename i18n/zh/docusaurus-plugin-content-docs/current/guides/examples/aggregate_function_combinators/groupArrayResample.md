---
slug: '/examples/aggregate-function-combinators/groupArrayResample'
title: 'groupArrayResample'
description: '在 groupArray 中使用 Resample 组合器的示例'
keywords: ['groupArray', 'Resample', 'combinator', 'examples', 'groupArrayResample']
sidebar_label: 'groupArrayResample'
doc_type: 'reference'
---



# groupArrayResample {#grouparrayresample}



## 描述 {#description}

可以将 [`Resample`](/sql-reference/aggregate-functions/combinators#-resample) 
组合器应用于 [`groupArray`](/sql-reference/aggregate-functions/reference/sum) 聚合函数，
将指定键列的取值范围划分为固定数量的区间（`N`），
并通过从落入每个区间的数据点中选取一个代表值
（对应最小键）来构造结果数组。
它生成的是数据的降采样视图，而非收集所有取值。



## 示例用法 {#example-usage}

我们来看一个示例。我们将创建一个包含员工 `name`、`age` 和 `wage` 的表，并向其中插入一些数据：

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

让我们获取那些年龄落在 `[30,60)` 和 `[60,75)` 区间内的人的姓名。由于我们对年龄使用整数表示，因此实际覆盖的年龄区间是 `[30, 59]` 和 `[60,74]`。

要将姓名聚合到一个数组中，我们使用 `groupArray` 聚合函数。它只接受一个参数，在我们的例子中，这个参数是 `name` 列。`groupArrayResample` 函数应当使用 `age` 列按年龄聚合姓名。为了定义所需的区间，我们向 `groupArrayResample` 函数传入 `30`、`75`、`30` 作为参数：

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
