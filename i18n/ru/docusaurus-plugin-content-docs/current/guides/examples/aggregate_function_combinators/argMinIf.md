---
slug: '/examples/aggregate-function-combinators/argMinIf'
title: 'argMinIf'
description: 'Пример использования комбинации argMinIf'
keywords: ['argMin', 'if', 'combinator', 'examples', 'argMinIf']
sidebar_label: 'argMinIf'
---


# argMinIf {#argminif}

## Описание {#description}

Комбинация [`If`](/sql-reference/aggregate-functions/combinators#-if) может быть применена к функции [`argMin`](/sql-reference/aggregate-functions/reference/argmin) для нахождения значения `arg`, соответствующего минимальному значению `val` для строк, где условие истинно, используя агрегатную функцию-комбинированную функцию `argMinIf`.

Функция `argMinIf` полезна, когда необходимо найти значение, связанное с минимальным значением в наборе данных, но только для строк, которые удовлетворяют определенному условию.

## Пример использования {#example-usage}

В этом примере мы создадим таблицу, которая хранит цены на продукты и их временные метки, и будем использовать `argMinIf`, чтобы найти самую низкую цену для каждого продукта, когда он на складе.

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
    argMinIf(price, timestamp, in_stock = 1) as lowest_price_when_in_stock
FROM product_prices
GROUP BY product_id;
```

Функция `argMinIf` найдет цену, которая соответствует самой ранней временной метке для каждого продукта, но только учитывая строки, где `in_stock = 1`. Например:
- Продукт 1: Среди строк на складе, 10.99 имеет самую раннюю временную метку (10:00:00)
- Продукт 2: Среди строк на складе, 20.99 имеет самую раннюю временную метку (11:00:00)

```response title="Ответ"
   ┌─product_id─┬─lowest_price_when_in_stock─┐
1. │          1 │                      10.99 │
2. │          2 │                      20.99 │
   └────────────┴────────────────────────────┘
```

## Смотрите также {#see-also}
- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMaxIf`](/examples/aggregate-function-combinators/argMaxIf)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
