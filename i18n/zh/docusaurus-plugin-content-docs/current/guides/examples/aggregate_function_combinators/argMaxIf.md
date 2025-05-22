
# argMaxIf {#argmaxif}

## 描述 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) 组合器可以应用于 [`argMax`](/sql-reference/aggregate-functions/reference/argmax) 函数，以找到在条件为真的行中，`val` 的最大值对应的 `arg` 的值，使用 `argMaxIf` 聚合组合器函数。

当你需要在数据集中找到与最大值相关的值，但仅限于满足特定条件的行时，`argMaxIf` 函数非常有用。

## 示例用法 {#example-usage}

在这个示例中，我们将使用一个产品销售的示例数据集来演示 `argMaxIf` 的工作原理。我们将找到价格最高的产品名称，但只考虑销售至少 10 次的产品。

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
    ('Watch', 199.99, 5),
    ('Headphones', 79.99, 20);

SELECT argMaxIf(product_name, price, sales_count >= 10) as most_expensive_popular_product
FROM product_sales;
```

`argMaxIf` 函数将返回所有销售至少 10 次的产品中价格最高的产品名称（sales_count >= 10）。在这种情况下，它将返回 'Laptop'，因为在受欢迎的产品中，它的价格最高（999.99）。

```response title="Response"
   ┌─most_expensi⋯lar_product─┐
1. │ Laptop                   │
   └──────────────────────────┘
```

## 另请参见 {#see-also}
- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMinIf`](/examples/aggregate-function-combinators/argMinIf)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
