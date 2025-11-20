---
slug: '/examples/aggregate-function-combinators/sumIf'
title: 'sumIf'
description: 'sumIf コンビネーターの例'
keywords: ['sum', 'if', 'combinator', 'examples', 'sumIf']
sidebar_label: 'sumIf'
doc_type: 'reference'
---



# sumIf {#sumif}


## 説明 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if)コンビネータを[`sum`](/sql-reference/aggregate-functions/reference/sum)関数に適用することで、条件が真である行の値の合計を計算できます。この機能は`sumIf`集約コンビネータ関数として提供されています。


## 使用例 {#example-usage}

この例では、成功フラグを持つ売上データを格納するテーブルを作成し、
`sumIf`を使用して成功した取引の総売上金額を計算します。

```sql title="クエリ"
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

`sumIf`関数は`is_successful = 1`の場合の金額のみを合計します。
この場合、100.50 + 200.75 + 300.00 + 175.25が合計されます。

```response title="レスポンス"
   ┌─total_successful_sales─┐
1. │                  776.50 │
   └───────────────────────┘
```

### 価格変動方向別の取引量を計算 {#calculate-trading-vol-price-direction}

この例では、[ClickHouse playground](https://sql.clickhouse.com/)で利用可能な`stock`テーブルを使用して、
2002年の価格変動方向別の取引量を計算します。

```sql title="クエリ"
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

### 銘柄別の取引量を計算 {#calculate-trading-volume}


この例では、[ClickHouse playground](https://sql.clickhouse.com/) で利用できる `stock` テーブルを使い、
当時の主要なテクノロジー企業 3 社について、2006 年の銘柄ごとの取引量を計算します。

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
 1. │ 2006-01-01 │ 7億8221万 │ 13億9000万     │ 2億9969万 │  84343937700 │                  2.93 │
 2. │ 2006-02-01 │ 6億7038万 │ 10億5000万     │ 2億9765万 │  73524748600 │                  2.74 │
 3. │ 2006-03-01 │ 7億4485万 │ 13億9000万     │ 2億8836万 │  87960830800 │                  2.75 │
 4. │ 2006-04-01 │ 7億1897万 │ 14億5000万     │ 1億8565万 │  78031719800 │                  3.02 │
 5. │ 2006-05-01 │ 5億5789万 │ 23億2000万     │ 1億7494万 │  97096584100 │                  3.14 │
 6. │ 2006-06-01 │ 6億4148万 │ 19億8000万     │ 1億4255万 │  96304086800 │                  2.87 │
 7. │ 2006-07-01 │ 6億2493万 │ 13億3000万     │ 1億2774万 │  79940921800 │                  2.61 │
 8. │ 2006-08-01 │ 6億3935万 │ 11億3000万     │ 1億716万 │  84251753200 │                  2.23 │
 9. │ 2006-09-01 │ 6億3345万 │ 11億0000万     │ 1億2172万 │  82775234300 │                  2.24 │
10. │ 2006-10-01 │ 5億1482万 │ 12億9000万     │ 1億5890万 │  93406712600 │                   2.1 │
11. │ 2006-11-01 │ 4億9437万 │ 12億4000万     │ 1億1849万 │  90177365500 │                  2.06 │
12. │ 2006-12-01 │ 6億395万 │ 11億4000万     │ 9177万  │  80499584100 │                  2.28 │
    └────────────┴────────────────┴──────────────────┴────────────────┴──────────────┴───────────────────────┘
```


## 関連項目 {#see-also}

- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
