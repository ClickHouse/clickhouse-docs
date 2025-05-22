
# sumArray {#sumforeach}

## 描述 {#description}

[`ForEach`](/sql-reference/aggregate-functions/combinators#-foreach) 组合器可以应用于 [`sum`](/sql-reference/aggregate-functions/reference/sum) 聚合函数，将其从一个作用于行值的聚合函数转换为一个作用于数组列的聚合函数，在多个行的数组中对每个元素应用聚合。

## 示例用法 {#example-usage}

在这个示例中，我们将使用在我们的 [SQL playground](https://sql.clickhouse.com/) 中可用的 `hits` 数据集。

`hits` 表包含一列名为 `isMobile` 的 UInt8 类型列，可能为 `0`（桌面）或 `1`（移动）：

```sql runnable
SELECT EventTime, IsMobile FROM metrica.hits ORDER BY rand() LIMIT 10
```

我们将使用 `sumForEach` 聚合组合器函数来分析桌面和移动流量如何随时间变化。点击下面的播放按钮以交互方式运行查询：

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

## 另请参见 {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`ForEach combinator`](/sql-reference/aggregate-functions/combinators#-foreach)
