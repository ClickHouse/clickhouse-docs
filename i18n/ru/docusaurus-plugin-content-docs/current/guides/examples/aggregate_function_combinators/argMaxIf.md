---
slug: '/examples/aggregate-function-combinators/argMaxIf'
title: 'argMaxIf'
description: 'Пример использования комбинатора argMaxIf'
keywords: ['argMax', 'if', 'комбинатор', 'примеры', 'argMaxIf']
sidebar_label: 'argMaxIf'
doc_type: 'reference'
---



# argMaxIf {#argmaxif}


## Описание {#description}

Комбинатор [`If`](/sql-reference/aggregate-functions/combinators#-if) может применяться к функции [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
для поиска значения `arg`, соответствующего максимальному значению `val` среди строк, удовлетворяющих условию,
с помощью агрегатной функции-комбинатора `argMaxIf`.

Функция `argMaxIf` полезна, когда требуется найти значение, связанное с
максимальным значением в наборе данных, но только среди строк, удовлетворяющих определённому
условию.


## Example usage {#example-usage}

В этом примере мы используем набор данных о продажах товаров, чтобы продемонстрировать, как работает функция `argMaxIf`. Мы найдем название товара с максимальной ценой, но только среди товаров, которые были проданы не менее 10 раз.

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
    ('Watch', 1199.99, 5),
    ('Headphones', 79.99, 20);

SELECT argMaxIf(product_name, price, sales_count >= 10) AS most_expensive_popular_product
FROM product_sales;
```

Функция `argMaxIf` вернет название товара с максимальной ценой среди всех товаров, которые были проданы не менее 10 раз (sales_count >= 10). В данном случае она вернет 'Laptop', так как он имеет максимальную цену (999.99) среди популярных товаров.

```response title="Результат"
   ┌─most_expensi⋯lar_product─┐
1. │ Laptop                   │
   └──────────────────────────┘
```


## См. также {#see-also}

- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMinIf`](/examples/aggregate-function-combinators/argMinIf)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
