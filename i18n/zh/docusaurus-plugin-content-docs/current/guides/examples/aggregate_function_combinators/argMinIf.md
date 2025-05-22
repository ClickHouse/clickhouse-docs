
# argMinIf {#argminif}

## 描述 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) 组合器可以应用于 [`argMin`](/sql-reference/aggregate-functions/reference/argmin) 函数，以查找`arg`的值，该值对应于`val`的最小值，前提是条件为真，使用 `argMinIf` 聚合组合函数。

当您需要找到与数据集中最小值相关的值时，`argMinIf` 函数非常有用，但仅适用于满足特定条件的行。

## 示例用法 {#example-usage}

在此示例中，我们将创建一个表，存储产品价格及其时间戳，并使用 `argMinIf` 查找每个产品在有库存时的最低价格。

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

`argMinIf` 函数将查找每个产品对应于最早时间戳的价格，但仅考虑 `in_stock = 1` 的行。例如：
- 产品 1：在有库存的行中，10.99 的时间戳最早（10:00:00）
- 产品 2：在有库存的行中，20.99 的时间戳最早（11:00:00）

```response title="Response"
   ┌─product_id─┬─lowest_price_when_in_stock─┐
1. │          1 │                      10.99 │
2. │          2 │                      20.99 │
   └────────────┴────────────────────────────┘
```

## 另请参见 {#see-also}
- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMaxIf`](/examples/aggregate-function-combinators/argMaxIf)
- [`If 组合器`](/sql-reference/aggregate-functions/combinators#-if)
