---
slug: '/examples/aggregate-function-combinators/sumForEach'
title: 'sumForEach'
description: 'sumForEach 聚合函数的使用示例'
keywords: ['sum', 'ForEach', 'combinator', 'examples', 'sumForEach']
sidebar_label: 'sumForEach'
doc_type: 'reference'
---



# sumForEach {#sumforeach}


## 描述 {#description}

[`ForEach`](/sql-reference/aggregate-functions/combinators#-foreach) 组合器可应用于 [`sum`](/sql-reference/aggregate-functions/reference/sum) 聚合函数,将其从操作行值的聚合函数转换为操作数组列的聚合函数,对跨行数组中的每个元素应用聚合操作。


## 使用示例 {#example-usage}

在本示例中,我们将使用 [SQL playground](https://sql.clickhouse.com/) 中的 `hits` 数据集。

`hits` 表包含一个名为 `isMobile` 的 UInt8 类型列,其值为 `0` 表示桌面设备,`1` 表示移动设备:

```sql runnable
SELECT EventTime, IsMobile FROM metrica.hits ORDER BY rand() LIMIT 10
```

我们将使用 `sumForEach` 聚合组合器函数来分析桌面设备与移动设备的流量在一天中各小时的变化情况。点击下方的播放按钮以交互方式运行查询:

```sql runnable
SELECT
    toHour(EventTime) AS hour_of_day,
    -- 使用 sumForEach 在一次遍历中统计桌面设备和移动设备的访问量
    sumForEach([
        IsMobile = 0, -- 桌面设备访问 (IsMobile = 0)
        IsMobile = 1  -- 移动设备访问 (IsMobile = 1)
    ]) AS device_counts
FROM metrica.hits
GROUP BY hour_of_day
ORDER BY hour_of_day;
```


## 另请参阅 {#see-also}

- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`ForEach` 组合器](/sql-reference/aggregate-functions/combinators#-foreach)
