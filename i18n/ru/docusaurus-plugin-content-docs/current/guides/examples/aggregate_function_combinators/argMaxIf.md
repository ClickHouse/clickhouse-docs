---
slug: '/examples/aggregate-function-combinators/argMaxIf'
title: 'argMaxIf'
description: 'Пример использования комбинатора argMaxIf'
keywords: ['argMax', 'if', 'combinator', 'examples', 'argMaxIf']
sidebar_label: 'argMaxIf'
doc_type: 'reference'
---



# argMaxIf {#argmaxif}



## Описание {#description}

Комбинатор [`If`](/sql-reference/aggregate-functions/combinators#-if) может быть применён к функции [`argMax`](/sql-reference/aggregate-functions/reference/argmax),
чтобы найти значение `arg`, которое соответствует максимальному значению `val` для строк, где условие истинно,
с помощью агрегатной функции-комбинатора `argMaxIf`.

Функция `argMaxIf` полезна, когда вам нужно найти значение, связанное с
максимальным значением в наборе данных, но только для строк, которые удовлетворяют определённому
условию.



## Пример использования

В этом примере мы используем демонстрационный набор данных о продажах товаров, чтобы показать, как работает `argMaxIf`. Мы найдём название товара с наивысшей ценой, но только среди тех товаров, которые были проданы как минимум 10 раз.

```sql title="Query"
CREATE TABLE product_sales
(
    product_name String,
    price Decimal32(2),
    sales_count UInt32
) ENGINE = Memory;

INSERT INTO product_sales VALUES
    ('Laptop', 999.99, 10),
    ('Phone', 499.99, 15),
    ('Tablet', 299.99, 0),
    ('Watch', 1199.99, 5),
    ('Headphones', 79.99, 20);

SELECT argMaxIf(product_name, price, sales_count >= 10) AS most_expensive_popular_product
FROM product_sales;
```

Функция `argMaxIf` вернёт название товара с наивысшей ценой
среди всех товаров, которые были проданы как минимум 10 раз (sales&#95;count &gt;= 10).
В этом случае она вернёт &#39;Laptop&#39;, так как у него самая высокая цена (999.99)
среди популярных товаров.

```response title="Response"
   ┌─самый_дорого⋯й_продукт────┐
1. │ Ноутбук                  │
   └──────────────────────────┘
```


## См. также {#see-also}
- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMinIf`](/examples/aggregate-function-combinators/argMinIf)
- [`комбинатор If`](/sql-reference/aggregate-functions/combinators#-if)
