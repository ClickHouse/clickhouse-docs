---
'description': '关于 lag 窗口函数的文档'
'sidebar_label': 'lag'
'sidebar_position': 9
'slug': '/sql-reference/window-functions/lag'
'title': '延迟'
'doc_type': 'reference'
---


# lag

返回在有序框架内，当前行之前的指定物理偏移所评估的值。
此函数类似于 [`lagInFrame`](./lagInFrame.md)，但始终使用 `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` 框架。

**语法**

```sql
lag(x[, offset[, default]])
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

有关窗口函数语法的更多详细信息，请参见：[窗口函数 - 语法](./index.md/#syntax)。

**参数**

- `x` — 列名。
- `offset` — 要应用的偏移量。[(U)Int*](../data-types/int-uint.md)。 （可选 - 默认值为 `1`）。
- `default` — 如果计算的行超过窗口框架的边界，则返回的值。 （可选 - 省略时默认为列类型的默认值）。

**返回值**

- 在有序框架内，当前行之前的指定物理偏移所评估的值。

**示例**

此示例查看特定股票的历史数据，并使用 `lag` 函数计算每天的增量和股价收盘价的百分比变化。

```sql title="Query"
CREATE TABLE stock_prices
(
    `date`   Date,
    `open`   Float32, -- opening price
    `high`   Float32, -- daily high
    `low`    Float32, -- daily low
    `close`  Float32, -- closing price
    `volume` UInt32   -- trade volume
)
Engine = Memory;

INSERT INTO stock_prices FORMAT Values
    ('2024-06-03', 113.62, 115.00, 112.00, 115.00, 438392000),
    ('2024-06-04', 115.72, 116.60, 114.04, 116.44, 403324000),
    ('2024-06-05', 118.37, 122.45, 117.47, 122.44, 528402000),
    ('2024-06-06', 124.05, 125.59, 118.32, 121.00, 664696000),
    ('2024-06-07', 119.77, 121.69, 118.02, 120.89, 412386000);
```

```sql title="Query"
SELECT
    date,
    close,
    lag(close, 1, close) OVER (ORDER BY date ASC) AS previous_day_close,
    COALESCE(ROUND(close - previous_day_close, 2)) AS delta,
    COALESCE(ROUND((delta / previous_day_close) * 100, 2)) AS percent_change
FROM stock_prices
ORDER BY date DESC
```

```response title="Response"
   ┌───────date─┬──close─┬─previous_day_close─┬─delta─┬─percent_change─┐
1. │ 2024-06-07 │ 120.89 │                121 │ -0.11 │          -0.09 │
2. │ 2024-06-06 │    121 │             122.44 │ -1.44 │          -1.18 │
3. │ 2024-06-05 │ 122.44 │             116.44 │     6 │           5.15 │
4. │ 2024-06-04 │ 116.44 │                115 │  1.44 │           1.25 │
5. │ 2024-06-03 │    115 │                115 │     0 │              0 │
   └────────────┴────────┴────────────────────┴───────┴────────────────┘
```
