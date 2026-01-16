---
slug: '/examples/aggregate-function-combinators/sumForEach'
title: 'sumForEach'
description: 'sumForEach 聚合函数使用示例'
keywords: ['sum', 'ForEach', 'combinator', 'examples', 'sumForEach']
sidebar_label: 'sumForEach'
doc_type: 'reference'
---

# sumForEach \\{#sumforeach\\}

## 描述 \\{#description\\}

[`ForEach`](/sql-reference/aggregate-functions/combinators#-foreach) 组合器
可以应用到 [`sum`](/sql-reference/aggregate-functions/reference/sum) 聚合函数上，将其从在行值上进行计算的聚合函数转换为在数组列上进行计算的聚合函数，对数组中每个元素在跨行的数据上分别进行聚合。

## 示例用法 \\{#example-usage\\}

在本示例中，我们将使用在我们的 [SQL playground](https://sql.clickhouse.com/) 中提供的 `hits` 数据集。

`hits` 表包含一个名为 `isMobile` 的 UInt8 类型列，其中桌面端为 `0`，移动端为 `1`：

```sql runnable
SELECT EventTime, IsMobile FROM metrica.hits ORDER BY rand() LIMIT 10
```

我们将使用 `sumForEach` 聚合组合器函数来分析一天中各个小时桌面端与移动端流量的变化情况。点击下方播放按钮以交互方式运行查询：

```sql runnable
SELECT
    toHour(EventTime) AS hour_of_day,
    -- 使用 sumForEach 一次性统计桌面端和移动端的访问量
    sumForEach([
        IsMobile = 0, -- 桌面端访问量 (IsMobile = 0)
        IsMobile = 1  -- 移动端访问量 (IsMobile = 1)
    ]) AS device_counts
FROM metrica.hits
GROUP BY hour_of_day
ORDER BY hour_of_day;
```

## 另请参阅 \\{#see-also\\}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`ForEach` 组合器](/sql-reference/aggregate-functions/combinators#-foreach)
