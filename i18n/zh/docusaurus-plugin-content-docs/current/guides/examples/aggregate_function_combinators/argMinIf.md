---
slug: '/examples/aggregate-function-combinators/argMinIf'
title: 'argMinIf'
description: 'argMinIf 组合器的使用示例'
keywords: ['argMin', 'if', '组合器', '示例', 'argMinIf']
sidebar_label: 'argMinIf'
doc_type: 'reference'
---

# argMinIf {#argminif}

## 描述 {#description}

可以将 [`If`](/sql-reference/aggregate-functions/combinators#-if) 组合器应用于 [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
函数，从而在条件为 true 的行中，找到其 `val` 取最小值时对应的 `arg` 值，
即通过使用 `argMinIf` 聚合函数组合器实现该目的。

当需要在数据集中查找与最小值关联的值，但只针对满足特定条件的行时，`argMinIf` 函数非常有用。

## 示例用法 {#example-usage}

在本示例中，我们将创建一张表，用于存储商品价格及其时间戳，
并使用 `argMinIf` 在商品有库存时找出每个商品的最低价格。

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

`argMinIf` 函数会为每个产品找出具有最早时间戳的价格，
但只会考虑 `in_stock = 1` 的行。比如：

* 产品 1：在有库存的行中，10.99 的时间戳最早（10:00:00）
* 产品 2：在有库存的行中，20.99 的时间戳最早（11:00:00）

```response title="Response"
   ┌─product_id─┬─lowest_price_when_in_stock─┐
1. │          1 │                      10.99 │
2. │          2 │                      20.99 │
   └────────────┴────────────────────────────┘
```

## 另请参阅 {#see-also}
- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMaxIf`](/examples/aggregate-function-combinators/argMaxIf)
- [`If 组合器`](/sql-reference/aggregate-functions/combinators#-if)
