---
'slug': '/examples/aggregate-function-combinators/argMinIf'
'title': 'argMinIf'
'description': '使用 argMinIf 组合器的示例'
'keywords':
- 'argMin'
- 'if'
- 'combinator'
- 'examples'
- 'argMinIf'
'sidebar_label': 'argMinIf'
---


# argMinIf {#argminif}

## 描述 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) 组合器可以应用于 [`argMin`](/sql-reference/aggregate-functions/reference/argmin) 函数，以查找与 `val` 最小值相对应的 `arg` 值，适用于条件为真的行，使用 `argMinIf` 聚合组合器函数。

当您需要在数据集中查找与最小值关联的值，但仅针对满足特定条件的行时，`argMinIf` 函数非常有用。

## 示例用法 {#example-usage}

在此示例中，我们将创建一个存储产品价格及其时间戳的表，并使用 `argMinIf` 找出每个产品在有库存时的最低价格。

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
    argMinIf(price, timestamp, in_stock = 1) as lowest_price_when_in_stock
FROM product_prices
GROUP BY product_id;
```

`argMinIf` 函数将找到每个产品对应的最早时间戳的价格，但仅考虑 `in_stock = 1` 的行。例如：
- 产品 1：在有库存的行中，10.99 的时间戳最早（10:00:00）
- 产品 2：在有库存的行中，20.99 的时间戳最早（11:00:00）

```response title="Response"
   ┌─product_id─┬─lowest_price_when_in_stock─┐
1. │          1 │                      10.99 │
2. │          2 │                      20.99 │
   └────────────┴────────────────────────────┘
```

## 另见 {#see-also}
- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMaxIf`](/examples/aggregate-function-combinators/argMaxIf)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
