---
'slug': '/examples/aggregate-function-combinators/sumForEach'
'title': 'sumForEach'
'description': '使用 sumArray 组合器的示例'
'keywords':
- 'sum'
- 'array'
- 'combinator'
- 'examples'
- 'sumArray'
'sidebar_label': 'sumArray'
---


# sumArray {#sumforeach}

## Description {#description}

[`ForEach`](/sql-reference/aggregate-functions/combinators#-foreach) 组合器可以应用于 [`sum`](/sql-reference/aggregate-functions/reference/sum) 聚合函数，将其从作用于行值的聚合函数转变为作用于数组列的聚合函数，应用聚合到每行数组中的每个元素。

## Example Usage {#example-usage}

在这个例子中，我们将使用在我们的 [SQL playground](https://sql.clickhouse.com/) 中可用的 `hits` 数据集。

`hits` 表包含一个名为 `isMobile` 的 UInt8 类型列，可能为 `0` 表示桌面，或 `1` 表示移动设备：

```sql runnable
SELECT EventTime, IsMobile FROM metrica.hits ORDER BY rand() LIMIT 10
```

我们将使用 `sumForEach` 聚合组合器函数来分析桌面与移动流量随一天的每小时变化。点击下面的播放按钮以交互方式运行查询：

```sql runnable
SELECT
    toHour(EventTime) AS hour_of_day,
    -- Use sumForEach to count desktop and mobile visits in one pass
    sumForEach([
        IsMobile = 0, -- Desktop visits (IsMobile = 0)
        IsMobile = 1  -- Mobile visits (IsMobile = 1)
    ]) AS device_counts
FROM metrica.hits
GROUP BY hour_of_day
ORDER BY hour_of_day;
```

## See also {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`ForEach combinator`](/sql-reference/aggregate-functions/combinators#-foreach)
