---
slug: '/examples/aggregate-function-combinators/sumIf'
title: 'sumIf'
description: 'sumIf 组合器的使用示例'
keywords: ['sum', 'if', '组合器', '示例', 'sumIf']
sidebar_label: 'sumIf'
doc_type: 'reference'
---



# sumIf {#sumif}



## 描述 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) 组合器可以应用于 [`sum`](/sql-reference/aggregate-functions/reference/sum)
函数，使用 `sumIf` 聚合组合器函数计算条件为 true 的行的值之和。



## 示例用法 {#example-usage}

在这个示例中，我们将创建一个用于存储包含成功标记的销售数据表，
并使用 `sumIf` 来计算所有成功交易的销售总金额。

```sql title="Query"
创建表 sales(
    transaction_id UInt32,
    amount Decimal(10,2),
    is_successful UInt8
) 引擎 = Log;

INSERT INTO sales VALUES
    (1, 100.50, 1),
    (2, 200.75, 1),
    (3, 150.25, 0),
    (4, 300.00, 1),
    (5, 250.50, 0),
    (6, 175.25, 1);

SELECT
    sumIf(amount, is_successful = 1) AS total_successful_sales
FROM sales;
```

`sumIf` 函数只会对 `is_successful = 1` 的记录对应金额进行求和。
在本例中，它会对以下数值求和：100.50 + 200.75 + 300.00 + 175.25。

```response title="Response"
   ┌─total_successful_sales─┐
1. │                  776.50 │
   └───────────────────────┘
```

### 按价格走势计算交易量 {#calculate-trading-vol-price-direction}

在本示例中，我们将使用 [ClickHouse playground](https://sql.clickhouse.com/) 中提供的 `stock` 表，
来计算 2002 年上半年按价格走势划分的交易量。

```sql title="Query"
SELECT 
    toStartOfMonth(date) AS month,
    formatReadableQuantity(sumIf(volume, price > open)) AS 上涨日成交量,
    formatReadableQuantity(sumIf(volume, price < open)) AS 下跌日成交量,
    formatReadableQuantity(sumIf(volume, price = open)) AS 平盘日成交量,
    formatReadableQuantity(sum(volume)) AS 总成交量
FROM stock.stock
WHERE date BETWEEN '2002-01-01' AND '2002-12-31'
GROUP BY month
ORDER BY month;
```

```markdown
    ┌──────month─┬─volume_on_up_days─┬─volume_on_down_days─┬─volume_on_neutral_days─┬─total_volume──┐
 1. │ 2002-01-01 │ 26.07 十亿        │ 30.74 十亿           │ 781.80 百万             │ 57.59 十亿     │
 2. │ 2002-02-01 │ 20.84 十亿        │ 29.60 十亿           │ 642.36 百万             │ 51.09 十亿     │
 3. │ 2002-03-01 │ 28.81 十亿        │ 23.57 十亿           │ 762.60 百万             │ 53.14 十亿     │
 4. │ 2002-04-01 │ 24.72 十亿        │ 30.99 十亿           │ 763.92 百万             │ 56.47 十亿     │
 5. │ 2002-05-01 │ 25.09 十亿        │ 30.57 十亿           │ 858.57 百万             │ 56.52 十亿     │
 6. │ 2002-06-01 │ 29.10 十亿        │ 30.88 十亿           │ 875.71 百万             │ 60.86 十亿     │
 7. │ 2002-07-01 │ 32.27 十亿        │ 41.73 十亿           │ 747.32 百万             │ 74.75 十亿     │
 8. │ 2002-08-01 │ 28.57 十亿        │ 27.49 十亿           │ 1.17 十亿               │ 57.24 十亿     │
 9. │ 2002-09-01 │ 23.37 十亿        │ 31.02 十亿           │ 775.66 百万             │ 55.17 十亿     │
10. │ 2002-10-01 │ 38.57 十亿        │ 34.05 十亿           │ 956.48 百万             │ 73.57 十亿     │
11. │ 2002-11-01 │ 34.90 十亿        │ 25.47 十亿           │ 998.34 百万             │ 61.37 十亿     │
12. │ 2002-12-01 │ 22.99 十亿        │ 28.65 十亿           │ 1.14 十亿               │ 52.79 十亿     │
    └────────────┴───────────────────┴─────────────────────┴────────────────────────┴───────────────┘
```

### 按股票代码统计成交量 {#calculate-trading-volume}


在这个示例中，我们将使用 [ClickHouse playground](https://sql.clickhouse.com/) 中提供的 `stock` 表，
来统计 2006 年三家当时规模最大的科技公司按股票代码划分的交易量。

```sql title="Query"
SELECT 
    toStartOfMonth(date) AS month,
    formatReadableQuantity(sumIf(volume, symbol = 'AAPL')) AS apple_volume,
    formatReadableQuantity(sumIf(volume, symbol = 'MSFT')) AS microsoft_volume,
    formatReadableQuantity(sumIf(volume, symbol = 'GOOG')) AS google_volume,
    sum(volume) AS total_volume,
    round(sumIf(volume, symbol IN ('AAPL', 'MSFT', 'GOOG')) / sum(volume) * 100, 2) AS major_tech_percentage
FROM stock.stock
WHERE date BETWEEN '2006-01-01' AND '2006-12-31'
GROUP BY month
ORDER BY month;
```

```markdown title="Response"
    ┌──────month─┬─apple_volume───┬─microsoft_volume─┬─google_volume──┬─total_volume─┬─major_tech_percentage─┐
 1. │ 2006-01-01 │ 782.21百万 │ 1.39十亿     │ 299.69百万 │  84343937700 │                  2.93 │
 2. │ 2006-02-01 │ 670.38百万 │ 1.05十亿     │ 297.65百万 │  73524748600 │                  2.74 │
 3. │ 2006-03-01 │ 744.85百万 │ 1.39十亿     │ 288.36百万 │  87960830800 │                  2.75 │
 4. │ 2006-04-01 │ 718.97百万 │ 1.45十亿     │ 185.65百万 │  78031719800 │                  3.02 │
 5. │ 2006-05-01 │ 557.89百万 │ 2.32十亿     │ 174.94百万 │  97096584100 │                  3.14 │
 6. │ 2006-06-01 │ 641.48百万 │ 1.98十亿     │ 142.55百万 │  96304086800 │                  2.87 │
 7. │ 2006-07-01 │ 624.93百万 │ 1.33十亿     │ 127.74百万 │  79940921800 │                  2.61 │
 8. │ 2006-08-01 │ 639.35百万 │ 1.13十亿     │ 107.16百万 │  84251753200 │                  2.23 │
 9. │ 2006-09-01 │ 633.45百万 │ 1.10十亿     │ 121.72百万 │  82775234300 │                  2.24 │
10. │ 2006-10-01 │ 514.82百万 │ 1.29十亿     │ 158.90百万 │  93406712600 │                   2.1 │
11. │ 2006-11-01 │ 494.37百万 │ 1.24十亿     │ 118.49百万 │  90177365500 │                  2.06 │
12. │ 2006-12-01 │ 603.95百万 │ 1.14十亿     │ 91.77百万  │  80499584100 │                  2.28 │
    └────────────┴────────────────┴──────────────────┴────────────────┴──────────────┴───────────────────────┘
```


## 另请参阅 {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`If` 组合器](/sql-reference/aggregate-functions/combinators#-if)
