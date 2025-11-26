---
slug: '/examples/aggregate-function-combinators/argMinIf'
title: 'argMinIf'
description: 'Пример использования комбинатора argMinIf'
keywords: ['argMin', 'if', 'комбинатор', 'примеры', 'argMinIf']
sidebar_label: 'argMinIf'
doc_type: 'reference'
---



# argMinIf {#argminif}



## Описание {#description}

Комбинатор [`If`](/sql-reference/aggregate-functions/combinators#-if) может быть применён к функции [`argMin`](/sql-reference/aggregate-functions/reference/argmin),
чтобы с помощью агрегатной функции-комбинатора `argMinIf` найти значение `arg`, которое соответствует минимальному значению `val` среди строк, для которых условие истинно.

Функция `argMinIf` полезна, когда нужно найти значение, связанное 
с минимальным значением `val` в наборе данных, но только для строк, которые удовлетворяют определённому 
условию.



## Пример использования

В этом примере мы создадим таблицу, которая хранит цены товаров и их временные метки,
и используем `argMinIf`, чтобы найти минимальную цену для каждого товара в те моменты, когда он есть в наличии.

```sql title="Query"
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

Функция `argMinIf` найдёт цену, соответствующую самой ранней метке времени для каждого товара,
но только среди строк, где `in_stock = 1`. Например:

* Товар 1: среди строк с товаром в наличии цена 10.99 имеет самую раннюю метку времени (10:00:00)
* Товар 2: среди строк с товаром в наличии цена 20.99 имеет самую раннюю метку времени (11:00:00)

```response title="Response"
   ┌─product_id─┬─lowest_price_when_in_stock─┐
1. │          1 │                      10.99 │
2. │          2 │                      20.99 │
   └────────────┴────────────────────────────┘
```


## См. также {#see-also}
- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMaxIf`](/examples/aggregate-function-combinators/argMaxIf)
- [`комбинатор If`](/sql-reference/aggregate-functions/combinators#-if)
