---
slug: '/examples/aggregate-function-combinators/avgIf'
title: 'avgIf'
description: 'avgIf 组合器的使用示例'
keywords: ['avg', 'if', 'combinator', 'examples', 'avgIf']
sidebar_label: 'avgIf'
doc_type: 'reference'
---



# avgIf {#avgif}


## 描述 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) 组合器可应用于 [`avg`](/sql-reference/aggregate-functions/reference/avg) 函数,使用 `avgIf` 聚合组合器函数计算满足条件为真的行的算术平均值。


## 使用示例 {#example-usage}

在此示例中,我们将创建一个存储销售数据及成功标志的表,
并使用 `avgIf` 计算成功交易的平均销售金额。

```sql title="查询"
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

`avgIf` 函数仅计算 `is_successful = 1` 的行的平均金额。
在本例中,它将对以下金额求平均值:100.50、200.75、300.00 和 175.25。

```response title="响应"
   ┌─avg_successful_sale─┐
1. │              193.88 │
   └─────────────────────┘
```


## 另请参阅 {#see-also}

- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`If 组合器`](/sql-reference/aggregate-functions/combinators#-if)
