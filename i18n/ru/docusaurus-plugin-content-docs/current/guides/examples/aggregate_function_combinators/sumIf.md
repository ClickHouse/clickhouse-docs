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

Комбинатор [`If`](/sql-reference/aggregate-functions/combinators#-if) может быть применён к агрегатной функции [`sum`](/sql-reference/aggregate-functions/reference/sum)
для вычисления суммы значений по строкам, для которых условие истинно,
используя агрегатную функцию-комбинатор `sumIf`.



## Пример использования

В этом примере мы создадим таблицу, которая хранит данные о продажах с флагами успешности,
а затем используем `sumIf` для вычисления общей суммы продаж по успешным транзакциям.

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

Функция `sumIf` будет суммировать только те значения поля `amount`, для которых `is_successful = 1`.
В этом случае она просуммирует: 100.50 + 200.75 + 300.00 + 175.25.

```response title="Response"
   ┌─total_successful_sales─┐
1. │                  776.50 │
   └───────────────────────┘
```

### Расчет торгового объема по направлению движения цены

В этом примере мы используем таблицу `stock`, доступную в [ClickHouse playground](https://sql.clickhouse.com/),
чтобы рассчитать торговый объем по направлению движения цены за первую половину 2002 года.

```sql title="Query"
SELECT 
    toStartOfMonth(date) AS month,
    formatReadableQuantity(sumIf(volume, price > open)) AS объем_в_дни_роста,
    formatReadableQuantity(sumIf(volume, price < open)) AS объем_в_дни_падения,
    formatReadableQuantity(sumIf(volume, price = open)) AS объем_в_нейтральные_дни,
    formatReadableQuantity(sum(volume)) AS общий_объем
FROM stock.stock
WHERE date BETWEEN '2002-01-01' AND '2002-12-31'
GROUP BY month
ORDER BY month;
```

```markdown
    ┌──────месяц─┬─объем_в_дни_роста─┬─объем_в_дни_падения─┬─объем_в_нейтральные_дни─┬─общий_объем──┐
 1. │ 2002-01-01 │ 26.07 миллиард     │ 30.74 миллиард       │ 781.80 миллион         │ 57.59 миллиард │
 2. │ 2002-02-01 │ 20.84 миллиард     │ 29.60 миллиард       │ 642.36 миллион         │ 51.09 миллиард │
 3. │ 2002-03-01 │ 28.81 миллиард     │ 23.57 миллиард       │ 762.60 миллион         │ 53.14 миллиард │
 4. │ 2002-04-01 │ 24.72 миллиард     │ 30.99 миллиард       │ 763.92 миллион         │ 56.47 миллиард │
 5. │ 2002-05-01 │ 25.09 миллиард     │ 30.57 миллиард       │ 858.57 миллион         │ 56.52 миллиард │
 6. │ 2002-06-01 │ 29.10 миллиард     │ 30.88 миллиард       │ 875.71 миллион         │ 60.86 миллиард │
 7. │ 2002-07-01 │ 32.27 миллиард     │ 41.73 миллиард       │ 747.32 миллион         │ 74.75 миллиард │
 8. │ 2002-08-01 │ 28.57 миллиард     │ 27.49 миллиард       │ 1.17 миллиард           │ 57.24 миллиард │
 9. │ 2002-09-01 │ 23.37 миллиард     │ 31.02 миллиард       │ 775.66 миллион         │ 55.17 миллиард │
10. │ 2002-10-01 │ 38.57 миллиард     │ 34.05 миллиард       │ 956.48 миллион         │ 73.57 миллиард │
11. │ 2002-11-01 │ 34.90 миллиард     │ 25.47 миллиард       │ 998.34 миллион         │ 61.37 миллиард │
12. │ 2002-12-01 │ 22.99 миллиард     │ 28.65 миллиард       │ 1.14 миллиард           │ 52.79 миллиард │
    └────────────┴───────────────────┴─────────────────────┴────────────────────────┴───────────────┘
```

### Рассчитать торговый объём по тикеру


В этом примере мы будем использовать таблицу `stock`, доступную в [ClickHouse playground](https://sql.clickhouse.com/),
чтобы посчитать объём торгов по биржевому тикеру в 2006 году для трёх крупнейших
технологических компаний того времени.

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
 1. │ 2006-01-01 │ 782.21 млн │ 1.39 млрд     │ 299.69 млн │  84343937700 │                  2.93 │
 2. │ 2006-02-01 │ 670.38 млн │ 1.05 млрд     │ 297.65 млн │  73524748600 │                  2.74 │
 3. │ 2006-03-01 │ 744.85 млн │ 1.39 млрд     │ 288.36 млн │  87960830800 │                  2.75 │
 4. │ 2006-04-01 │ 718.97 млн │ 1.45 млрд     │ 185.65 млн │  78031719800 │                  3.02 │
 5. │ 2006-05-01 │ 557.89 млн │ 2.32 млрд     │ 174.94 млн │  97096584100 │                  3.14 │
 6. │ 2006-06-01 │ 641.48 млн │ 1.98 млрд     │ 142.55 млн │  96304086800 │                  2.87 │
 7. │ 2006-07-01 │ 624.93 млн │ 1.33 млрд     │ 127.74 млн │  79940921800 │                  2.61 │
 8. │ 2006-08-01 │ 639.35 млн │ 1.13 млрд     │ 107.16 млн │  84251753200 │                  2.23 │
 9. │ 2006-09-01 │ 633.45 млн │ 1.10 млрд     │ 121.72 млн │  82775234300 │                  2.24 │
10. │ 2006-10-01 │ 514.82 млн │ 1.29 млрд     │ 158.90 млн │  93406712600 │                   2.1 │
11. │ 2006-11-01 │ 494.37 млн │ 1.24 млрд     │ 118.49 млн │  90177365500 │                  2.06 │
12. │ 2006-12-01 │ 603.95 млн │ 1.14 млрд     │ 91.77 млн  │  80499584100 │                  2.28 │
    └────────────┴────────────────┴──────────────────┴────────────────┴──────────────┴───────────────────────┘
```


## Смотрите также {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
