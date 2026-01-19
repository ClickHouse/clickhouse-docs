---
slug: '/examples/aggregate-function-combinators/anyIf'
title: 'anyIf'
description: '使用 anyIf 组合器的示例'
keywords: ['any', 'if', 'combinator', 'examples', 'anyIf']
sidebar_label: 'anyIf'
doc_type: 'reference'
---

# anyIf \{#avgif\}

## 描述 \{#description\}

可以将 [`If`](/sql-reference/aggregate-functions/combinators#-if) 组合器应用于 [`any`](/sql-reference/aggregate-functions/reference/any)
聚合函数，从给定列中选出首个满足指定条件的元素。

## 示例用法 \{#example-usage\}

在本示例中，我们将创建一个用于存储带有成功标志的销售数据的表，
并使用 `anyIf` 分别选出金额大于 200 和小于 200 的首个 `transaction_id`。

我们首先创建一个表并向其中插入数据：

```sql title="Query"
CREATE TABLE sales(
    transaction_id UInt32,
    amount Decimal(10,2),
    is_successful UInt8
) 
ENGINE = MergeTree()
ORDER BY tuple();

INSERT INTO sales VALUES
    (1, 100.00, 1),
    (2, 150.00, 1),
    (3, 155.00, 0),
    (4, 300.00, 1),
    (5, 250.50, 0),
    (6, 175.25, 1);
```

```sql
SELECT
    anyIf(transaction_id, amount < 200) AS tid_lt_200,
    anyIf(transaction_id, amount > 200) AS tid_gt_200
FROM sales;
```

```response title="Response"
┌─tid_lt_200─┬─tid_gt_200─┐
│          1 │          4 │
└────────────┴────────────┘
```

## 另请参阅 \{#see-also\}
- [`any`](/sql-reference/aggregate-functions/reference/any)
- [`If 组合器`](/sql-reference/aggregate-functions/combinators#-if)
