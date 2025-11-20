---
slug: '/examples/aggregate-function-combinators/sumIf'
title: 'sumIf'
description: 'Пример использования комбинатора sumIf'
keywords: ['sum', 'if', 'combinator', 'examples', 'sumIf']
sidebar_label: 'sumIf'
doc_type: 'reference'
---



# sumIf {#sumif}


## Описание {#description}

Комбинатор [`If`](/sql-reference/aggregate-functions/combinators#-if) может применяться к функции [`sum`](/sql-reference/aggregate-functions/reference/sum)
для вычисления суммы значений строк, удовлетворяющих условию,
с помощью агрегатной функции-комбинатора `sumIf`.


## Пример использования {#example-usage}

В этом примере мы создадим таблицу, в которой хранятся данные о продажах с флагами успешности, и используем функцию `sumIf` для вычисления общей суммы продаж по успешным транзакциям.

```sql title="Запрос"
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

Функция `sumIf` просуммирует только те значения, для которых `is_successful = 1`.
В этом случае будет вычислена сумма: 100.50 + 200.75 + 300.00 + 175.25.

```response title="Результат"
   ┌─total_successful_sales─┐
1. │                  776.50 │
   └───────────────────────┘
```

### Расчёт торгового объёма по направлению изменения цены {#calculate-trading-vol-price-direction}

В этом примере мы используем таблицу `stock`, доступную в [демо-среде ClickHouse](https://sql.clickhouse.com/), чтобы вычислить торговый объём по направлению изменения цены за первое полугодие 2002 года.

```sql title="Запрос"
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

1.  │ 2002-01-01 │ 26.07 млрд │ 30.74 млрд │ 781.80 млн │ 57.59 млрд │
2.  │ 2002-02-01 │ 20.84 млрд │ 29.60 млрд │ 642.36 млн │ 51.09 млрд │
3.  │ 2002-03-01 │ 28.81 млрд │ 23.57 млрд │ 762.60 млн │ 53.14 млрд │
4.  │ 2002-04-01 │ 24.72 млрд │ 30.99 млрд │ 763.92 млн │ 56.47 млрд │
5.  │ 2002-05-01 │ 25.09 млрд │ 30.57 млрд │ 858.57 млн │ 56.52 млрд │
6.  │ 2002-06-01 │ 29.10 млрд │ 30.88 млрд │ 875.71 млн │ 60.86 млрд │
7.  │ 2002-07-01 │ 32.27 млрд │ 41.73 млрд │ 747.32 млн │ 74.75 млрд │
8.  │ 2002-08-01 │ 28.57 млрд │ 27.49 млрд │ 1.17 млрд │ 57.24 млрд │
9.  │ 2002-09-01 │ 23.37 млрд │ 31.02 млрд │ 775.66 млн │ 55.17 млрд │
10. │ 2002-10-01 │ 38.57 млрд │ 34.05 млрд │ 956.48 млн │ 73.57 млрд │
11. │ 2002-11-01 │ 34.90 млрд │ 25.47 млрд │ 998.34 млн │ 61.37 млрд │
12. │ 2002-12-01 │ 22.99 млрд │ 28.65 млрд │ 1.14 млрд │ 52.79 млрд │
    └────────────┴───────────────────┴─────────────────────┴────────────────────────┴───────────────┘
```

### Расчёт торгового объёма по тикеру {#calculate-trading-volume}


В этом примере мы будем использовать таблицу `stock`, доступную в [ClickHouse playground](https://sql.clickhouse.com/),
чтобы вычислить торговый объём по тикеру в 2006 году для трёх крупнейших на тот момент технологических компаний.

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


## См. также {#see-also}

- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [Комбинатор `If`](/sql-reference/aggregate-functions/combinators#-if)
