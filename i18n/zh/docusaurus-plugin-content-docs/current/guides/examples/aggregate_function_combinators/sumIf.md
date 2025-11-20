---
slug: '/examples/aggregate-function-combinators/sumIf'
title: 'sumIf'
description: 'sumIf 组合器的使用示例'
keywords: ['sum', 'if', 'combinator', 'examples', 'sumIf']
sidebar_label: 'sumIf'
doc_type: 'reference'
---



# sumIf {#sumif}


## 描述 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) 组合器可以应用于 [`sum`](/sql-reference/aggregate-functions/reference/sum) 函数,使用 `sumIf` 聚合组合器函数来计算条件为真的行的值总和。


## 使用示例 {#example-usage}

在此示例中,我们将创建一个存储销售数据及成功标志的表,
并使用 `sumIf` 计算成功交易的总销售额。

```sql title="查询"
CREATE TABLE sales(
    transaction_id UInt32,
    amount Decimal(10,2),
    is_successful UInt8
) ENGINE = Log;

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

`sumIf` 函数仅对 `is_successful = 1` 的金额求和。
在本例中,将对以下值求和:100.50 + 200.75 + 300.00 + 175.25。

```response title="响应"
   ┌─total_successful_sales─┐
1. │                  776.50 │
   └───────────────────────┘
```

### 按价格方向计算交易量 {#calculate-trading-vol-price-direction}

在此示例中,我们将使用 [ClickHouse playground](https://sql.clickhouse.com/) 中的 `stock` 表
来计算 2002 年全年按价格方向的交易量。

```sql title="查询"
SELECT
    toStartOfMonth(date) AS month,
    formatReadableQuantity(sumIf(volume, price > open)) AS volume_on_up_days,
    formatReadableQuantity(sumIf(volume, price < open)) AS volume_on_down_days,
    formatReadableQuantity(sumIf(volume, price = open)) AS volume_on_neutral_days,
    formatReadableQuantity(sum(volume)) AS total_volume
FROM stock.stock
WHERE date BETWEEN '2002-01-01' AND '2002-12-31'
GROUP BY month
ORDER BY month;
```

```markdown
    ┌──────month─┬─volume_on_up_days─┬─volume_on_down_days─┬─volume_on_neutral_days─┬─total_volume──┐

1.  │ 2002-01-01 │ 26.07 billion │ 30.74 billion │ 781.80 million │ 57.59 billion │
2.  │ 2002-02-01 │ 20.84 billion │ 29.60 billion │ 642.36 million │ 51.09 billion │
3.  │ 2002-03-01 │ 28.81 billion │ 23.57 billion │ 762.60 million │ 53.14 billion │
4.  │ 2002-04-01 │ 24.72 billion │ 30.99 billion │ 763.92 million │ 56.47 billion │
5.  │ 2002-05-01 │ 25.09 billion │ 30.57 billion │ 858.57 million │ 56.52 billion │
6.  │ 2002-06-01 │ 29.10 billion │ 30.88 billion │ 875.71 million │ 60.86 billion │
7.  │ 2002-07-01 │ 32.27 billion │ 41.73 billion │ 747.32 million │ 74.75 billion │
8.  │ 2002-08-01 │ 28.57 billion │ 27.49 billion │ 1.17 billion │ 57.24 billion │
9.  │ 2002-09-01 │ 23.37 billion │ 31.02 billion │ 775.66 million │ 55.17 billion │
10. │ 2002-10-01 │ 38.57 billion │ 34.05 billion │ 956.48 million │ 73.57 billion │
11. │ 2002-11-01 │ 34.90 billion │ 25.47 billion │ 998.34 million │ 61.37 billion │
12. │ 2002-12-01 │ 22.99 billion │ 28.65 billion │ 1.14 billion │ 52.79 billion │
    └────────────┴───────────────────┴─────────────────────┴────────────────────────┴───────────────┘
```

### 按股票代码计算交易量 {#calculate-trading-volume}


在本示例中，我们将使用 [ClickHouse playground](https://sql.clickhouse.com/) 中提供的 `stock` 表，
计算 2006 年三家当时最大的科技公司按股票代码划分的交易量。

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
 1. │ 2006-01-01 │ 7.8221亿 │ 13.9亿     │ 2.9969亿 │  84343937700 │                  2.93 │
 2. │ 2006-02-01 │ 6.7038亿 │ 10.5亿     │ 2.9765亿 │  73524748600 │                  2.74 │
 3. │ 2006-03-01 │ 7.4485亿 │ 13.9亿     │ 2.8836亿 │  87960830800 │                  2.75 │
 4. │ 2006-04-01 │ 7.1897亿 │ 14.5亿     │ 1.8565亿 │  78031719800 │                  3.02 │
 5. │ 2006-05-01 │ 5.5789亿 │ 23.2亿     │ 1.7494亿 │  97096584100 │                  3.14 │
 6. │ 2006-06-01 │ 6.4148亿 │ 19.8亿     │ 1.4255亿 │  96304086800 │                  2.87 │
 7. │ 2006-07-01 │ 6.2493亿 │ 13.3亿     │ 1.2774亿 │  79940921800 │                  2.61 │
 8. │ 2006-08-01 │ 6.3935亿 │ 11.3亿     │ 1.0716亿 │  84251753200 │                  2.23 │
 9. │ 2006-09-01 │ 6.3345亿 │ 11.0亿     │ 1.2172亿 │  82775234300 │                  2.24 │
10. │ 2006-10-01 │ 5.1482亿 │ 12.9亿     │ 1.5890亿 │  93406712600 │                   2.1 │
11. │ 2006-11-01 │ 4.9437亿 │ 12.4亿     │ 1.1849亿 │  90177365500 │                  2.06 │
12. │ 2006-12-01 │ 6.0395亿 │ 11.4亿     │ 0.9177亿  │  80499584100 │                  2.28 │
    └────────────┴────────────────┴──────────────────┴────────────────┴──────────────┴───────────────────────┘
```


## 另请参阅 {#see-also}

- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`If 组合器`](/sql-reference/aggregate-functions/combinators#-if)
