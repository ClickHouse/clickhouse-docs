---
slug: '/examples/aggregate-function-combinators/argMaxIf'
title: 'argMaxIf'
description: 'Пример использования комбинатора argMaxIf'
keywords: ['argMax', 'if', 'combinator', 'examples', 'argMaxIf']
sidebar_label: 'argMaxIf'
---


# argMaxIf {#argmaxif}

## Описание {#description}

Комбинатор [`If`](/sql-reference/aggregate-functions/combinators#-if) может быть применен к функции [`argMax`](/sql-reference/aggregate-functions/reference/argmax) для нахождения значения `arg`, соответствующего максимальному значению `val` для строк, где условие истинно, с использованием агрегатной функции комбинатора `argMaxIf`.

Функция `argMaxIf` полезна, когда необходимо найти значение, связанное с максимальным значением в наборе данных, но только для строк, удовлетворяющих определенному условию.

## Пример использования {#example-usage}

В этом примере мы используем выборку данных о продажах продуктов, чтобы продемонстрировать, как работает `argMaxIf`. Мы найдем название продукта с самой высокой ценой, но только для продуктов, которые были проданы не менее 10 раз.

```sql title="Запрос"
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
    ('Watch', 199.99, 5),
    ('Headphones', 79.99, 20);

SELECT argMaxIf(product_name, price, sales_count >= 10) as most_expensive_popular_product
FROM product_sales;
```

Функция `argMaxIf` вернет название продукта, которое имеет наивысшую цену среди всех продуктов, которые были проданы не менее 10 раз (sales_count >= 10). В этом случае она вернет 'Laptop', поскольку у него самая высокая цена (999.99) среди популярных продуктов.

```response title="Ответ"
   ┌─most_expensi⋯lar_product─┐
1. │ Laptop                   │
   └──────────────────────────┘
```

## См. также {#see-also}
- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMinIf`](/examples/aggregate-function-combinators/argMinIf)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
