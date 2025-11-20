---
'slug': '/examples/aggregate-function-combinators/sumIf'
'title': 'sumIf'
'description': 'sumIf 조합기를 사용하는 예시'
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

## 설명 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) 조합자는 [`sum`](/sql-reference/aggregate-functions/reference/sum)
함수에 적용되어 조건이 참인 행의 값의 합계를 계산하는 데 사용되며, `sumIf` 집계 조합자 함수를 사용합니다.

## 예제 사용법 {#example-usage}

이 예제에서는 성공 플래그와 함께 판매 데이터를 저장하는 테이블을 생성하고, 
`sumIf`를 사용하여 성공적인 거래의 총 판매 금액을 계산합니다.

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

`sumIf` 함수는 `is_successful = 1`인 경우에만 금액을 합산합니다.
이 경우, 100.50 + 200.75 + 300.00 + 175.25를 합산합니다.

```response title="Response"
   ┌─total_successful_sales─┐
1. │                  776.50 │
   └───────────────────────┘
```

### 가격 방향에 따른 거래량 계산 {#calculate-trading-vol-price-direction}

이 예제에서는 [ClickHouse playground](https://sql.clickhouse.com/)에서 제공되는 `stock` 테이블을 사용하여
2002년 상반기 가격 방향에 따른 거래량을 계산합니다.

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

### 주식 기호에 따른 거래량 계산 {#calculate-trading-volume}

이 예제에서는 [ClickHouse playground](https://sql.clickhouse.com/)에서 제공되는 `stock` 테이블을 사용하여
2006년 당시 세 개의 가장 큰 기술 회사의 주식 기호에 따른 거래량을 계산합니다.

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

## 참고 {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`If 조합자`](/sql-reference/aggregate-functions/combinators#-if)
