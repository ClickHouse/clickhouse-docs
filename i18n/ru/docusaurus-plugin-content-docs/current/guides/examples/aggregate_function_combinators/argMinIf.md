---
slug: '/examples/aggregate-function-combinators/argMinIf'
title: 'argMinIf'
description: 'Пример использования комбинатора argMinIf'
keywords: ['argMin', 'if', 'combinator', 'examples', 'argMinIf']
sidebar_label: 'argMinIf'
doc_type: 'reference'
---



# argMinIf {#argminif}


## Описание {#description}

Комбинатор [`If`](/sql-reference/aggregate-functions/combinators#-if) может применяться к функции [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
для поиска значения `arg`, соответствующего минимальному значению `val` среди строк, удовлетворяющих условию,
с помощью агрегатной функции-комбинатора `argMinIf`.

Функция `argMinIf` полезна, когда требуется найти значение, связанное
с минимальным значением в наборе данных, но только для строк, удовлетворяющих заданному
условию.


## Пример использования {#example-usage}

В этом примере мы создадим таблицу для хранения цен на товары и временных меток,
и используем `argMinIf` для поиска минимальной цены каждого товара при наличии на складе.

```sql title="Запрос"
CREATE TABLE product_prices(
    product_id UInt32,
    price Decimal(10,2),
    timestamp DateTime,
    in_stock UInt8
) ENGINE = Log;

INSERT INTO product_prices VALUES
    (1, 10.99, '2024-01-01 10:00:00', 1),
    (1, 9.99, '2024-01-01 10:05:00', 1),
    (1, 11.99, '2024-01-01 10:10:00', 0),
    (2, 20.99, '2024-01-01 11:00:00', 1),
    (2, 19.99, '2024-01-01 11:05:00', 1),
    (2, 21.99, '2024-01-01 11:10:00', 1);

SELECT
    product_id,
    argMinIf(price, timestamp, in_stock = 1) AS lowest_price_when_in_stock
FROM product_prices
GROUP BY product_id;
```

Функция `argMinIf` найдет цену, соответствующую наиболее ранней временной метке для каждого товара,
учитывая только строки, где `in_stock = 1`. Например:

- Товар 1: Среди товаров в наличии цена 10.99 имеет наиболее раннюю временную метку (10:00:00)
- Товар 2: Среди товаров в наличии цена 20.99 имеет наиболее раннюю временную метку (11:00:00)

```response title="Результат"
   ┌─product_id─┬─lowest_price_when_in_stock─┐
1. │          1 │                      10.99 │
2. │          2 │                      20.99 │
   └────────────┴────────────────────────────┘
```


## См. также {#see-also}

- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMaxIf`](/examples/aggregate-function-combinators/argMaxIf)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
