---
'slug': '/examples/aggregate-function-combinators/argMaxIf'
'title': 'argMaxIf'
'description': 'Пример использования комбинатора argMaxIf'
'keywords':
- 'argMax'
- 'if'
- 'combinator'
- 'examples'
- 'argMaxIf'
'sidebar_label': 'argMaxIf'
'doc_type': 'reference'
---


# argMaxIf {#argmaxif}

## Описание {#description}

Комбинатор [`If`](/sql-reference/aggregate-functions/combinators#-if) можно применить к функции [`argMax`](/sql-reference/aggregate-functions/reference/argmax), чтобы найти значение `arg`, которое соответствует максимальному значению `val` для строк, где условие истинно, используя агрегатную функцию-комбинатор `argMaxIf`.

Функция `argMaxIf` полезна, когда вам нужно найти значение, связанное с максимальным значением в наборе данных, но только для строк, которые удовлетворяют конкретному условию.

## Пример использования {#example-usage}

В этом примере мы будем использовать выборку данных о продажах продуктов, чтобы продемонстрировать, как работает `argMaxIf`. Мы найдем название продукта, который имеет самую высокую цену, но только для продуктов, которые были проданы как минимум 10 раз.

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

Функция `argMaxIf` вернет название продукта, который имеет самую высокую цену среди всех продуктов, которые были проданы как минимум 10 раз (sales_count >= 10). В данном случае она вернет 'Laptop', поскольку он имеет самую высокую цену (999.99) среди популярных продуктов.

```response title="Response"
   ┌─most_expensi⋯lar_product─┐
1. │ Laptop                   │
   └──────────────────────────┘
```

## См. также {#see-also}
- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMinIf`](/examples/aggregate-function-combinators/argMinIf)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
