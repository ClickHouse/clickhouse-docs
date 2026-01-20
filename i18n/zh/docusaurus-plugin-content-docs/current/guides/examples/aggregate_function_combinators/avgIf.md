---
slug: '/examples/aggregate-function-combinators/avgIf'
title: 'avgIf'
description: '使用 avgIf 组合子的示例'
keywords: ['avg', 'if', 'combinator', 'examples', 'avgIf']
sidebar_label: 'avgIf'
doc_type: 'reference'
---

# avgIf \{#avgif\}

## 描述 \{#description\}

[`If`](/sql-reference/aggregate-functions/combinators#-if) 组合器可以应用于 [`avg`](/sql-reference/aggregate-functions/reference/avg)
函数，通过 `avgIf` 聚合组合器函数来计算条件为 true 的行中各值的算术平均值。

## 示例用法 \{#example-usage\}

在本示例中，我们将创建一个用于存储带有成功标志的销售数据的表，
并使用 `avgIf` 来计算成功交易的平均销售金额。

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
    avgIf(amount, is_successful = 1) AS avg_successful_sale
FROM sales;
```

`avgIf` 函数只会对满足 `is_successful = 1` 条件的行计算平均值。
在本例中，它会对以下金额取平均值：100.50、200.75、300.00 和 175.25。

```response title="Response"
   ┌─avg_successful_sale─┐
1. │              193.88 │
   └─────────────────────┘
```

## 另请参阅 \{#see-also\}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`If 组合器`](/sql-reference/aggregate-functions/combinators#-if)
