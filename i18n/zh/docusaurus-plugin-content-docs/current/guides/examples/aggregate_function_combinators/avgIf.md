---
'slug': '/examples/aggregate-function-combinators/avgIf'
'title': 'avgIf'
'description': '示例使用avgIf组合器'
'keywords':
- 'avg'
- 'if'
- 'combinator'
- 'examples'
- 'avgIf'
'sidebar_label': 'avgIf'
---




# avgIf {#avgif}

## Description {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) 组合器可以应用于 [`avg`](/sql-reference/aggregate-functions/reference/avg) 函数，以计算条件为真的行的值的算术平均值，使用 `avgIf` 聚合组合器函数。

## Example Usage {#example-usage}

在这个例子中，我们将创建一个存储销售数据和成功标志的表，并且我们将使用 `avgIf` 来计算成功交易的平均销售额。

```sql title="Query"
CREATE TABLE sales(
    transaction_id UInt32,
    amount Decimal(10,2),
    is_successful UInt8
) ENGINE = Log;

INSERT INTO sales VALUES
    (1, 100.50, 1),
    (2, 200.75, 1),
    (3, 150.25, 0),
    (4, 300.00, 1),
    (5, 250.50, 0),
    (6, 175.25, 1);

SELECT
    avgIf(amount, is_successful = 1) as avg_successful_sale
FROM sales;
```

`avgIf` 函数将仅计算 `is_successful = 1` 行的平均金额。在这种情况下，它将对以下金额求平均：100.50、200.75、300.00 和 175.25。

```response title="Response"
   ┌─avg_successful_sale─┐
1. │              193.88 │
   └─────────────────────┘
```

## See also {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
