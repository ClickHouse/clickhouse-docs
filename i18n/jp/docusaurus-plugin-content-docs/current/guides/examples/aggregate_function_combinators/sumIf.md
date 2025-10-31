---
'slug': '/examples/aggregate-function-combinators/sumIf'
'title': 'sumIf'
'description': 'sumIfコムビネーターを使用する例'
'keywords':
- 'sum'
- 'if'
- 'combinator'
- 'examples'
- 'sumIf'
'sidebar_label': 'sumIf'
'doc_type': 'reference'
---


# sumIf {#sumif}

## Description {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) コンビネータは、`sum`(/sql-reference/aggregate-functions/reference/sum) 関数に適用して、条件が真である行の値の合計を計算するために、`sumIf` 集約コンビネータ関数を使用します。

## Example usage {#example-usage}

この例では、成功フラグを持つ販売データを保存するテーブルを作成し、`sumIf`を使用して成功した取引の総販売額を計算します。

```sql title="Query"
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

`sumIf` 関数は、`is_successful = 1` の条件を満たす金額のみを合計します。この場合、合計するのは: 100.50 + 200.75 + 300.00 + 175.25 です。

```response title="Response"
   ┌─total_successful_sales─┐
1. │                  776.50 │
   └───────────────────────┘
```

### Calculate trading volume by price direction {#calculate-trading-vol-price-direction}

この例では、[ClickHouse playground](https://sql.clickhouse.com/) で使用できる `stock` テーブルを利用して、2002年上半期の価格方向による取引量を計算します。

```sql title="Query"
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
 1. │ 2002-01-01 │ 26.07 billion     │ 30.74 billion       │ 781.80 million         │ 57.59 billion │
 2. │ 2002-02-01 │ 20.84 billion     │ 29.60 billion       │ 642.36 million         │ 51.09 billion │
 3. │ 2002-03-01 │ 28.81 billion     │ 23.57 billion       │ 762.60 million         │ 53.14 billion │
 4. │ 2002-04-01 │ 24.72 billion     │ 30.99 billion       │ 763.92 million         │ 56.47 billion │
 5. │ 2002-05-01 │ 25.09 billion     │ 30.57 billion       │ 858.57 million         │ 56.52 billion │
 6. │ 2002-06-01 │ 29.10 billion     │ 30.88 billion       │ 875.71 million         │ 60.86 billion │
 7. │ 2002-07-01 │ 32.27 billion     │ 41.73 billion       │ 747.32 million         │ 74.75 billion │
 8. │ 2002-08-01 │ 28.57 billion     │ 27.49 billion       │ 1.17 billion           │ 57.24 billion │
 9. │ 2002-09-01 │ 23.37 billion     │ 31.02 billion       │ 775.66 million         │ 55.17 billion │
10. │ 2002-10-01 │ 38.57 billion     │ 34.05 billion       │ 956.48 million         │ 73.57 billion │
11. │ 2002-11-01 │ 34.90 billion     │ 25.47 billion       │ 998.34 million         │ 61.37 billion │
12. │ 2002-12-01 │ 22.99 billion     │ 28.65 billion       │ 1.14 billion           │ 52.79 billion │
    └────────────┴───────────────────┴─────────────────────┴────────────────────────┴───────────────┘
```

### Calculate trading volume by stock symbol {#calculate-trading-volume}

この例では、[ClickHouse playground](https://sql.clickhouse.com/) で使用できる `stock` テーブルを利用して、2006年に当時の最大の3つのテクノロジー企業の株式シンボルによる取引量を計算します。

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
 1. │ 2006-01-01 │ 782.21 million │ 1.39 billion     │ 299.69 million │  84343937700 │                  2.93 │
 2. │ 2006-02-01 │ 670.38 million │ 1.05 billion     │ 297.65 million │  73524748600 │                  2.74 │
 3. │ 2006-03-01 │ 744.85 million │ 1.39 billion     │ 288.36 million │  87960830800 │                  2.75 │
 4. │ 2006-04-01 │ 718.97 million │ 1.45 billion     │ 185.65 million │  78031719800 │                  3.02 │
 5. │ 2006-05-01 │ 557.89 million │ 2.32 billion     │ 174.94 million │  97096584100 │                  3.14 │
 6. │ 2006-06-01 │ 641.48 million │ 1.98 billion     │ 142.55 million │  96304086800 │                  2.87 │
 7. │ 2006-07-01 │ 624.93 million │ 1.33 billion     │ 127.74 million │  79940921800 │                  2.61 │
 8. │ 2006-08-01 │ 639.35 million │ 1.13 billion     │ 107.16 million │  84251753200 │                  2.23 │
 9. │ 2006-09-01 │ 633.45 million │ 1.10 billion     │ 121.72 million │  82775234300 │                  2.24 │
10. │ 2006-10-01 │ 514.82 million │ 1.29 billion     │ 158.90 million │  93406712600 │                   2.1 │
11. │ 2006-11-01 │ 494.37 million │ 1.24 billion     │ 118.49 million │  90177365500 │                  2.06 │
12. │ 2006-12-01 │ 603.95 million │ 1.14 billion     │ 91.77 million  │  80499584100 │                  2.28 │
    └────────────┴────────────────┴──────────────────┴────────────────┴──────────────┴───────────────────────┘
```

## See also {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
