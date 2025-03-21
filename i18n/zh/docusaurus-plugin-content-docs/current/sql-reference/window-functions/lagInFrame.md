---
slug: /sql-reference/window-functions/lagInFrame
sidebar_label: lagInFrame
sidebar_position: 9
---


# lagInFrame

返回在有序框架内当前行之前指定物理偏移行处评估的值。

:::warning
`lagInFrame` 的行为与标准 SQL 的 `lag` 窗口函数不同。
Clickhouse 窗口函数 `lagInFrame` 遵循窗口框架。
要获得与 `lag` 相同的行为，请使用 `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`。
:::

**语法**

```sql
lagInFrame(x[, offset[, default]])
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

有关窗口函数语法的更多详细信息，请参见: [Window Functions - Syntax](./index.md/#syntax).

**参数**
- `x` — 列名称。
- `offset` — 应用的偏移量。[(U)Int*](../data-types/int-uint.md)。 （可选 - 默认值为`1`）。
- `default` — 如果计算的行超出窗口框架的边界，则返回的值。 （可选 - 略去时默认为列类型的默认值）。

**返回值**

- 在有序框架内指定物理偏移行之前评估的值。

**示例**

该示例查看某个特定股票的历史数据，并使用 `lagInFrame` 函数计算股票收盘价的逐日变化和百分比变化。

查询：

```sql
CREATE TABLE stock_prices
(
    `date`   Date,
    `open`   Float32, -- 开盘价
    `high`   Float32, -- 日内最高价
    `low`    Float32, -- 日内最低价
    `close`  Float32, -- 收盘价
    `volume` UInt32   -- 成交量
)
Engine = Memory;

INSERT INTO stock_prices FORMAT Values
    ('2024-06-03', 113.62, 115.00, 112.00, 115.00, 438392000),
    ('2024-06-04', 115.72, 116.60, 114.04, 116.44, 403324000),
    ('2024-06-05', 118.37, 122.45, 117.47, 122.44, 528402000),
    ('2024-06-06', 124.05, 125.59, 118.32, 121.00, 664696000),
    ('2024-06-07', 119.77, 121.69, 118.02, 120.89, 412386000);
```

```sql
SELECT
    date,
    close,
    lagInFrame(close, 1, close) OVER (ORDER BY date ASC
       ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
     ) AS previous_day_close,
    COALESCE(ROUND(close - previous_day_close, 2)) AS delta,
    COALESCE(ROUND((delta / previous_day_close) * 100, 2)) AS percent_change
FROM stock_prices
ORDER BY date DESC
```

结果：

```response
   ┌───────date─┬──close─┬─previous_day_close─┬─delta─┬─percent_change─┐
1. │ 2024-06-07 │ 120.89 │                121 │ -0.11 │          -0.09 │
2. │ 2024-06-06 │    121 │             122.44 │ -1.44 │          -1.18 │
3. │ 2024-06-05 │ 122.44 │             116.44 │     6 │           5.15 │
4. │ 2024-06-04 │ 116.44 │                115 │  1.44 │           1.25 │
5. │ 2024-06-03 │    115 │                115 │     0 │              0 │
   └────────────┴────────┴────────────────────┴───────┴────────────────┘
```
