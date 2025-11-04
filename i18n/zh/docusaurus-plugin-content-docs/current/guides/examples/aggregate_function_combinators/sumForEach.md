---
'slug': '/examples/aggregate-function-combinators/sumForEach'
'title': 'sumForEach'
'description': '使用 sumForEach 聚合函数的示例'
'keywords':
- 'sum'
- 'ForEach'
- 'combinator'
- 'examples'
- 'sumForEach'
'sidebar_label': 'sumForEach'
'doc_type': 'reference'
---


# sumForEach {#sumforeach}

## Description {#description}

[`ForEach`](/sql-reference/aggregate-functions/combinators#-foreach) 组合器可以应用于 [`sum`](/sql-reference/aggregate-functions/reference/sum) 聚合函数，将其从一个操作行值的聚合函数转变为一个操作数组列的聚合函数，在跨行的每个元素上应用聚合。

## Example usage {#example-usage}

在这个例子中，我们将利用我们 [SQL playground](https://sql.clickhouse.com/) 中提供的 `hits` 数据集。

`hits` 表包含一个名为 `isMobile` 的 UInt8 类型列，可以是 `0` 表示桌面或 `1` 表示移动设备：

```sql runnable
SELECT EventTime, IsMobile FROM metrica.hits ORDER BY rand() LIMIT 10
```

我们将使用 `sumForEach` 聚合组合器函数来分析桌面与移动流量如何按小时变化。点击下面的播放按钮以交互方式运行查询：

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
- [`ForEach` combinator](/sql-reference/aggregate-functions/combinators#-foreach)
