---
slug: '/examples/aggregate-function-combinators/sumIf'
title: 'sumIf'
description: 'sumIf コンビネータの使用例'
keywords: ['sum', 'if', 'コンビネータ', '例', 'sumIf']
sidebar_label: 'sumIf'
doc_type: 'reference'
---



# sumIf {#sumif}



## 説明 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) コンビネーターは [`sum`](/sql-reference/aggregate-functions/reference/sum)
関数に適用でき、条件が真となる行の値だけを合計する
`sumIf` 集約コンビネーター関数を使用して計算できます。



## 使用例

この例では、成功フラグ付きの売上データを保存するテーブルを作成し、
`sumIf` を使用して成功したトランザクションの総売上金額を計算します。

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

`sumIf` 関数は、`is_successful = 1` の行の金額のみを合計します。
この場合、次の値を合計します: 100.50 + 200.75 + 300.00 + 175.25。

```response title="Response"
   ┌─total_successful_sales─┐
1. │                  776.50 │
   └───────────────────────┘
```

### 価格方向別に出来高を計算する

この例では、[ClickHouse playground](https://sql.clickhouse.com/) で利用可能な `stock` テーブルを使用して、
2002 年前半における価格方向別の出来高を計算します。

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
 1. │ 2002-01-01 │ 260.7億     │ 307.4億       │ 7億8180万         │ 575.9億 │
 2. │ 2002-02-01 │ 208.4億     │ 296.0億       │ 6億4236万         │ 510.9億 │
 3. │ 2002-03-01 │ 288.1億     │ 235.7億       │ 7億6260万         │ 531.4億 │
 4. │ 2002-04-01 │ 247.2億     │ 309.9億       │ 7億6392万         │ 564.7億 │
 5. │ 2002-05-01 │ 250.9億     │ 305.7億       │ 8億5857万         │ 565.2億 │
 6. │ 2002-06-01 │ 291.0億     │ 308.8億       │ 8億7571万         │ 608.6億 │
 7. │ 2002-07-01 │ 322.7億     │ 417.3億       │ 7億4732万         │ 747.5億 │
 8. │ 2002-08-01 │ 285.7億     │ 274.9億       │ 11.7億           │ 572.4億 │
 9. │ 2002-09-01 │ 233.7億     │ 310.2億       │ 7億7566万         │ 551.7億 │
10. │ 2002-10-01 │ 385.7億     │ 340.5億       │ 9億5648万         │ 735.7億 │
11. │ 2002-11-01 │ 349.0億     │ 254.7億       │ 9億9834万         │ 613.7億 │
12. │ 2002-12-01 │ 229.9億     │ 286.5億       │ 11.4億           │ 527.9億 │
    └────────────┴───────────────────┴─────────────────────┴────────────────────────┴───────────────┘
```

### 株式銘柄別の取引量を計算する


この例では、[ClickHouse playground](https://sql.clickhouse.com/) で利用可能な `stock` テーブルを使用し、
2006 年における当時の大手テクノロジー企業 3 社の銘柄シンボルごとの取引量を算出します。

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
- [`If` コンビネーター](/sql-reference/aggregate-functions/combinators#-if)
